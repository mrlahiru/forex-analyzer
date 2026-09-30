import axios from 'axios';
import MarketDataProvider from './MarketDataProvider.js';

export class PolygonProvider extends MarketDataProvider {
  constructor(apiKey) {
    super('Polygon', { maxPerMinute: 5 });
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.polygon.io';
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  formatPairForProvider(pair) {
    // Polygon uses "C:EURUSD"
    return `C:${this.normalizePair(pair).replace('/', '')}`;
  }

  mapTimeframe(timeframe) {
    const map = {
      '1m': { multiplier: 1, timespan: 'minute' },
      '5m': { multiplier: 5, timespan: 'minute' },
      '15m': { multiplier: 15, timespan: 'minute' },
      '30m': { multiplier: 30, timespan: 'minute' },
      '1h': { multiplier: 1, timespan: 'hour' },
      '4h': { multiplier: 4, timespan: 'hour' },
      '1d': { multiplier: 1, timespan: 'day' },
    };
    return map[timeframe] || { multiplier: 1, timespan: 'hour' };
  }

  async getCandles(pair, timeframe = '1h', limit = 100) {
    if (!this.isAvailable()) {
      throw new Error('Polygon API key is not configured');
    }

    const ticker = this.formatPairForProvider(pair);
    const { multiplier, timespan } = this.mapTimeframe(timeframe);

    const to = new Date().toISOString().split('T')[0];
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    const from = fromDate.toISOString().split('T')[0];

    try {
      const response = await this.client.get(
        `/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}`,
        {
          params: {
            apiKey: this.apiKey,
            limit,
            sort: 'asc',
          },
        }
      );

      const results = response.data.results || [];
      return results.map((r) => ({
        timestamp: new Date(r.t).toISOString(),
        time: Math.floor(r.t / 1000),
        open: r.o,
        high: r.h,
        low: r.l,
        close: r.c,
        volume: r.v || 0,
      }));
    } catch (error) {
      throw new Error(`[Polygon] ${error.response?.data?.message || error.message}`);
    }
  }

  async getQuote(pair) {
    const candles = await this.getCandles(pair, '1m', 2);
    if (!candles || candles.length === 0) {
      throw new Error(`[Polygon] Failed to fetch quote for ${pair}`);
    }
    const latest = candles[candles.length - 1];
    const prev = candles[candles.length - 2] || latest;
    const change = latest.close - prev.close;
    const changePercent = (change / prev.close) * 100;

    return {
      pair: this.normalizePair(pair),
      price: latest.close,
      open: latest.open,
      high: latest.high,
      low: latest.low,
      change: parseFloat(change.toFixed(5)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      timestamp: latest.timestamp,
      provider: 'polygon',
      isLive: true,
    };
  }
}

export default PolygonProvider;
