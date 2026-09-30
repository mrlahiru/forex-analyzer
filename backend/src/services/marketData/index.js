// Market Data Provider Abstraction Layer (Phase 2)
export class MarketDataProvider {
  async getCandles(pair, timeframe, limit) {
    throw new Error('getCandles must be implemented by specific provider');
  }
  async getLatestQuote(pair) {
    throw new Error('getLatestQuote must be implemented by specific provider');
  }
}
