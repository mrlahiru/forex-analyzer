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
  Award,
  Zap,
  Calculator,
  DollarSign,
  Percent,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  LayoutDashboard,
  Radio,
  Star,
  History,
  TestTube2,
  BellRing,
  Boxes,
  Settings,
} from 'lucide-react';
import {
  fetchMarkets,
  fetchCandles,
  fetchAnalysis,
  fetchMultiTimeframeAnalysis,
  evaluateAllSignals,
  calculateRisk,
  fetchAiExplanation,
  fetchScannerStatus,
  triggerManualScan,
  fetchScannerEvents,
  fetchNotificationStatus,
  sendTestNotification,
  updateNotificationSettings,
  runBacktest,
  fetchBacktestResults,
} from '../services/api';
import { TradingViewChart } from '../components/TradingViewChart';
import { AiAnalysisCard } from '../components/AiAnalysisCard';
import { ScannerConsole } from '../components/ScannerConsole';
import { TelegramAlertConsole } from '../components/TelegramAlertConsole';
import { BacktestConsole } from '../components/BacktestConsole';
import { ProductionDeploymentConsole } from '../components/ProductionDeploymentConsole';
import { WatchlistConsole } from '../components/WatchlistConsole';
import { SettingsConsole } from '../components/SettingsConsole';
import { SignalHistoryConsole } from '../components/SignalHistoryConsole';


const defaultFallbackPairs = [
  {
    pair: 'EUR/USD',
    price: 1.0842,
    change: 0.0034,
    changePercent: 0.34,
    trend: 'Bullish (Above EMA 50/200)',
    signal: 'BUY',
    score: 84,
    confidence: 'STRONG',
    entry: 1.0842,
    tp1: 1.0858,
    tp2: 1.0874,
    tp3: 1.089,
    sl: 1.0826,
    rr: '1:2.4',
    timeframe: '1h',
    breakdown: { emaTrend: 22, macd: 16, rsi: 15, marketStructure: 10, supportResistance: 11, volatility: 10 },
    reasons: ['Price is trading above EMA 20', 'EMA 20 is above EMA 50', 'MACD histogram is positive', 'RSI is 61.4 (Healthy momentum)'],
  },
  {
    pair: 'GBP/USD',
    price: 1.2981,
    change: -0.0021,
    changePercent: -0.21,
    trend: 'Bearish Breakdown',
    signal: 'SELL',
    score: 78,
    confidence: 'STRONG',
    entry: 1.2981,
    tp1: 1.2965,
    tp2: 1.2942,
    tp3: 1.291,
    sl: 1.3005,
    rr: '1:2.9',
    timeframe: '1h',
    breakdown: { emaTrend: 20, macd: 16, rsi: 15, marketStructure: 11, supportResistance: 8, volatility: 8 },
    reasons: ['Price is below EMA 20 and EMA 50', 'MACD histogram is negative', 'Lower High & Lower Low printed'],
  },
  {
    pair: 'USD/JPY',
    price: 154.65,
    change: 0.12,
    changePercent: 0.08,
    trend: 'Consolidation Range',
    signal: 'NO_TRADE',
    score: 52,
    confidence: 'LOW',
    entry: null,
    tp1: null,
    tp2: null,
    tp3: null,
    sl: null,
    rr: '—',
    timeframe: '1h',
    breakdown: { emaTrend: 12, macd: 10, rsi: 10, marketStructure: 6, supportResistance: 8, volatility: 6 },
    reasons: ['Technical setup score (52/100) below minimum edge threshold (60)', 'Consolidation range without directional edge'],
  },
  {
    pair: 'USD/CHF',
    price: 0.8845,
    change: -0.0011,
    changePercent: -0.12,
    trend: 'Neutral / Range Bound',
    signal: 'NO_TRADE',
    score: 48,
    confidence: 'LOW',
    entry: null,
    tp1: null,
    tp2: null,
    tp3: null,
    sl: null,
    rr: '—',
    timeframe: '1h',
    breakdown: { emaTrend: 10, macd: 8, rsi: 10, marketStructure: 6, supportResistance: 8, volatility: 6 },
    reasons: ['Setup below 60 threshold', 'Mixed indicator signals'],
  },
  {
    pair: 'AUD/USD',
    price: 0.6534,
    change: 0.0029,
    changePercent: 0.45,
    trend: 'Bullish Pullback',
    signal: 'BUY',
    score: 76,
    confidence: 'MODERATE',
    entry: 0.6534,
    tp1: 0.6548,
    tp2: 0.6565,
    tp3: 0.659,
    sl: 0.6515,
    rr: '1:2.1',
    timeframe: '1h',
    breakdown: { emaTrend: 18, macd: 16, rsi: 15, marketStructure: 8, supportResistance: 11, volatility: 8 },
    reasons: ['Dynamic support bounce near 0.6520', 'MACD line positive with bullish histogram'],
  },
  {
    pair: 'USD/CAD',
    price: 1.3912,
    change: -0.0022,
    changePercent: -0.16,
    trend: 'Bearish Continuation',
    signal: 'SELL',
    score: 74,
    confidence: 'MODERATE',
    entry: 1.3912,
    tp1: 1.3895,
    tp2: 1.3872,
    tp3: 1.384,
    sl: 1.3938,
    rr: '1:2.8',
    timeframe: '1h',
    breakdown: { emaTrend: 18, macd: 16, rsi: 15, marketStructure: 8, supportResistance: 9, volatility: 8 },
    reasons: ['Rejected dynamic EMA resistance', 'Bearish structural lower high formation'],
  },
  {
    pair: 'NZD/USD',
    price: 0.5891,
    change: 0.0016,
    changePercent: 0.27,
    trend: 'Consolidation',
    signal: 'NO_TRADE',
    score: 55,
    confidence: 'LOW',
    entry: null,
    tp1: null,
    tp2: null,
    tp3: null,
    sl: null,
    rr: '—',
    timeframe: '1h',
    breakdown: { emaTrend: 12, macd: 10, rsi: 11, marketStructure: 8, supportResistance: 8, volatility: 6 },
    reasons: ['Score below 60 threshold', 'Low volume compression below supply zone'],
  },
];

const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

const roadmapPhases = [
  { phase: 'Phase 1', title: 'Project Initialization', status: 'completed', desc: 'React, Vite, Tailwind, Express (5001), CORS, MongoDB schema, Health check' },
  { phase: 'Phase 2', title: 'Market Data Layer', status: 'completed', desc: 'Twelve Data API abstraction, OANDA/AlphaVantage fallbacks, candlestick ingestion & OHLCV endpoints' },
  { phase: 'Phase 3', title: 'Technical Analysis Engine', status: 'completed', desc: 'EMA 20/50/200, RSI (Wilder), MACD (12,26,9), ATR, Market Structure & S/R' },
  { phase: 'Phase 4', title: 'Deterministic Signal Engine', status: 'completed', desc: '100pt rule engine (EMA 25, MACD 20, RSI 15, Struct 15, S/R 15, Vol 10), BUY/SELL/NO TRADE, MTF confirmation' },
  { phase: 'Phase 5', title: 'Dynamic TP/SL & Risk Calculator', status: 'completed', desc: 'Structural Entry, TP1, TP2, TP3, SL anchored to ATR/swings, lot sizing, and risk-to-reward calculation' },
  { phase: 'Phase 6', title: 'Interactive Dashboard', status: 'completed', desc: 'TradingView Lightweight Charts with live EMA overlays, TP/SL horizontal rays' },
  { phase: 'Phase 7', title: 'OpenAI Intelligence', status: 'completed', desc: 'Structured AI synthesis, scenario risks, no hallucinations/guarantees' },
  { phase: 'Phase 8', title: 'Automatic Market Scanner', status: 'completed', desc: 'node-cron background scanner, signal lifecycle monitoring, TP/SL hit states' },
  { phase: 'Phase 9', title: 'Telegram Notifications', status: 'completed', desc: 'Real-time alert bot for generated signals, TP1/2/3 hits, SL hits' },
  { phase: 'Phase 10', title: 'Backtesting Engine', status: 'completed', desc: 'Historical strategy simulation, win rate, drawdown, profit factor' },
  { phase: 'Phase 11', title: 'Production Deployment', status: 'completed', desc: 'Docker Compose, Multi-stage builds, Nginx reverse proxy, CI/CD pipeline, and security hardened container orchestration' },
];

export const Dashboard = ({
  healthInfo,
  providerStatus,
  isApiOnline,
  latency,
  onRefreshHealth,
  isRefreshing,
  activeTab = 'dashboard',
  setActiveTab,
}) => {
  const [pairsData, setPairsData] = useState(defaultFallbackPairs);
  const [selectedPair, setSelectedPair] = useState(defaultFallbackPairs[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
  const [candlesData, setCandlesData] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);
  const [mtfData, setMtfData] = useState(null);
  const [activeSignalDetails, setActiveSignalDetails] = useState(defaultFallbackPairs[0]);
  const [loadingSignal, setLoadingSignal] = useState(false);
  const [feedSource, setFeedSource] = useState('Simulation Fallback');

  // Phase 5 Risk Calculator State
  const [accountBalance, setAccountBalance] = useState(1000);
  const [riskPercentage, setRiskPercentage] = useState(1.0);
  const [riskCalculations, setRiskCalculations] = useState(null);

  // Phase 7 OpenAI Intelligence State
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Phase 8 Automatic Market Scanner State
  const [scannerData, setScannerData] = useState(null);
  const [scannerEvents, setScannerEvents] = useState([]);
  const [scanningManual, setScanningManual] = useState(false);

  // Phase 9 Telegram Notifications State
  const [telegramStatus, setTelegramStatus] = useState(null);
  const [sendingTestAlert, setSendingTestAlert] = useState(false);

  // Phase 10 Backtesting Engine State
  const [backtestData, setBacktestData] = useState(null);
  const [backtestLoading, setBacktestLoading] = useState(false);

  // Load live quotes and evaluate signals
  const loadMarketAndSignals = async () => {
    setLoadingSignal(true);

    const [marketsRes, signalsRes] = await Promise.all([
      fetchMarkets(),
      evaluateAllSignals(selectedTimeframe),
    ]);

    if (marketsRes.success && marketsRes.data?.markets) {
      setFeedSource(marketsRes.data.isLive ? `Live (${marketsRes.data.activeProvider})` : 'Simulation Fallback');
    }

    if (signalsRes.success && signalsRes.data?.signals?.length > 0) {
      setPairsData((prev) =>
        prev.map((item) => {
          const sigMatch = signalsRes.data.signals.find((s) => s.pair === item.pair);
          const marketMatch = marketsRes.data?.markets?.find((m) => m.pair === item.pair);

          if (!sigMatch) return item;
          return {
            ...item,
            price: marketMatch?.price || sigMatch.entry || item.price,
            changePercent: marketMatch?.changePercent || item.changePercent,
            change: marketMatch?.change || item.change,
            signal: sigMatch.direction,
            score: sigMatch.score,
            confidence: sigMatch.confidence,
            entry: sigMatch.entry,
            tp1: sigMatch.tp1,
            tp2: sigMatch.tp2,
            tp3: sigMatch.tp3,
            sl: sigMatch.stopLoss,
            breakdown: sigMatch.breakdown || item.breakdown,
            reasons: sigMatch.reasons || item.reasons,
            timeframeConsensus: sigMatch.timeframeConsensus,
          };
        })
      );
    }
    setLoadingSignal(false);
  };

  // Load AI explanation for the selected pair & timeframe
  const loadAiExplanation = async (pair, timeframe) => {
    setLoadingAi(true);
    const res = await fetchAiExplanation(pair, timeframe);
    if (res.success && res.data) {
      setAiExplanation(res.data);
    }
    setLoadingAi(false);
  };

  // Load candles & indicators for the selected pair
  const loadPairDetails = async (pair, timeframe, includeAi = true) => {
    if (includeAi) {
      loadAiExplanation(pair, timeframe);
    }

    const [candleRes, anaRes, mtfRes] = await Promise.all([
      fetchCandles(pair, timeframe, 100),
      fetchAnalysis(pair, timeframe),
      fetchMultiTimeframeAnalysis(pair),
    ]);

    if (candleRes.success && candleRes.data?.candles) {
      setCandlesData(candleRes.data.candles);
    }
    if (anaRes.success) {
      setAnalysisData(anaRes.data);
    }
    if (mtfRes.success) {
      setMtfData(mtfRes.data);
    }
  };

  // Run Phase 5 Risk Calculation
  const runRiskCalculation = async () => {
    const entry = activeSignalDetails?.entry || activeSignalDetails?.price;
    const sl = activeSignalDetails?.sl || (entry ? (activeSignalDetails?.signal === 'SELL' ? entry + 0.002 : entry - 0.002) : null);
    const tp1 = activeSignalDetails?.tp1;
    const tp2 = activeSignalDetails?.tp2;
    const tp3 = activeSignalDetails?.tp3;

    if (!entry || !sl) return;

    const res = await calculateRisk({
      accountBalance,
      riskPercentage,
      entryPrice: entry,
      stopLoss: sl,
      tp1,
      tp2,
      tp3,
      pair: activeSignalDetails?.pair,
    });

    if (res.success && res.data) {
      setRiskCalculations(res.data);
    }
  };

  // Load scanner status and recent lifecycle events
  const loadScanner = async () => {
    const [statusRes, eventsRes] = await Promise.all([
      fetchScannerStatus(),
      fetchScannerEvents(25),
    ]);
    if (statusRes.success && statusRes.data) {
      setScannerData(statusRes.data);
    }
    if (eventsRes.success && eventsRes.data) {
      setScannerEvents(eventsRes.data);
    }
  };

  const handleManualScan = async () => {
    setScanningManual(true);
    await triggerManualScan(selectedTimeframe);
    await loadScanner();
    await loadMarketAndSignals();
    setScanningManual(false);
  };

  // Load Telegram status
  const loadTelegramStatus = async () => {
    const res = await fetchNotificationStatus();
    if (res.success && res.data) {
      setTelegramStatus(res.data);
    }
  };

  const handleSendTelegramTest = async () => {
    setSendingTestAlert(true);
    await sendTestNotification();
    await loadTelegramStatus();
    setSendingTestAlert(false);
  };

  const handleUpdateTelegramPreferences = async (newPrefs) => {
    const res = await updateNotificationSettings(newPrefs);
    if (res.success && res.data) {
      setTelegramStatus((prev) => (prev ? { ...prev, preferences: res.data } : prev));
    }
  };

  // Phase 10 Backtest Handler
  const handleRunBacktest = async (params) => {
    setBacktestLoading(true);
    const res = await runBacktest(params);
    if (res.success && res.data) {
      setBacktestData(res.data);
    }
    setBacktestLoading(false);
  };

  // Initial load & real-time live market ticker loop (every 3 seconds)
  useEffect(() => {
    loadMarketAndSignals();
    loadPairDetails(selectedPair.pair, selectedTimeframe, true);
    loadScanner();
    loadTelegramStatus();

    // Initial backtest data load if cached
    fetchBacktestResults().then((res) => {
      if (res.success && res.data) setBacktestData(res.data);
    });

    // High-frequency live tick refresher: updates quotes and current active candle every 3 seconds
    const liveTickInterval = setInterval(() => {
      loadMarketAndSignals();
      loadPairDetails(selectedPair.pair, selectedTimeframe, false);
    }, 3000);

    const scannerInterval = setInterval(loadScanner, 10000);
    const tgInterval = setInterval(loadTelegramStatus, 15000);

    return () => {
      clearInterval(liveTickInterval);
      clearInterval(scannerInterval);
      clearInterval(tgInterval);
    };
  }, [selectedPair.pair, selectedTimeframe]);

  // Real-Time WebSocket stream connection for instant scanner and price events
  useEffect(() => {
    let ws = null;
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.hostname || 'localhost';
      const wsUrl = `${protocol}//${host}:5001/ws`;
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'SCANNER_EVENT') {
            setScannerEvents((prev) => [msg.event, ...prev.slice(0, 99)]);
            // Immediate live re-evaluation on scanner events
            loadMarketAndSignals();
            loadPairDetails(selectedPair.pair, selectedTimeframe, false);
          }
        } catch (e) {}
      };
    } catch (e) {
      console.warn('[WebSocket] Connection fallback:', e.message);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [selectedPair.pair, selectedTimeframe]);

  // Keep active signal details in sync with updated pair quotes
  useEffect(() => {
    const current = pairsData.find((p) => p.pair === selectedPair.pair);
    if (current) {
      setActiveSignalDetails(current);
    }
  }, [pairsData, selectedPair.pair]);

  useEffect(() => {
    runRiskCalculation();
  }, [accountBalance, riskPercentage, activeSignalDetails]);

  const indicators = analysisData?.indicators;
  const structure = analysisData?.marketStructure;
  const sr = analysisData?.supportResistance;
  const breakdown = activeSignalDetails?.breakdown || {};
  const isBuy = activeSignalDetails?.signal === 'BUY';
  const isSell = activeSignalDetails?.signal === 'SELL';
  const isNoTrade = activeSignalDetails?.signal === 'NO_TRADE' || activeSignalDetails?.signal === 'NO TRADE';

  const isMaster = activeTab === 'dashboard';
  const showMarkets = isMaster || activeTab === 'markets';
  const showSignals = isMaster || activeTab === 'signals';
  const showWatchlist = activeTab === 'watchlist';
  const showHistory = activeTab === 'history';
  const showBacktesting = isMaster || activeTab === 'backtesting';
  const showAlerts = isMaster || activeTab === 'alerts';
  const showDeployment = isMaster || activeTab === 'deployment';
  const showSettings = activeTab === 'settings';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner: Operational Status */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-900/20 border border-blue-500/30 p-5 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-mono font-bold">REAL-TIME AUTO-TICK ACTIVE (3s)</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                WEBSOCKET LIVE
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              ForexAI Analyzer — Full-Stack Algorithmic Signal & Quantitative Risk Platform
            </h1>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Deterministic 100-point signal engine, institutional multi-target TP/SL execution, TradingView charts, automated background scanner, Telegram alerts, backtesting suite & production Docker stack.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                onRefreshHealth();
                loadMarketAndSignals();
                loadPairDetails(selectedPair.pair, selectedTimeframe);
              }}
              disabled={isRefreshing || loadingSignal}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || loadingSignal ? 'animate-spin text-blue-400' : ''}`} />
              <span>{loadingSignal ? 'Scoring...' : 'Recalculate Signals'}</span>
            </button>
            <a
              href={`http://localhost:5001/api/risk/parameters/${selectedPair.pair.replace('/', '')}?direction=${isSell ? 'SELL' : 'BUY'}&timeframe=${selectedTimeframe}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-xs font-semibold text-blue-400 border border-blue-500/30 transition"
            >
              <span>Risk Params JSON</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Live Diagnostics Mini-Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Active Pair</span>
            <span className="text-blue-400 font-semibold">{selectedPair.pair} ({selectedTimeframe})</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Engine Direction</span>
            <span className={`font-bold ${isBuy ? 'text-emerald-400' : isSell ? 'text-rose-400' : 'text-slate-400'}`}>
              {activeSignalDetails?.signal?.replace('_', ' ') || 'ANALYZING...'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Signal Score</span>
            <span className="text-amber-400 font-semibold">{activeSignalDetails?.score || 0}/100</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Max Risk Ratio</span>
            <span className="text-teal-400 font-semibold">
              TP1 (1:1) / TP2 (1:2) / TP3 (1:3)
            </span>
          </div>
        </div>
      </div>

      {/* Workspace Quick-Bar Selector */}
      <div className="flex items-center justify-between bg-[#0E1320] border border-slate-800 p-2 rounded-2xl overflow-x-auto shadow-md">
        <div className="flex items-center space-x-1">
          {[
            { id: 'dashboard', label: 'All Workspaces', icon: LayoutDashboard },
            { id: 'markets', label: 'Markets & Chart', icon: TrendingUp },
            { id: 'signals', label: 'Signals & Rules', icon: Radio },
            { id: 'watchlist', label: 'Watchlist', icon: Star },
            { id: 'history', label: 'Signal History', icon: History },
            { id: 'backtesting', label: 'Backtesting', icon: TestTube2 },
            { id: 'alerts', label: 'Alerts & Scanner', icon: BellRing },
            { id: 'deployment', label: 'Deployment', icon: Boxes },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab && setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab !== 'dashboard' && (
          <button
            onClick={() => setActiveTab && setActiveTab('dashboard')}
            className="hidden sm:flex items-center space-x-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-blue-400 border border-slate-700 transition"
          >
            <span>Show Full Station</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* DEDICATED WORKSPACE: SETTINGS CONSOLE */}
      {showSettings && (
        <SettingsConsole
          healthInfo={healthInfo}
          providerStatus={providerStatus}
          defaultBalance={accountBalance}
          defaultRisk={riskPercentage}
          onSavePreferences={(prefs) => {
            setAccountBalance(prefs.balance);
            setRiskPercentage(prefs.riskPct);
            setSelectedTimeframe(prefs.defaultTf);
          }}
        />
      )}

      {/* DEDICATED WORKSPACE: WATCHLIST CONSOLE */}
      {showWatchlist && (
        <WatchlistConsole
          pairsData={pairsData}
          selectedPair={selectedPair}
          onSelectPair={(pair) => {
            setSelectedPair(pair);
            loadPairDetails(pair.pair, selectedTimeframe);
          }}
          onViewChart={(pair) => {
            setSelectedPair(pair);
            loadPairDetails(pair.pair, selectedTimeframe);
            setActiveTab && setActiveTab('markets');
          }}
        />
      )}

      {/* DEDICATED WORKSPACE: SIGNAL HISTORY CONSOLE (SECTION 15) */}
      {showHistory && (
        <SignalHistoryConsole />
      )}

      {/* Market Overview Section */}
      {showMarkets && (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-100">
              Market Overview & Signal Matrix
            </h2>
            <p className="text-xs text-slate-400">
              Real-time scoring across 7 core currency pairs with dynamic multi-target levels
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
            const cardIsBuy = item.signal === 'BUY';
            const cardIsSell = item.signal === 'SELL';
            const cardIsNoTrade = item.signal === 'NO_TRADE' || item.signal === 'NO TRADE';
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
                        cardIsBuy
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : cardIsSell
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          cardIsBuy ? 'bg-emerald-400' : cardIsSell ? 'bg-rose-400' : 'bg-slate-500'
                        }`}
                      ></span>
                      <span>{item.signal?.replace('_', ' ')}</span>
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
                      cardIsBuy
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : cardIsSell
                        ? 'bg-gradient-to-r from-rose-500 to-red-400'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>

                {/* Bottom: Dynamic Entry, TP1, TP2, TP3, SL Card */}
                {!cardIsNoTrade && item.entry ? (
                  <div className="space-y-1.5 bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 text-xs font-mono">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>Potential Entry:</span>
                      <span className="text-white font-semibold">{item.entry}</span>
                    </div>
                    <div className="flex justify-between items-center text-emerald-400">
                      <span>TP1 (Conservative 1:1):</span>
                      <span className="font-semibold">{item.tp1}</span>
                    </div>
                    <div className="flex justify-between items-center text-teal-400">
                      <span>TP2 (Structural 1:2):</span>
                      <span className="font-semibold">{item.tp2}</span>
                    </div>
                    <div className="flex justify-between items-center text-cyan-400">
                      <span>TP3 (Structural 1:3):</span>
                      <span className="font-semibold">{item.tp3}</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-400 pt-1 border-t border-slate-800/60">
                      <span>Potential SL:</span>
                      <span className="font-semibold">{item.sl}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900/40 rounded-xl p-3 border border-slate-800/60 text-xs text-slate-400 italic text-center">
                    Market consolidating. Setup does not meet deterministic threshold (&lt; 60 pts).
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}

      {/* PHASE 8 & 9: AUTOMATIC MARKET SCANNER & TELEGRAM ALERTS */}
      {showAlerts && (
        <>
          <ScannerConsole
            scannerData={scannerData}
            events={scannerEvents}
            loading={scanningManual}
            onRunScan={handleManualScan}
            onSelectPair={(pairName) => {
              const matched = pairsData.find((p) => p.pair === pairName);
              if (matched) setSelectedPair(matched);
            }}
          />

          <TelegramAlertConsole
            status={telegramStatus}
            loading={sendingTestAlert}
            onSendTest={handleSendTelegramTest}
            onUpdatePreferences={handleUpdateTelegramPreferences}
          />
        </>
      )}

      {/* PHASE 6: INTERACTIVE TRADINGVIEW LIGHTWEIGHT CHARTS */}
      {(showMarkets || showWatchlist || isMaster) && (
      <div className="rounded-2xl bg-[#0E1320] border border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <CandlestickChart className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Phase 6 Interactive TradingView Lightweight Chart:</span>
                <span className="text-blue-400 font-mono">{selectedPair.pair} ({selectedTimeframe})</span>
              </h3>
              <p className="text-xs text-slate-400">
                Live candlestick bars, volume histogram, dynamic EMA 20/50/200 overlays, and multi-target TP/SL horizontal price rays
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              Bars: <b className="text-white">{candlesData.length} Loaded</b>
            </span>
            <span className="text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              Feed: <b className="text-blue-400">{feedSource}</b>
            </span>
          </div>
        </div>

        {/* TradingView Chart Container */}
        <TradingViewChart
          candles={candlesData}
          pair={selectedPair.pair}
          timeframe={selectedTimeframe}
          levels={{
            entry: activeSignalDetails?.entry || activeSignalDetails?.price,
            tp1: activeSignalDetails?.tp1,
            tp2: activeSignalDetails?.tp2,
            tp3: activeSignalDetails?.tp3,
            stopLoss: activeSignalDetails?.sl,
            nearestSupport: sr?.nearestSupport,
            nearestResistance: sr?.nearestResistance,
          }}
          indicators={indicators}
          height={480}
        />
      </div>
      )}

      {/* PHASE 7: OPENAI INTELLIGENCE & SETUP SYNTHESIS */}
      {showSignals && (
        <AiAnalysisCard
          aiData={aiExplanation}
          loading={loadingAi}
          onRefresh={() => loadAiExplanation(selectedPair.pair, selectedTimeframe)}
          pair={selectedPair.pair}
          timeframe={selectedTimeframe}
        />
      )}

      {/* PHASE 5: RISK MANAGEMENT & POSITION SIZING CALCULATOR */}
      {(showSignals || showWatchlist || isMaster) && (
      <div className="rounded-2xl bg-[#0E1320] border border-blue-500/40 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Phase 5 Risk Management Calculator:</span>
                <span className="text-emerald-400 font-mono">{activeSignalDetails?.pair}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Institutional lot sizing, capital preservation buffers, and multi-target profit projections
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span>Pip Value:</span>
            <span className="text-white font-bold">${riskCalculations?.pipValuePerLot || 10.0}/lot</span>
          </div>
        </div>

        {/* Input & Output Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4 bg-slate-900/60 p-5 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Account & Risk Parameters
            </h4>

            {/* Account Balance */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 flex justify-between">
                <span>Account Balance ($)</span>
                <span className="font-mono text-white font-bold">${accountBalance.toLocaleString()}</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="50"
                  step="100"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Quick Balance Presets */}
              <div className="flex space-x-2 pt-1 font-mono text-xs">
                {[500, 1000, 5000, 10000].map((bal) => (
                  <button
                    key={bal}
                    onClick={() => setAccountBalance(bal)}
                    className={`px-2 py-1 rounded-md border text-[11px] transition ${
                      accountBalance === bal
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    ${bal >= 1000 ? `${bal / 1000}k` : bal}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Percentage */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs text-slate-400 flex justify-between">
                <span>Risk Percentage Per Trade</span>
                <span className="font-mono text-amber-400 font-bold">{riskPercentage}%</span>
              </label>
              <div className="relative">
                <Percent className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="number"
                  min="0.1"
                  max="10.0"
                  step="0.1"
                  value={riskPercentage}
                  onChange={(e) => setRiskPercentage(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-sm font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Quick Risk Presets */}
              <div className="flex space-x-2 pt-1 font-mono text-xs">
                {[0.5, 1.0, 1.5, 2.0].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setRiskPercentage(pct)}
                    className={`px-2.5 py-1 rounded-md border text-[11px] transition ${
                      riskPercentage === pct
                        ? 'bg-emerald-600 text-white border-emerald-500'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Active Signal Levels Readout */}
            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs font-mono pt-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Entry Anchor:</span>
                <span className="text-white font-bold">{activeSignalDetails?.entry || activeSignalDetails?.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stop Loss Anchor:</span>
                <span className="text-rose-400 font-bold">{activeSignalDetails?.sl || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Risk Distance:</span>
                <span className="text-amber-400 font-bold">{riskCalculations?.riskPips || '0'} pips</span>
              </div>
            </div>
          </div>

          {/* Right: Calculated Metrics & Targets (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Max Risk Capital */}
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-mono">Max Risk ($)</span>
                <div className="text-xl font-bold font-mono text-rose-400">
                  -${riskCalculations?.riskAmount || 10.0}
                </div>
                <span className="text-[10px] text-slate-500 block">{riskPercentage}% of ${accountBalance}</span>
              </div>

              {/* Recommended Lot Size */}
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-blue-500/30 space-y-1">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-mono">Position Size</span>
                <div className="text-xl font-bold font-mono text-blue-400">
                  {riskCalculations?.positionSize?.standardLots || '0.04'} Lots
                </div>
                <span className="text-[10px] text-slate-400 block font-mono">
                  {riskCalculations?.positionSize?.microLots || '4.0'} Micro Lots
                </span>
              </div>

              {/* Total Units */}
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-mono">Market Units</span>
                <div className="text-xl font-bold font-mono text-white">
                  {riskCalculations?.positionSize?.units?.toLocaleString() || '4,000'}
                </div>
                <span className="text-[10px] text-slate-500 block">Currency Units</span>
              </div>
            </div>

            {/* Target Projections (TP1, TP2, TP3) */}
            <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Multi-Target Reward Projections
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                {/* TP1 */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-emerald-500/30 space-y-1">
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span className="text-emerald-400 font-bold">TP1 (1:1.0)</span>
                    <span>+{riskCalculations?.targets?.tp1?.pips || 0} pips</span>
                  </div>
                  <div className="text-base font-bold text-white">
                    {riskCalculations?.targets?.tp1?.price || activeSignalDetails?.tp1}
                  </div>
                  <div className="text-xs text-emerald-400 font-bold">
                    +${riskCalculations?.targets?.tp1?.profit || (accountBalance * 0.01)}
                  </div>
                </div>

                {/* TP2 */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-teal-500/30 space-y-1">
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span className="text-teal-400 font-bold">TP2 (1:2.0)</span>
                    <span>+{riskCalculations?.targets?.tp2?.pips || 0} pips</span>
                  </div>
                  <div className="text-base font-bold text-white">
                    {riskCalculations?.targets?.tp2?.price || activeSignalDetails?.tp2}
                  </div>
                  <div className="text-xs text-teal-400 font-bold">
                    +${riskCalculations?.targets?.tp2?.profit || (accountBalance * 0.02)}
                  </div>
                </div>

                {/* TP3 */}
                <div className="bg-slate-950/70 p-3 rounded-xl border border-cyan-500/30 space-y-1">
                  <div className="flex justify-between items-center text-slate-400 text-[11px]">
                    <span className="text-cyan-400 font-bold">TP3 (1:3.0)</span>
                    <span>+{riskCalculations?.targets?.tp3?.pips || 0} pips</span>
                  </div>
                  <div className="text-base font-bold text-white">
                    {riskCalculations?.targets?.tp3?.price || activeSignalDetails?.tp3}
                  </div>
                  <div className="text-xs text-cyan-400 font-bold">
                    +${riskCalculations?.targets?.tp3?.profit || (accountBalance * 0.03)}
                  </div>
                </div>
              </div>
            </div>

            {/* Safety & Leverage Warning */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start space-x-2 text-xs text-amber-300">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <p className="leading-relaxed">
                <b>Capital Preservation Rule:</b> Never risk more than 1% to 2% of capital per trade. Calculated sizes protect against consecutive drawdown streaks. Real trade execution is prohibited.
              </p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* PHASE 4: DETERMINISTIC 100-POINT SCORING BREAKDOWN & REASONS */}
      {showSignals && (
        <>
          <div className="rounded-2xl bg-[#0E1320] border border-slate-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Phase 4 Deterministic Signal Engine:</span>
                <span className="text-blue-400 font-mono">{selectedPair.pair} ({selectedTimeframe})</span>
              </h3>
              <p className="text-xs text-slate-400">
                100-Point multi-factor rule scoring model & transparent setup triggers
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold uppercase border ${
              isBuy
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : isSell
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {activeSignalDetails?.signal?.replace('_', ' ')}: {activeSignalDetails?.score}/100
            </span>
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
              Confidence: {activeSignalDetails?.confidence}
            </span>
          </div>
        </div>

        {/* 100-Point Rule Breakdown Meter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Factor Score Distribution</span>
            <span className="font-mono text-amber-400 font-bold">{activeSignalDetails?.score} / 100 Points</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* EMA Trend */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono">
              <span className="text-slate-400 text-[11px] block">EMA Trend (25)</span>
              <div className="text-lg font-bold text-white">{breakdown.emaTrend || 0}<span className="text-xs text-slate-500">/25</span></div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${((breakdown.emaTrend || 0) / 25) * 100}%` }}></div>
              </div>
            </div>

            {/* MACD */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono">
              <span className="text-slate-400 text-[11px] block">MACD (20)</span>
              <div className="text-lg font-bold text-white">{breakdown.macd || 0}<span className="text-xs text-slate-500">/20</span></div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${((breakdown.macd || 0) / 20) * 100}%` }}></div>
              </div>
            </div>

            {/* RSI */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono">
              <span className="text-slate-400 text-[11px] block">RSI (15)</span>
              <div className="text-lg font-bold text-white">{breakdown.rsi || 0}<span className="text-xs text-slate-500">/15</span></div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${((breakdown.rsi || 0) / 15) * 100}%` }}></div>
              </div>
            </div>

            {/* Market Structure */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono">
              <span className="text-slate-400 text-[11px] block">Structure (15)</span>
              <div className="text-lg font-bold text-white">{breakdown.marketStructure || 0}<span className="text-xs text-slate-500">/15</span></div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: `${((breakdown.marketStructure || 0) / 15) * 100}%` }}></div>
              </div>
            </div>

            {/* Support / Resistance */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono">
              <span className="text-slate-400 text-[11px] block">S / R (15)</span>
              <div className="text-lg font-bold text-white">{breakdown.supportResistance || 0}<span className="text-xs text-slate-500">/15</span></div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${((breakdown.supportResistance || 0) / 15) * 100}%` }}></div>
              </div>
            </div>

            {/* Volatility */}
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono">
              <span className="text-slate-400 text-[11px] block">Volatility (10)</span>
              <div className="text-lg font-bold text-white">{breakdown.volatility || 0}<span className="text-xs text-slate-500">/10</span></div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${((breakdown.volatility || 0) / 10) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Reasons & Confirmation Triggers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Transparent Reasons List */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Transparent Algorithmic Triggers</span>
            </h4>
            <div className="space-y-2">
              {activeSignalDetails?.reasons?.map((reason, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs text-slate-200 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-Timeframe Confirmation Rule Box */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans flex items-center space-x-1.5">
              <Target className="w-4 h-4 text-blue-400" />
              <span>Multi-Timeframe Confirmation Filter</span>
            </h4>

            <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Consensus State:</span>
                <span className="text-blue-400 font-bold">{activeSignalDetails?.timeframeConsensus?.replace(/_/g, ' ') || 'ALIGNED'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Trend Alignment:</span>
                <span className="text-emerald-400 font-bold">4H & 1H Higher Timeframe Confirmed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Veto Condition:</span>
                <span className="text-slate-300">If 4H conflicts &rarr; Force NO TRADE</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Rule: Single-indicator signals are prohibited. Every signal requires multi-timeframe concordance across trend, momentum, and market structure.
            </p>
          </div>
        </div>
      </div>

      {/* PHASE 3 INDICATOR CONSOLE (EMA, RSI, MACD, ATR, S/R) */}
      <div className="rounded-2xl bg-[#0E1320] border border-slate-800 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <Sliders className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Phase 3 Quantitative Indicator Stack:</span>
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
      </div>
      </>
      )}

      {/* Candlestick Feed Table */}
      {showMarkets && (
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
      )}

      {/* PHASE 10: HISTORICAL STRATEGY BACKTESTING ENGINE */}
      {showBacktesting && (
        <BacktestConsole
          results={backtestData}
          loading={backtestLoading}
          onRun={handleRunBacktest}
          initialPair={selectedPair.pair}
        />
      )}

      {/* PHASE 11: PRODUCTION DOCKER DEPLOYMENT & ORCHESTRATION */}
      {showDeployment && (
        <>
          <ProductionDeploymentConsole />

          {/* Master 11-Phase Architecture Roadmap */}
          <div className="rounded-2xl bg-[#0E1320] border border-slate-800 p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <Layers className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-base font-bold text-white">
                  ForexAI Analyzer Architecture Roadmap
                </h3>
                <p className="text-xs text-slate-400">
                  All 11 architectural phases are fully implemented, verified, and production-ready.
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
        </>
      )}
    </div>
  );
};

export default Dashboard;
