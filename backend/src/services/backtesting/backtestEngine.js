import { marketDataManager } from '../marketData/index.js';
import { runTechnicalAnalysis } from '../indicators/analysisEngine.js';
import { evaluateDeterministicSignal } from '../signals/scoringEngine.js';
import { calculateDynamicTPSL } from '../risk/tpslEngine.js';

/**
 * Deterministic Backtesting Simulation Engine (Phase 10)
 * Evaluates the 100-point scoring model and multi-target TP/SL rules across historical candle datasets.
 * Computes institutional performance metrics: Win Rate %, Profit Factor, Max Drawdown %, Equity Curve, and Trade Log.
 */
class BacktestEngine {
  constructor() {
    this.lastResult = null;
  }

  /**
   * Run historical backtest
   * @param {Object} options
   * @param {string} options.pair - Currency pair (default EUR/USD)
   * @param {string} options.timeframe - Active timeframe (default 1h)
   * @param {number} options.initialBalance - Starting equity (default 10,000)
   * @param {number} options.riskPercentage - Capital risk % per trade (default 1.0)
   * @param {number} options.lookbackBars - Historical bars count (default 300)
   * @param {number} options.minScore - Minimum threshold to open trade (default 65)
   * @param {string} options.strategy - Strategy preset name
   */
  async runBacktest({
    pair = 'EUR/USD',
    timeframe = '1h',
    initialBalance = 10000,
    riskPercentage = 1.0,
    lookbackBars = 300,
    minScore = 65,
    strategy = 'DETERMINISTIC_CORE',
  } = {}) {
    // 1. Ingest historical candles
    const candleCount = Math.max(100, Math.min(lookbackBars, 800));
    const candleResult = await marketDataManager.getCandles(pair, timeframe, candleCount);
    const candles = candleResult.candles || [];

    if (candles.length < 50) {
      throw new Error(`Insufficient historical candles (${candles.length}). Need at least 50 bars.`);
    }

    const isJPY = pair.includes('JPY');
    const pipMultiplier = isJPY ? 100 : 10000;
    const pipSize = isJPY ? 0.01 : 0.0001;

    let balance = parseFloat(initialBalance);
    let peakEquity = balance;
    let maxDrawdownPct = 0;

    const trades = [];
    const equityCurve = [
      {
        time: candles[0].timestamp || new Date().toISOString(),
        balance: parseFloat(balance.toFixed(2)),
        equity: parseFloat(balance.toFixed(2)),
        drawdownPct: 0,
      },
    ];

    let currentTrade = null;
    const warmupWindow = 40; // minimum bars for moving averages

    // 2. Step through historical candles
    for (let i = warmupWindow; i < candles.length; i++) {
      const currentCandle = candles[i];
      const currentTimestamp = currentCandle.timestamp || new Date().toISOString();

      // Check if an existing open trade exits at current bar
      if (currentTrade) {
        const isBuy = currentTrade.direction === 'BUY';
        let isClosed = false;
        let exitReason = '';
        let exitPrice = currentCandle.close;

        if (isBuy) {
          // Check Stop Loss hit first (conservative simulation)
          if (currentCandle.low <= currentTrade.stopLoss) {
            isClosed = true;
            exitReason = 'SL_HIT';
            exitPrice = currentTrade.stopLoss;
          } else if (currentCandle.high >= currentTrade.tp3) {
            isClosed = true;
            exitReason = 'TP3_HIT';
            exitPrice = currentTrade.tp3;
          } else if (currentCandle.high >= currentTrade.tp2) {
            isClosed = true;
            exitReason = 'TP2_HIT';
            exitPrice = currentTrade.tp2;
          } else if (currentCandle.high >= currentTrade.tp1) {
            isClosed = true;
            exitReason = 'TP1_HIT';
            exitPrice = currentTrade.tp1;
          }
        } else {
          // SELL trade
          if (currentCandle.high >= currentTrade.stopLoss) {
            isClosed = true;
            exitReason = 'SL_HIT';
            exitPrice = currentTrade.stopLoss;
          } else if (currentCandle.low <= currentTrade.tp3) {
            isClosed = true;
            exitReason = 'TP3_HIT';
            exitPrice = currentTrade.tp3;
          } else if (currentCandle.low <= currentTrade.tp2) {
            isClosed = true;
            exitReason = 'TP2_HIT';
            exitPrice = currentTrade.tp2;
          } else if (currentCandle.low <= currentTrade.tp1) {
            isClosed = true;
            exitReason = 'TP1_HIT';
            exitPrice = currentTrade.tp1;
          }
        }

        // Handle Trade Exit
        if (isClosed) {
          const pipsGain = isBuy
            ? (exitPrice - currentTrade.entryPrice) * pipMultiplier
            : (currentTrade.entryPrice - exitPrice) * pipMultiplier;

          let rMultiple = -1.0;
          let profitDollar = -currentTrade.riskAmount;

          if (exitReason === 'TP1_HIT') {
            rMultiple = 1.0;
            profitDollar = currentTrade.riskAmount * 1.0;
          } else if (exitReason === 'TP2_HIT') {
            rMultiple = 2.0;
            profitDollar = currentTrade.riskAmount * 2.0;
          } else if (exitReason === 'TP3_HIT') {
            rMultiple = 3.0;
            profitDollar = currentTrade.riskAmount * 3.0;
          }

          balance += profitDollar;
          balance = parseFloat(balance.toFixed(2));

          trades.push({
            id: currentTrade.id,
            pair,
            direction: currentTrade.direction,
            entryIndex: currentTrade.entryIndex,
            exitIndex: i,
            entryTime: currentTrade.entryTime,
            exitTime: currentTimestamp,
            entryPrice: currentTrade.entryPrice,
            exitPrice: parseFloat(exitPrice.toFixed(isJPY ? 2 : 5)),
            stopLoss: currentTrade.stopLoss,
            tp1: currentTrade.tp1,
            tp2: currentTrade.tp2,
            tp3: currentTrade.tp3,
            outcome: exitReason,
            pips: parseFloat(pipsGain.toFixed(1)),
            rMultiple,
            profitDollar: parseFloat(profitDollar.toFixed(2)),
            balanceAfter: balance,
            durationBars: i - currentTrade.entryIndex,
          });

          currentTrade = null;
        }
      }

      // Update Equity Curve & Drawdown
      const currentEquity = balance;
      if (currentEquity > peakEquity) {
        peakEquity = currentEquity;
      }
      const currentDrawdownPct = peakEquity > 0
        ? parseFloat((((peakEquity - currentEquity) / peakEquity) * 100).toFixed(2))
        : 0;

      if (currentDrawdownPct > maxDrawdownPct) {
        maxDrawdownPct = currentDrawdownPct;
      }

      equityCurve.push({
        time: currentTimestamp,
        balance,
        equity: currentEquity,
        drawdownPct: currentDrawdownPct,
      });

      // If no open trade, evaluate signal on candles up to index i
      if (!currentTrade && i < candles.length - 1) {
        const slice = candles.slice(0, i + 1);
        const signalCandidate = this._evaluateSlice(slice, pair, timeframe, minScore, strategy);

        if (signalCandidate && (signalCandidate.direction === 'BUY' || signalCandidate.direction === 'SELL')) {
          const entryPrice = currentCandle.close;
          const atr = signalCandidate.atr || (pipSize * 15);

          // Calculate Dynamic TP/SL
          const tpsl = calculateDynamicTPSL({
            pair,
            direction: signalCandidate.direction,
            currentPrice: entryPrice,
            marketStructure: signalCandidate.structure,
            supportResistance: signalCandidate.sr,
            atr,
          });

          if (tpsl.isViable && tpsl.stopLoss) {
            const riskAmount = parseFloat(((balance * riskPercentage) / 100).toFixed(2));

            currentTrade = {
              id: `tr_${trades.length + 1}`,
              entryIndex: i,
              entryTime: currentTimestamp,
              direction: signalCandidate.direction,
              score: signalCandidate.score,
              entryPrice,
              stopLoss: tpsl.stopLoss,
              tp1: tpsl.tp1,
              tp2: tpsl.tp2,
              tp3: tpsl.tp3,
              riskAmount,
            };
          }
        }
      }
    }

    // 3. Compute Summary Performance Metrics
    const totalTrades = trades.length;
    const winningTrades = trades.filter((t) => t.profitDollar > 0);
    const losingTrades = trades.filter((t) => t.profitDollar <= 0);

    const winCount = winningTrades.length;
    const lossCount = losingTrades.length;
    const winRate = totalTrades > 0 ? parseFloat(((winCount / totalTrades) * 100).toFixed(1)) : 0;

    const grossProfit = winningTrades.reduce((sum, t) => sum + t.profitDollar, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profitDollar, 0));
    const profitFactor = grossLoss > 0
      ? parseFloat((grossProfit / grossLoss).toFixed(2))
      : grossProfit > 0 ? 999.0 : 1.0;

    const netProfit = parseFloat((balance - initialBalance).toFixed(2));
    const netProfitPct = parseFloat((((balance - initialBalance) / initialBalance) * 100).toFixed(2));
    const totalPips = parseFloat(trades.reduce((sum, t) => sum + t.pips, 0).toFixed(1));

    const avgWin = winCount > 0 ? parseFloat((grossProfit / winCount).toFixed(2)) : 0;
    const avgLoss = lossCount > 0 ? parseFloat((grossLoss / lossCount).toFixed(2)) : 0;
    const expectancy = totalTrades > 0 ? parseFloat((netProfit / totalTrades).toFixed(2)) : 0;

    const avgDuration = totalTrades > 0
      ? parseFloat((trades.reduce((sum, t) => sum + t.durationBars, 0) / totalTrades).toFixed(1))
      : 0;

    const result = {
      pair,
      timeframe,
      strategy,
      candlesTested: candles.length,
      initialBalance: parseFloat(initialBalance),
      finalBalance: balance,
      netProfit,
      netProfitPct,
      totalPips,
      kpis: {
        totalTrades,
        winCount,
        lossCount,
        winRate,
        profitFactor,
        maxDrawdownPct,
        expectancy,
        avgWin,
        avgLoss,
        avgDurationBars: avgDuration,
      },
      trades: trades.slice(-50), // return last 50 trades for table
      equityCurve: this._sampleEquityCurve(equityCurve, 60), // sample 60 points for charting
      testedAt: new Date().toISOString(),
    };

    this.lastResult = result;
    return result;
  }

  /**
   * Helper to sample equity curve for clean chart rendering
   */
  _sampleEquityCurve(curve, targetPoints = 60) {
    if (curve.length <= targetPoints) return curve;
    const step = Math.ceil(curve.length / targetPoints);
    const sampled = [];
    for (let i = 0; i < curve.length; i += step) {
      sampled.push(curve[i]);
    }
    // Always include latest point
    if (sampled[sampled.length - 1] !== curve[curve.length - 1]) {
      sampled.push(curve[curve.length - 1]);
    }
    return sampled;
  }

  /**
   * Evaluate a slice of candles using the deterministic scoring engine
   */
  _evaluateSlice(slice, pair, timeframe, minScoreThreshold, strategy) {
    try {
      const analysis = runTechnicalAnalysis(slice, pair, timeframe);
      const scoring = evaluateDeterministicSignal(analysis);

      let effectiveThreshold = minScoreThreshold;
      if (strategy === 'CONSERVATIVE') effectiveThreshold = 75;
      if (strategy === 'AGGRESSIVE_MOMENTUM') effectiveThreshold = 60;

      if (scoring.score >= effectiveThreshold && scoring.direction !== 'NO_TRADE') {
        return {
          direction: scoring.direction,
          score: scoring.score,
          structure: analysis.marketStructure,
          sr: analysis.supportResistance,
          atr: analysis.indicators?.volatility?.atr || 0.001,
        };
      }
    } catch (e) {
      // ignore slice errors during warmup
    }
    return null;
  }

  /**
   * Get available strategy presets
   */
  getStrategies() {
    return [
      {
        id: 'DETERMINISTIC_CORE',
        name: 'Deterministic 100-Point Core',
        description: 'Standard institutional 65+ score threshold combining EMA trend, RSI momentum, and market structure confirmation.',
        threshold: 65,
        targetRR: '1:1.0 to 1:3.0',
      },
      {
        id: 'CONSERVATIVE',
        name: 'High-Conviction Conservative',
        description: 'Selective 75+ score requirement with strict higher timeframe alignment and confirmed swing breakout anchors.',
        threshold: 75,
        targetRR: '1:2.0 to 1:3.0',
      },
      {
        id: 'AGGRESSIVE_MOMENTUM',
        name: 'Momentum Continuation (60+)',
        description: 'Lower 60-point threshold for earlier entries during strong trend acceleration phases.',
        threshold: 60,
        targetRR: '1:1.0 to 1:2.0',
      },
    ];
  }
}

export const backtestEngine = new BacktestEngine();
export default backtestEngine;
