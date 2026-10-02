/**
 * Position Sizing and Risk Management Calculator (Section 10)
 * Evaluates trade risk, position size (lots & units), and multi-target reward projections.
 */

/**
 * Calculates standard pip value per 100,000 units (1 standard lot) in USD
 * @param {string} pair - e.g. "EUR/USD" or "USD/JPY"
 * @param {number} currentPrice
 */
export const getPipValuePerLot = (pair, currentPrice) => {
  const normPair = pair?.toUpperCase().replace(/[^A-Z]/g, '') || 'EURUSD';

  // Gold (XAU/USD): 1 standard lot = 100 oz. 1 pip ($0.10 price move) = $10.00
  if (normPair.includes('XAU') || normPair.includes('GOLD')) {
    return 10.0;
  }

  // Pairs where USD is quote currency: 1 pip = $10.00 per standard lot
  if (
    normPair.endsWith('USD') // EUR/USD, GBP/USD, AUD/USD, NZD/USD
  ) {
    return 10.0;
  }

  // USD/JPY: 1 pip = 0.01. Pip value = (0.01 / price) * 100,000
  if (normPair === 'USDJPY') {
    return currentPrice > 0 ? parseFloat(((0.01 / currentPrice) * 100000).toFixed(2)) : 6.5;
  }

  // USD/CHF: 1 pip = 0.0001. Pip value = (0.0001 / price) * 100,000
  if (normPair === 'USDCHF') {
    return currentPrice > 0 ? parseFloat(((0.0001 / currentPrice) * 100000).toFixed(2)) : 11.3;
  }

  // USD/CAD: 1 pip = 0.0001. Pip value = (0.0001 / price) * 100,000
  if (normPair === 'USDCAD') {
    return currentPrice > 0 ? parseFloat(((0.0001 / currentPrice) * 100000).toFixed(2)) : 7.2;
  }

  return 10.0;
};

/**
 * Calculate comprehensive position sizing, potential losses, and target returns
 * @param {Object} input
 * @param {number} input.accountBalance - e.g. 1000 ($)
 * @param {number} input.riskPercentage - e.g. 1.0 (%)
 * @param {number} input.entryPrice - e.g. 1.08420
 * @param {number} input.stopLoss - e.g. 1.08180
 * @param {number} [input.tp1] - e.g. 1.08660
 * @param {number} [input.tp2] - e.g. 1.08900
 * @param {number} [input.tp3] - e.g. 1.09140
 * @param {string} [input.pair] - e.g. "EUR/USD"
 */
export const calculatePositionSize = (input) => {
  const {
    accountBalance = 1000,
    riskPercentage = 1.0,
    entryPrice,
    stopLoss,
    tp1,
    tp2,
    tp3,
    pair = 'EUR/USD',
  } = input;

  const balance = Math.max(parseFloat(accountBalance) || 1000, 10);
  const riskPct = Math.min(Math.max(parseFloat(riskPercentage) || 1.0, 0.1), 10.0);

  const isJPY = pair?.includes('JPY');
  const isGold = pair?.includes('XAU') || pair?.includes('GOLD');
  const pipMultiplier = isGold ? 10 : (isJPY ? 100 : 10000);

  // Max Risk Capital
  const riskAmount = parseFloat(((balance * riskPct) / 100).toFixed(2));

  if (!entryPrice || !stopLoss || entryPrice === stopLoss) {
    return {
      accountBalance: balance,
      riskPercentage: riskPct,
      riskAmount,
      error: 'Valid Entry Price and distinct Stop Loss are required',
    };
  }

  const entry = parseFloat(entryPrice);
  const sl = parseFloat(stopLoss);
  const riskDistance = Math.abs(entry - sl);
  const riskPips = parseFloat((riskDistance * pipMultiplier).toFixed(1));

  if (riskPips <= 0) {
    return {
      accountBalance: balance,
      riskPercentage: riskPct,
      riskAmount,
      error: 'Stop loss distance must be greater than zero',
    };
  }

  // Pip value per standard lot (100,000 units)
  const pipValuePerLot = getPipValuePerLot(pair, entry);
  const pipValuePerUnit = pipValuePerLot / 100000;

  // Total Position Size Calculation
  const totalUnits = Math.floor(riskAmount / (riskPips * pipValuePerUnit));
  const standardLots = parseFloat((totalUnits / 100000).toFixed(3));
  const miniLots = parseFloat((totalUnits / 10000).toFixed(2));
  const microLots = parseFloat((totalUnits / 1000).toFixed(1));

  // Potential Loss
  const potentialLoss = parseFloat((-riskAmount).toFixed(2));

  // Profit calculations for TP1, TP2, TP3
  const calcTargetMetrics = (targetPrice, defaultRR) => {
    if (!targetPrice) {
      const reward = parseFloat((riskAmount * defaultRR).toFixed(2));
      return {
        price: null,
        pips: parseFloat((riskPips * defaultRR).toFixed(1)),
        profit: reward,
        rrRatio: `1:${defaultRR}`,
      };
    }

    const tp = parseFloat(targetPrice);
    const tpDistance = Math.abs(tp - entry);
    const tpPips = parseFloat((tpDistance * pipMultiplier).toFixed(1));
    const rr = parseFloat((tpDistance / riskDistance).toFixed(2));
    const profit = parseFloat((totalUnits * tpPips * pipValuePerUnit).toFixed(2));

    return {
      price: tp,
      pips: tpPips,
      profit,
      rrRatio: `1:${rr}`,
    };
  };

  const target1 = calcTargetMetrics(tp1, 1.0);
  const target2 = calcTargetMetrics(tp2, 2.0);
  const target3 = calcTargetMetrics(tp3, 3.0);

  // Capital Preservation & Safety Advisories
  const warnings = [];
  if (riskPct > 2.0) {
    warnings.push('Risk percentage exceeds institutional 2.0% safe threshold.');
  }
  if (standardLots * 100000 > balance * 30) {
    warnings.push('High leverage detected relative to account balance.');
  }

  return {
    pair,
    accountBalance: balance,
    riskPercentage: riskPct,
    riskAmount,
    entryPrice: entry,
    stopLoss: sl,
    riskPips,
    pipValuePerLot,
    positionSize: {
      units: totalUnits,
      standardLots,
      miniLots,
      microLots,
    },
    potentialLoss,
    targets: {
      tp1: target1,
      tp2: target2,
      tp3: target3,
    },
    warnings,
    disclaimer: 'Risk calculations are mathematical estimates. Execution slippage and broker spreads may impact live trade outcomes.',
  };
};

export default {
  getPipValuePerLot,
  calculatePositionSize,
};
