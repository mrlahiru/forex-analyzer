import { marketDataManager } from '../marketData/index.js';
import { runTechnicalAnalysis, runMultiTimeframeAnalysis } from '../indicators/analysisEngine.js';
import { evaluateDeterministicSignal } from './scoringEngine.js';
import { applyMultiTimeframeConfirmation } from './multiTimeframeFilter.js';
import { calculateDynamicTPSL } from '../risk/tpslEngine.js';
import Signal from '../../models/Signal.js';
import SignalEvent from '../../models/SignalEvent.js';
import mongoose from 'mongoose';

export class SignalService {
  constructor() {
    this.activeSignalsMemory = new Map();
    this.evaluationCache = new Map();
  }

  /**
   * Evaluate and generate signal for a specific pair and timeframe
   * @param {string} pair - e.g. "EUR/USD"
   * @param {string} timeframe - e.g. "1h"
   * @param {boolean} persist - whether to save valid BUY/SELL to database
   */
  async evaluatePair(pair, timeframe = '1h', persist = true) {
    const normPair = marketDataManager.normalizePair(pair);
    const cacheKey = `${normPair}_${timeframe}`;
    const cached = this.evaluationCache.get(cacheKey);
    // Cache for 30 seconds to prevent rapid credit/compute burning
    if (cached && Date.now() - cached.timestamp < 30000) {
      return cached.data;
    }

    // 1. Fetch candles & execute technical indicator analysis
    const candleResult = await marketDataManager.getCandles(normPair, timeframe, 120);
    const analysis = runTechnicalAnalysis(candleResult.candles, normPair, timeframe);

    // 2. Fetch multi-timeframe concordance
    const mtfData = await runMultiTimeframeAnalysis(normPair);

    // 3. Deterministic 100-Point Scoring Engine
    const initialSignal = evaluateDeterministicSignal(analysis);

    // 4. Multi-Timeframe Confirmation Filter
    const finalSignal = applyMultiTimeframeConfirmation(initialSignal, mtfData);

    // 5. Calculate structural Entry, TP1, TP2, TP3, SL levels using Dynamic TPSL Engine
    const currentPrice = analysis.currentPrice;
    const atr = analysis.indicators.volatility.atr || 0.0012;

    const tpsl = calculateDynamicTPSL({
      pair: normPair,
      direction: finalSignal.direction,
      currentPrice,
      atr,
      marketStructure: analysis.marketStructure,
      supportResistance: analysis.supportResistance,
    });

    // If technical setup cannot produce reasonable risk/reward, veto to NO_TRADE (Section 9)
    if (finalSignal.direction !== 'NO_TRADE' && !tpsl.isViable) {
      finalSignal.direction = 'NO_TRADE';
      finalSignal.confidence = 'LOW';
      finalSignal.reasons.push('Vetoed: Market structure cannot support minimum 1:1 risk-to-reward ratio');
    }

    const entry = tpsl.entry;
    const stopLoss = tpsl.stopLoss;
    const tp1 = tpsl.tp1;
    const tp2 = tpsl.tp2;
    const tp3 = tpsl.tp3;
    const riskReward = tpsl.riskReward;

    const signalObject = {
      pair: normPair,
      timeframe,
      direction: finalSignal.direction,
      score: finalSignal.score,
      confidence: finalSignal.confidence,
      entry,
      tp1,
      tp2,
      tp3,
      stopLoss,
      riskReward,
      breakdown: finalSignal.breakdown,
      reasons: finalSignal.reasons,
      status: 'ACTIVE',
      timeframeConsensus: finalSignal.timeframeConsensus,
      timeframeBreakdown: finalSignal.timeframeBreakdown,
      indicators: {
        ema20: analysis.indicators.trend.ema20,
        ema50: analysis.indicators.trend.ema50,
        ema200: analysis.indicators.trend.ema200,
        rsi: analysis.indicators.momentum.rsi,
        macdHistogram: analysis.indicators.momentum.macdHistogram,
        atr,
      },
      supportResistance: {
        nearestSupport: analysis.supportResistance.nearestSupport,
        nearestResistance: analysis.supportResistance.nearestResistance,
      },
      marketStructure: analysis.marketStructure.state,
      evaluatedAt: new Date().toISOString(),
    };

    // Cache in memory
    this.activeSignalsMemory.set(normPair, signalObject);
    this.evaluationCache.set(cacheKey, { data: signalObject, timestamp: Date.now() });

    // Save to MongoDB if connected and persist requested
    if (persist && mongoose.connection.readyState === 1 && (signalObject.direction === 'BUY' || signalObject.direction === 'SELL')) {
      await this.saveSignalToDB(signalObject);
    }

    return signalObject;
  }

  /**
   * Persist signal to MongoDB and record event
   */
  async saveSignalToDB(signalData) {
    try {
      // Check if active signal already exists for this pair to avoid spam
      const existing = await Signal.findOne({
        pair: signalData.pair,
        status: 'ACTIVE',
      });

      if (!existing) {
        const newSignal = await Signal.create({
          pair: signalData.pair,
          timeframe: signalData.timeframe,
          direction: signalData.direction,
          score: signalData.score,
          confidence: signalData.confidence,
          entry: signalData.entry,
          tp1: signalData.tp1,
          tp2: signalData.tp2,
          tp3: signalData.tp3,
          stopLoss: signalData.stopLoss,
          riskReward: signalData.riskReward,
          reasons: signalData.reasons,
          status: 'ACTIVE',
        });

        // Record Signal Event
        await SignalEvent.create({
          signalId: newSignal._id,
          eventType: 'CREATED',
          price: signalData.entry,
          timestamp: new Date(),
          notes: `Signal created with score ${signalData.score}/100`,
        });

        return newSignal;
      }
    } catch (err) {
      console.warn(`[SignalService] DB save warning: ${err.message}`);
    }
  }

  /**
   * Retrieve active signals across all pairs
   */
  async getActiveSignals() {
    if (mongoose.connection.readyState === 1) {
      try {
        const dbSignals = await Signal.find({ status: 'ACTIVE' }).sort({ createdAt: -1 });
        if (dbSignals.length > 0) return dbSignals;
      } catch (err) {
        console.warn(`[SignalService] DB query warning: ${err.message}`);
      }
    }

    // In-memory fallback
    return Array.from(this.activeSignalsMemory.values()).filter(
      (s) => s.direction === 'BUY' || s.direction === 'SELL'
    );
  }

  /**
   * Evaluate all 7 supported pairs simultaneously
   */
  async evaluateAllPairs(timeframe = '1h') {
    const pairs = marketDataManager.supportedPairs;
    const results = await Promise.all(
      pairs.map((p) => this.evaluatePair(p, timeframe, false))
    );
    return results;
  }

  /**
   * Get single signal by ID
   */
  async getSignalById(id) {
    if (mongoose.connection.readyState === 1) {
      return await Signal.findById(id);
    }
    // Return from memory if matched
    return Array.from(this.activeSignalsMemory.values()).find((s) => s._id === id || s.pair === id);
  }
}

export const signalService = new SignalService();
export default signalService;
