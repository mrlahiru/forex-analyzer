import axios from 'axios';
import MarketDataProvider from './MarketDataProvider.js';

export class TwelveDataProvider extends MarketDataProvider {
  constructor(apiKey) {
    super('TwelveData', { maxPerMinute: 6 });
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.twelvedata.com';
    this.creditsUsed = 0;
    this.dailyLimit = 800;
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });
  }

  formatPairForProvider(pair) {
    // Twelve Data accepts "EUR/USD" directly
    return this.normalizePair(pair);
  }

  mapTimeframe(timeframe) {
    const map = {
      '1m': '1min',
      '5m': '5min',
      '15m': '15min',
      '30m': '30min',
      '1h': '1h',
      '4h': '4h',
      '1d': '1day',
    };
    return map[timeframe] || '1h';
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  recordCreditsFromHeaders(headers) {
    if (headers && headers['api-credits-used']) {
      const used = parseInt(headers['api-credits-used'], 10);
      if (!isNaN(used)) {
        this.creditsUsed = used;
      }
    }
  }

  getUsageInfo() {
    return {
      creditsUsed: this.creditsUsed,
      dailyLimit: this.dailyLimit,
      remaining: Math.max(0, this.dailyLimit - this.creditsUsed),
      isExhausted: this.creditsUsed >= 780,
    };
  }

  async getCandles(pair, timeframe = '1h', limit = 100) {
    if (!this.isAvailable()) {
      throw new Error('Twelve Data API key is not configured');
    }

    if (this.creditsUsed >= 780) {
      throw new Error(`Twelve Data daily credit limit reached (${this.creditsUsed}/${this.dailyLimit})`);
    }

    if (!this.checkRateLimit()) {
      throw new Error('Twelve Data free rate limit reached (max 6-8 requests/min). Please wait a moment.');
    }

    const symbol = this.formatPairForProvider(pair);
    const interval = this.mapTimeframe(timeframe);

    try {
      const response = await this.client.get('/time_series', {
        params: {
          symbol,
          interval,
          outputsize: Math.min(limit, 500),
          apikey: this.apiKey,
        },
      });

      this.recordCreditsFromHeaders(response.headers);
      const data = response.data;

      if (data.status === 'error' || data.code === 429) {
        throw new Error(data.message || 'Twelve Data API returned an error or quota exceeded');
      }

      if (!data.values || !Array.isArray(data.values)) {
        throw new Error(`No candle data returned for ${pair}`);
      }

      // Convert and reverse so candles are in ascending chronological order (oldest -> newest)
      const candles = data.values
        .map((c) => ({
          timestamp: new Date(c.datetime).toISOString(),
          time: Math.floor(new Date(c.datetime).getTime() / 1000), // UNIX timestamp for TradingView
          open: parseFloat(c.open),
          high: parseFloat(c.high),
          low: parseFloat(c.low),
          close: parseFloat(c.close),
          volume: parseFloat(c.volume || 0),
        }))
        .filter((c) => !isNaN(c.close))
        .reverse();

      return candles;
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      throw new Error(`[TwelveData] Failed to fetch candles for ${pair}: ${msg}`);
    }
  }

  async getQuote(pair) {
    if (!this.isAvailable()) {
      throw new Error('Twelve Data API key is not configured');
    }

    if (this.creditsUsed >= 780) {
      throw new Error(`Twelve Data daily credit limit reached (${this.creditsUsed}/${this.dailyLimit})`);
    }

    if (!this.checkRateLimit()) {
      throw new Error('Twelve Data rate limit reached (max 6-8 requests/min)');
    }

    const symbol = this.formatPairForProvider(pair);

    try {
      const response = await this.client.get('/quote', {
        params: {
          symbol,
          apikey: this.apiKey,
        },
      });

      this.recordCreditsFromHeaders(response.headers);
      const data = response.data;
      if (data.status === 'error' || data.code === 429) {
        throw new Error(data.message || 'Error fetching quote from Twelve Data');
      }

      const price = parseFloat(data.close || data.price);
      const prevClose = parseFloat(data.previous_close || price);
      const change = parseFloat(data.change || (price - prevClose).toFixed(5));
      const changePercent = parseFloat(
        data.percent_change || (((price - prevClose) / prevClose) * 100).toFixed(2)
      );

      return {
        pair: this.normalizePair(pair),
        price,
        open: parseFloat(data.open || price),
        high: parseFloat(data.high || price),
        low: parseFloat(data.low || price),
        change,
        changePercent,
        timestamp: new Date().toISOString(),
        provider: 'twelve_data',
        isLive: true,
      };
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      throw new Error(`[TwelveData] Failed to fetch quote for ${pair}: ${msg}`);
    }
  }

  async getQuotes(pairs) {
    if (!this.isAvailable()) {
      throw new Error('Twelve Data API key is not configured');
    }

    if (this.creditsUsed >= 780) {
      throw new Error(`Twelve Data daily credit limit reached (${this.creditsUsed}/${this.dailyLimit})`);
    }

    if (!this.checkRateLimit()) {
      throw new Error('Twelve Data rate limit reached (max 6-8 requests/min)');
    }

    const symbols = pairs.map((p) => this.formatPairForProvider(p)).join(',');

    try {
      const response = await this.client.get('/quote', {
        params: {
          symbol: symbols,
          apikey: this.apiKey,
        },
      });

      this.recordCreditsFromHeaders(response.headers);
      const data = response.data;
      if (data.status === 'error' || data.code === 429) {
        throw new Error(data.message || 'Error fetching batch quotes from Twelve Data');
      }

      const results = [];
      for (const pair of pairs) {
        const norm = this.normalizePair(pair);
        const quoteData = data[norm] || data[pair];
        if (quoteData && !quoteData.status) {
          const price = parseFloat(quoteData.close || quoteData.price || 0);
          const prevClose = parseFloat(quoteData.previous_close || price);
          const change = parseFloat(quoteData.change || (price - prevClose).toFixed(5));
          const changePercent = parseFloat(
            quoteData.percent_change || (((price - prevClose) / prevClose) * 100).toFixed(2)
          );

          results.push({
            pair: norm,
            price,
            open: parseFloat(quoteData.open || price),
            high: parseFloat(quoteData.high || price),
            low: parseFloat(quoteData.low || price),
            change,
            changePercent,
            timestamp: new Date().toISOString(),
            provider: 'twelve_data',
            isLive: true,
          });
        }
      }
      return results;
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      throw new Error(`[TwelveData] Failed to fetch batch quotes: ${msg}`);
    }
  }
}

export default TwelveDataProvider;
