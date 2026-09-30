/**
 * Volatility Indicators: ATR (Average True Range)
 */

/**
 * Calculate Average True Range (ATR)
 * @param {Array<{ high: number, low: number, close: number }>} candles
 * @param {number} period - default 14
 * @returns {{ atr: number|null, tr: number[], atrSeries: number[], atrPercent: number|null }}
 */
export const calculateATR = (candles, period = 14) => {
  if (!candles || candles.length <= period) {
    return {
      atr: null,
      atrPercent: null,
      tr: [],
      atrSeries: [],
    };
  }

  const trSeries = [candles[0].high - candles[0].low];

  // Calculate True Range for each bar
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr1 = high - low;
    const tr2 = Math.abs(high - prevClose);
    const tr3 = Math.abs(low - prevClose);

    const tr = Math.max(tr1, tr2, tr3);
    trSeries.push(tr);
  }

  const atrSeries = new Array(candles.length).fill(NaN);

  // Initial ATR: Simple average of first 'period' True Ranges
  let initialSum = 0;
  for (let i = 0; i < period; i++) {
    initialSum += trSeries[i];
  }
  let prevATR = initialSum / period;
  atrSeries[period - 1] = parseFloat(prevATR.toFixed(6));

  // Subsequent ATR using Wilder's smoothing
  for (let i = period; i < trSeries.length; i++) {
    const currentATR = (prevATR * (period - 1) + trSeries[i]) / period;
    atrSeries[i] = parseFloat(currentATR.toFixed(6));
    prevATR = currentATR;
  }

  const lastATR = atrSeries[atrSeries.length - 1];
  const lastClose = candles[candles.length - 1].close;
  const atrPercent = lastClose > 0 ? parseFloat(((lastATR / lastClose) * 100).toFixed(3)) : null;

  return {
    atr: lastATR,
    atrPercent,
    tr: trSeries,
    atrSeries,
  };
};

export default {
  calculateATR,
};
