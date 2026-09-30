import MarketDataProvider from './MarketDataProvider.js';

const BASE_PRICES = {
  'EUR/USD': { base: 1.0842, pip: 0.0001, decimals: 5, vol: 0.0008 },
  'GBP/USD': { base: 1.2985, pip: 0.0001, decimals: 5, vol: 0.0012 },
  'USD/JPY': { base: 154.60, pip: 0.01, decimals: 2, vol: 0.25 },
  'USD/CHF': { base: 0.8845, pip: 0.0001, decimals: 5, vol: 0.0007 },
  'AUD/USD': { base: 0.6535, pip: 0.0001, decimals: 5, vol: 0.0009 },
  'USD/CAD': { base: 1.3915, pip: 0.0001, decimals: 5, vol: 0.0008 },
  'NZD/USD': { base: 0.5892, pip: 0.0001, decimals: 5, vol: 0.0008 },
};

const TIMEFRAME_MS = {
  '1m': 60 * 1000,
  '5m': 5 * 60 * 1000,
  '15m': 15 * 60 * 1000,
  '30m': 30 * 60 * 1000,
  '1h': 60 * 60 * 1000,
  '4h': 4 * 60 * 60 * 1000,
  '1d': 24 * 60 * 60 * 1000,
};

export class MockMarketDataProvider extends MarketDataProvider {
  constructor() {
    super('DemoSimulator', { maxPerMinute: 10000 });
  }

  isAvailable() {
    return true;
  }

  async getCandles(pair, timeframe = '1h', limit = 100) {
    const normPair = this.normalizePair(pair);
    const spec = BASE_PRICES[normPair] || {
      base: 1.0000,
      pip: 0.0001,
      decimals: 4,
      vol: 0.001,
    };

    const intervalMs = TIMEFRAME_MS[timeframe] || TIMEFRAME_MS['1h'];
    const now = Date.now();
    const candles = [];

    let currentPrice = spec.base;

    // Generate deterministic yet natural random walk
    // We walk backwards from current time
    for (let i = limit - 1; i >= 0; i--) {
      const candleTimeMs = now - i * intervalMs;
      const date = new Date(candleTimeMs);

      // Random price drift with mean-reversion towards base price
      const meanReversion = (spec.base - currentPrice) * 0.02;
      const randomShock = (Math.sin(i * 0.3) * 0.6 + (Math.random() - 0.49)) * spec.vol;
      const delta = meanReversion + randomShock;

      const open = currentPrice;
      const close = parseFloat((open + delta).toFixed(spec.decimals));
      const wick1 = Math.abs(Math.random() * spec.vol * 0.8);
      const wick2 = Math.abs(Math.random() * spec.vol * 0.8);
      const high = parseFloat((Math.max(open, close) + wick1).toFixed(spec.decimals));
      const low = parseFloat((Math.min(open, close) - wick2).toFixed(spec.decimals));
      const volume = Math.floor(100 + Math.random() * 2500);

      candles.push({
        timestamp: date.toISOString(),
        time: Math.floor(candleTimeMs / 1000),
        open,
        high,
        low,
        close,
        volume,
      });

      currentPrice = close;
    }

    return candles;
  }

  async getQuote(pair) {
    const normPair = this.normalizePair(pair);
    const spec = BASE_PRICES[normPair] || {
      base: 1.0000,
      pip: 0.0001,
      decimals: 4,
      vol: 0.001,
    };

    const tickDelta = (Math.random() - 0.48) * (spec.vol * 0.4);
    const price = parseFloat((spec.base + tickDelta).toFixed(spec.decimals));
    const open = parseFloat((spec.base - (Math.random() * spec.vol * 0.5)).toFixed(spec.decimals));
    const change = parseFloat((price - open).toFixed(spec.decimals));
    const changePercent = parseFloat(((change / open) * 100).toFixed(2));
    const high = parseFloat((Math.max(price, open) + Math.random() * spec.vol * 0.5).toFixed(spec.decimals));
    const low = parseFloat((Math.min(price, open) - Math.random() * spec.vol * 0.5).toFixed(spec.decimals));

    return {
      pair: normPair,
      price,
      open,
      high,
      low,
      change,
      changePercent,
      timestamp: new Date().toISOString(),
      provider: 'demo_simulator',
      isLive: false,
    };
  }
}

export default MockMarketDataProvider;
