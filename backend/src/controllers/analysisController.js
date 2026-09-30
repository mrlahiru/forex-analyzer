import {
  runTechnicalAnalysis,
  runMultiTimeframeAnalysis,
} from '../services/indicators/analysisEngine.js';
import { marketDataManager } from '../services/marketData/index.js';

export const getAnalysisByPair = async (req, res, next) => {
  try {
    const { pair } = req.params;
    const timeframe = req.query.timeframe || '1h';

    // Ingest latest candles for the pair & timeframe
    const candleResult = await marketDataManager.getCandles(pair, timeframe, 120);

    const analysis = runTechnicalAnalysis(
      candleResult.candles,
      candleResult.pair,
      timeframe
    );

    res.status(200).json({
      success: true,
      analysis,
    });
  } catch (error) {
    next(error);
  }
};

export const getMultiTimeframeAnalysis = async (req, res, next) => {
  try {
    const { pair } = req.params;
    const mtfResult = await runMultiTimeframeAnalysis(pair);

    res.status(200).json({
      success: true,
      data: mtfResult,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPairsAnalysis = async (req, res, next) => {
  try {
    const timeframe = req.query.timeframe || '1h';
    const pairs = marketDataManager.supportedPairs;

    const results = await Promise.all(
      pairs.map(async (pair) => {
        try {
          const candleResult = await marketDataManager.getCandles(pair, timeframe, 100);
          return runTechnicalAnalysis(candleResult.candles, pair, timeframe);
        } catch (err) {
          return {
            pair,
            error: err.message,
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      timeframe,
      count: results.length,
      analyses: results,
    });
  } catch (error) {
    next(error);
  }
};
