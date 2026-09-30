/**
 * Market Structure Detection Engine
 * Detects:
 * - Swing Highs & Swing Lows
 * - Higher High (HH), Higher Low (HL)
 * - Lower High (LH), Lower Low (LL)
 * - Breakout, Breakdown
 * - Consolidation
 */

/**
 * Identify Swing Points (Fractals)
 * @param {Array<{ high: number, low: number, close: number, timestamp: string, time: number }>} candles
 * @param {number} lookback - window to left and right (default 3)
 */
export const findSwingPoints = (candles, lookback = 3) => {
  if (!candles || candles.length < lookback * 2 + 1) {
    return { swingHighs: [], swingLows: [] };
  }

  const swingHighs = [];
  const swingLows = [];

  for (let i = lookback; i < candles.length - lookback; i++) {
    const currentHigh = candles[i].high;
    const currentLow = candles[i].low;

    let isSwingHigh = true;
    let isSwingLow = true;

    for (let j = 1; j <= lookback; j++) {
      if (candles[i - j].high >= currentHigh || candles[i + j].high > currentHigh) {
        isSwingHigh = false;
      }
      if (candles[i - j].low <= currentLow || candles[i + j].low < currentLow) {
        isSwingLow = false;
      }
    }

    if (isSwingHigh) {
      swingHighs.push({
        index: i,
        price: currentHigh,
        time: candles[i].time,
        timestamp: candles[i].timestamp,
      });
    }

    if (isSwingLow) {
      swingLows.push({
        index: i,
        price: currentLow,
        time: candles[i].time,
        timestamp: candles[i].timestamp,
      });
    }
  }

  return { swingHighs, swingLows };
};

/**
 * Analyze structural progression (HH, HL, LH, LL) and breakout/consolidation states
 * @param {Array<{ high: number, low: number, close: number, timestamp: string }>} candles
 * @param {number} lookback
 */
export const analyzeMarketStructure = (candles, lookback = 3) => {
  if (!candles || candles.length < 20) {
    return {
      state: 'INSUFFICIENT_DATA',
      trend: 'NEUTRAL',
      highStructure: null,
      lowStructure: null,
      isBreakout: false,
      isBreakdown: false,
      isConsolidating: false,
      recentSwingHigh: null,
      recentSwingLow: null,
      details: 'Awaiting sufficient candlestick history',
    };
  }

  const { swingHighs, swingLows } = findSwingPoints(candles, lookback);
  const currentPrice = candles[candles.length - 1].close;

  // Need at least 2 swing highs and 2 swing lows to evaluate structural sequence
  if (swingHighs.length < 2 || swingLows.length < 2) {
    const fallbackHigh = Math.max(...candles.slice(-15).map((c) => c.high));
    const fallbackLow = Math.min(...candles.slice(-15).map((c) => c.low));

    return {
      state: 'DEVELOPING',
      trend: 'NEUTRAL',
      highStructure: null,
      lowStructure: null,
      isBreakout: currentPrice > fallbackHigh,
      isBreakdown: currentPrice < fallbackLow,
      isConsolidating: true,
      recentSwingHigh: fallbackHigh,
      recentSwingLow: fallbackLow,
      details: 'Developing price structure',
    };
  }

  const lastHigh = swingHighs[swingHighs.length - 1];
  const prevHigh = swingHighs[swingHighs.length - 2];

  const lastLow = swingLows[swingLows.length - 1];
  const prevLow = swingLows[swingLows.length - 2];

  // Compare highs
  const isHH = lastHigh.price > prevHigh.price;
  const isLH = lastHigh.price < prevHigh.price;
  const highStructure = isHH ? 'HIGHER_HIGH' : isLH ? 'LOWER_HIGH' : 'EQUAL_HIGH';

  // Compare lows
  const isHL = lastLow.price > prevLow.price;
  const isLL = lastLow.price < prevLow.price;
  const lowStructure = isHL ? 'HIGHER_LOW' : isLL ? 'LOWER_LOW' : 'EQUAL_LOW';

  // Breakout / Breakdown detection against most recent swing points
  const isBreakout = currentPrice > lastHigh.price;
  const isBreakdown = currentPrice < lastLow.price;

  // Range and Consolidation detection
  const recentRange = lastHigh.price - lastLow.price;
  const avgRange = (prevHigh.price - prevLow.price + recentRange) / 2;
  const isConsolidating =
    (highStructure === 'LOWER_HIGH' && lowStructure === 'HIGHER_LOW') || // Triangle/compression
    (!isBreakout && !isBreakdown && recentRange < avgRange * 0.7);

  // Overall Market Structure Trend
  let trend = 'NEUTRAL';
  let state = 'CONSOLIDATION';

  if (isHH && isHL) {
    trend = 'BULLISH';
    state = 'UPTREND';
  } else if (isLH && isLL) {
    trend = 'BEARISH';
    state = 'DOWNTREND';
  } else if (isHH && isLL) {
    trend = 'VOLATILE_EXPANSION';
    state = 'EXPANDING_RANGE';
  } else {
    trend = 'NEUTRAL';
    state = 'CONSOLIDATION';
  }

  if (isBreakout) {
    state = 'BULLISH_BREAKOUT';
  } else if (isBreakdown) {
    state = 'BEARISH_BREAKDOWN';
  }

  return {
    state,
    trend,
    highStructure,
    lowStructure,
    isBreakout,
    isBreakdown,
    isConsolidating,
    recentSwingHigh: lastHigh.price,
    recentSwingLow: lastLow.price,
    swingHighsCount: swingHighs.length,
    swingLowsCount: swingLows.length,
    lastSwingHigh: lastHigh,
    lastSwingLow: lastLow,
    summary: `${state} (${highStructure} & ${lowStructure})`,
  };
};

export default {
  findSwingPoints,
  analyzeMarketStructure,
};
