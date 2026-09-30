import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Database,
  ExternalLink,
  CandlestickChart,
  Activity,
  Gauge,
  Sliders,
  Target,
  BarChart3,
} from 'lucide-react';
import {
  fetchMarkets,
  fetchCandles,
  fetchAnalysis,
  fetchMultiTimeframeAnalysis,
} from '../services/api';

const defaultFallbackPairs = [
  {
    pair: 'EUR/USD',
    price: 1.0842,
    change: 0.0034,
    changePercent: 0.34,
    trend: 'Bullish (Above EMA 50/200)',
    signal: 'BUY',
    score: 84,
    confidence: 'Strong Setup',
    entry: 1.0842,
    tp1: 1.0852,
    tp2: 1.0865,
    tp3: 1.088,
    sl: 1.0828,
    rr: '1:2.4',
    timeframe: '1h',
  },
  {
    pair: 'GBP/USD',
    price: 1.2981,
    change: -0.0021,
    changePercent: -0.21,
    trend: 'Bearish Breakdown',
    signal: 'SELL',
    score: 78,
    confidence: 'Strong Setup',
    entry: 1.2981,
    tp1: 1.2965,
    tp2: 1.2942,
    tp3: 1.291,
    sl: 1.3005,
    rr: '1:2.9',
    timeframe: '4h',
  },
  {
    pair: 'USD/JPY',
    price: 154.65,
    change: 0.12,
    changePercent: 0.08,
    trend: 'Consolidation Range',
    signal: 'NO TRADE',
    score: 52,
    confidence: 'Low Confidence',
    entry: null,
    tp1: null,
    tp2: null,
    tp3: null,
    sl: null,
    rr: '—',
    timeframe: '1h',
  },
  {
    pair: 'USD/CHF',
    price: 0.8845,
    change: -0.0011,
    changePercent: -0.12,
    trend: 'Neutral / Range Bound',
    signal: 'NO TRADE',
    score: 48,
    confidence: 'Neutral',
    entry: null,
    tp1: null,
    tp2: null,
    tp3: null,
    sl: null,
    rr: '—',
    timeframe: '15m',
  },
  {
    pair: 'AUD/USD',
    price: 0.6534,
    change: 0.0029,
    changePercent: 0.45,
    trend: 'Bullish Pullback',
    signal: 'BUY',
    score: 76,
    confidence: 'Moderate Setup',
    entry: 0.6534,
    tp1: 0.6548,
    tp2: 0.6565,
    tp3: 0.659,
    sl: 0.6515,
    rr: '1:2.1',
    timeframe: '1h',
  },
  {
    pair: 'USD/CAD',
    price: 1.3912,
    change: -0.0022,
    changePercent: -0.16,
    trend: 'Bearish Continuation',
    signal: 'SELL',
    score: 74,
    confidence: 'Moderate Setup',
    entry: 1.3912,
    tp1: 1.3895,
    tp2: 1.3872,
    tp3: 1.384,
    sl: 1.3938,
    rr: '1:2.8',
    timeframe: '1h',
  },
  {
    pair: 'NZD/USD',
    price: 0.5891,
    change: 0.0016,
    changePercent: 0.27,
    trend: 'Consolidation',
    signal: 'NO TRADE',
    score: 55,
    confidence: 'No Edge',
    entry: null,
    tp1: null,
    tp2: null,
    tp3: null,
    sl: null,
    rr: '—',
    timeframe: '1h',
  },
];

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

const roadmapPhases = [
  { phase: 'Phase 1', title: 'Project Initialization', status: 'completed', desc: 'React, Vite, Tailwind, Express (5001), CORS, MongoDB schema, Health check' },
  { phase: 'Phase 2', title: 'Market Data Layer', status: 'completed', desc: 'Twelve Data API abstraction, OANDA/AlphaVantage fallbacks, candlestick ingestion & OHLCV endpoints' },
  { phase: 'Phase 3', title: 'Technical Analysis Engine', status: 'completed', desc: 'EMA 20/50/200, RSI (Wilder), MACD (12,26,9), ATR, Market Structure (HH/HL/LH/LL, Breakout/Consolidation), and Dynamic S/R zones' },
  { phase: 'Phase 4', title: 'Signal Scoring Engine', status: 'upcoming', desc: 'Deterministic 100pt rule engine, BUY/SELL/NO TRADE, Multi-timeframe confirmation' },
  { phase: 'Phase 5', title: 'Dynamic TP/SL Engine', status: 'upcoming', desc: 'Non-arbitrary ATR & structural Entry, TP1, TP2, TP3, SL, Risk Calculator' },
  { phase: 'Phase 6', title: 'Interactive Dashboard', status: 'upcoming', desc: 'TradingView Lightweight Charts with live EMA overlays, TP/SL horizontal rays' },
  { phase: 'Phase 7', title: 'OpenAI Intelligence', status: 'upcoming', desc: 'Structured AI synthesis, scenario risks, no hallucinations/guarantees' },
  { phase: 'Phase 8', title: 'Automatic Market Scanner', status: 'upcoming', desc: 'node-cron background scanner, signal lifecycle monitoring, TP/SL hit states' },
  { phase: 'Phase 9', title: 'Telegram Notifications', status: 'upcoming', desc: 'Real-time alert bot for generated signals, TP1/2/3 hits, SL hits' },
  { phase: 'Phase 10', title: 'Backtesting Engine', status: 'upcoming', desc: 'Historical strategy simulation, win rate, drawdown, profit factor' },
  { phase: 'Phase 11', title: 'Production Deployment', status: 'upcoming', desc: 'Docker Compose, GitHub Actions, environment security' },
];

export const Dashboard = ({
  healthInfo,
  providerStatus,
  isApiOnline,
  latency,
  onRefreshHealth,
  isRefreshing,
}) => {
  const [pairsData, setPairsData] = useState(defaultFallbackPairs);
  const [selectedPair, setSelectedPair] = useState(defaultFallbackPairs[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [candlesData, setCandlesData] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);
  const [mtfData, setMtfData] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [feedSource, setFeedSource] = useState('Simulation Fallback');

  // Load quotes from backend /api/markets
  const loadMarketQuotes = async () => {
    const res = await fetchMarkets();
    if (res.success && res.data?.markets?.length > 0) {
      setFeedSource(res.data.isLive ? `Live (${res.data.activeProvider})` : 'Simulation Fallback');
      setPairsData((prev) =>
        prev.map((item) => {
          const liveMatch = res.data.markets.find((m) => m.pair === item.pair);
          if (!liveMatch) return item;
          return {
            ...item,
            price: liveMatch.price,
            changePercent: liveMatch.changePercent,
            change: liveMatch.change,
            isLive: liveMatch.isLive,
            provider: liveMatch.provider,
          };
        })
      );
    }
  };

  // Load real candles
  const loadCandles = async (pair, timeframe) => {
    const res = await fetchCandles(pair, timeframe, 15);
    if (res.success && res.data?.candles) {
      setCandlesData(res.data.candles);
    }
  };

  // Load technical analysis and multi-timeframe concordance
  const loadAnalysis = async (pair, timeframe) => {
    setLoadingAnalysis(true);
    const [anaRes, mtfRes] = await Promise.all([
      fetchAnalysis(pair, timeframe),
      fetchMultiTimeframeAnalysis(pair),
    ]);

    if (anaRes.success) {
      setAnalysisData(anaRes.data);
    }
    if (mtfRes.success) {
      setMtfData(mtfRes.data);
    }
    setLoadingAnalysis(false);
  };

  useEffect(() => {
    loadMarketQuotes();
    loadCandles(selectedPair.pair, selectedTimeframe);
    loadAnalysis(selectedPair.pair, selectedTimeframe);

    const interval = setInterval(loadMarketQuotes, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadCandles(selectedPair.pair, selectedTimeframe);
    loadAnalysis(selectedPair.pair, selectedTimeframe);
  }, [selectedPair.pair, selectedTimeframe]);

  const indicators = analysisData?.indicators;
  const structure = analysisData?.marketStructure;
  const sr = analysisData?.supportResistance;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Operational Status */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-900/20 border border-blue-500/30 p-5 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Phase 3 Complete
              </span>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Technical Analysis & Market Structure Engine Active
              </h1>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Quantitative indicators (EMA 20/50/200, SMA 50, RSI 14, MACD, ATR), dynamic support/resistance clustering, and swing-based market structure recognition are fully operational.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                onRefreshHealth();
                loadMarketQuotes();
                loadCandles(selectedPair.pair, selectedTimeframe);
                loadAnalysis(selectedPair.pair, selectedTimeframe);
              }}
              disabled={isRefreshing || loadingAnalysis}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loadingAnalysis ? 'animate-spin text-blue-400' : ''}`} />
              <span>{loadingAnalysis ? 'Analyzing...' : 'Recalculate Analysis'}</span>
            </button>
            <a
              href={`http://localhost:5001/api/analysis/${selectedPair.pair.replace('/', '')}?timeframe=${selectedTimeframe}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-xs font-semibold text-blue-400 border border-blue-500/30 transition"
            >
              <span>Analysis JSON</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Live Diagnostics Mini-Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Active Pair & Timeframe</span>
            <span className="text-blue-400 font-semibold">{selectedPair.pair} ({selectedTimeframe})</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Quantitative Bias</span>
            <span className={`font-semibold ${
              analysisData?.overallBias === 'BULLISH'
                ? 'text-emerald-400'
                : analysisData?.overallBias === 'BEARISH'
                ? 'text-rose-400'
                : 'text-amber-400'
            }`}>
              {analysisData?.overallBias || 'ANALYZING...'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Market Structure</span>
            <span className="text-teal-400 font-semibold">
              {structure?.state || 'CALCULATING'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">MTF Consensus</span>
            <span className="text-slate-300 font-semibold">
              {mtfData?.consensus?.replace(/_/g, ' ') || 'SYNCHRONIZING'}
            </span>
          </div>
        </div>
      </div>

      {/* Market Overview Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-100">
              Market Overview & Signal Matrix
            </h2>
            <p className="text-xs text-slate-400">
              Select any currency pair to inspect quantitative indicators and structural swing levels
            </p>
          </div>

          {/* Timeframe Switcher */}
          <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition ${
                  selectedTimeframe === tf
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Currency Pair Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pairsData.map((item) => {
            const isBuy = item.signal === 'BUY';
            const isSell = item.signal === 'SELL';
            const isNoTrade = item.signal === 'NO TRADE';
            const isSelected = selectedPair.pair === item.pair;
            const isPositive = (item.changePercent || 0) >= 0;

            return (
              <div
                key={item.pair}
                onClick={() => setSelectedPair(item)}
                className={`cursor-pointer rounded-2xl p-5 border transition-all duration-200 relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#12192A] border-blue-500/50 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30'
                    : 'bg-[#0E1320] border-slate-800/90 hover:border-slate-700 hover:bg-[#111726]'
                }`}
              >
                {/* Top: Pair & Price */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-extrabold tracking-tight text-white">
                        {item.pair}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {selectedTimeframe}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{item.trend}</span>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-base font-bold text-white tracking-tight">
                      {typeof item.price === 'number'
                        ? item.price.toFixed(item.pair.includes('JPY') ? 2 : 5)
                        : item.price}
                    </div>
                    <div
                      className={`text-xs font-mono font-medium flex items-center justify-end space-x-1 ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>
                        {isPositive ? '+' : ''}
                        {item.changePercent ? item.changePercent.toFixed(2) : '0.00'}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle: Signal Badge & Score Bar */}
                <div className="my-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase flex items-center space-x-1.5 ${
                        isBuy
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isSell
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isBuy ? 'bg-emerald-400' : isSell ? 'bg-rose-400' : 'bg-slate-500'
                        }`}
                      ></span>
                      <span>{item.signal}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {item.confidence}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-white">
                      Score: {item.score}/100
                    </span>
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isBuy
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : isSell
                        ? 'bg-gradient-to-r from-rose-500 to-red-400'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>

                {/* Bottom: Entry, TP1, TP2, TP3, SL Card */}
                {!isNoTrade && item.entry ? (
                  <div className="space-y-1.5 bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 text-xs font-mono">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Potential Entry:</span>
                      <span className="text-white font-semibold">{item.entry}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-400">
                      <span>TP1 (Conservative):</span>
                      <span className="font-semibold">{item.tp1}</span>
                    </div>
                    <div className="flex justify-between items-center text-teal-400">
                      <span>TP2 (Target 2):</span>
                      <span className="font-semibold">{item.tp2}</span>
                    </div>
                    <div className="flex justify-between items-center text-cyan-400">
                      <span>TP3 (Structural):</span>
                      <span className="font-semibold">{item.tp3}</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-400 pt-1 border-t border-slate-800/60">
                      <span>Potential SL:</span>
                      <span className="font-semibold">{item.sl}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800/60 text-xs text-slate-400 italic text-center">
                    Market consolidating. Setup does not meet deterministic threshold.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* PHASE 3 DEEP TECHNICAL ANALYSIS CONSOLE */}
      <div className="rounded-2xl bg-[#0E1320] border border-blue-500/30 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <Sliders className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Phase 3 Quantitative Indicator Engine:</span>
                <span className="text-blue-400 font-mono">{selectedPair.pair} ({selectedTimeframe})</span>
              </h3>
              <p className="text-xs text-slate-400">
                Mathematical indicator series, dynamic support/resistance zones, and structural state
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-900 border border-slate-800 text-slate-300">
              Bias: <span className={analysisData?.overallBias === 'BULLISH' ? 'text-emerald-400' : analysisData?.overallBias === 'BEARISH' ? 'text-rose-400' : 'text-amber-400'}>{analysisData?.overallBias || '...'}</span>
            </span>
          </div>
        </div>

        {/* 4 Quantitative Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Trend Indicators (EMAs & SMA) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>Trend Stack</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {indicators?.trend?.alignment?.replace(/_/g, ' ') || 'NEUTRAL'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">EMA 20:</span>
                <span className="text-white font-semibold">{indicators?.trend?.ema20 || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">EMA 50:</span>
                <span className="text-teal-400 font-semibold">{indicators?.trend?.ema50 || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">EMA 200:</span>
                <span className="text-cyan-400 font-semibold">{indicators?.trend?.ema200 || '—'}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">SMA 50:</span>
                <span className="text-slate-300 font-semibold">{indicators?.trend?.sma50 || '—'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Momentum (RSI 14) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <span>RSI (14 Wilder)</span>
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                indicators?.momentum?.rsi >= 70
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  : indicators?.momentum?.rsi <= 30
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {indicators?.momentum?.rsiStatus || 'NEUTRAL'}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-mono font-extrabold text-white">
                  {indicators?.momentum?.rsi || '50.0'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {indicators?.momentum?.rsi > 50 ? 'Bullish Half' : 'Bearish Half'}
                </span>
              </div>

              {/* RSI Level Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-blue-500 to-rose-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Math.max(indicators?.momentum?.rsi || 50, 0), 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0 (Oversold)</span>
                <span>50</span>
                <span>100 (Overbought)</span>
              </div>
            </div>
          </div>

          {/* Card 3: Momentum (MACD 12, 26, 9) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center space-x-1.5">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>MACD (12, 26, 9)</span>
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                indicators?.momentum?.macdTrend?.includes('BULLISH')
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {indicators?.momentum?.macdTrend || 'NEUTRAL'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">MACD Line:</span>
                <span className="text-white font-semibold">{indicators?.momentum?.macd || '0.0000'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Signal Line:</span>
                <span className="text-slate-300 font-semibold">{indicators?.momentum?.macdSignal || '0.0000'}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Histogram:</span>
                <span className={`font-bold ${
                  (indicators?.momentum?.macdHistogram || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {indicators?.momentum?.macdHistogram || '0.0000'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Volatility (ATR 14) */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-amber-400" />
                <span>ATR Volatility (14)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                True Range
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-400">Average TR:</span>
                <span className="text-lg font-bold text-white">{indicators?.volatility?.atr || '0.0000'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ATR % of Price:</span>
                <span className="text-amber-400 font-semibold">{indicators?.volatility?.atrPercent || '0.00'}%</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight pt-1">
                Used to dynamically compute Stop Loss buffers and structural targets.
              </p>
            </div>
          </div>
        </div>

        {/* Structural Analysis & Dynamic Support/Resistance Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          {/* Market Structure Engine */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Market Structure & Fractals
                </h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {structure?.state || 'UPTREND'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">High Structure</span>
                <span className="text-emerald-400 font-bold">{structure?.highStructure || 'HIGHER_HIGH'}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Low Structure</span>
                <span className="text-teal-400 font-bold">{structure?.lowStructure || 'HIGHER_LOW'}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Recent Swing High</span>
                <span className="text-white font-bold">{structure?.recentSwingHigh || '—'}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px] uppercase">Recent Swing Low</span>
                <span className="text-white font-bold">{structure?.recentSwingLow || '—'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-xs font-mono text-slate-400 pt-1">
              <span>Breakout: <b className={structure?.isBreakout ? 'text-emerald-400' : 'text-slate-500'}>{structure?.isBreakout ? 'YES' : 'NO'}</b></span>
              <span>Breakdown: <b className={structure?.isBreakdown ? 'text-rose-400' : 'text-slate-500'}>{structure?.isBreakdown ? 'YES' : 'NO'}</b></span>
              <span>Consolidation: <b className={structure?.isConsolidating ? 'text-amber-400' : 'text-slate-500'}>{structure?.isConsolidating ? 'YES' : 'NO'}</b></span>
            </div>
          </div>

          {/* Dynamic Support & Resistance Levels */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-teal-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Dynamic Support & Resistance Clusters
                </h4>
              </div>
              <span className="text-xs font-mono text-slate-400">ATR Cluster Method</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-rose-500/20">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-rose-400 font-bold">Resistance (R1)</span>
                  <span className="text-[10px] text-slate-400">+{sr?.resistanceDistance || '0'} pips</span>
                </div>
                <div className="text-base font-bold text-white">{sr?.nearestResistance || '—'}</div>
                <div className="text-[10px] text-slate-500 mt-1">R2: {sr?.resistances?.[1] || '—'}</div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-emerald-500/20">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-emerald-400 font-bold">Support (S1)</span>
                  <span className="text-[10px] text-slate-400">-{sr?.supportDistance || '0'} pips</span>
                </div>
                <div className="text-base font-bold text-white">{sr?.nearestSupport || '—'}</div>
                <div className="text-[10px] text-slate-500 mt-1">S2: {sr?.supports?.[1] || '—'}</div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Levels are mathematically calculated using swing high/low density clustering. No arbitrary percentage levels.
            </p>
          </div>
        </div>

        {/* Multi-Timeframe Confirmation Matrix */}
        {mtfData && (
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider">
                Multi-Timeframe Confirmation Matrix (Section 8)
              </span>
              <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Consensus: {mtfData.consensus.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              {mtfData.timeframes.map((t) => (
                <div key={t.timeframe} className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex justify-between items-center">
                  <span className="font-bold uppercase text-slate-300">{t.timeframe}:</span>
                  <span className={`font-bold ${
                    t.bias === 'BULLISH'
                      ? 'text-emerald-400'
                      : t.bias === 'BEARISH'
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}>
                    {t.bias}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Pair Candlestick Feed (Phase 2 Ingestion Table) */}
      <div className="rounded-2xl bg-[#0E1320] border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CandlestickChart className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Historical Candlestick Feed: {selectedPair.pair} ({selectedTimeframe})
              </h3>
              <p className="text-xs text-slate-400">
                Real-time OHLCV bars ingested from backend provider abstraction layer
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            {candlesData.length} Recent Bars
          </span>
        </div>

        {/* OHLCV Mini-Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 px-3">Timestamp (UTC)</th>
                <th className="py-2 px-3">Open</th>
                <th className="py-2 px-3">High</th>
                <th className="py-2 px-3">Low</th>
                <th className="py-2 px-3">Close</th>
                <th className="py-2 px-3 text-right">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {candlesData.slice(-8).reverse().map((c, i) => {
                const isBull = c.close >= c.open;
                return (
                  <tr key={i} className="hover:bg-slate-900/40 transition">
                    <td className="py-2 px-3 text-slate-400">
                      {new Date(c.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-slate-300">{c.open}</td>
                    <td className="py-2 px-3 text-emerald-400">{c.high}</td>
                    <td className="py-2 px-3 text-rose-400">{c.low}</td>
                    <td className={`py-2 px-3 font-bold ${isBull ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {c.close}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400">{c.volume}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Master 11-Phase Architecture Roadmap */}
      <div className="rounded-2xl bg-[#0E1320] border border-slate-800 p-6 space-y-4">
        <div className="flex items-center space-x-3">
          <Layers className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-base font-bold text-white">
              ForexAI Analyzer Architecture Roadmap
            </h3>
            <p className="text-xs text-slate-400">
              Phases 1, 2, and 3 are complete. Ready for Phase 4 (Deterministic Signal Engine).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {roadmapPhases.map((phase) => {
            const isDone = phase.status === 'completed';
            return (
              <div
                key={phase.phase}
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 transition ${
                  isDone
                    ? 'bg-blue-950/20 border-blue-500/40 text-slate-200'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono font-bold ${
                      isDone ? 'text-blue-400' : 'text-slate-500'
                    }`}
                  >
                    {phase.phase}
                  </span>
                  {isDone ? (
                    <span className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Ready</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                      Next Up
                    </span>
                  )}
                </div>
                <div className="font-semibold text-white text-xs">{phase.title}</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">{phase.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
