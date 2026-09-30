import MarketDataProvider from './MarketDataProvider.js';

const BASE_PRICES = {
  'EUR/USD': { base: 1.0842, pip: 0.0001, decimals: 5, vol: 0.0006 },
  'GBP/USD': { base: 1.2985, pip: 0.0001, decimals: 5, vol: 0.0008 },
  'USD/JPY': { base: 154.60, pip: 0.01, decimals: 2, vol: 0.15 },
  'USD/CHF': { base: 0.8845, pip: 0.0001, decimals: 5, vol: 0.0005 },
  'AUD/USD': { base: 0.6535, pip: 0.0001, decimals: 5, vol: 0.0006 },
  'USD/CAD': { base: 1.3915, pip: 0.0001, decimals: 5, vol: 0.0006 },
  'NZD/USD': { base: 0.5892, pip: 0.0001, decimals: 5, vol: 0.0005 },
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

    // Stateful live tick store
    this.currentTicks = new Map();
    this.sessionOpens = new Map();
    this.sessionHighs = new Map();
    this.sessionLows = new Map();

    for (const [pair, spec] of Object.entries(BASE_PRICES)) {
      this.currentTicks.set(pair, spec.base);
      this.sessionOpens.set(pair, spec.base);
      this.sessionHighs.set(pair, spec.base + spec.vol * 0.8);
      this.sessionLows.set(pair, spec.base - spec.vol * 0.8);
    }

    // Active live price ticker: runs every 1 second to create realistic live market ticks
    this.tickTimer = setInterval(() => {
      this._simulateTick();
    }, 1200);
  }

  isAvailable() {
    return true;
  }

  _simulateTick() {
    for (const [pair, spec] of Object.entries(BASE_PRICES)) {
      const current = this.currentTicks.get(pair) || spec.base;
      // Gentle mean reversion towards base price + random fractional pip shock
      const meanRevert = (spec.base - current) * 0.03;
      const shock = (Math.random() - 0.495) * (spec.vol * 0.25);
      const delta = meanRevert + shock;
      const nextPrice = parseFloat((current + delta).toFixed(spec.decimals));

      this.currentTicks.set(pair, nextPrice);

      const high = this.sessionHighs.get(pair) || nextPrice;
      const low = this.sessionLows.get(pair) || nextPrice;
      if (nextPrice > high) this.sessionHighs.set(pair, nextPrice);
      if (nextPrice < low) this.sessionLows.set(pair, nextPrice);
    }
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

    const livePrice = this.currentTicks.get(normPair) || spec.base;
    let currentPrice = spec.base;

    // Generate historical candles
    for (let i = limit - 1; i >= 1; i--) {
      const candleTimeMs = now - i * intervalMs;
      const date = new Date(candleTimeMs);

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

    // The most current active bar dynamically tracks the live tick
    const activeBarTimeMs = now;
    const activeOpen = currentPrice;
    const activeClose = livePrice;
    const activeHigh = parseFloat(Math.max(activeOpen, activeClose, this.sessionHighs.get(normPair) || activeClose).toFixed(spec.decimals));
    const activeLow = parseFloat(Math.min(activeOpen, activeClose, this.sessionLows.get(normPair) || activeClose).toFixed(spec.decimals));

    candles.push({
      timestamp: new Date(activeBarTimeMs).toISOString(),
      time: Math.floor(activeBarTimeMs / 1000),
      open: activeOpen,
      high: activeHigh,
      low: activeLow,
      close: activeClose,
      volume: Math.floor(800 + Math.random() * 1200),
    });

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

    const price = this.currentTicks.get(normPair) || spec.base;
    const open = this.sessionOpens.get(normPair) || spec.base;
    const change = parseFloat((price - open).toFixed(spec.decimals));
    const changePercent = parseFloat(((change / open) * 100).toFixed(2));
    const high = this.sessionHighs.get(normPair) || price;
    const low = this.sessionLows.get(normPair) || price;

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
