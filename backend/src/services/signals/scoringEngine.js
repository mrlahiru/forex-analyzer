/**
 * Deterministic Scoring Engine
 * Evaluates market technical parameters against a 100-point transparent scoring model.
 * 
 * Weights:
 * - EMA Trend:           25 points
 * - MACD:                20 points
 * - RSI:                 15 points
 * - Market Structure:    15 points
 * - Support / Resistance 15 points
 * - Volatility (ATR):    10 points
 * Total:                 100 points
 */

export const DEFAULT_WEIGHTS = {
  emaTrend: 25,
  macd: 20,
  rsi: 15,
  marketStructure: 15,
  supportResistance: 15,
  volatility: 10,
};

/**
 * Score technical analysis data for BUY bias
 * @param {Object} analysis - Output from runTechnicalAnalysis
 * @param {Object} weights
 */
export const scoreBullishSetup = (analysis, weights = DEFAULT_WEIGHTS) => {
  let score = 0;
  const breakdown = {};
  const reasons = [];

  const { indicators, marketStructure, supportResistance, currentPrice } = analysis;
  const { trend, momentum, volatility } = indicators;

  // 1. EMA Trend (25 points max)
  let trendScore = 0;
  if (trend.ema20 && currentPrice > trend.ema20) {
    trendScore += 6;
    reasons.push('Price is trading above EMA 20');
  }
  if (trend.ema20 && trend.ema50 && trend.ema20 > trend.ema50) {
    trendScore += 8;
    reasons.push('EMA 20 is above EMA 50 (Bullish Momentum)');
  }
  if (trend.ema50 && trend.ema200 && trend.ema50 > trend.ema200) {
    trendScore += 8;
    reasons.push('EMA 50 is above EMA 200 (Golden Cross Alignment)');
  } else if (!trend.ema200 && trend.ema50 && currentPrice > trend.ema50) {
    trendScore += 5;
  }
  if (trend.sma50 && currentPrice > trend.sma50) {
    trendScore += 3;
    reasons.push('Price holds above 50-period SMA benchmark');
  }
  trendScore = Math.min(trendScore, weights.emaTrend);
  breakdown.emaTrend = trendScore;
  score += trendScore;

  // 2. MACD (20 points max)
  let macdScore = 0;
  if (momentum.macdHistogram > 0) {
    macdScore += 10;
    reasons.push('MACD histogram is positive (Bullish Momentum)');
  }
  if (momentum.macd > 0) {
    macdScore += 6;
    reasons.push('MACD line is in positive territory');
  }
  if (momentum.isBullishCrossover) {
    macdScore += 4;
    reasons.push('Fresh Bullish MACD crossover detected');
  }
  macdScore = Math.min(macdScore, weights.macd);
  breakdown.macd = macdScore;
  score += macdScore;

  // 3. RSI (15 points max)
  let rsiScore = 0;
  const rsi = momentum.rsi;
  if (rsi !== null && rsi !== undefined) {
    if (rsi >= 52 && rsi <= 68) {
      rsiScore = 15;
      reasons.push(`RSI is ${rsi} (Healthy bullish momentum without overbought risk)`);
    } else if (rsi > 68 && rsi <= 75) {
      rsiScore = 8;
      reasons.push(`RSI is ${rsi} (Bullish but approaching overbought threshold)`);
    } else if (rsi >= 48 && rsi < 52) {
      rsiScore = 7;
      reasons.push(`RSI is neutral-bullish at ${rsi}`);
    } else if (rsi > 75) {
      rsiScore = 0;
      reasons.push(`RSI is overbought at ${rsi} (Caution: pullback risk)`);
    } else {
      rsiScore = 0;
    }
  }
  breakdown.rsi = rsiScore;
  score += rsiScore;

  // 4. Market Structure (15 points max)
  let structScore = 0;
  if (marketStructure.state === 'UPTREND') {
    structScore += 10;
    reasons.push('Higher High & Higher Low market structure confirmed');
  } else if (marketStructure.highStructure === 'HIGHER_HIGH') {
    structScore += 6;
    reasons.push('Higher High printed on current timeframe');
  }
  if (marketStructure.isBreakout) {
    structScore += 5;
    reasons.push(`Bullish breakout above recent swing high (${marketStructure.recentSwingHigh})`);
  }
  structScore = Math.min(structScore, weights.marketStructure);
  breakdown.marketStructure = structScore;
  score += structScore;

  // 5. Support & Resistance (15 points max)
  let srScore = 0;
  const atr = volatility.atr || 0.001;
  if (supportResistance.nearestSupport) {
    const distToSupport = currentPrice - supportResistance.nearestSupport;
    if (distToSupport > 0 && distToSupport <= 1.8 * atr) {
      srScore += 8;
      reasons.push(`Price is well supported near dynamic zone at ${supportResistance.nearestSupport}`);
    } else if (distToSupport > 0) {
      srScore += 5;
    }
  }
  if (supportResistance.nearestResistance) {
    const distToResistance = supportResistance.nearestResistance - currentPrice;
    if (distToResistance >= 1.5 * atr) {
      srScore += 7;
      reasons.push(`Favorable upside runway before next resistance at ${supportResistance.nearestResistance}`);
    } else if (distToResistance > 0) {
      srScore += 3;
    }
  }
  srScore = Math.min(srScore, weights.supportResistance);
  breakdown.supportResistance = srScore;
  score += srScore;

  // 6. Volatility & Liquidity (10 points max)
  let volScore = 0;
  if (volatility.atr && volatility.atrPercent) {
    if (volatility.atrPercent >= 0.03 && volatility.atrPercent <= 0.8) {
      volScore = 10;
      reasons.push(`ATR volatility is stable (${volatility.atrPercent}% of price)`);
    } else {
      volScore = 5;
    }
  } else {
    volScore = 6;
  }
  breakdown.volatility = volScore;
  score += volScore;

  return {
    score: Math.min(Math.round(score), 100),
    breakdown,
    reasons,
  };
};

/**
 * Score technical analysis data for SELL bias
 * @param {Object} analysis - Output from runTechnicalAnalysis
 * @param {Object} weights
 */
export const scoreBearishSetup = (analysis, weights = DEFAULT_WEIGHTS) => {
  let score = 0;
  const breakdown = {};
  const reasons = [];

  const { indicators, marketStructure, supportResistance, currentPrice } = analysis;
  const { trend, momentum, volatility } = indicators;

  // 1. EMA Trend (25 points max)
  let trendScore = 0;
  if (trend.ema20 && currentPrice < trend.ema20) {
    trendScore += 6;
    reasons.push('Price is trading below EMA 20');
  }
  if (trend.ema20 && trend.ema50 && trend.ema20 < trend.ema50) {
    trendScore += 8;
    reasons.push('EMA 20 is below EMA 50 (Bearish Momentum)');
  }
  if (trend.ema50 && trend.ema200 && trend.ema50 < trend.ema200) {
    trendScore += 8;
    reasons.push('EMA 50 is below EMA 200 (Death Cross Alignment)');
  } else if (!trend.ema200 && trend.ema50 && currentPrice < trend.ema50) {
    trendScore += 5;
  }
  if (trend.sma50 && currentPrice < trend.sma50) {
    trendScore += 3;
    reasons.push('Price is below 50-period SMA benchmark');
  }
  trendScore = Math.min(trendScore, weights.emaTrend);
  breakdown.emaTrend = trendScore;
  score += trendScore;

  // 2. MACD (20 points max)
  let macdScore = 0;
  if (momentum.macdHistogram < 0) {
    macdScore += 10;
    reasons.push('MACD histogram is negative (Bearish Momentum)');
  }
  if (momentum.macd < 0) {
    macdScore += 6;
    reasons.push('MACD line is in negative territory');
  }
  if (momentum.isBearishCrossover) {
    macdScore += 4;
    reasons.push('Fresh Bearish MACD crossover detected');
  }
  macdScore = Math.min(macdScore, weights.macd);
  breakdown.macd = macdScore;
  score += macdScore;

  // 3. RSI (15 points max)
  let rsiScore = 0;
  const rsi = momentum.rsi;
  if (rsi !== null && rsi !== undefined) {
    if (rsi <= 48 && rsi >= 32) {
      rsiScore = 15;
      reasons.push(`RSI is ${rsi} (Healthy bearish momentum without oversold exhaustion)`);
    } else if (rsi < 32 && rsi >= 25) {
      rsiScore = 8;
      reasons.push(`RSI is ${rsi} (Bearish but approaching oversold support)`);
    } else if (rsi > 48 && rsi <= 52) {
      rsiScore = 7;
      reasons.push(`RSI is neutral-bearish at ${rsi}`);
    } else if (rsi < 25) {
      rsiScore = 0;
      reasons.push(`RSI is deeply oversold at ${rsi} (Bounce risk)`);
    } else {
      rsiScore = 0;
    }
  }
  breakdown.rsi = rsiScore;
  score += rsiScore;

  // 4. Market Structure (15 points max)
  let structScore = 0;
  if (marketStructure.state === 'DOWNTREND') {
    structScore += 10;
    reasons.push('Lower High & Lower Low market structure confirmed');
  } else if (marketStructure.lowStructure === 'LOWER_LOW') {
    structScore += 6;
    reasons.push('Lower Low printed on current timeframe');
  }
  if (marketStructure.isBreakdown) {
    structScore += 5;
    reasons.push(`Bearish breakdown below recent swing low (${marketStructure.recentSwingLow})`);
  }
  structScore = Math.min(structScore, weights.marketStructure);
  breakdown.marketStructure = structScore;
  score += structScore;

  // 5. Support & Resistance (15 points max)
  let srScore = 0;
  const atr = volatility.atr || 0.001;
  if (supportResistance.nearestResistance) {
    const distToRes = supportResistance.nearestResistance - currentPrice;
    if (distToRes > 0 && distToRes <= 1.8 * atr) {
      srScore += 8;
      reasons.push(`Price is capped below strong resistance at ${supportResistance.nearestResistance}`);
    } else if (distToRes > 0) {
      srScore += 5;
    }
  }
  if (supportResistance.nearestSupport) {
    const distToSup = currentPrice - supportResistance.nearestSupport;
    if (distToSup >= 1.5 * atr) {
      srScore += 7;
      reasons.push(`Clear downward runway to support target at ${supportResistance.nearestSupport}`);
    } else if (distToSup > 0) {
      srScore += 3;
    }
  }
  srScore = Math.min(srScore, weights.supportResistance);
  breakdown.supportResistance = srScore;
  score += srScore;

  // 6. Volatility & Liquidity (10 points max)
  let volScore = 0;
  if (volatility.atr && volatility.atrPercent) {
    if (volatility.atrPercent >= 0.03 && volatility.atrPercent <= 0.8) {
      volScore = 10;
      reasons.push(`ATR volatility is stable (${volatility.atrPercent}% of price)`);
    } else {
      volScore = 5;
    }
  } else {
    volScore = 6;
  }
  breakdown.volatility = volScore;
  score += volScore;

  return {
    score: Math.min(Math.round(score), 100),
    breakdown,
    reasons,
  };
};

/**
 * Determine final signal outcome from bullish and bearish evaluations
 * Thresholds:
 * - Score >= 75: Strong setup
 * - Score 60-74: Moderate setup
 * - Score < 60: NO TRADE
 */
export const evaluateDeterministicSignal = (analysis, weights = DEFAULT_WEIGHTS) => {
  const bullish = scoreBullishSetup(analysis, weights);
  const bearish = scoreBearishSetup(analysis, weights);

  let direction = 'NO_TRADE';
  let score = 0;
  let confidence = 'NONE';
  let breakdown = {};
  let reasons = [];

  if (bullish.score >= 75 && bullish.score > bearish.score) {
    direction = 'BUY';
    score = bullish.score;
    confidence = 'STRONG';
    breakdown = bullish.breakdown;
    reasons = bullish.reasons;
  } else if (bearish.score >= 75 && bearish.score > bullish.score) {
    direction = 'SELL';
    score = bearish.score;
    confidence = 'STRONG';
    breakdown = bearish.breakdown;
    reasons = bearish.reasons;
  } else if (bullish.score >= 60 && bullish.score > bearish.score + 10) {
    direction = 'BUY';
    score = bullish.score;
    confidence = 'MODERATE';
    breakdown = bullish.breakdown;
    reasons = bullish.reasons;
  } else if (bearish.score >= 60 && bearish.score > bullish.score + 10) {
    direction = 'SELL';
    score = bearish.score;
    confidence = 'MODERATE';
    breakdown = bearish.breakdown;
    reasons = bearish.reasons;
  } else {
    direction = 'NO_TRADE';
    score = Math.max(bullish.score, bearish.score);
    confidence = 'LOW';
    breakdown = bullish.score >= bearish.score ? bullish.breakdown : bearish.breakdown;
    reasons = [
      `Technical setup score (${score}/100) below minimum edge threshold (60)`,
      'Conflicting indicator signals or tight consolidation without directional edge',
    ];
  }

  return {
    direction,
    score,
    confidence,
    breakdown,
    reasons,
    bullishScore: bullish.score,
    bearishScore: bearish.score,
  };
};

export default {
  scoreBullishSetup,
  scoreBearishSetup,
  evaluateDeterministicSignal,
};
