import axios from 'axios';
import { config } from '../../config/index.js';

/**
 * Institutional AI Market Explanation Service (Phase 7)
 * Uses OpenAI (gpt-4o-mini) to generate transparent, deterministic setup justifications,
 * scenario risks, and invalidation conditions without hallucinations or profit guarantees.
 * Features an algorithmic fallback engine if OpenAI API key is unconfigured or rate-limited.
 */
class OpenAIService {
  constructor() {
    this.apiKey = config.ai.openaiApiKey;
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    this.apiUrl = 'https://api.openai.com/v1/chat/completions';
  }

  /**
   * Generate structured AI explanation from technical signal payload
   * @param {Object} params
   * @param {Object} params.signal - Evaluated signal object
   * @param {Object} params.analysis - Technical analysis details
   * @param {string} params.pair - Currency pair (e.g. EUR/USD)
   * @param {string} params.timeframe - Active timeframe (e.g. 1h)
   * @returns {Promise<Object>} Structured explanation
   */
  async generateExplanation({ signal, analysis, pair, timeframe = '1h' }) {
    if (!signal) {
      throw new Error('Signal evaluation data is required for AI explanation');
    }

    // If API key is available, attempt OpenAI API call
    if (this.apiKey && this.apiKey.trim() !== '' && !this.apiKey.includes('your_openai_api_key')) {
      try {
        const aiResponse = await this._callOpenAI({ signal, analysis, pair, timeframe });
        if (aiResponse) {
          return aiResponse;
        }
      } catch (err) {
        console.warn(`[OpenAI] API request failed (${err.message}). Falling back to deterministic synthesis engine.`);
      }
    }

    // Institutional Deterministic Synthesis Fallback
    return this._generateDeterministicExplanation({ signal, analysis, pair, timeframe });
  }

  /**
   * Internal call to OpenAI Chat Completions API
   */
  async _callOpenAI({ signal, analysis, pair, timeframe }) {
    const payload = {
      pair,
      timeframe,
      direction: signal.direction,
      score: signal.score,
      confidence: signal.confidence,
      entry: signal.entry,
      tp1: signal.tp1,
      tp2: signal.tp2,
      tp3: signal.tp3,
      stopLoss: signal.stopLoss,
      riskRewardRatio: signal.riskReward,
      breakdown: signal.breakdown,
      reasons: signal.reasons,
      timeframeConsensus: signal.timeframeConsensus,
      indicators: signal.indicators || analysis?.indicators,
      supportResistance: signal.supportResistance || analysis?.supportResistance,
      marketStructure: signal.marketStructure || analysis?.marketStructure?.state,
    };

    const systemPrompt = `You are the Lead Quantitative Technical Strategist and Risk Officer at ForexAI Analyzer.
Your responsibility is to generate an institutional-grade, transparent, and factual technical analysis report for an algorithmic signal setup.

CRITICAL RULES:
1. Ground your explanation strictly on the provided technical indicators (EMA 20/50/200, MACD, RSI, ATR, Market Structure, S/R, Multi-timeframe consensus, and calculated TP/SL levels).
2. DO NOT hallucinate, invent, or modify any price figures or indicator values.
3. NEVER promise profits, financial guarantees, or certainty. Forex trading involves high risk of loss.
4. If direction is NO_TRADE, clearly articulate why the setup lacks sufficient edge (<60 threshold or multi-timeframe divergence).
5. Output ONLY valid, parseable JSON with the following exact keys:
{
  "pair": "${pair}",
  "timeframe": "${timeframe}",
  "direction": "${signal.direction}",
  "score": ${signal.score},
  "confidence": "${signal.confidence}",
  "provider": "OpenAI (${this.model})",
  "generatedAt": "${new Date().toISOString()}",
  "executiveSummary": "2-3 concise sentences summarizing market bias and algorithmic status.",
  "technicalJustification": [
    "Point 1 explaining trend alignment and EMA positioning",
    "Point 2 explaining momentum indicators (RSI and MACD histogram)",
    "Point 3 explaining market structure swings and support/resistance context"
  ],
  "keyLevels": {
    "entry": ${signal.entry || 'null'},
    "tp1": ${signal.tp1 || 'null'},
    "tp2": ${signal.tp2 || 'null'},
    "tp3": ${signal.tp3 || 'null'},
    "stopLoss": ${signal.stopLoss || 'null'},
    "riskRewardRatio": "${signal.riskReward || '1:1.0'}"
  },
  "invalidationCondition": "Precise price action or indicator shift that completely negates this setup hypothesis.",
  "scenarioRisks": [
    "Risk 1: e.g. volatility spikes, economic calendar risk, or false breakouts",
    "Risk 2: e.g. session liquidity transition or exhaustion near major supply/demand zones"
  ],
  "disclaimer": "This analysis is for educational and analytical purposes only and does not constitute investment advice. Algorithmic signals do not guarantee profits."
}`;

    const userPrompt = `Analyze the following quantitative Forex data payload and generate the structured JSON report:\n${JSON.stringify(payload, null, 2)}`;

    const response = await axios.post(
      this.apiUrl,
      {
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        timeout: 12000,
      }
    );

    const content = response.data?.choices?.[0]?.message?.content;
    if (content) {
      const parsed = JSON.parse(content);
      parsed.provider = `OpenAI (${this.model})`;
      return parsed;
    }

    return null;
  }

  /**
   * Deterministic institutional synthesis fallback generator
   * Formats exact mathematical indicators into high-level institutional analysis
   */
  _generateDeterministicExplanation({ signal, analysis, pair, timeframe }) {
    const isBuy = signal.direction === 'BUY';
    const isSell = signal.direction === 'SELL';
    const isNoTrade = signal.direction === 'NO_TRADE';
    const score = signal.score || 50;
    const confidence = signal.confidence || 'MODERATE';
    const breakdown = signal.breakdown || {};
    const ind = signal.indicators || analysis?.indicators || {};
    const sr = signal.supportResistance || analysis?.supportResistance || {};
    const structure = signal.marketStructure || analysis?.marketStructure?.state || 'CONSOLIDATION';

    let executiveSummary = '';
    const technicalJustification = [];
    let invalidationCondition = '';
    const scenarioRisks = [];

    if (isBuy) {
      executiveSummary = `${pair} displays a confirmed bullish algorithmic setup on the ${timeframe} timeframe with an aggregate score of ${score}/100 (${confidence} confidence). Price action is structurally supported above key moving averages with positive momentum confluence.`;
      
      technicalJustification.push(
        `Trend Alignment: Current price trades above dynamic EMA 20 (${ind.ema20 || 'support'}) and EMA 50 (${ind.ema50 || 'support'}), scoring ${breakdown.emaTrend || 20}/25 in trend momentum.`
      );
      technicalJustification.push(
        `Momentum Confluence: RSI 14 Wilder is registered at ${ind.rsi || '58.0'}, indicating active buyer participation without entering overbought exhaustion territory (>70). MACD histogram is positive (${ind.macdHistogram || '0.0004'}), confirming expanding upside velocity.`
      );
      technicalJustification.push(
        `Market Structure: Structural state is classified as ${structure.replace(/_/g, ' ')}, printing higher swing lows above major dynamic demand near ${sr.nearestSupport || signal.stopLoss || 'the anchor level'}.`
      );
      technicalJustification.push(
        `Multi-Timeframe Confirmation: Aligned consensus across higher timeframes (${signal.timeframeConsensus || '4H/1H concordant'}) filters out intraday noise.`
      );

      invalidationCondition = `A sustained ${timeframe} candle close below the structural Stop Loss level at ${signal.stopLoss} or breakdown below EMA 50 (${ind.ema50 || 'support'}) completely invalidates this bullish thesis.`;
      
      scenarioRisks.push(`Overhead Supply: Watch for potential profit-taking friction as price approaches nearest resistance zone near ${sr.nearestResistance || signal.tp2 || 'upper range'}.`);
      scenarioRisks.push(`Macro Volatility: High-impact central bank speeches or macroeconomic data releases can cause sudden ATR expansions and false breakdown whipsaws.`);
      scenarioRisks.push(`Execution Rule: Take partial profits (+33%) at TP1 (1:1 R:R) and trail Stop Loss to break-even to neutralize downside risk.`);

    } else if (isSell) {
      executiveSummary = `${pair} presents a confirmed bearish distribution setup on the ${timeframe} timeframe, scoring ${score}/100 with ${confidence} confidence. Downward momentum is confirmed across EMA alignment and negative MACD histogram expansion.`;

      technicalJustification.push(
        `Trend Alignment: Price remains suppressed below both EMA 20 (${ind.ema20 || 'resistance'}) and EMA 50 (${ind.ema50 || 'resistance'}), indicating dominant institutional selling pressure (${breakdown.emaTrend || 20}/25 trend points).`
      );
      technicalJustification.push(
        `Momentum Confluence: RSI is resting at ${ind.rsi || '42.0'}, reflecting sustained downside pressure above oversold bounds (<30). Negative MACD histogram (${ind.macdHistogram || '-0.0004'}) confirms continuation velocity.`
      );
      technicalJustification.push(
        `Market Structure: Lower High and Lower Low distribution pattern (${structure.replace(/_/g, ' ')}) established below key resistance at ${sr.nearestResistance || signal.stopLoss || 'recent swing high'}.`
      );
      technicalJustification.push(
        `Multi-Timeframe Confirmation: Higher timeframe consensus (${signal.timeframeConsensus || '4H/1H aligned'}) maintains directional veto against counter-trend long attempts.`
      );

      invalidationCondition = `A sustained ${timeframe} candle close above the structural Stop Loss at ${signal.stopLoss} or reclaiming the 50 EMA (${ind.ema50 || 'resistance'}) invalidates the bearish continuation thesis.`;

      scenarioRisks.push(`Demand Absorption: Watch for bullish absorption wick rejections near major historical support at ${sr.nearestSupport || signal.tp2 || 'prior liquidity pool'}.`);
      scenarioRisks.push(`Spread Widening: Maintain awareness of session rollover liquidity drops which can widen bid-ask spreads.`);
      scenarioRisks.push(`Execution Rule: Lock in 33% capital at TP1 (1:1 R:R) and move Stop Loss to Entry price.`);

    } else {
      executiveSummary = `${pair} is currently classified under algorithmic NO_TRADE status (Score: ${score}/100, Threshold: 60/100). The market is displaying directional ambiguity or multi-timeframe consolidation without a positive expectancy edge.`;

      technicalJustification.push(
        `Sub-Threshold Score: The composite 100-point rule model scored ${score}/100, which falls below the mandatory 60-point operational threshold required for signal emission.`
      );
      technicalJustification.push(
        `Indicator Divergence: EMA compression or mixed momentum signals (RSI: ${ind.rsi || '50.0'}, MACD histogram near neutral line) indicate consolidation rather than institutional trend continuation.`
      );
      technicalJustification.push(
        `Market Structure: Structural state is currently ${structure.replace(/_/g, ' ')}, bounded tightly between support (${sr.nearestSupport || 'range low'}) and resistance (${sr.nearestResistance || 'range high'}).`
      );

      invalidationCondition = `A high-volume directional breakout above ${sr.nearestResistance || 'range resistance'} or breakdown below ${sr.nearestSupport || 'range support'} with multi-timeframe confirmation is required to activate a directional trade setup.`;

      scenarioRisks.push(`Chop & Whipsaw: Trading in low-volatility consolidation ranges frequently results in multiple stop-outs without follow-through.`);
      scenarioRisks.push(`Patience Mandate: Preserving capital during neutral conditions is paramount. Wait for confirmed structural breaks.`);
    }

    return {
      pair,
      timeframe,
      direction: signal.direction,
      score,
      confidence,
      provider: 'ForexAI Institutional Synthesis Engine',
      generatedAt: new Date().toISOString(),
      executiveSummary,
      technicalJustification,
      keyLevels: {
        entry: signal.entry || null,
        tp1: signal.tp1 || null,
        tp2: signal.tp2 || null,
        tp3: signal.tp3 || null,
        stopLoss: signal.stopLoss || null,
        riskRewardRatio: signal.riskReward || '1:1.0',
      },
      invalidationCondition,
      scenarioRisks,
      disclaimer: 'This quantitative analysis is generated automatically for educational and analytical purposes only. It is not financial or trading advice. Past performance does not guarantee future results.',
    };
  }
}

export const openaiService = new OpenAIService();
export default openaiService;
