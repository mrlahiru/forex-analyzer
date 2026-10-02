/**
 * Base Abstract Market Data Provider
 * All market data providers (Twelve Data, Oanda, Alpha Vantage, Polygon, Mock) must extend this class.
 */
export class MarketDataProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
    this.rateLimit = {
      requestsThisMinute: 0,
      lastReset: Date.now(),
      maxPerMinute: config.maxPerMinute || 8,
    };
  }

  /**
   * Normalizes standard currency pair notation to provider format
   * Input: "EUR/USD" or "EURUSD" or "EUR_USD" -> Output: "EUR/USD" (standard)
   */
  normalizePair(pair) {
    if (!pair) return 'EUR/USD';
    const clean = pair.toUpperCase().replace(/[^A-Z]/g, '');
    if (clean === 'GOLD' || clean === 'XAUUSD') {
      return 'XAU/USD';
    }
    if (clean.length === 6) {
      return `${clean.slice(0, 3)}/${clean.slice(3)}`;
    }
    return pair.toUpperCase();
  }

  /**
   * Format pair for provider specific API needs
   */
  formatPairForProvider(pair) {
    return this.normalizePair(pair);
  }

  /**
   * Standard timeframes: '1m', '5m', '15m', '30m', '1h', '4h', '1d'
   */
  mapTimeframe(timeframe) {
    return timeframe;
  }

  /**
   * Check and update simple in-memory rate limiting
   */
  checkRateLimit() {
    const now = Date.now();
    if (now - this.rateLimit.lastReset > 60000) {
      this.rateLimit.requestsThisMinute = 0;
      this.rateLimit.lastReset = now;
    }

    if (this.rateLimit.requestsThisMinute >= this.rateLimit.maxPerMinute) {
      return false;
    }

    this.rateLimit.requestsThisMinute += 1;
    return true;
  }

  /**
   * Fetch candlestick OHLCV data
   * @param {string} pair - e.g. "EUR/USD"
   * @param {string} timeframe - '1m', '5m', '15m', '30m', '1h', '4h', '1d'
   * @param {number} limit - number of candles to return (default 100)
   * @returns {Promise<Array<{ timestamp: string, open: number, high: number, low: number, close: number, volume: number }>>}
   */
  async getCandles(pair, timeframe = '1h', limit = 100) {
    throw new Error(`getCandles() must be implemented by ${this.name}`);
  }

  /**
   * Fetch single quote for a pair
   * @param {string} pair - e.g. "EUR/USD"
   * @returns {Promise<{ pair: string, price: number, change: number, changePercent: number, high: number, low: number, timestamp: string, provider: string }>}
   */
  async getQuote(pair) {
    throw new Error(`getQuote() must be implemented by ${this.name}`);
  }

  /**
   * Fetch batch quotes for multiple pairs
   * @param {string[]} pairs
   */
  async getQuotes(pairs) {
    const results = await Promise.allSettled(pairs.map((p) => this.getQuote(p)));
    return results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => r.value);
  }
}

export default MarketDataProvider;
