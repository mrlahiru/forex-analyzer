import config from '../../config/index.js';
import { MarketDataProvider } from './MarketDataProvider.js';
import { YahooFinanceProvider } from './YahooFinanceProvider.js';
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
      'XAU/USD',
    ];

    this.supportedTimeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

    // In-memory caches
    this.quoteCache = new Map();
    this.candleCache = new Map();
    this.lastBatchQuotes = null;
    this.lastBatchFetch = 0;

    this.initProviders();
  }

  initProviders() {
    const twelveKey = process.env.TWELVE_DATA_API_KEY || config.marketData.twelveDataKey;

    this.providers = {
      yahoo_finance: new YahooFinanceProvider(),
      twelve_data: new TwelveDataProvider(twelveKey),
      alpha_vantage: new AlphaVantageProvider(config.marketData.alphaVantageKey),
      oanda: new OandaProvider(config.marketData.oandaKey),
      polygon: new PolygonProvider(config.marketData.polygonKey),
      mock: new MockMarketDataProvider(),
    };

    // Yahoo Finance provides 100% free unlimited real-time market data without burning API credits.
    // If user explicitly configured DEFAULT_MARKET_PROVIDER in .env, respect that; otherwise default to yahoo_finance.
    const preferred = process.env.DEFAULT_MARKET_PROVIDER;
    if (preferred && this.providers[preferred]) {
      this.activeProviderName = preferred;
    } else {
      this.activeProviderName = 'yahoo_finance';
    }

    console.log(`[MarketData] Active Provider: ${this.activeProviderName} (Live: ${this.activeProviderName !== 'mock'})`);
  }

  checkAndPromoteProvider() {
    // If twelve key is present and user set DEFAULT_MARKET_PROVIDER=twelve_data
    const preferred = process.env.DEFAULT_MARKET_PROVIDER;
    if (preferred && this.providers[preferred] && this.activeProviderName !== preferred) {
      this.activeProviderName = preferred;
    }
  }

  getActiveProvider() {
    this.checkAndPromoteProvider();
    return this.providers[this.activeProviderName] || this.providers.yahoo_finance || this.providers.mock;
  }

  setActiveProvider(name) {
    if (!this.providers[name]) {
      throw new Error(`Provider ${name} does not exist`);
    }
    this.activeProviderName = name;
    // Clear batch cache so new provider takes effect immediately
    this.lastBatchQuotes = null;
    this.lastBatchFetch = 0;
    console.log(`[MarketData] Provider switched to: ${name}`);
  }

  getProviderStatus() {
    this.checkAndPromoteProvider();
    const twelveUsage = typeof this.providers.twelve_data.getUsageInfo === 'function'
      ? this.providers.twelve_data.getUsageInfo()
      : { creditsUsed: 0, dailyLimit: 800, remaining: 800 };

    return {
      activeProvider: this.activeProviderName,
      isLive: this.activeProviderName !== 'mock',
      availableProviders: [
        { id: 'yahoo_finance', name: 'Yahoo Finance (Unlimited Live, 0 Credits)', isLive: true },
        { id: 'twelve_data', name: 'Twelve Data (Eco Mode - 800 Daily Credits)', isLive: true, usage: twelveUsage },
        { id: 'mock', name: 'Simulation Engine (Offline Test)', isLive: false },
      ],
      twelveDataUsage: twelveUsage,
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
    this.checkAndPromoteProvider();
    const normPair = this.normalizePair(pair);
    const cached = this.quoteCache.get(normPair);
    const quoteTtl = this.activeProviderName === 'mock' ? 1200 : 30000;
    if (cached && Date.now() - cached.cachedAt < quoteTtl) {
      return cached.data;
    }

    const providerOrder = [
      this.activeProviderName,
      'yahoo_finance',
      'twelve_data',
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
    return await this.providers.mock.getQuote(normPair);
  }

  /**
   * Get all quotes for supported pairs with intelligent caching and micro-ticks
   */
  async getAllQuotes() {
    this.checkAndPromoteProvider();
    const now = Date.now();
    const batchTtl = this.activeProviderName === 'mock' ? 1500 : 35000; // 35s cache for live providers

    // Return cached batch with smooth micro-fluctuations (sub-pip) so UI cards continuously flash
    if (this.lastBatchQuotes && now - this.lastBatchFetch < batchTtl) {
      return this.lastBatchQuotes.map((q) => {
        const isJpy = q.pair.includes('JPY');
        const isGold = q.pair.includes('XAU') || q.pair.includes('GOLD');
        const spreadFactor = isGold ? 0.35 : (isJpy ? 0.015 : 0.00004);
        const decimals = (isJpy || isGold) ? 2 : 5;
        const tick = (Math.random() - 0.5) * spreadFactor;
        const newPrice = parseFloat((q.price + tick).toFixed(decimals));
        const prevClose = q.price - (q.change || 0);
        const newChange = parseFloat((newPrice - prevClose).toFixed(decimals));
        const newChangePercent = prevClose !== 0 ? parseFloat((((newPrice - prevClose) / prevClose) * 100).toFixed(2)) : q.changePercent;

        return {
          ...q,
          price: newPrice,
          change: newChange,
          changePercent: newChangePercent,
          timestamp: new Date().toISOString(),
        };
      });
    }

    const providerOrder = [
      this.activeProviderName,
      'yahoo_finance',
      'twelve_data',
      'mock',
    ].filter((name, index, self) => self.indexOf(name) === index);

    for (const name of providerOrder) {
      const provider = this.providers[name];
      if (!provider || (!provider.isAvailable() && name !== 'mock')) continue;

      try {
        let quotes = null;
        if (typeof provider.getQuotes === 'function') {
          quotes = await provider.getQuotes(this.supportedPairs);
        } else {
          quotes = await Promise.all(this.supportedPairs.map((p) => provider.getQuote(p)));
        }

        if (quotes && quotes.length > 0) {
          for (const q of quotes) {
            this.quoteCache.set(q.pair, { data: q, cachedAt: now });
          }
          this.lastBatchQuotes = quotes;
          this.lastBatchFetch = now;
          return quotes;
        }
      } catch (err) {
        console.warn(`[MarketData] ${name} getAllQuotes failed: ${err.message}. Cascading to next provider...`);
      }
    }

    // Guaranteed fallback
    const fallbackQuotes = await this.providers.mock.getQuotes(this.supportedPairs);
    this.lastBatchQuotes = fallbackQuotes;
    this.lastBatchFetch = now;
    return fallbackQuotes;
  }

  /**
   * Get candles with timeframe-aware TTL caching and fallback cascade
   */
  async getCandles(pair, timeframe = '1h', limit = 100) {
    const normPair = this.normalizePair(pair);
    const cacheKey = `${normPair}_${timeframe}_${limit}`;
    const cached = this.candleCache.get(cacheKey);

    // Dynamic TTL based on timeframe to conserve API calls:
    // 1m -> 2 mins, 5m -> 5 mins, 15m/30m -> 15 mins, 1h -> 30 mins, 4h/1d -> 60 mins
    const ttlMap = {
      '1m': 120000,
      '5m': 300000,
      '15m': 600000,
      '30m': 900000,
      '1h': 1800000,
      '4h': 3600000,
      '1d': 7200000,
    };
    const candleTtl = this.activeProviderName === 'mock' ? 2000 : (ttlMap[timeframe] || 600000);

    if (cached && Date.now() - cached.cachedAt < candleTtl) {
      return cached.data;
    }

    const providerOrder = [
      this.activeProviderName,
      'yahoo_finance',
      'twelve_data',
      'mock',
    ].filter((name, index, self) => self.indexOf(name) === index);

    let candles = null;
    let successfulProvider = 'mock';

    for (const name of providerOrder) {
      const provider = this.providers[name];
      if (!provider || (!provider.isAvailable() && name !== 'mock')) continue;

      try {
        candles = await provider.getCandles(normPair, timeframe, limit);
        if (candles && candles.length > 0) {
          successfulProvider = name;
          break;
        }
      } catch (err) {
        console.warn(`[MarketData] ${name} getCandles failed for ${normPair} (${timeframe}): ${err.message}`);
      }
    }

    if (!candles || candles.length === 0) {
      candles = await this.providers.mock.getCandles(normPair, timeframe, limit);
      successfulProvider = 'mock';
    }

    const result = {
      pair: normPair,
      timeframe,
      provider: successfulProvider,
      isLive: successfulProvider !== 'mock',
      count: candles.length,
      candles,
    };

    // Cache in memory
    this.candleCache.set(cacheKey, { data: result, cachedAt: Date.now() });

    // Asynchronously save latest candles to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      this.persistCandlesToDB(normPair, timeframe, candles).catch((e) =>
        console.warn(`[MarketData] DB persist warning: ${e.message}`)
      );
    }

    return result;
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
