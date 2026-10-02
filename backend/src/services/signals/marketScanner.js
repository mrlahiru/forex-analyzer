import cron from 'node-cron';
import { marketDataManager } from '../marketData/index.js';
import { signalService } from './signalService.js';
import { Signal } from '../../models/Signal.js';
import { SignalEvent } from '../../models/SignalEvent.js';
import { signalVerificationService } from './signalVerificationService.js';
import mongoose from 'mongoose';

/**
 * Automatic Market Scanner & Background Engine (Phase 8)
 * - Periodically scans all 7 Forex pairs across technical indicators & deterministic rules
 * - Monitors active signals in real-time against incoming market prices
 * - Detects lifecycle states: CREATED -> ACTIVE -> TP1_HIT -> TP2_HIT -> TP3_HIT / SL_HIT / EXPIRED
 * - Maintains an in-memory event store with Mongoose persistence fallback
 */
class MarketScannerService {
  constructor() {
    this.cronTask = null;
    this.isRunning = false;
    this.isScanning = false;
    this.lastScanTime = null;
    this.scanCount = 0;
    this.cronExpression = process.env.SCANNER_CRON || '*/1 * * * *'; // Every minute
    this.defaultTimeframe = '1h';

    // In-memory signal tracking & lifecycle event log (retains latest 100 events)
    this.trackedSignals = new Map();
    this.eventsHistory = [];

    // Subscribers for Phase 9 Telegram & Webhook notification events
    this.eventListeners = [];
  }

  /**
   * Register listener for signal events (used by Telegram alert service)
   */
  onEvent(callback) {
    if (typeof callback === 'function') {
      this.eventListeners.push(callback);
    }
  }

  /**
   * Emit lifecycle event to listeners and storage
   */
  async emitSignalEvent(eventType, signal, price, notes = '') {
    const event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      signalId: signal.id || signal._id || signal.pair,
      pair: signal.pair,
      timeframe: signal.timeframe || this.defaultTimeframe,
      direction: signal.direction,
      eventType,
      price: parseFloat(price),
      timestamp: new Date().toISOString(),
      notes,
    };

    // Prepend to in-memory events list (cap at 100)
    this.eventsHistory.unshift(event);
    if (this.eventsHistory.length > 100) {
      this.eventsHistory.pop();
    }

    // Persist to MongoDB if connected
    if (mongoose.connection.readyState === 1 && signal._id) {
      try {
        await SignalEvent.create({
          signalId: signal._id,
          eventType,
          price,
          notes,
        });

        // Keep parent Signal document status strictly in sync with lifecycle
        // Note: CREATED is an event type, but parent document status remains ACTIVE
        const isClosed = ['TP3_HIT', 'SL_HIT', 'EXPIRED', 'CANCELLED', 'CLOSED'].includes(eventType);
        const targetStatus = eventType === 'CREATED' ? 'ACTIVE' : eventType;
        await Signal.findByIdAndUpdate(signal._id, {
          status: targetStatus,
          ...(isClosed ? { closedAt: new Date() } : {}),
          updatedAt: new Date(),
        });
      } catch (err) {
        console.warn('[Scanner] DB persistence warning:', err.message);
      }
    }

    // Notify listeners (e.g. Telegram Bot in Phase 9)
    for (const listener of this.eventListeners) {
      try {
        listener(event, signal);
      } catch (e) {
        console.error('[Scanner] Error in event listener:', e.message);
      }
    }

    console.log(`[Scanner Event] ${signal.pair} [${eventType}] @ ${price} - ${notes}`);
    return event;
  }

  /**
   * Start scheduled background scanner
   */
  start() {
    if (this.isRunning) {
      return { status: 'already_running', cronExpression: this.cronExpression };
    }

    console.log(`[Scanner] Initializing automatic background scanner (${this.cronExpression})...`);
    this.cronTask = cron.schedule(this.cronExpression, async () => {
      try {
        await this.runScanCycle();
      } catch (err) {
        console.error('[Scanner] Unhandled error during scan cycle:', err.message);
      }
    });

    this.isRunning = true;

    // Trigger initial scan asynchronously
    setTimeout(() => {
      this.runScanCycle().catch(() => {});
    }, 1500);

    return { status: 'started', cronExpression: this.cronExpression };
  }

  /**
   * Stop / pause background scanner
   */
  stop() {
    if (this.cronTask) {
      this.cronTask.stop();
      this.cronTask = null;
    }
    this.isRunning = false;
    console.log('[Scanner] Background scanner paused.');
    return { status: 'stopped' };
  }

  /**
   * Synchronize active signals from MongoDB into scanner tracking memory
   */
  async syncTrackedSignalsFromDB() {
    if (mongoose.connection.readyState === 1) {
      try {
        const supported = marketDataManager.supportedPairs;
        // Clean out any unsupported tracked pairs in memory
        for (const [key] of this.trackedSignals) {
          if (!supported.includes(key)) this.trackedSignals.delete(key);
        }

        const active = await Signal.find({ status: { $in: ['ACTIVE', 'CREATED', 'TP1_HIT', 'TP2_HIT'] } });
        for (const sig of active) {
          if (sig.status === 'CREATED') {
            sig.status = 'ACTIVE';
            await Signal.findByIdAndUpdate(sig._id, { status: 'ACTIVE' });
          }
          if (!supported.includes(sig.pair)) continue;
          if (!this.trackedSignals.has(sig.pair)) {
            this.trackedSignals.set(sig.pair, {
              _id: sig._id,
              pair: sig.pair,
              direction: sig.direction,
              timeframe: sig.timeframe,
              entry: sig.entry,
              tp1: sig.tp1,
              tp2: sig.tp2,
              tp3: sig.tp3,
              stopLoss: sig.stopLoss,
              score: sig.score,
              status: sig.status,
              reasons: sig.reasons,
              riskReward: sig.riskReward,
              createdAt: sig.createdAt,
            });
          }
        }
      } catch (e) {
        // non-fatal
      }
    }
  }

  /**
   * Execute a single market scan cycle across all pairs
   */
  async runScanCycle(timeframe = this.defaultTimeframe) {
    if (this.isScanning) {
      return { status: 'already_scanning' };
    }

    this.isScanning = true;
    const startTime = Date.now();
    const pairs = marketDataManager.supportedPairs;
    const cycleResults = [];

    try {
      await this.syncTrackedSignalsFromDB();

      for (const pair of pairs) {
        try {
          // 1. Ingest latest candles and current price
          const candleResult = await marketDataManager.getCandles(pair, timeframe, 100);
          const currentPrice = candleResult.candles[candleResult.candles.length - 1]?.close;

          if (!currentPrice) continue;

          // 2. Evaluate deterministic rules
          const signal = await signalService.evaluatePair(pair, timeframe, true);

          // 3. Monitor lifecycle against tracked signals
          const existing = this.trackedSignals.get(pair);

          if (existing && existing.status !== 'EXPIRED' && existing.status !== 'CANCELLED') {
            await this._checkSignalLifecycle(existing, currentPrice, candleResult.candles || []);
          }

          // 4. If new trade setup emerged (BUY or SELL with score >= 60)
          if (signal.direction === 'BUY' || signal.direction === 'SELL') {
            const isDifferent =
              !existing ||
              existing.direction !== signal.direction ||
              existing.status === 'TP3_HIT' ||
              existing.status === 'SL_HIT' ||
              existing.status === 'EXPIRED';

            if (isDifferent) {
              signal.status = 'ACTIVE';
              signal.trackedAt = new Date().toISOString();
              this.trackedSignals.set(pair, signal);

              await this.emitSignalEvent(
                'CREATED',
                signal,
                currentPrice,
                `Deterministic ${signal.direction} signal triggered (Score: ${signal.score}/100, MTF: ${signal.timeframeConsensus})`
              );
            }
          }

          cycleResults.push({
            pair,
            price: currentPrice,
            direction: signal.direction,
            score: signal.score,
            status: this.trackedSignals.get(pair)?.status || 'MONITORING',
          });
        } catch (pairErr) {
          console.warn(`[Scanner] Error scanning ${pair}:`, pairErr.message);
        }
      }

      this.lastScanTime = new Date().toISOString();
      this.scanCount++;
    } finally {
      this.isScanning = false;
    }

    const durationMs = Date.now() - startTime;
    return {
      status: 'completed',
      scannedPairsCount: cycleResults.length,
      durationMs,
      timestamp: this.lastScanTime,
      results: cycleResults,
    };
  }

  /**
   * Monitor price action against active signal TP1, TP2, TP3, and Stop Loss
   */
  async _checkSignalLifecycle(signal, currentPrice, candles = []) {
    // If candles available, evaluate using signalVerificationService
    if (candles && candles.length > 0) {
      const outcome = signalVerificationService.evaluateSignalOutcome(signal, candles);
      if (outcome.verified && outcome.status !== signal.status) {
        signal.status = outcome.status;
        signal.closedAt = outcome.closedAt ? outcome.closedAt.toISOString() : new Date().toISOString();
        await this.emitSignalEvent(
          outcome.status,
          signal,
          outcome.exitPrice || currentPrice,
          outcome.exitReason || `Lifecycle state updated to ${outcome.status}`
        );
        return;
      }
    }
    const isBuy = signal.direction === 'BUY';
    const isSell = signal.direction === 'SELL';
    const currentStatus = signal.status;

    // Check Take Profit 3 (Runner Target 1:3)
    if (signal.tp3) {
      const tp3Hit = isBuy ? currentPrice >= signal.tp3 : currentPrice <= signal.tp3;
      if (tp3Hit && currentStatus !== 'TP3_HIT') {
        signal.status = 'TP3_HIT';
        signal.closedAt = new Date().toISOString();
        await this.emitSignalEvent(
          'TP3_HIT',
          signal,
          currentPrice,
          `Full Take Profit 3 reached at ${currentPrice} (+3:1 R:R structural runner)`
        );
        return;
      }
    }

    // Check Take Profit 2 (Structural Target 1:2)
    if (signal.tp2) {
      const tp2Hit = isBuy ? currentPrice >= signal.tp2 : currentPrice <= signal.tp2;
      if (tp2Hit && currentStatus !== 'TP2_HIT' && currentStatus !== 'TP3_HIT') {
        signal.status = 'TP2_HIT';
        await this.emitSignalEvent(
          'TP2_HIT',
          signal,
          currentPrice,
          `Target 2 reached at ${currentPrice} (+2:1 R:R). Lock in additional gains.`
        );
        return;
      }
    }

    // Check Take Profit 1 (Breakeven Target 1:1)
    if (signal.tp1) {
      const tp1Hit = isBuy ? currentPrice >= signal.tp1 : currentPrice <= signal.tp1;
      if (tp1Hit && currentStatus === 'ACTIVE') {
        signal.status = 'TP1_HIT';
        await this.emitSignalEvent(
          'TP1_HIT',
          signal,
          currentPrice,
          `Target 1 reached at ${currentPrice} (+1:1 R:R). Rule: Move Stop Loss to Entry price.`
        );
        return;
      }
    }

    // Check Stop Loss
    if (signal.stopLoss) {
      const slHit = isBuy ? currentPrice <= signal.stopLoss : currentPrice >= signal.stopLoss;
      if (slHit && currentStatus !== 'SL_HIT' && currentStatus !== 'TP3_HIT') {
        signal.status = 'SL_HIT';
        signal.closedAt = new Date().toISOString();
        await this.emitSignalEvent(
          'SL_HIT',
          signal,
          currentPrice,
          `Stop Loss executed at ${currentPrice}. Capital preserved at defined risk percentage.`
        );
        return;
      }
    }
  }

  /**
   * Get scanner operational diagnostics
   */
  getStatus() {
    const trackedList = Array.from(this.trackedSignals.values());
    return {
      running: this.isRunning,
      isScanning: this.isScanning,
      cronExpression: this.cronExpression,
      lastScanTime: this.lastScanTime,
      scanCount: this.scanCount,
      monitoredPairsCount: marketDataManager.supportedPairs.length,
      trackedSignalsCount: trackedList.length,
      activeSignalsCount: trackedList.filter((s) => s.status === 'ACTIVE' || s.status.includes('TP')).length,
      trackedSignals: trackedList,
      recentEvents: this.eventsHistory.slice(0, 15),
    };
  }

  /**
   * Get historical signal events
   */
  getEvents(limit = 50) {
    return this.eventsHistory.slice(0, limit);
  }
}

export const marketScanner = new MarketScannerService();
export default marketScanner;
