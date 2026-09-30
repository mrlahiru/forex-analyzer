import { backtestEngine } from '../services/backtesting/index.js';

/**
 * Backtest Controller (Phase 10)
 */

export const runBacktest = async (req, res, next) => {
  try {
    const {
      pair = 'EUR/USD',
      timeframe = '1h',
      initialBalance = 10000,
      riskPercentage = 1.0,
      lookbackBars = 300,
      minScore = 65,
      strategy = 'DETERMINISTIC_CORE',
    } = req.body;

    const results = await backtestEngine.runBacktest({
      pair,
      timeframe,
      initialBalance: parseFloat(initialBalance),
      riskPercentage: parseFloat(riskPercentage),
      lookbackBars: parseInt(lookbackBars, 10),
      minScore: parseInt(minScore, 10),
      strategy,
    });

    res.status(200).json({
      success: true,
      message: 'Historical strategy simulation completed successfully',
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

export const getBacktestResults = (req, res, next) => {
  try {
    const data = backtestEngine.lastResult;
    if (!data) {
      return res.status(200).json({
        success: true,
        message: 'No previous backtest in memory. Run a backtest first.',
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getBacktestStrategies = (req, res, next) => {
  try {
    const strategies = backtestEngine.getStrategies();
    res.status(200).json({
      success: true,
      data: strategies,
    });
  } catch (error) {
    next(error);
  }
};
