import { signalService } from '../services/signals/index.js';

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
