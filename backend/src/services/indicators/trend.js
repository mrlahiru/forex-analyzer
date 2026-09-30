/**
 * Trend Indicators: SMA & EMA (Exponential Moving Average)
 */

/**
 * Calculate Simple Moving Average (SMA)
 * @param {number[]} values
 * @param {number} period
 * @returns {number[]} Array of SMA values matching input length (NaN for indices < period - 1)
 */
export const calculateSMA = (values, period) => {
  if (!values || values.length < period) {
    return new Array(values?.length || 0).fill(NaN);
  }

  const result = new Array(values.length).fill(NaN);
  let sum = 0;

  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) {
      sum -= values[i - period];
    }
    if (i >= period - 1) {
      result[i] = parseFloat((sum / period).toFixed(6));
    }
  }

  return result;
};

/**
 * Calculate Exponential Moving Average (EMA)
 * Multiplier = 2 / (period + 1)
 * First EMA is the SMA of the first 'period' values.
 * Subsequent EMA = (Close - Previous EMA) * multiplier + Previous EMA
 * @param {number[]} values
 * @param {number} period
 * @returns {number[]} Array of EMA values matching input length
 */
export const calculateEMA = (values, period) => {
  if (!values || values.length < period) {
    return new Array(values?.length || 0).fill(NaN);
  }

  const result = new Array(values.length).fill(NaN);
  const multiplier = 2 / (period + 1);

  // Initialize first EMA with SMA of first 'period' values
  let initialSum = 0;
  for (let i = 0; i < period; i++) {
    initialSum += values[i];
  }
  let prevEMA = initialSum / period;
  result[period - 1] = parseFloat(prevEMA.toFixed(6));

  for (let i = period; i < values.length; i++) {
    const currentEMA = (values[i] - prevEMA) * multiplier + prevEMA;
    result[i] = parseFloat(currentEMA.toFixed(6));
    prevEMA = currentEMA;
  }

  return result;
};

/**
 * Compute EMA 20, 50, 200 and SMA 50 for a candlestick series
 * @param {Array<{ close: number }>} candles
 */
export const calculateTrendIndicators = (candles) => {
  if (!candles || candles.length === 0) {
    return {
      ema20: null,
      ema50: null,
      ema200: null,
      sma50: null,
      alignment: 'INSUFFICIENT_DATA',
      series: { ema20: [], ema50: [], ema200: [] },
    };
  }

  const closes = candles.map((c) => c.close);

  const ema20Series = calculateEMA(closes, 20);
  const ema50Series = calculateEMA(closes, 50);
  const ema200Series = calculateEMA(closes, 200);
  const sma50Series = calculateSMA(closes, 50);

  const lastIdx = closes.length - 1;
  const currentPrice = closes[lastIdx];

  const ema20 = !isNaN(ema20Series[lastIdx]) ? ema20Series[lastIdx] : null;
  const ema50 = !isNaN(ema50Series[lastIdx]) ? ema50Series[lastIdx] : null;
  const ema200 = !isNaN(ema200Series[lastIdx]) ? ema200Series[lastIdx] : null;
  const sma50 = !isNaN(sma50Series[lastIdx]) ? sma50Series[lastIdx] : null;

  // Evaluate EMA trend alignment
  let alignment = 'NEUTRAL';
  if (ema20 && ema50 && ema200) {
    if (currentPrice > ema20 && ema20 > ema50 && ema50 > ema200) {
      alignment = 'STRONG_BULLISH';
    } else if (currentPrice < ema20 && ema20 < ema50 && ema50 < ema200) {
      alignment = 'STRONG_BEARISH';
    } else if (currentPrice > ema50 && ema50 > ema200) {
      alignment = 'MODERATE_BULLISH';
    } else if (currentPrice < ema50 && ema50 < ema200) {
      alignment = 'MODERATE_BEARISH';
    }
  } else if (ema20 && ema50) {
    if (currentPrice > ema20 && ema20 > ema50) alignment = 'BULLISH';
    else if (currentPrice < ema20 && ema20 < ema50) alignment = 'BEARISH';
  }

  return {
    ema20,
    ema50,
    ema200,
    sma50,
    alignment,
    series: {
      ema20: ema20Series,
      ema50: ema50Series,
      ema200: ema200Series,
    },
  };
};

export default {
  calculateSMA,
  calculateEMA,
  calculateTrendIndicators,
};
