/**
 * Dynamic Entry, TP (Take Profit) and Stop Loss (SL) Engine
 * Calculates non-arbitrary levels anchored to Market Structure swings,
 * dynamic Support/Resistance clusters, and ATR volatility buffers.
 */

export const calculateDynamicTPSL = (params) => {
  const {
    pair,
    direction,
    currentPrice,
    atr = 0.0012,
    marketStructure = {},
    supportResistance = {},
  } = params;

  const isJPY = pair?.includes('JPY');
  const isGold = pair?.includes('XAU') || pair?.includes('GOLD');
  const decimals = (isJPY || isGold) ? 2 : 5;
  const pipMultiplier = isGold ? 10 : (isJPY ? 100 : 10000);

  if (direction === 'NO_TRADE') {
    return {
      entry: currentPrice,
      stopLoss: null,
      tp1: null,
      tp2: null,
      tp3: null,
      riskPips: 0,
      tp1Pips: 0,
      tp2Pips: 0,
      tp3Pips: 0,
      riskReward: { tp1: 0, tp2: 0, tp3: 0 },
      isViable: false,
      reason: 'No directional setup identified',
    };
  }

  const defaultATR = isGold ? 15.0 : (isJPY ? 0.35 : 0.0012);
  const effectiveATR = atr && atr > 0 ? atr : defaultATR;
  const entry = parseFloat(currentPrice.toFixed(decimals));

  let stopLoss = null;
  let tp1 = null;
  let tp2 = null;
  let tp3 = null;
  let notes = [];

  if (direction === 'BUY') {
    // 1. Anchor Stop Loss below recent swing low or dynamic support
    const swingLow = marketStructure.recentSwingLow;
    const support = supportResistance.nearestSupport;

    let candidateSL = null;
    if (swingLow && currentPrice > swingLow) {
      // Place SL 0.35 * ATR below swing low to avoid stop hunts
      candidateSL = swingLow - 0.35 * effectiveATR;
      notes.push(`SL anchored below recent swing low (${swingLow}) with 0.35 ATR buffer`);
    } else if (support && currentPrice > support) {
      candidateSL = support - 0.35 * effectiveATR;
      notes.push(`SL anchored below dynamic support (${support}) with 0.35 ATR buffer`);
    } else {
      candidateSL = currentPrice - 1.5 * effectiveATR;
      notes.push('SL anchored to 1.5x ATR volatility buffer');
    }

    // Sanity checks on risk distance (must not be too tight or unmanageably wide)
    const rawRisk = currentPrice - candidateSL;
    const minRisk = 0.8 * effectiveATR;
    const maxRisk = 2.8 * effectiveATR;

    if (rawRisk < minRisk) {
      candidateSL = currentPrice - minRisk;
    } else if (rawRisk > maxRisk) {
      candidateSL = currentPrice - maxRisk;
    }

    stopLoss = parseFloat(candidateSL.toFixed(decimals));
    const riskDistance = currentPrice - stopLoss;

    // 2. Take Profit Targets
    // TP1: 1:1 R:R (conservative partial target)
    tp1 = parseFloat((currentPrice + riskDistance * 1.0).toFixed(decimals));

    // TP2: 1:2 R:R (structural target)
    const resistance = supportResistance.nearestResistance;
    if (resistance && resistance > currentPrice && resistance > tp1) {
      // Align TP2 near resistance if favorable
      tp2 = parseFloat((resistance - 0.2 * effectiveATR).toFixed(decimals));
      notes.push(`TP2 aligned just ahead of dynamic resistance (${resistance})`);
    } else {
      tp2 = parseFloat((currentPrice + riskDistance * 2.0).toFixed(decimals));
    }

    // TP3: 1:3 R:R (structural runner target)
    tp3 = parseFloat((currentPrice + riskDistance * 3.0).toFixed(decimals));
  } else if (direction === 'SELL') {
    // Symmetrical logic for SELL
    const swingHigh = marketStructure.recentSwingHigh;
    const resistance = supportResistance.nearestResistance;

    let candidateSL = null;
    if (swingHigh && swingHigh > currentPrice) {
      candidateSL = swingHigh + 0.35 * effectiveATR;
      notes.push(`SL anchored above recent swing high (${swingHigh}) with 0.35 ATR buffer`);
    } else if (resistance && resistance > currentPrice) {
      candidateSL = resistance + 0.35 * effectiveATR;
      notes.push(`SL anchored above dynamic resistance (${resistance}) with 0.35 ATR buffer`);
    } else {
      candidateSL = currentPrice + 1.5 * effectiveATR;
      notes.push('SL anchored to 1.5x ATR volatility buffer');
    }

    const rawRisk = candidateSL - currentPrice;
    const minRisk = 0.8 * effectiveATR;
    const maxRisk = 2.8 * effectiveATR;

    if (rawRisk < minRisk) {
      candidateSL = currentPrice + minRisk;
    } else if (rawRisk > maxRisk) {
      candidateSL = currentPrice + maxRisk;
    }

    stopLoss = parseFloat(candidateSL.toFixed(decimals));
    const riskDistance = stopLoss - currentPrice;

    // TP1: 1:1 R:R
    tp1 = parseFloat((currentPrice - riskDistance * 1.0).toFixed(decimals));

    // TP2: 1:2 R:R or dynamic support
    const support = supportResistance.nearestSupport;
    if (support && support < currentPrice && support < tp1) {
      tp2 = parseFloat((support + 0.2 * effectiveATR).toFixed(decimals));
      notes.push(`TP2 aligned just above dynamic support (${support})`);
    } else {
      tp2 = parseFloat((currentPrice - riskDistance * 2.0).toFixed(decimals));
    }

    // TP3: 1:3 R:R
    tp3 = parseFloat((currentPrice - riskDistance * 3.0).toFixed(decimals));
  }

  // Calculate pip distances and exact R:R ratios
  const riskDiff = Math.abs(entry - stopLoss);
  const riskPips = parseFloat((riskDiff * pipMultiplier).toFixed(1));

  const tp1Diff = Math.abs(tp1 - entry);
  const tp2Diff = Math.abs(tp2 - entry);
  const tp3Diff = Math.abs(tp3 - entry);

  const tp1Pips = parseFloat((tp1Diff * pipMultiplier).toFixed(1));
  const tp2Pips = parseFloat((tp2Diff * pipMultiplier).toFixed(1));
  const tp3Pips = parseFloat((tp3Diff * pipMultiplier).toFixed(1));

  const rr1 = riskDiff > 0 ? parseFloat((tp1Diff / riskDiff).toFixed(2)) : 1.0;
  const rr2 = riskDiff > 0 ? parseFloat((tp2Diff / riskDiff).toFixed(2)) : 2.0;
  const rr3 = riskDiff > 0 ? parseFloat((tp3Diff / riskDiff).toFixed(2)) : 3.0;

  // Geometry viability check: ensure minimum 1:1 R:R
  const isViable = riskPips >= 4.0 && rr1 >= 0.85;

  return {
    entry,
    stopLoss,
    tp1,
    tp2,
    tp3,
    riskPips,
    tp1Pips,
    tp2Pips,
    tp3Pips,
    riskReward: {
      tp1: rr1,
      tp2: rr2,
      tp3: rr3,
    },
    ratios: {
      tp1: `1:${rr1}`,
      tp2: `1:${rr2}`,
      tp3: `1:${rr3}`,
    },
    isViable,
    notes: notes.join('; '),
  };
};

export default {
  calculateDynamicTPSL,
};
