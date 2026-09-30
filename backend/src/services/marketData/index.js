import config from '../../config/index.js';
import { MarketDataProvider } from './MarketDataProvider.js';
import { TwelveDataProvider } from './TwelveDataProvider.js';
import { AlphaVantageProvider } from './AlphaVantageProvider.js';
import { OandaProvider } from './OandaProvider.js';
import { PolygonProvider } from './PolygonProvider.js';
import { MockMarketDataProvider } from './MockMarketDataProvider.js';
import MarketData from '../../models/MarketData.js';
import mongoose from 'mongoose';

export class MarketDataManager {
  constructor() {
    this.supportedPairs = [
      'EUR/USD',
      'GBP/USD',
      'USD/JPY',
      'USD/CHF',
      'AUD/USD',
      'USD/CAD',
      'NZD/USD',
    ];

    this.supportedTimeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

    // In-memory quote cache (TTL 10 seconds)
    this.quoteCache = new Map();
    this.candleCache = new Map();

    this.initProviders();
  }

  initProviders() {
    this.providers = {
      twelve_data: new TwelveDataProvider(config.marketData.twelveDataKey),
      alpha_vantage: new AlphaVantageProvider(config.marketData.alphaVantageKey),
      oanda: new OandaProvider(config.marketData.oandaKey),
      polygon: new PolygonProvider(config.marketData.polygonKey),
      mock: new MockMarketDataProvider(),
    };

    // Determine primary provider based on availability
    if (this.providers.twelve_data.isAvailable()) {
      this.activeProviderName = 'twelve_data';
    } else if (this.providers.alpha_vantage.isAvailable()) {
      this.activeProviderName = 'alpha_vantage';
    } else if (this.providers.oanda.isAvailable()) {
      this.activeProviderName = 'oanda';
    } else if (this.providers.polygon.isAvailable()) {
      this.activeProviderName = 'polygon';
    } else {
      this.activeProviderName = 'mock';
    }

    console.log(`[MarketData] Active Provider: ${this.activeProviderName} (Live: ${this.activeProviderName !== 'mock'})`);
  }

  getActiveProvider() {
    return this.providers[this.activeProviderName] || this.providers.mock;
  }

  setActiveProvider(name) {
    if (!this.providers[name]) {
      throw new Error(`Provider ${name} does not exist`);
    }
    this.activeProviderName = name;
  }

  getProviderStatus() {
    return {
      activeProvider: this.activeProviderName,
      isLive: this.activeProviderName !== 'mock',
      providers: {
        twelve_data: {
          configured: this.providers.twelve_data.isAvailable(),
          rateLimit: this.providers.twelve_data.rateLimit,
        },
        alpha_vantage: {
          configured: this.providers.alpha_vantage.isAvailable(),
          rateLimit: this.providers.alpha_vantage.rateLimit,
        },
        oanda: {
          configured: this.providers.oanda.isAvailable(),
        },
        polygon: {
          configured: this.providers.polygon.isAvailable(),
        },
        mock: {
          configured: true,
          status: 'Always Available (Fallback)',
        },
      },
      supportedPairs: this.supportedPairs,
      supportedTimeframes: this.supportedTimeframes,
    };
  }

  normalizePair(pair) {
    return this.getActiveProvider().normalizePair(pair);
  }

  /**
   * Get latest quote for single pair with fallback cascade
   */
  async getQuote(pair) {
    const normPair = this.normalizePair(pair);
    const cached = this.quoteCache.get(normPair);
    if (cached && Date.now() - cached.cachedAt < 10000) {
      return cached.data;
    }

    const providerOrder = [
      this.activeProviderName,
      'twelve_data',
      'alpha_vantage',
      'mock',
    ].filter((name, index, self) => self.indexOf(name) === index);

    for (const name of providerOrder) {
      const provider = this.providers[name];
      if (!provider || (!provider.isAvailable() && name !== 'mock')) continue;

      try {
        const quote = await provider.getQuote(normPair);
        this.quoteCache.set(normPair, { data: quote, cachedAt: Date.now() });
        return quote;
      } catch (err) {
        console.warn(`[MarketData] ${name} quote failed for ${normPair}: ${err.message}. Trying next...`);
      }
    }

    // Fallback to mock guaranteed
    const fallbackQuote = await this.providers.mock.getQuote(normPair);
    return fallbackQuote;
  }

  /**
   * Get all quotes for supported pairs
   */
  async getAllQuotes() {
    const quotes = await Promise.all(
      this.supportedPairs.map((pair) => this.getQuote(pair))
    );
    return quotes;
  }

  /**
   * Get candles with fallback cascade and optional DB caching
   */
  async getCandles(pair, timeframe = '1h', limit = 100) {
    const normPair = this.normalizePair(pair);
    const cacheKey = `${normPair}_${timeframe}_${limit}`;
    const cached = this.candleCache.get(cacheKey);

    // Candle cache TTL 15 seconds
    if (cached && Date.now() - cached.cachedAt < 15000) {
      return cached.data;
    }

    const providerOrder = [
      this.activeProviderName,
      'twelve_data',
      'alpha_vantage',
      'mock',
    ].filter((name, index, self) => self.indexOf(name) === index);

    let candles = null;
    let successfulProvider = 'mock';

    for (const name of providerOrder) {
      const provider = this.providers[name];
      if (!provider || (!provider.isAvailable() && name !== 'mock')) continue;

      try {
        candles = await provider.getCandles(normPair, timeframe, limit);
        successfulProvider = name;
        break;
      } catch (err) {
        console.warn(`[MarketData] ${name} getCandles failed for ${normPair} (${timeframe}): ${err.message}`);
      }
    }

    if (!candles || candles.length === 0) {
      candles = await this.providers.mock.getCandles(normPair, timeframe, limit);
      successfulProvider = 'mock';
    }

    // Cache in memory
    this.candleCache.set(cacheKey, { data: candles, cachedAt: Date.now() });

    // Asynchronously save latest candles to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      this.persistCandlesToDB(normPair, timeframe, candles).catch((e) =>
        console.warn(`[MarketData] DB persist warning: ${e.message}`)
      );
    }

    return {
      pair: normPair,
      timeframe,
      provider: successfulProvider,
      isLive: successfulProvider !== 'mock',
      count: candles.length,
      candles,
    };
  }

  /**
   * Asynchronously upsert candlestick records into MongoDB MarketData collection
   */
  async persistCandlesToDB(pair, timeframe, candles) {
    if (!candles || candles.length === 0) return;
    const operations = candles.slice(-20).map((c) => ({
      updateOne: {
        filter: { pair, timeframe, timestamp: new Date(c.timestamp) },
        update: {
          $set: {
            pair,
            timeframe,
            timestamp: new Date(c.timestamp),
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            volume: c.volume,
          },
        },
        upsert: true,
      },
    }));
    await MarketData.bulkWrite(operations, { ordered: false });
  }
}

export const marketDataManager = new MarketDataManager();
export default marketDataManager;
export { MarketDataProvider };
