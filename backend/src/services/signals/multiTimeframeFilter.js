/**
 * Multi-Timeframe Confirmation Filter (Section 8)
 * Validates and refines single-timeframe signal setups against higher and lower timeframes.
 */

export const applyMultiTimeframeConfirmation = (candidateSignal, mtfData) => {
  const result = {
    ...candidateSignal,
    timeframeConsensus: mtfData?.consensus || 'MIXED',
    timeframeBreakdown: mtfData?.timeframes || [],
    reasons: [...candidateSignal.reasons],
  };

  if (!mtfData || !mtfData.timeframes || mtfData.timeframes.length === 0) {
    return result;
  }

  const { direction, score } = candidateSignal;
  if (direction === 'NO_TRADE') {
    return result;
  }

  const tf4h = mtfData.timeframes.find((t) => t.timeframe === '4h');
  const tf1h = mtfData.timeframes.find((t) => t.timeframe === '1h');
  const tf15m = mtfData.timeframes.find((t) => t.timeframe === '15m');

  if (direction === 'BUY') {
    // Check higher timeframe (4H) conflict
    if (tf4h && tf4h.bias === 'BEARISH') {
      const adjustedScore = Math.max(score - 18, 0);
      result.score = adjustedScore;
      result.reasons.push('Warning: 4H higher timeframe trend is Bearish (Trend Conflict)');

      if (adjustedScore < 60) {
        result.direction = 'NO_TRADE';
        result.confidence = 'LOW';
        result.reasons.unshift('Vetoed: Higher timeframe (4H) bearish trend strongly conflicts with setup');
      } else {
        result.confidence = 'MODERATE';
      }
    } else if (
      (tf4h && tf4h.bias === 'BULLISH') &&
      (tf1h && tf1h.bias === 'BULLISH')
    ) {
      // Concordance bonus
      const bonusScore = Math.min(score + 10, 100);
      result.score = bonusScore;
      result.confidence = bonusScore >= 80 ? 'STRONG' : 'MODERATE';
      result.reasons.push('Multi-timeframe confirmation: 4H & 1H trends are aligned Bullish (+10 confidence bonus)');
    }
  } else if (direction === 'SELL') {
    // Check higher timeframe (4H) conflict
    if (tf4h && tf4h.bias === 'BULLISH') {
      const adjustedScore = Math.max(score - 18, 0);
      result.score = adjustedScore;
      result.reasons.push('Warning: 4H higher timeframe trend is Bullish (Trend Conflict)');

      if (adjustedScore < 60) {
        result.direction = 'NO_TRADE';
        result.confidence = 'LOW';
        result.reasons.unshift('Vetoed: Higher timeframe (4H) bullish trend strongly conflicts with setup');
      } else {
        result.confidence = 'MODERATE';
      }
    } else if (
      (tf4h && tf4h.bias === 'BEARISH') &&
      (tf1h && tf1h.bias === 'BEARISH')
    ) {
      // Concordance bonus
      const bonusScore = Math.min(score + 10, 100);
      result.score = bonusScore;
      result.confidence = bonusScore >= 80 ? 'STRONG' : 'MODERATE';
      result.reasons.push('Multi-timeframe confirmation: 4H & 1H trends are aligned Bearish (+10 confidence bonus)');
    }
  }

  return result;
};

export default {
  applyMultiTimeframeConfirmation,
};
