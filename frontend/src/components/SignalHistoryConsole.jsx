import React, { useState, useEffect } from 'react';
import {
  History,
  TrendingUp,
  TrendingDown,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  ShieldAlert,
  Award,
  Zap,
} from 'lucide-react';
import { fetchSignalHistory } from '../services/api';

const PAIRS = ['ALL', 'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD'];
const TIMEFRAMES = ['ALL', '1m', '5m', '15m', '30m', '1h', '4h', '1d'];
const RESULTS = ['ALL', 'TP1_HIT', 'TP2_HIT', 'TP3_HIT', 'SL_HIT'];

export const SignalHistoryConsole = () => {
  const [history, setHistory] = useState([]);
  const [metrics, setMetrics] = useState({
    totalSignals: 0,
    winCount: 0,
    lossCount: 0,
    winRate: 0,
    totalPips: 0,
    avgRiskReward: '1:2.0',
  });
  const [loading, setLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState('ALL');
  const [selectedDirection, setSelectedDirection] = useState('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('ALL');
  const [selectedResult, setSelectedResult] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const loadHistory = async () => {
    setLoading(true);
    const params = {};
    if (selectedPair !== 'ALL') params.pair = selectedPair;
    if (selectedDirection !== 'ALL') params.direction = selectedDirection;
    if (selectedTimeframe !== 'ALL') params.timeframe = selectedTimeframe;
    if (selectedResult !== 'ALL') params.result = selectedResult;

    const res = await fetchSignalHistory(params);
    if (res.success && res.data) {
      setHistory(res.data.history || []);
      if (res.data.metrics) setMetrics(res.data.metrics);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, [selectedPair, selectedDirection, selectedTimeframe, selectedResult]);

  const filteredHistory = history.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.pair.toLowerCase().includes(q) ||
      item.direction.toLowerCase().includes(q) ||
      item.result.toLowerCase().includes(q) ||
      (item.reasons && item.reasons.some((r) => r.toLowerCase().includes(q)))
    );
  });

  const getResultBadge = (result) => {
    if (result.includes('TP3')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <Award className="w-3 h-3 text-emerald-400" />
          <span>TP3 HIT (Full Run)</span>
        </span>
      );
    }
    if (result.includes('TP2')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
          <CheckCircle2 className="w-3 h-3 text-emerald-300" />
          <span>TP2 HIT (Target 2)</span>
        </span>
      );
    }
    if (result.includes('TP1')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
          <CheckCircle2 className="w-3 h-3 text-cyan-300" />
          <span>TP1 HIT (1:1)</span>
        </span>
      );
    }
    if (result.includes('SL')) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/25">
          <XCircle className="w-3 h-3 text-rose-400" />
          <span>STOP LOSS HIT</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
        {result}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800/80 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">Signal History & Verification</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                SECTION 15
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditable lifecycle records for closed trade setups, deterministic scoring, and verified outcome pips.
            </p>
          </div>
        </div>

        <button
          onClick={loadHistory}
          disabled={loading}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-medium transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Historical Performance KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Closed Signals</span>
            <History className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">{metrics.totalSignals}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {metrics.winCount} Wins / {metrics.lossCount} Losses
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Win Rate</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{metrics.winRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            TP1, TP2, or TP3 secured
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Net Pips</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className={`text-2xl font-bold font-mono ${metrics.totalPips >= 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
            {metrics.totalPips >= 0 ? `+${metrics.totalPips}` : metrics.totalPips}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Total pip delta
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Average R:R</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-300">{metrics.avgRiskReward}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Reward-to-risk ratio
          </div>
        </div>
      </div>

      {/* Filters Toolbar (Section 15: Pair, BUY/SELL, Timeframe, Date, Result) */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
          <Filter className="w-3.5 h-3.5 text-blue-400" />
          <span>FILTER HISTORICAL SIGNALS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Pair Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Currency Pair</label>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {PAIRS.map((p) => (
                <option key={p} value={p}>{p === 'ALL' ? 'All Pairs' : p}</option>
              ))}
            </select>
          </div>

          {/* Direction Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Direction</label>
            <select
              value={selectedDirection}
              onChange={(e) => setSelectedDirection(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Directions</option>
              <option value="BUY">BUY Only</option>
              <option value="SELL">SELL Only</option>
            </select>
          </div>

          {/* Timeframe Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Timeframe</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {TIMEFRAMES.map((tf) => (
                <option key={tf} value={tf}>{tf === 'ALL' ? 'All Timeframes' : tf.toUpperCase()}</option>
              ))}
            </select>
          </div>

          {/* Result Filter */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Outcome Result</label>
            <select
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Outcomes</option>
              <option value="TP1_HIT">TP1 Hit</option>
              <option value="TP2_HIT">TP2 Hit</option>
              <option value="TP3_HIT">TP3 Hit</option>
              <option value="SL_HIT">Stop Loss Hit</option>
            </select>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 placeholder-slate-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Signal History Table (Section 15) */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800/80 text-[11px]">
              <tr>
                <th className="py-3 px-4">Pair & TF</th>
                <th className="py-3 px-4">Direction</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Entry</th>
                <th className="py-3 px-4">TP Targets</th>
                <th className="py-3 px-4">Stop Loss</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Net Pips</th>
                <th className="py-3 px-4">Timing</th>
                <th className="py-3 px-3 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredHistory.map((item) => {
                const isBuy = item.direction === 'BUY';
                const isExpanded = expandedId === item.id;
                const isWin = item.result.includes('TP');
                const pipsVal = parseFloat(item.pips) || 0;

                return (
                  <React.Fragment key={item.id}>
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      {/* Pair & TF */}
                      <td className="py-3.5 px-4 font-semibold text-slate-100">
                        <div className="flex items-center space-x-2">
                          <span>{item.pair}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                            {item.timeframe.toUpperCase()}
                          </span>
                        </div>
                      </td>

                      {/* Direction */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            isBuy
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isBuy ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{item.direction}</span>
                        </span>
                      </td>

                      {/* Score */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-200">
                          {item.score}
                        </span>
                        <span className="text-[10px] text-slate-400">/100</span>
                      </td>

                      {/* Entry */}
                      <td className="py-3.5 px-4 font-mono text-slate-200">
                        {typeof item.entry === 'number' ? item.entry.toFixed(item.pair.includes('JPY') ? 3 : 5) : item.entry}
                      </td>

                      {/* TP Targets */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300 space-y-0.5">
                        <div className="text-cyan-400">TP1: {typeof item.tp1 === 'number' ? item.tp1.toFixed(item.pair.includes('JPY') ? 3 : 5) : item.tp1}</div>
                        <div className="text-slate-400">TP2: {typeof item.tp2 === 'number' ? item.tp2.toFixed(item.pair.includes('JPY') ? 3 : 5) : item.tp2}</div>
                        <div className="text-slate-400">TP3: {typeof item.tp3 === 'number' ? item.tp3.toFixed(item.pair.includes('JPY') ? 3 : 5) : item.tp3}</div>
                      </td>

                      {/* Stop Loss */}
                      <td className="py-3.5 px-4 font-mono text-rose-400">
                        {typeof item.stopLoss === 'number' ? item.stopLoss.toFixed(item.pair.includes('JPY') ? 3 : 5) : item.stopLoss}
                      </td>

                      {/* Result */}
                      <td className="py-3.5 px-4">
                        {getResultBadge(item.result)}
                      </td>

                      {/* Net Pips */}
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={pipsVal >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                          {pipsVal >= 0 ? `+${pipsVal}` : pipsVal} pips
                        </span>
                      </td>

                      {/* Timing */}
                      <td className="py-3.5 px-4 text-[11px] text-slate-400 font-mono">
                        <div>Closed: {item.closedAt ? new Date(item.closedAt).toLocaleDateString() : 'N/A'}</div>
                        <div className="text-[10px] text-slate-400">
                          {item.closedAt ? new Date(item.closedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </div>
                      </td>

                      {/* Expand Button */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* Accordion Row for Deterministic Reasons */}
                    {isExpanded && (
                      <tr className="bg-slate-950/70 border-b border-slate-800/80">
                        <td colSpan={10} className="py-3 px-6">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400">
                              <Zap className="w-3.5 h-3.5" />
                              <span>DETERMINISTIC SETUP REASONS & AUDIT TRAIL</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              {item.reasons && item.reasons.length > 0 ? (
                                item.reasons.map((r, i) => (
                                  <div key={i} className="flex items-start space-x-2 text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                                    <span className="text-blue-400 font-bold">•</span>
                                    <span>{r}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-slate-400 text-xs">Standard multi-timeframe structural breakout.</div>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
                              <span>Signal Created: {new Date(item.createdAt).toLocaleString()}</span>
                              <span>Target Risk/Reward: {item.riskReward}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredHistory.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-slate-400 text-xs">
                    No historical signals match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Regulatory & Risk Disclaimer (Section 15, 23) */}
      <div className="flex items-start space-x-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs leading-relaxed">
        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <span className="font-bold">Historical Performance Notice:</span>
          {' '}Historical trade logs and backtested analytics are displayed strictly for educational and algorithmic research purposes. Past performance is not indicative of future market results. No algorithmic model guarantees profits or eliminates capital risk.
        </div>
      </div>
    </div>
  );
};

export default SignalHistoryConsole;
