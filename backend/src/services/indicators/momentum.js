import { calculateEMA } from './trend.js';

/**
 * Momentum Indicators: RSI (Relative Strength Index) and MACD
 */

/**
 * Calculate Relative Strength Index (RSI) using Wilder's Smoothing
 * @param {Array<{ close: number }>} candles
 * @param {number} period - default 14
 * @returns {{ rsi: number|null, status: string, series: number[] }}
 */
export const calculateRSI = (candles, period = 14) => {
  if (!candles || candles.length <= period) {
    return {
      rsi: null,
      status: 'INSUFFICIENT_DATA',
      series: new Array(candles?.length || 0).fill(NaN),
    };
  }

  const closes = candles.map((c) => c.close);
  const rsiSeries = new Array(closes.length).fill(NaN);

  const changes = [];
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1]);
  }

  // Calculate first average gain and loss
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    const change = changes[i];
    if (change > 0) avgGain += change;
    else avgLoss += Math.abs(change);
  }

  avgGain /= period;
  avgLoss /= period;

  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsiSeries[period] = parseFloat((100 - 100 / (1 + firstRS)).toFixed(2));

  // Wilder's smoothing for subsequent periods
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    rsiSeries[i + 1] = parseFloat(rsi.toFixed(2));
  }

  const lastRSI = rsiSeries[rsiSeries.length - 1];

  let status = 'NEUTRAL';
  if (lastRSI >= 70) status = 'OVERBOUGHT';
  else if (lastRSI <= 30) status = 'OVERSOLD';
  else if (lastRSI >= 55) status = 'BULLISH_MOMENTUM';
  else if (lastRSI <= 45) status = 'BEARISH_MOMENTUM';

  return {
    rsi: lastRSI,
    status,
    series: rsiSeries,
  };
};

/**
 * Calculate Moving Average Convergence Divergence (MACD)
 * @param {Array<{ close: number }>} candles
 * @param {number} fastPeriod - default 12
 * @param {number} slowPeriod - default 26
 * @param {number} signalPeriod - default 9
 */
export const calculateMACD = (
  candles,
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
) => {
  if (!candles || candles.length <= slowPeriod + signalPeriod) {
    return {
      macd: null,
      signal: null,
      histogram: null,
      trend: 'INSUFFICIENT_DATA',
      series: { macd: [], signal: [], histogram: [] },
    };
  }

  const closes = candles.map((c) => c.close);

  const emaFast = calculateEMA(closes, fastPeriod);
  const emaSlow = calculateEMA(closes, slowPeriod);

  // Compute MACD Line = EMA(fast) - EMA(slow)
  const macdLine = [];
  for (let i = 0; i < closes.length; i++) {
    if (isNaN(emaFast[i]) || isNaN(emaSlow[i])) {
      macdLine.push(NaN);
    } else {
      macdLine.push(parseFloat((emaFast[i] - emaSlow[i]).toFixed(6)));
    }
  }

  // Filter valid MACD values to compute Signal Line
  const validMacdStart = macdLine.findIndex((v) => !isNaN(v));
  const validMacd = macdLine.slice(validMacdStart);
  const rawSignal = calculateEMA(validMacd, signalPeriod);

  // Re-align signal line to full series length
  const signalLine = new Array(closes.length).fill(NaN);
  for (let i = 0; i < rawSignal.length; i++) {
    signalLine[validMacdStart + i] = rawSignal[i];
  }

  // Compute Histogram = MACD Line - Signal Line
  const histogram = [];
  for (let i = 0; i < closes.length; i++) {
    if (isNaN(macdLine[i]) || isNaN(signalLine[i])) {
      histogram.push(NaN);
    } else {
      histogram.push(parseFloat((macdLine[i] - signalLine[i]).toFixed(6)));
    }
  }

  const lastIdx = closes.length - 1;
  const lastMacd = macdLine[lastIdx];
  const lastSignal = signalLine[lastIdx];
  const lastHistogram = histogram[lastIdx];
  const prevHistogram = histogram[lastIdx - 1] || 0;

  let trend = 'NEUTRAL';
  if (lastHistogram > 0 && lastMacd > 0) {
    trend = 'STRONG_BULLISH';
  } else if (lastHistogram > 0) {
    trend = 'BULLISH';
  } else if (lastHistogram < 0 && lastMacd < 0) {
    trend = 'STRONG_BEARISH';
  } else if (lastHistogram < 0) {
    trend = 'BEARISH';
  }

  const isBullishCrossover = prevHistogram <= 0 && lastHistogram > 0;
  const isBearishCrossover = prevHistogram >= 0 && lastHistogram < 0;

  return {
    macd: lastMacd,
    signal: lastSignal,
    histogram: lastHistogram,
    trend,
    isBullishCrossover,
    isBearishCrossover,
    series: {
      macd: macdLine,
      signal: signalLine,
      histogram,
    },
  };
};

export default {
  calculateRSI,
  calculateMACD,
};
