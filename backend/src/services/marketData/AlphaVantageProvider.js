import axios from 'axios';
import MarketDataProvider from './MarketDataProvider.js';

export class AlphaVantageProvider extends MarketDataProvider {
  constructor(apiKey) {
    super('AlphaVantage', { maxPerMinute: 5 });
    this.apiKey = apiKey;
    this.baseUrl = 'https://www.alphavantage.co';
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  mapTimeframe(timeframe) {
    const map = {
      '1m': '1min',
      '5m': '5min',
      '15m': '15min',
      '30m': '30min',
      '1h': '60min',
      '4h': '60min',
      '1d': 'daily',
    };
    return map[timeframe] || '60min';
  }

  async getCandles(pair, timeframe = '1h', limit = 100) {
    if (!this.isAvailable()) {
      throw new Error('Alpha Vantage API key is not configured');
    }

    if (!this.checkRateLimit()) {
      throw new Error('Alpha Vantage rate limit reached (max 5 requests/min)');
    }

    const [fromSymbol, toSymbol] = this.normalizePair(pair).split('/');
    const isDaily = timeframe === '1d';
    const func = isDaily ? 'FX_DAILY' : 'FX_INTRADAY';
    const interval = this.mapTimeframe(timeframe);

    try {
      const params = {
        function: func,
        from_symbol: fromSymbol,
        to_symbol: toSymbol,
        apikey: this.apiKey,
        outputsize: 'compact',
      };
      if (!isDaily) {
        params.interval = interval;
      }

      const response = await this.client.get('/query', { params });
      const data = response.data;

      const timeSeriesKey = Object.keys(data).find((k) =>
        k.toLowerCase().includes('time series')
      );

      if (!timeSeriesKey || !data[timeSeriesKey]) {
        throw new Error(data['Note'] || data['Error Message'] || 'No candle data');
      }

      const raw = data[timeSeriesKey];
      const candles = Object.entries(raw)
        .slice(0, limit)
        .map(([dateStr, item]) => ({
          timestamp: new Date(dateStr).toISOString(),
          time: Math.floor(new Date(dateStr).getTime() / 1000),
          open: parseFloat(item['1. open']),
          high: parseFloat(item['2. high']),
          low: parseFloat(item['3. low']),
          close: parseFloat(item['4. close']),
          volume: 0,
        }))
        .filter((c) => !isNaN(c.close))
        .reverse();

      return candles;
    } catch (error) {
      throw new Error(`[AlphaVantage] ${error.message}`);
    }
  }

  async getQuote(pair) {
    const candles = await this.getCandles(pair, '1m', 2);
    if (!candles || candles.length === 0) {
      throw new Error(`[AlphaVantage] Could not fetch quote for ${pair}`);
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
      provider: 'alpha_vantage',
      isLive: true,
    };
  }
}

export default AlphaVantageProvider;
