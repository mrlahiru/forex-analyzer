import axios from 'axios';
import MarketDataProvider from './MarketDataProvider.js';

export class OandaProvider extends MarketDataProvider {
  constructor(apiKey, accountId = '', environment = 'practice') {
    super('OANDA', { maxPerMinute: 60 });
    this.apiKey = apiKey;
    this.accountId = accountId;
    this.baseUrl =
      environment === 'live'
        ? 'https://api-fxtrade.oanda.com/v3'
        : 'https://api-fxpractice.oanda.com/v3';
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  isAvailable() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  formatPairForProvider(pair) {
    // OANDA uses "EUR_USD"
    return this.normalizePair(pair).replace('/', '_');
  }

  mapTimeframe(timeframe) {
    const map = {
      '1m': 'M1',
      '5m': 'M5',
      '15m': 'M15',
      '30m': 'M30',
      '1h': 'H1',
      '4h': 'H4',
      '1d': 'D',
    };
    return map[timeframe] || 'H1';
  }

  async getCandles(pair, timeframe = '1h', limit = 100) {
    if (!this.isAvailable()) {
      throw new Error('OANDA API key is not configured');
    }

    const instrument = this.formatPairForProvider(pair);
    const granularity = this.mapTimeframe(timeframe);

    try {
      const response = await this.client.get(`/instruments/${instrument}/candles`, {
        params: {
          granularity,
          count: limit,
          price: 'M',
        },
      });

      const raw = response.data.candles || [];
      return raw.map((c) => ({
        timestamp: new Date(c.time).toISOString(),
        time: Math.floor(new Date(c.time).getTime() / 1000),
        open: parseFloat(c.mid.o),
        high: parseFloat(c.mid.h),
        low: parseFloat(c.mid.l),
        close: parseFloat(c.mid.c),
        volume: parseInt(c.volume || 0, 10),
      }));
    } catch (error) {
      throw new Error(`[OANDA] ${error.response?.data?.errorMessage || error.message}`);
    }
  }

  async getQuote(pair) {
    const candles = await this.getCandles(pair, '1m', 2);
    if (!candles || candles.length === 0) {
      throw new Error(`[OANDA] Failed to fetch quote for ${pair}`);
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
      provider: 'oanda',
      isLive: true,
    };
  }
}

export default OandaProvider;
