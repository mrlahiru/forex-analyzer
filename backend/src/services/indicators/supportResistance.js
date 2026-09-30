import { findSwingPoints } from './marketStructure.js';
import { calculateATR } from './volatility.js';

/**
 * Dynamic Support and Resistance Zone Calculator
 * Clusters recent swing highs, lows, and price reaction levels.
 */

/**
 * Calculate dynamic support and resistance zones based on price action
 * @param {Array<{ high: number, low: number, close: number, timestamp: string }>} candles
 * @param {number} tolerancePips - clustering proximity
 */
export const calculateSupportResistance = (candles, tolerancePips = null) => {
  if (!candles || candles.length < 15) {
    return {
      supports: [],
      resistances: [],
      nearestSupport: null,
      nearestResistance: null,
      supportDistance: null,
      resistanceDistance: null,
    };
  }

  const currentPrice = candles[candles.length - 1].close;
  const { atr } = calculateATR(candles, 14);

  // Determine cluster tolerance: use 0.8 * ATR or default 0.0015
  const tolerance = tolerancePips ? tolerancePips * 0.0001 : (atr ? atr * 0.8 : 0.0015);

  // Collect key price reaction points (swing highs and swing lows)
  const { swingHighs, swingLows } = findSwingPoints(candles, 2);

  const pricePoints = [
    ...swingHighs.map((sh) => ({ price: sh.price, type: 'high', time: sh.time })),
    ...swingLows.map((sl) => ({ price: sl.price, type: 'low', time: sl.time })),
  ];

  if (pricePoints.length === 0) {
    const recentHigh = Math.max(...candles.slice(-20).map((c) => c.high));
    const recentLow = Math.min(...candles.slice(-20).map((c) => c.low));
    return {
      supports: [parseFloat(recentLow.toFixed(5))],
      resistances: [parseFloat(recentHigh.toFixed(5))],
      nearestSupport: parseFloat(recentLow.toFixed(5)),
      nearestResistance: parseFloat(recentHigh.toFixed(5)),
      supportDistance: parseFloat((currentPrice - recentLow).toFixed(5)),
      resistanceDistance: parseFloat((recentHigh - currentPrice).toFixed(5)),
    };
  }

  // Cluster prices that lie within 'tolerance' of each other
  const clusters = [];

  for (const point of pricePoints) {
    let matchedCluster = null;

    for (const cluster of clusters) {
      if (Math.abs(cluster.center - point.price) <= tolerance) {
        matchedCluster = cluster;
        break;
      }
    }

    if (matchedCluster) {
      matchedCluster.points.push(point.price);
      matchedCluster.touches += 1;
      // Recompute weighted center
      const sum = matchedCluster.points.reduce((acc, p) => acc + p, 0);
      matchedCluster.center = sum / matchedCluster.points.length;
    } else {
      clusters.push({
        center: point.price,
        touches: 1,
        points: [point.price],
      });
    }
  }

  // Sort clusters by touch count (strength)
  clusters.sort((a, b) => b.touches - a.touches);

  // Divide into supports (below current price) and resistances (above current price)
  const supports = clusters
    .map((c) => parseFloat(c.center.toFixed(5)))
    .filter((level) => level < currentPrice)
    .sort((a, b) => b - a); // Descending (closest support first)

  const resistances = clusters
    .map((c) => parseFloat(c.center.toFixed(5)))
    .filter((level) => level > currentPrice)
    .sort((a, b) => a - b); // Ascending (closest resistance first)

  // Ensure at least one S & R exists using recent extremes if clusters didn't find levels on both sides
  if (supports.length === 0) {
    const minLow = Math.min(...candles.slice(-20).map((c) => c.low));
    supports.push(parseFloat(minLow.toFixed(5)));
  }

  if (resistances.length === 0) {
    const maxHigh = Math.max(...candles.slice(-20).map((c) => c.high));
    resistances.push(parseFloat(maxHigh.toFixed(5)));
  }

  const nearestSupport = supports[0];
  const nearestResistance = resistances[0];

  const supportDistance = parseFloat((currentPrice - nearestSupport).toFixed(5));
  const resistanceDistance = parseFloat((nearestResistance - currentPrice).toFixed(5));

  return {
    supports: supports.slice(0, 4),
    resistances: resistances.slice(0, 4),
    nearestSupport,
    nearestResistance,
    supportDistance,
    resistanceDistance,
    tolerance,
  };
};

export default {
  calculateSupportResistance,
};
