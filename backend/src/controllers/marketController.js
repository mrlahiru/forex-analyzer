import { marketDataManager } from '../services/marketData/index.js';

export const getAllMarkets = async (req, res, next) => {
  try {
    const quotes = await marketDataManager.getAllQuotes();
    const status = marketDataManager.getProviderStatus();

    res.status(200).json({
      success: true,
      count: quotes.length,
      activeProvider: status.activeProvider,
      isLive: status.isLive,
      markets: quotes,
    });
  } catch (error) {
    next(error);
  }
};

export const getMarketByPair = async (req, res, next) => {
  try {
    const { pair } = req.params;
    const quote = await marketDataManager.getQuote(pair);

    res.status(200).json({
      success: true,
      market: quote,
    });
  } catch (error) {
    next(error);
  }
};

export const getCandles = async (req, res, next) => {
  try {
    const { pair } = req.params;
    const timeframe = req.query.timeframe || '1h';
    const limit = parseInt(req.query.limit || '100', 10);

    const validTimeframes = marketDataManager.supportedTimeframes;
    if (!validTimeframes.includes(timeframe)) {
      return res.status(400).json({
        success: false,
        message: `Invalid timeframe '${timeframe}'. Supported: ${validTimeframes.join(', ')}`,
      });
    }

    const safeLimit = Math.min(Math.max(limit, 10), 500);
    const result = await marketDataManager.getCandles(pair, timeframe, safeLimit);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getProviderStatus = async (req, res, next) => {
  try {
    const status = marketDataManager.getProviderStatus();
    res.status(200).json({
      success: true,
      status,
    });
  } catch (error) {
    next(error);
  }
};
