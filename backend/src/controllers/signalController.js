import { signalService, signalVerificationService } from '../services/signals/index.js';
import Signal from '../models/Signal.js';
import mongoose from 'mongoose';

export const getActiveSignals = async (req, res, next) => {
  try {
    const signals = await signalService.getActiveSignals();
    res.status(200).json({
      success: true,
      count: signals.length,
      signals,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Section 15: Run verification audit on all pending signals
 */
export const verifySignals = async (req, res, next) => {
  try {
    const report = await signalVerificationService.verifyAllSignals();
    res.status(200).json({
      success: true,
      message: 'Signal verification audit executed successfully',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Section 15: Signal History endpoint
 * Fetches closed signals with filters: pair, direction, timeframe, date, result
 */
export const getSignalHistory = async (req, res, next) => {
  try {
    const { pair, direction, timeframe, result, date, limit = 50, autoVerify = 'true' } = req.query;

    // Run verification if explicitly requested or if autoVerify enabled
    if (autoVerify === 'true' && mongoose.connection.readyState === 1) {
      const status = signalVerificationService.getStatus();
      const lastAudit = status.lastVerificationTime ? new Date(status.lastVerificationTime).getTime() : 0;
      // If never verified or last verified over 2 minutes ago, trigger quick background/sync audit
      if (Date.now() - lastAudit > 120000) {
        try {
          await signalVerificationService.verifyAllSignals();
        } catch (auditErr) {
          console.warn('[SignalController] Auto-verification warning:', auditErr.message);
        }
      }
    }

    let historyRecords = [];

    // Attempt MongoDB query for closed/completed signals
    if (mongoose.connection.readyState === 1) {
      try {
        const query = {
          status: { $in: ['TP1_HIT', 'TP2_HIT', 'TP3_HIT', 'SL_HIT', 'CLOSED', 'EXPIRED'] },
        };
        if (pair && pair !== 'ALL') {
          query.pair = pair.toUpperCase().includes('/') ? pair.toUpperCase() : `${pair.slice(0, 3)}/${pair.slice(3)}`.toUpperCase();
        }
        if (direction && direction !== 'ALL') query.direction = direction.toUpperCase();
        if (timeframe && timeframe !== 'ALL') query.timeframe = timeframe;
        if (result && result !== 'ALL') query.status = result.toUpperCase();

        const dbRecords = await Signal.find(query).sort({ updatedAt: -1, createdAt: -1 }).limit(parseInt(limit, 10));

        if (dbRecords && dbRecords.length > 0) {
          historyRecords = dbRecords.map((s) => {
            const isGold = s.pair.includes('XAU') || s.pair.includes('GOLD');
            const isJpy = s.pair.includes('JPY');
            const pipMult = isGold ? 10 : (isJpy ? 100 : 10000);
            const isBuy = s.direction === 'BUY';
            let pips = 0;

            if (s.status === 'TP3_HIT') {
              pips = isBuy ? (s.tp3 - s.entry) * pipMult : (s.entry - s.tp3) * pipMult;
            } else if (s.status === 'TP2_HIT') {
              pips = isBuy ? (s.tp2 - s.entry) * pipMult : (s.entry - s.tp2) * pipMult;
            } else if (s.status === 'TP1_HIT') {
              pips = isBuy ? (s.tp1 - s.entry) * pipMult : (s.entry - s.tp1) * pipMult;
            } else if (s.status.includes('SL')) {
              pips = isBuy ? (s.stopLoss - s.entry) * pipMult : (s.entry - s.stopLoss) * pipMult;
            }

            return {
              id: s._id.toString(),
              pair: s.pair,
              direction: s.direction,
              timeframe: s.timeframe,
              entry: s.entry,
              tp1: s.tp1,
              tp2: s.tp2,
              tp3: s.tp3,
              stopLoss: s.stopLoss,
              score: s.score,
              result: s.status,
              pips: pips.toFixed(1),
              riskReward: s.riskReward?.tp2 ? `1:${s.riskReward.tp2}` : (s.riskReward || '1:2.0'),
              reasons: s.reasons || [],
              createdAt: s.createdAt,
              closedAt: s.closedAt || s.updatedAt,
            };
          });
        }
      } catch (dbErr) {
        console.warn('[SignalController] DB History query fallback:', dbErr.message);
      }
    }

    // Apply in-memory filtering for any remaining query constraints
    if (pair && pair !== 'ALL') {
      const cleanPair = pair.toUpperCase().replace(/[^A-Z]/g, '');
      historyRecords = historyRecords.filter((h) => h.pair.replace(/[^A-Z]/g, '') === cleanPair);
    }
    if (direction && direction !== 'ALL') {
      historyRecords = historyRecords.filter((h) => h.direction.toUpperCase() === direction.toUpperCase());
    }
    if (timeframe && timeframe !== 'ALL') {
      historyRecords = historyRecords.filter((h) => h.timeframe.toLowerCase() === timeframe.toLowerCase());
    }
    if (result && result !== 'ALL') {
      historyRecords = historyRecords.filter((h) => h.result.toUpperCase() === result.toUpperCase());
    }
    if (date) {
      historyRecords = historyRecords.filter((h) => h.createdAt.startsWith(date) || (h.closedAt && h.closedAt.startsWith(date)));
    }

    // Calculate aggregated metrics
    const totalSignals = historyRecords.length;
    const winTrades = historyRecords.filter((h) => h.result.includes('TP'));
    const lossTrades = historyRecords.filter((h) => h.result.includes('SL'));
    const winRate = totalSignals > 0 ? ((winTrades.length / totalSignals) * 100).toFixed(1) : 0;
    const totalPips = historyRecords.reduce((acc, h) => acc + (parseFloat(h.pips) || 0), 0).toFixed(1);

    let avgRiskReward = '1:2.0';
    if (historyRecords.length > 0) {
      const sumRR = historyRecords.reduce((acc, h) => {
        const match = String(h.riskReward).match(/1:([0-9.]+)/);
        return acc + (match ? parseFloat(match[1]) : 2.0);
      }, 0);
      avgRiskReward = `1:${(sumRR / historyRecords.length).toFixed(1)}`;
    }

    res.status(200).json({
      success: true,
      count: historyRecords.length,
      metrics: {
        totalSignals,
        winCount: winTrades.length,
        lossCount: lossTrades.length,
        winRate: parseFloat(winRate),
        totalPips: parseFloat(totalPips),
        avgRiskReward,
      },
      history: historyRecords,
    });
  } catch (error) {
    next(error);
  }
};

export const evaluatePairSignal = async (req, res, next) => {
  try {
    const { pair } = req.params;
    const timeframe = req.query.timeframe || '1h';

    const signal = await signalService.evaluatePair(pair, timeframe, true);

    res.status(200).json({
      success: true,
      signal,
    });
  } catch (error) {
    next(error);
  }
};

export const evaluateAllSignals = async (req, res, next) => {
  try {
    const timeframe = req.query.timeframe || '1h';
    const signals = await signalService.evaluateAllPairs(timeframe);

    res.status(200).json({
      success: true,
      timeframe,
      count: signals.length,
      signals,
    });
  } catch (error) {
    next(error);
  }
};

export const getSignalById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const signal = await signalService.getSignalById(id);

    if (!signal) {
      return res.status(404).json({
        success: false,
        message: `Signal with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      signal,
    });
  } catch (error) {
    next(error);
  }
};
