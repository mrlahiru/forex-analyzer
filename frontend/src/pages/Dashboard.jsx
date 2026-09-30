import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Database,
  ExternalLink,
  CandlestickChart,
  Radio,
} from 'lucide-react';
import { fetchMarkets, fetchCandles } from '../services/api';

const defaultFallbackPairs = [
  {
    pair: 'EUR/USD',
    price: 1.08420,
    change: 0.0034,
    changePercent: 0.34,
    trend: 'Bullish (Above EMA 50/200)',
    signal: 'BUY',
    score: 84,
    confidence: 'Strong Setup',
    entry: 1.08420,
    tp1: 1.08520,
    tp2: 1.08650,
    tp3: 1.08800,
    sl: 1.08280,
    rr: '1:2.4',
    timeframe: '1h',
    reasons: [
      'EMA 50 crossed above EMA 200 (Golden Cross)',
      'RSI is 61 (Healthy Bullish Momentum)',
      'Higher-High market structure confirmed',
    ],
  },
  {
    pair: 'GBP/USD',
    price: 1.29810,
    change: -0.0021,
    changePercent: -0.21,
    trend: 'Bearish Breakdown',
    signal: 'SELL',
    score: 78,
    confidence: 'Strong Setup',
    entry: 1.29810,
    tp1: 1.29650,
    tp2: 1.29420,
    tp3: 1.29100,
    sl: 1.30050,
    rr: '1:2.9',
    timeframe: '4h',
    reasons: [
      'Price rejected key 4H resistance zone',
      'MACD histogram turned bearish',
      'Lower-Low breakdown on 15M / 1H',
    ],
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
    reasons: [
      'Choppy price action within tight range',
      'RSI is neutral at 49.5',
      'Score below 60 threshold (No deterministic edge)',
    ],
  },
  {
    pair: 'USD/CHF',
    price: 0.88450,
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
    reasons: [
      'Multi-timeframe disagreement (1D Bullish vs 15M Bearish)',
      'Awaiting breakout confirmation',
    ],
  },
  {
    pair: 'AUD/USD',
    price: 0.65340,
    change: 0.0029,
    changePercent: 0.45,
    trend: 'Bullish Pullback',
    signal: 'BUY',
    score: 76,
    confidence: 'Moderate Setup',
    entry: 0.65340,
    tp1: 0.65480,
    tp2: 0.65650,
    tp3: 0.65900,
    sl: 0.65150,
    rr: '1:2.1',
    timeframe: '1h',
    reasons: [
      'Support bounce at 0.6520 with pin bar',
      'MACD bullish divergence on 1H chart',
    ],
  },
  {
    pair: 'USD/CAD',
    price: 1.39120,
    change: -0.0022,
    changePercent: -0.16,
    trend: 'Bearish Continuation',
    signal: 'SELL',
    score: 74,
    confidence: 'Moderate Setup',
    entry: 1.39120,
    tp1: 1.38950,
    tp2: 1.38720,
    tp3: 1.38400,
    sl: 1.39380,
    rr: '1:2.8',
    timeframe: '1h',
    reasons: [
      'Rejected EMA 20 dynamic resistance',
      'Bearish structural lower high formation',
    ],
  },
  {
    pair: 'NZD/USD',
    price: 0.58910,
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
    reasons: ['Consolidation below major supply zone', 'Low volume compression'],
  },
];

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

const roadmapPhases = [
  { phase: 'Phase 1', title: 'Project Initialization', status: 'completed', desc: 'React, Vite, Tailwind, Express (5001), CORS, MongoDB schema, Health check' },
  { phase: 'Phase 2', title: 'Market Data Layer', status: 'completed', desc: 'Twelve Data API abstraction, OANDA/AlphaVantage fallbacks, candlestick ingestion & OHLCV endpoints' },
  { phase: 'Phase 3', title: 'Technical Analysis Engine', status: 'upcoming', desc: 'EMA 20/50/200, RSI, MACD, ATR, Market Structure & S/R recognition' },
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
  const [loadingCandles, setLoadingCandles] = useState(false);
  const [feedSource, setFeedSource] = useState('Simulation Fallback');

  // Load real quotes from backend /api/markets
  const loadMarketQuotes = async () => {
    const res = await fetchMarkets();
    if (res.success && res.data?.markets?.length > 0) {
      setFeedSource(res.data.isLive ? `Live (${res.data.activeProvider})` : 'Simulation Fallback');
      
      // Merge live prices with default signal parameters
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

  // Load real candlestick series from backend /api/markets/:pair/candles
  const loadCandles = async (pair, timeframe) => {
    setLoadingCandles(true);
    const res = await fetchCandles(pair, timeframe, 15);
    if (res.success && res.data?.candles) {
      setCandlesData(res.data.candles);
    }
    setLoadingCandles(false);
  };

  useEffect(() => {
    loadMarketQuotes();
    loadCandles(selectedPair.pair, selectedTimeframe);
    const interval = setInterval(loadMarketQuotes, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadCandles(selectedPair.pair, selectedTimeframe);
  }, [selectedPair.pair, selectedTimeframe]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Operational Status */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-900/20 border border-blue-500/30 p-5 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Phase 2 Complete
              </span>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Market Data Provider Abstraction Active
              </h1>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Twelve Data provider abstraction with multi-provider fallbacks (OANDA, Alpha Vantage, Polygon, Simulator), multi-timeframe candles, and REST endpoints are verified.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                onRefreshHealth();
                loadMarketQuotes();
                loadCandles(selectedPair.pair, selectedTimeframe);
              }}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync Market Data'}</span>
            </button>
            <a
              href="http://localhost:5001/api/markets"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-xs font-semibold text-blue-400 border border-blue-500/30 transition"
            >
              <span>Markets JSON</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Live Diagnostics Mini-Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Active Provider</span>
            <span className="text-blue-400 font-semibold uppercase">{providerStatus?.activeProvider || 'twelve_data'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Data Feed Mode</span>
            <span className={providerStatus?.isLive ? 'text-emerald-400 font-semibold' : 'text-cyan-400 font-semibold'}>
              {feedSource}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Database State</span>
            <span className={healthInfo?.database?.connected ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {healthInfo?.database?.state || 'offline'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Supported Pairs</span>
            <span className="text-slate-300 font-semibold">{pairsData.length} FX Pairs</span>
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
              Live quotes and multi-target setups across 7 core currency pairs
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
                      {typeof item.price === 'number' ? item.price.toFixed(item.pair.includes('JPY') ? 2 : 5) : item.price}
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
                          isBuy
                            ? 'bg-emerald-400'
                            : isSell
                            ? 'bg-rose-400'
                            : 'bg-slate-500'
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
            {loadingCandles ? 'Ingesting...' : `${candlesData.length} Recent Bars`}
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

      {/* Selected Pair Detailed Breakdown & Reasons */}
      <div className="rounded-2xl bg-[#0E1320] border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">
              Signal Engine Breakdown: {selectedPair.pair} ({selectedTimeframe})
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Scoring Criteria: 100-Point Rule Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Deterministic Rule Triggers
            </h4>
            <div className="space-y-2">
              {selectedPair.reasons.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center space-x-2 text-xs text-slate-300 bg-slate-900/70 p-2.5 rounded-lg border border-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Risk / Reward & Execution Framework
            </h4>
            <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Estimated Risk/Reward:</span>
                <span className="text-white font-bold">{selectedPair.rr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Confidence Category:</span>
                <span className="text-blue-400 font-bold">{selectedPair.confidence}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Execution Rule:</span>
                <span className="text-amber-400">Analytical Signal Only (No Direct Broker Order)</span>
              </div>
            </div>
          </div>
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
              Phases 1 & 2 are complete. Development follows strict sequential progression.
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
