import mongoose from 'mongoose';
import Signal from '../../models/Signal.js';
import SignalEvent from '../../models/SignalEvent.js';
import { marketDataManager } from '../marketData/index.js';

/**
 * Signal Verification & Audit Service (Section 15)
 * Audits active and historical signals against real market candlestick price action.
 * Determines deterministic lifecycle outcomes: TP1_HIT, TP2_HIT, TP3_HIT, SL_HIT.
 */
class SignalVerificationService {
  constructor() {
    this.isVerifying = false;
    this.lastVerificationTime = null;
    this.auditListeners = [];
  }

  /**
   * Register a listener for verification events
   */
  onVerification(listener) {
    if (typeof listener === 'function') {
      this.auditListeners.push(listener);
    }
  }

  /**
   * Calculate pip gain or loss accurately for any instrument
   */
  calculatePips(pair, direction, entryPrice, exitPrice) {
    const isGold = pair.includes('XAU') || pair.includes('GOLD');
    const isJpy = pair.includes('JPY');
    const pipMult = isGold ? 10 : (isJpy ? 100 : 10000);
    const isBuy = direction === 'BUY';
    const delta = isBuy ? (exitPrice - entryPrice) : (entryPrice - exitPrice);
    return parseFloat((delta * pipMult).toFixed(1));
  }

  /**
   * Verify a single signal against historical candles
   * @param {Object} signal - Signal document or object
   * @param {Array} candles - Array of OHLCV candles
   * @returns {Object} verification result
   */
  evaluateSignalOutcome(signal, candles) {
    if (!candles || candles.length === 0) {
      return { verified: false, status: signal.status, message: 'No candle data available' };
    }

    const isBuy = signal.direction === 'BUY';
    const sigTime = new Date(signal.createdAt || signal.evaluatedAt || Date.now()).getTime();

    // Only inspect candles at or after signal inception (with 5 min grace window)
    const relevantCandles = candles.filter((c) => {
      const cTime = new Date(c.timestamp).getTime();
      return cTime >= sigTime - 300000;
    });

    if (relevantCandles.length === 0) {
      return { verified: false, status: signal.status, message: 'No candles after signal inception' };
    }

    let currentStatus = signal.status === 'CREATED' ? 'ACTIVE' : signal.status;
    let exitPrice = null;
    let closedAt = signal.closedAt ? new Date(signal.closedAt) : null;
    let exitReason = null;
    let bestTpHit = null;

    // Check existing TP state
    if (currentStatus === 'TP1_HIT') bestTpHit = 1;
    if (currentStatus === 'TP2_HIT') bestTpHit = 2;
    if (currentStatus === 'TP3_HIT') bestTpHit = 3;

    // If already closed by SL or TP3, retain state unless closedAt is missing
    if (currentStatus === 'SL_HIT' || currentStatus === 'TP3_HIT') {
      const exitP = currentStatus === 'SL_HIT' ? signal.stopLoss : signal.tp3;
      return {
        verified: true,
        status: currentStatus,
        exitPrice: exitP,
        closedAt: signal.closedAt || signal.updatedAt || new Date(),
        pips: this.calculatePips(signal.pair, signal.direction, signal.entry, exitP),
        changed: false,
      };
    }

    // Step through each candle chronologically
    for (const candle of relevantCandles) {
      const high = candle.high;
      const low = candle.low;
      const cTimestamp = new Date(candle.timestamp);

      if (isBuy) {
        // 1. Check Stop Loss
        // If TP1 has already been hit, stop loss was moved to breakeven (entry price)
        const effectiveSl = bestTpHit ? signal.entry : signal.stopLoss;

        if (low <= effectiveSl) {
          if (!bestTpHit) {
            // Outright Stop Loss hit
            currentStatus = 'SL_HIT';
            exitPrice = signal.stopLoss;
            closedAt = cTimestamp;
            exitReason = 'Stop Loss executed. Defined capital preservation triggered.';
            break;
          } else {
            // Trailing stop touched at breakeven after TP hit
            // Keep the best TP secured
            exitPrice = bestTpHit === 1 ? signal.tp1 : signal.tp2;
            currentStatus = bestTpHit === 1 ? 'TP1_HIT' : 'TP2_HIT';
            closedAt = cTimestamp;
            exitReason = `Trailing breakeven hit after Target ${bestTpHit} secured.`;
            break;
          }
        }

        // 2. Check Take Profit 3 (Runner Target)
        if (high >= signal.tp3) {
          currentStatus = 'TP3_HIT';
          exitPrice = signal.tp3;
          closedAt = cTimestamp;
          bestTpHit = 3;
          exitReason = 'Full Take Profit 3 reached (+3:1 R:R).';
          break; // Trade completed
        }

        // 3. Check Take Profit 2
        if (high >= signal.tp2) {
          bestTpHit = Math.max(bestTpHit || 0, 2);
          currentStatus = 'TP2_HIT';
          exitPrice = signal.tp2;
          closedAt = cTimestamp;
          exitReason = 'Target 2 reached (+2:1 R:R).';
        }

        // 4. Check Take Profit 1
        else if (high >= signal.tp1 && !bestTpHit) {
          bestTpHit = 1;
          currentStatus = 'TP1_HIT';
          exitPrice = signal.tp1;
          closedAt = cTimestamp;
          exitReason = 'Target 1 reached (+1:1 R:R). Stop Loss moved to Entry.';
        }
      } else {
        // SELL Trade
        const effectiveSl = bestTpHit ? signal.entry : signal.stopLoss;

        if (high >= effectiveSl) {
          if (!bestTpHit) {
            currentStatus = 'SL_HIT';
            exitPrice = signal.stopLoss;
            closedAt = cTimestamp;
            exitReason = 'Stop Loss executed. Defined capital preservation triggered.';
            break;
          } else {
            exitPrice = bestTpHit === 1 ? signal.tp1 : signal.tp2;
            currentStatus = bestTpHit === 1 ? 'TP1_HIT' : 'TP2_HIT';
            closedAt = cTimestamp;
            exitReason = `Trailing breakeven hit after Target ${bestTpHit} secured.`;
            break;
          }
        }

        if (low <= signal.tp3) {
          currentStatus = 'TP3_HIT';
          exitPrice = signal.tp3;
          closedAt = cTimestamp;
          bestTpHit = 3;
          exitReason = 'Full Take Profit 3 reached (+3:1 R:R).';
          break;
        }

        if (low <= signal.tp2) {
          bestTpHit = Math.max(bestTpHit || 0, 2);
          currentStatus = 'TP2_HIT';
          exitPrice = signal.tp2;
          closedAt = cTimestamp;
          exitReason = 'Target 2 reached (+2:1 R:R).';
        } else if (low <= signal.tp1 && !bestTpHit) {
          bestTpHit = 1;
          currentStatus = 'TP1_HIT';
          exitPrice = signal.tp1;
          closedAt = cTimestamp;
          exitReason = 'Target 1 reached (+1:1 R:R). Stop Loss moved to Entry.';
        }
      }
    }

    const changed = currentStatus !== signal.status || (!signal.closedAt && closedAt !== null);
    const resolvedPrice = exitPrice || (currentStatus.includes('TP') ? signal.tp1 : signal.stopLoss);
    const pips = currentStatus !== 'ACTIVE'
      ? this.calculatePips(signal.pair, signal.direction, signal.entry, resolvedPrice)
      : 0;

    return {
      verified: true,
      status: currentStatus,
      exitPrice: resolvedPrice,
      closedAt: closedAt || (currentStatus !== 'ACTIVE' ? new Date() : null),
      pips,
      exitReason,
      changed,
    };
  }

  /**
   * Run full verification audit across all pending and active signals
   */
  async verifyAllSignals(forceTimeframe = '1h') {
    if (this.isVerifying) {
      return { status: 'already_verifying', lastVerificationTime: this.lastVerificationTime };
    }

    this.isVerifying = true;
    const auditReport = {
      startTime: new Date().toISOString(),
      totalAudited: 0,
      updatedCount: 0,
      closedCount: 0,
      activeRemaining: 0,
      results: [],
    };

    try {
      if (mongoose.connection.readyState !== 1) {
        return { success: false, message: 'Database not connected for audit' };
      }

      // Query any unverified or active signals (including legacy 'CREATED' states)
      const pendingSignals = await Signal.find({
        status: { $in: ['ACTIVE', 'CREATED', 'TP1_HIT', 'TP2_HIT'] },
      }).sort({ createdAt: 1 });

      auditReport.totalAudited = pendingSignals.length;

      // Group candle requests by pair to minimize API/quote calls
      const candleCache = new Map();
      const pairsNeeded = [...new Set(pendingSignals.map((s) => s.pair))];

      for (const pair of pairsNeeded) {
        try {
          const candleResult = await marketDataManager.getCandles(pair, forceTimeframe, 150);
          candleCache.set(pair, candleResult.candles || []);
        } catch (e) {
          console.warn(`[Verification] Failed to fetch candles for ${pair}:`, e.message);
          candleCache.set(pair, []);
        }
      }

      // Track the latest active signal per pair to clean up duplicate legacy spam
      const seenActivePairs = new Set();

      for (const signal of pendingSignals) {
        const candles = candleCache.get(signal.pair) || [];
        const outcome = this.evaluateSignalOutcome(signal, candles);

        // Check for duplicate pending signals for the same pair
        if (outcome.status === 'ACTIVE') {
          if (seenActivePairs.has(signal.pair)) {
            // Archive older duplicate active signal
            await Signal.findByIdAndUpdate(signal._id, {
              status: 'CANCELLED',
              closedAt: new Date(),
              updatedAt: new Date(),
            });
            continue;
          }
          seenActivePairs.add(signal.pair);
        }

        if (outcome.changed || signal.status === 'CREATED') {
          const updateData = {
            status: outcome.status,
            updatedAt: new Date(),
          };

          if (outcome.closedAt) {
            updateData.closedAt = outcome.closedAt;
          }

          await Signal.findByIdAndUpdate(signal._id, updateData);

          // Record Signal Event in audit trail
          if (outcome.status !== signal.status) {
            await SignalEvent.create({
              signalId: signal._id,
              eventType: outcome.status,
              price: outcome.exitPrice || signal.entry,
              notes: outcome.exitReason || `Signal verified as ${outcome.status}`,
              timestamp: outcome.closedAt || new Date(),
            });
          }

          auditReport.updatedCount++;
          if (['TP1_HIT', 'TP2_HIT', 'TP3_HIT', 'SL_HIT'].includes(outcome.status)) {
            auditReport.closedCount++;
          }

          auditReport.results.push({
            id: signal._id,
            pair: signal.pair,
            direction: signal.direction,
            previousStatus: signal.status,
            newStatus: outcome.status,
            pips: outcome.pips,
            closedAt: outcome.closedAt,
            notes: outcome.exitReason,
          });

          // Notify any registered listeners
          for (const listener of this.auditListeners) {
            try {
              listener({ signal, outcome });
            } catch (e) {}
          }
        } else {
          if (outcome.status === 'ACTIVE') {
            auditReport.activeRemaining++;
          }
        }
      }

      this.lastVerificationTime = new Date().toISOString();
      auditReport.endTime = this.lastVerificationTime;
      auditReport.success = true;
      return auditReport;
    } finally {
      this.isVerifying = false;
    }
  }

  /**
   * Diagnostic status of verification engine
   */
  getStatus() {
    return {
      isVerifying: this.isVerifying,
      lastVerificationTime: this.lastVerificationTime,
    };
  }
}

export const signalVerificationService = new SignalVerificationService();
export default signalVerificationService;
