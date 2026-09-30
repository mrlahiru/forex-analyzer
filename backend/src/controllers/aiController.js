import { openaiService } from '../services/ai/index.js';
import { signalService } from '../services/signals/index.js';
import { marketDataManager } from '../services/marketData/index.js';
import { runTechnicalAnalysis } from '../services/indicators/analysisEngine.js';

/**
 * AI Explanation Controller (Phase 7)
 * Generates transparent technical justifications, scenario risks, and key levels
 */

export const getAiExplanation = async (req, res, next) => {
  try {
    const { pair } = req.params;
    const timeframe = req.query.timeframe || '1h';

    // 1. Evaluate deterministic signal and levels
    const signal = await signalService.evaluatePair(pair, timeframe, true);

    // 2. Fetch candles and run technical analysis for detailed indicators
    const candleResult = await marketDataManager.getCandles(pair, timeframe, 100);
    const analysis = runTechnicalAnalysis(candleResult.candles, signal.pair, timeframe);

    // 3. Generate structured AI explanation
    const explanation = await openaiService.generateExplanation({
      signal,
      analysis,
      pair: signal.pair,
      timeframe,
    });

    res.status(200).json({
      success: true,
      data: explanation,
    });
  } catch (error) {
    next(error);
  }
};

export const postAiExplanation = async (req, res, next) => {
  try {
    const { pair, timeframe = '1h', signal, analysis } = req.body;

    if (!signal) {
      return res.status(400).json({
        success: false,
        message: 'Signal payload is required for custom AI explanation',
      });
    }

    const explanation = await openaiService.generateExplanation({
      signal,
      analysis,
      pair: pair || signal.pair || 'EUR/USD',
      timeframe,
    });

    res.status(200).json({
      success: true,
      data: explanation,
    });
  } catch (error) {
    next(error);
  }
};
