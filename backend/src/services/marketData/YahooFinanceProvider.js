import axios from 'axios';
import MarketDataProvider from './MarketDataProvider.js';

export class YahooFinanceProvider extends MarketDataProvider {
  constructor() {
    super('YahooFinance', { maxPerMinute: 60 });
    this.client = axios.create({
      baseURL: 'https://query1.finance.yahoo.com/v8/finance/chart',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
  }

  isAvailable() {
    return true; // Always available, no API key required, zero credit limit
  }

  formatPairForProvider(pair) {
    const clean = pair.toUpperCase().replace(/[^A-Z]/g, '');
    return `${clean}=X`;
  }

  mapTimeframeParams(timeframe) {
    switch (timeframe) {
      case '1m':
        return { interval: '1m', range: '1d' };
      case '5m':
        return { interval: '5m', range: '5d' };
      case '15m':
        return { interval: '15m', range: '5d' };
      case '30m':
        return { interval: '30m', range: '1mo' };
      case '1h':
        return { interval: '60m', range: '1mo' };
      case '4h':
        // Yahoo doesn't have native 4h interval, so fetch 60m and aggregate
        return { interval: '60m', range: '3mo', aggregate: 4 };
      case '1d':
        return { interval: '1d', range: '1y' };
      default:
        return { interval: '60m', range: '1mo' };
    }
  }

  async getQuote(pair) {
    const symbol = this.formatPairForProvider(pair);
    const normPair = this.normalizePair(pair);

    try {
      const response = await this.client.get(`/${symbol}`, {
        params: { interval: '1m', range: '1d' },
      });

      const result = response.data?.chart?.result?.[0];
      if (!result || !result.meta) {
        throw new Error(`Invalid response structure from Yahoo Finance for ${symbol}`);
      }

      const meta = result.meta;
      const price = parseFloat(meta.regularMarketPrice || meta.chartPreviousClose || 1.0);
      const prevClose = parseFloat(meta.chartPreviousClose || price);
      const change = parseFloat((price - prevClose).toFixed(5));
      const changePercent = prevClose !== 0 ? parseFloat((((price - prevClose) / prevClose) * 100).toFixed(2)) : 0;
      const high = parseFloat(meta.regularMarketDayHigh || price);
      const low = parseFloat(meta.regularMarketDayLow || price);
      const open = parseFloat(meta.regularMarketDayOpen || price);

      return {
        pair: normPair,
        price,
        open,
        high,
        low,
        change,
        changePercent,
        timestamp: new Date().toISOString(),
        provider: 'yahoo_finance',
        isLive: true,
      };
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      throw new Error(`[YahooFinance] Failed to fetch quote for ${pair}: ${msg}`);
    }
  }

  async getQuotes(pairs) {
    const results = await Promise.allSettled(
      pairs.map((p) => this.getQuote(p))
    );

    return results
      .filter((r) => r.status === 'fulfilled' && r.value)
      .map((r) => r.value);
  }

  async getCandles(pair, timeframe = '1h', limit = 100) {
    const symbol = this.formatPairForProvider(pair);
    const normPair = this.normalizePair(pair);
    const { interval, range, aggregate } = this.mapTimeframeParams(timeframe);

    try {
      const response = await this.client.get(`/${symbol}`, {
        params: { interval, range },
      });

      const result = response.data?.chart?.result?.[0];
      if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
        throw new Error(`No candle data returned from Yahoo Finance for ${pair}`);
      }

      const timestamps = result.timestamp;
      const quotes = result.indicators.quote[0];

      let rawCandles = [];
      for (let i = 0; i < timestamps.length; i++) {
        const o = quotes.open[i];
        const h = quotes.high[i];
        const l = quotes.low[i];
        const c = quotes.close[i];
        const v = quotes.volume ? quotes.volume[i] : 0;

        if (c !== null && c !== undefined && !isNaN(c)) {
          const ts = timestamps[i];
          rawCandles.push({
            timestamp: new Date(ts * 1000).toISOString(),
            time: ts,
            open: parseFloat(o || c),
            high: parseFloat(h || c),
            low: parseFloat(l || c),
            close: parseFloat(c),
            volume: parseFloat(v || 0),
          });
        }
      }

      // If timeframe is 4h, aggregate 1h candles into 4h intervals
      if (aggregate && aggregate > 1) {
        const aggregated = [];
        for (let i = 0; i < rawCandles.length; i += aggregate) {
          const chunk = rawCandles.slice(i, i + aggregate);
          if (chunk.length === 0) continue;
          const open = chunk[0].open;
          const close = chunk[chunk.length - 1].close;
          const high = Math.max(...chunk.map((c) => c.high));
          const low = Math.min(...chunk.map((c) => c.low));
          const volume = chunk.reduce((sum, c) => sum + c.volume, 0);

          aggregated.push({
            timestamp: chunk[0].timestamp,
            time: chunk[0].time,
            open,
            high,
            low,
            close,
            volume,
          });
        }
        rawCandles = aggregated;
      }

      // Return requested limit slice (oldest to newest)
      return rawCandles.slice(-limit);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      throw new Error(`[YahooFinance] Failed to fetch candles for ${pair}: ${msg}`);
    }
  }
}

export default YahooFinanceProvider;
