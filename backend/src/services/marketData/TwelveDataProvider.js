import axios from 'axios';
import MarketDataProvider from './MarketDataProvider.js';

export class TwelveDataProvider extends MarketDataProvider {
  constructor(apiKey) {
    super('TwelveData', { maxPerMinute: 8 });
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.twelvedata.com';
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

  async getCandles(pair, timeframe = '1h', limit = 100) {
    if (!this.isAvailable()) {
      throw new Error('Twelve Data API key is not configured');
    }

    if (!this.checkRateLimit()) {
      throw new Error('Twelve Data free rate limit reached (max 8 requests/min). Please wait a moment.');
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

      const data = response.data;

      if (data.status === 'error') {
        throw new Error(data.message || 'Twelve Data API returned an error');
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

    if (!this.checkRateLimit()) {
      throw new Error('Twelve Data rate limit reached');
    }

    const symbol = this.formatPairForProvider(pair);

    try {
      const response = await this.client.get('/quote', {
        params: {
          symbol,
          apikey: this.apiKey,
        },
      });

      const data = response.data;
      if (data.status === 'error') {
        throw new Error(data.message || 'Error fetching quote');
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
}

export default TwelveDataProvider;
