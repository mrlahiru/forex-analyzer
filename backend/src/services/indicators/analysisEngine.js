import { calculateTrendIndicators } from './trend.js';
import { calculateRSI, calculateMACD } from './momentum.js';
import { calculateATR } from './volatility.js';
import { analyzeMarketStructure } from './marketStructure.js';
import { calculateSupportResistance } from './supportResistance.js';
import { marketDataManager } from '../marketData/index.js';

/**
 * Perform comprehensive technical analysis on a candlestick array
 * @param {Array<{ high: number, low: number, open: number, close: number, timestamp: string }>} candles
 * @param {string} pair
 * @param {string} timeframe
 */
export const runTechnicalAnalysis = (candles, pair = 'EUR/USD', timeframe = '1h') => {
  if (!candles || candles.length === 0) {
    throw new Error(`Cannot run analysis: no candles provided for ${pair}`);
  }

  const currentPrice = candles[candles.length - 1].close;

  // 1. Trend Analysis (EMAs & SMA)
  const trend = calculateTrendIndicators(candles);

  // 2. Momentum Analysis (RSI & MACD)
  const rsi = calculateRSI(candles, 14);
  const macd = calculateMACD(candles, 12, 26, 9);

  // 3. Volatility Analysis (ATR)
  const volatility = calculateATR(candles, 14);

  // 4. Market Structure Detection (HH/HL/LH/LL, Breakout/Breakdown, Consolidation)
  const marketStructure = analyzeMarketStructure(candles, 3);

  // 5. Dynamic Support & Resistance Zones
  const srZones = calculateSupportResistance(candles);

  // 6. Overall Technical Bias Summary
  let bullishSignals = 0;
  let bearishSignals = 0;

  // EMA alignment scoring
  if (trend.alignment === 'STRONG_BULLISH' || trend.alignment === 'BULLISH') bullishSignals += 2;
  else if (trend.alignment === 'STRONG_BEARISH' || trend.alignment === 'BEARISH') bearishSignals += 2;

  // RSI scoring
  if (rsi.rsi && rsi.rsi > 52 && rsi.rsi < 70) bullishSignals += 1;
  else if (rsi.rsi && rsi.rsi < 48 && rsi.rsi > 30) bearishSignals += 1;

  // MACD scoring
  if (macd.trend.includes('BULLISH')) bullishSignals += 1.5;
  else if (macd.trend.includes('BEARISH')) bearishSignals += 1.5;

  // Market structure scoring
  if (marketStructure.trend === 'BULLISH' || marketStructure.isBreakout) bullishSignals += 2;
  else if (marketStructure.trend === 'BEARISH' || marketStructure.isBreakdown) bearishSignals += 2;

  let overallBias = 'NEUTRAL';
  if (bullishSignals > bearishSignals + 1) overallBias = 'BULLISH';
  else if (bearishSignals > bullishSignals + 1) overallBias = 'BEARISH';

  return {
    pair,
    timeframe,
    currentPrice,
    overallBias,
    candleCount: candles.length,
    timestamp: new Date().toISOString(),

    indicators: {
      trend: {
        ema20: trend.ema20,
        ema50: trend.ema50,
        ema200: trend.ema200,
        sma50: trend.sma50,
        alignment: trend.alignment,
      },
      momentum: {
        rsi: rsi.rsi,
        rsiStatus: rsi.status,
        macd: macd.macd,
        macdSignal: macd.signal,
        macdHistogram: macd.histogram,
        macdTrend: macd.trend,
        isBullishCrossover: macd.isBullishCrossover,
        isBearishCrossover: macd.isBearishCrossover,
      },
      volatility: {
        atr: volatility.atr,
        atrPercent: volatility.atrPercent,
      },
    },

    marketStructure: {
      state: marketStructure.state,
      trend: marketStructure.trend,
      highStructure: marketStructure.highStructure,
      lowStructure: marketStructure.lowStructure,
      isBreakout: marketStructure.isBreakout,
      isBreakdown: marketStructure.isBreakdown,
      isConsolidating: marketStructure.isConsolidating,
      recentSwingHigh: marketStructure.recentSwingHigh,
      recentSwingLow: marketStructure.recentSwingLow,
      summary: marketStructure.summary,
    },

    supportResistance: {
      supports: srZones.supports,
      resistances: srZones.resistances,
      nearestSupport: srZones.nearestSupport,
      nearestResistance: srZones.nearestResistance,
      supportDistance: srZones.supportDistance,
      resistanceDistance: srZones.resistanceDistance,
    },
  };
};

const mtfCache = new Map();

/**
 * Multi-Timeframe Confirmation Analysis
 * Evaluates 4H, 1H, 15M, 5M timeframes to check alignment (cached for 5 minutes)
 * @param {string} pair
 */
export const runMultiTimeframeAnalysis = async (pair) => {
  const normPair = marketDataManager.normalizePair(pair);
  const cached = mtfCache.get(normPair);
  // Cache for 5 minutes (300,000 ms) because macro timeframes (4h, 1h) move slowly
  if (cached && Date.now() - cached.timestamp < 300000) {
    return cached.data;
  }

  const timeframes = ['4h', '1h', '15m', '5m'];

  const results = await Promise.all(
    timeframes.map(async (tf) => {
      const candleRes = await marketDataManager.getCandles(normPair, tf, 80);
      const analysis = runTechnicalAnalysis(candleRes.candles, normPair, tf);
      return {
        timeframe: tf,
        bias: analysis.overallBias,
        structure: analysis.marketStructure.state,
        rsi: analysis.indicators.momentum.rsi,
        macdTrend: analysis.indicators.momentum.macdTrend,
      };
    })
  );

  // Measure multi-timeframe concordance
  const bullishCount = results.filter((r) => r.bias === 'BULLISH').length;
  const bearishCount = results.filter((r) => r.bias === 'BEARISH').length;

  let consensus = 'MIXED';
  let confidenceBonus = 0;

  if (bullishCount >= 3) {
    consensus = 'STRONG_BULLISH_CONCORDANCE';
    confidenceBonus = 15;
  } else if (bearishCount >= 3) {
    consensus = 'STRONG_BEARISH_CONCORDANCE';
    confidenceBonus = 15;
  } else if (bullishCount === 2 && bearishCount === 0) {
    consensus = 'MODERATE_BULLISH_ALIGNMENT';
    confidenceBonus = 5;
  } else if (bearishCount === 2 && bullishCount === 0) {
    consensus = 'MODERATE_BEARISH_ALIGNMENT';
    confidenceBonus = 5;
  } else {
    consensus = 'CONFLICTING_TIMEFRAMES';
    confidenceBonus = -10;
  }

  const responseData = {
    pair: normPair,
    consensus,
    confidenceBonus,
    timeframes: results,
    timestamp: new Date().toISOString(),
  };

  mtfCache.set(normPair, { data: responseData, timestamp: Date.now() });
  return responseData;
};

export default {
  runTechnicalAnalysis,
  runMultiTimeframeAnalysis,
};
