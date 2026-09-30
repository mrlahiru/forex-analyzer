import { marketScanner } from '../services/signals/marketScanner.js';

/**
 * Market Scanner Controller (Phase 8)
 */

export const getScannerStatus = (req, res, next) => {
  try {
    const status = marketScanner.getStatus();
    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
};

export const triggerManualScan = async (req, res, next) => {
  try {
    const timeframe = req.body?.timeframe || req.query?.timeframe || '1h';
    const result = await marketScanner.runScanCycle(timeframe);

    res.status(200).json({
      success: true,
      message: 'Market scan cycle executed successfully',
      data: result,
      scannerStatus: marketScanner.getStatus(),
    });
  } catch (error) {
    next(error);
  }
};

export const startScanner = (req, res, next) => {
  try {
    const result = marketScanner.start();
    res.status(200).json({
      success: true,
      message: 'Background market scanner started',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const stopScanner = (req, res, next) => {
  try {
    const result = marketScanner.stop();
    res.status(200).json({
      success: true,
      message: 'Background market scanner stopped',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getScannerEvents = (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const events = marketScanner.getEvents(limit);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    next(error);
  }
};
