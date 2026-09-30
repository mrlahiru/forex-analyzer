import { calculatePositionSize } from '../services/risk/positionCalculator.js';
import { calculateDynamicTPSL } from '../services/risk/tpslEngine.js';
import { marketDataManager } from '../services/marketData/index.js';
import { runTechnicalAnalysis } from '../services/indicators/analysisEngine.js';

export const calculateRisk = (req, res, next) => {
  try {
    const {
      accountBalance = 1000,
      riskPercentage = 1.0,
      entryPrice,
      stopLoss,
      tp1,
      tp2,
      tp3,
      pair = 'EUR/USD',
    } = req.body;

    const result = calculatePositionSize({
      accountBalance,
      riskPercentage,
      entryPrice,
      stopLoss,
      tp1,
      tp2,
      tp3,
      pair,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPairRiskParameters = async (req, res, next) => {
  try {
    const { pair } = req.params;
    const direction = req.query.direction || 'BUY';
    const timeframe = req.query.timeframe || '1h';

    const candleResult = await marketDataManager.getCandles(pair, timeframe, 100);
    const analysis = runTechnicalAnalysis(candleResult.candles, pair, timeframe);

    const levels = calculateDynamicTPSL({
      pair: candleResult.pair,
      direction,
      currentPrice: analysis.currentPrice,
      atr: analysis.indicators.volatility.atr,
      marketStructure: analysis.marketStructure,
      supportResistance: analysis.supportResistance,
    });

    res.status(200).json({
      success: true,
      pair: candleResult.pair,
      timeframe,
      direction,
      levels,
      atr: analysis.indicators.volatility.atr,
      atrPercent: analysis.indicators.volatility.atrPercent,
    });
  } catch (error) {
    next(error);
  }
};
