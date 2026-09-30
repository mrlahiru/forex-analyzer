import React, { useState } from 'react';
import {
  LineChart,
  Play,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Award,
  Zap,
  ShieldAlert,
  Clock,
  DollarSign,
  Percent,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
} from 'lucide-react';

export const BacktestConsole = ({
  results = null,
  loading = false,
  onRun = () => {},
  initialPair = 'EUR/USD',
}) => {
  const [pair, setPair] = useState(initialPair);
  const [timeframe, setTimeframe] = useState('1h');
  const [initialBalance, setInitialBalance] = useState(10000);
  const [riskPercentage, setRiskPercentage] = useState(1.0);
  const [lookbackBars, setLookbackBars] = useState(250);
  const [strategy, setStrategy] = useState('DETERMINISTIC_CORE');

  const pairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD'];
  const timeframes = ['15m', '30m', '1h', '4h', '1d'];

  const handleSubmit = (e) => {
    e?.preventDefault();
    onRun({
      pair,
      timeframe,
      initialBalance: Number(initialBalance),
      riskPercentage: Number(riskPercentage),
      lookbackBars: Number(lookbackBars),
      strategy,
    });
  };

  const kpis = results?.kpis || {
    totalTrades: 0,
    winCount: 0,
    lossCount: 0,
    winRate: 0,
    profitFactor: 1.0,
    maxDrawdownPct: 0,
    expectancy: 0,
    avgWin: 0,
    avgLoss: 0,
  };

  const netProfit = results?.netProfit ?? 0;
  const isNetPositive = netProfit >= 0;
  const trades = results?.trades || [];
  const equityCurve = results?.equityCurve || [];

  // Generate SVG points for Equity Curve chart
  const minEquity = Math.min(...equityCurve.map((p) => p.equity || initialBalance), initialBalance * 0.95);
  const maxEquity = Math.max(...equityCurve.map((p) => p.equity || initialBalance), initialBalance * 1.05);
  const equityRange = maxEquity - minEquity || 1;

  const svgWidth = 800;
  const svgHeight = 180;

  const points = equityCurve.map((p, idx) => {
    const x = (idx / (equityCurve.length - 1 || 1)) * svgWidth;
    const y = svgHeight - ((p.equity - minEquity) / equityRange) * (svgHeight - 20) - 10;
    return `${x},${y}`;
  });

  const polylineStr = points.join(' ');
  const areaPoints = `0,${svgHeight} ${polylineStr} ${svgWidth},${svgHeight}`;

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/[0.08] shadow-2xl space-y-6 relative overflow-hidden card-shine">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5 relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-blue-600/20 border border-blue-500/30 text-blue-400 shadow-sm shadow-blue-500/10">
            <LineChart className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center space-x-2 tracking-tight">
              <span>Historical Strategy Backtesting Engine</span>
            </h3>
            <p className="text-xs text-slate-400">
              Quantitative simulation of the 100-point rule model, multi-target TP1/2/3 exits, and drawdown analysis
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-mono font-bold text-white shadow-lg shadow-blue-500/25 transition active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <RotateCcw className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Play className="w-4 h-4 fill-white" />
          )}
          <span>{loading ? 'Simulating Strategy...' : 'Run Backtest Simulation'}</span>
        </button>
      </div>

      {/* Backtest Configuration Controls Bar */}
      <div className="bg-[#060A14]/70 p-4 rounded-2xl border border-white/[0.08] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 font-mono text-xs relative z-10 card-shine">
        {/* Pair */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Pair</label>
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="w-full bg-[#080D1A] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            {pairs.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Timeframe */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Timeframe</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="w-full bg-[#080D1A] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            {timeframes.map((tf) => (
              <option key={tf} value={tf}>{tf}</option>
            ))}
          </select>
        </div>

        {/* Starting Balance */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Balance ($)</label>
          <input
            type="number"
            step="500"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            className="w-full bg-[#080D1A] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Risk % per trade */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Risk %</label>
          <select
            value={riskPercentage}
            onChange={(e) => setRiskPercentage(Number(e.target.value))}
            className="w-full bg-[#080D1A] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value={0.5}>0.5% (Safe)</option>
            <option value={1.0}>1.0% (Standard)</option>
            <option value={1.5}>1.5% (Moderate)</option>
            <option value={2.0}>2.0% (Aggressive)</option>
          </select>
        </div>

        {/* Lookback Bars */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Lookback</label>
          <select
            value={lookbackBars}
            onChange={(e) => setLookbackBars(Number(e.target.value))}
            className="w-full bg-[#080D1A] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value={150}>150 Bars</option>
            <option value={250}>250 Bars</option>
            <option value={400}>400 Bars</option>
          </select>
        </div>

        {/* Strategy Preset */}
        <div className="space-y-1">
          <label className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Strategy</label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="w-full bg-[#080D1A] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="DETERMINISTIC_CORE">100-pt Core (65+)</option>
            <option value="CONSERVATIVE">Conservative (75+)</option>
            <option value="AGGRESSIVE_MOMENTUM">Momentum (60+)</option>
          </select>
        </div>
      </div>

      {/* KPI Performance Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs relative z-10 tabular-nums">
        {/* Win Rate */}
        <div className="glass-card p-3.5 rounded-2xl border border-white/[0.08] space-y-1 card-shine">
          <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Win Rate</span>
          <div className="text-xl font-black text-emerald-400">
            {kpis.winRate}%
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            {kpis.winCount}W / {kpis.lossCount}L ({kpis.totalTrades} Trades)
          </span>
        </div>

        {/* Profit Factor */}
        <div className="glass-card p-3.5 rounded-2xl border border-white/[0.08] space-y-1 card-shine">
          <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Profit Factor</span>
          <div className="text-xl font-black text-blue-400">
            {kpis.profitFactor}x
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Gross Gain vs Loss
          </span>
        </div>

        {/* Net Profit ($) */}
        <div className="glass-card p-3.5 rounded-2xl border border-white/[0.08] space-y-1 card-shine">
          <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Net Profit</span>
          <div className={`text-xl font-black ${isNetPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isNetPositive ? `+$${netProfit.toLocaleString()}` : `-$${Math.abs(netProfit).toLocaleString()}`}
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            {results?.netProfitPct ? `${results.netProfitPct}% Return` : '0%'}
          </span>
        </div>

        {/* Max Drawdown */}
        <div className="glass-card p-3.5 rounded-2xl border border-white/[0.08] space-y-1 card-shine">
          <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Max Drawdown</span>
          <div className="text-xl font-black text-amber-400">
            {kpis.maxDrawdownPct}%
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Peak to Trough
          </span>
        </div>

        {/* Total Pips */}
        <div className="glass-card p-3.5 rounded-2xl border border-white/[0.08] space-y-1 card-shine">
          <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Total Pips</span>
          <div className={`text-xl font-black ${results?.totalPips >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {results?.totalPips >= 0 ? `+${results?.totalPips || 0}` : results?.totalPips || 0}
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Across {kpis.totalTrades} positions
          </span>
        </div>

        {/* Avg Duration */}
        <div className="glass-card p-3.5 rounded-2xl border border-white/[0.08] space-y-1 card-shine">
          <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">Avg Hold Time</span>
          <div className="text-xl font-black text-white">
            {kpis.avgDurationBars || 0} Bars
          </div>
          <span className="text-[10px] text-slate-400 block font-mono">
            Per position
          </span>
        </div>
      </div>

      {/* Equity Curve Graph */}
      <div className="bg-[#060A14]/70 p-5 rounded-2xl border border-white/[0.08] space-y-3.5 relative z-10 card-shine">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span>Simulated Equity Curve Progression</span>
          </h4>
          <div className="flex items-center space-x-3 text-xs font-mono tabular-nums">
            <span className="text-slate-400">Start: <b className="text-white">${results?.initialBalance || initialBalance}</b></span>
            <span className="text-slate-400">Final: <b className={isNetPositive ? 'text-emerald-400' : 'text-rose-400'}>${results?.finalBalance || initialBalance}</b></span>
          </div>
        </div>

        {/* SVG Equity Graph */}
        <div className="w-full bg-[#04070F] rounded-xl p-3 border border-white/[0.06] overflow-hidden relative">
          {equityCurve.length > 1 ? (
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-36 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Baseline */}
              <line
                x1="0"
                y1={svgHeight - ((initialBalance - minEquity) / equityRange) * (svgHeight - 20) - 10}
                x2={svgWidth}
                y2={svgHeight - ((initialBalance - minEquity) / equityRange) * (svgHeight - 20) - 10}
                stroke="#1E293B"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              {/* Shaded Area */}
              <polygon points={areaPoints} fill="url(#equityGrad)" />
              {/* Equity Line */}
              <polyline
                fill="none"
                stroke={isNetPositive ? '#10B981' : '#F43F5E'}
                strokeWidth="2.5"
                points={polylineStr}
              />
            </svg>
          ) : (
            <div className="h-36 flex items-center justify-center text-slate-500 font-mono text-xs italic">
              Click 'Run Backtest Simulation' to generate historical equity curve.
            </div>
          )}
        </div>
      </div>

      {/* Trade Log Table */}
      <div className="bg-[#060A14]/70 p-5 rounded-2xl border border-white/[0.08] space-y-3.5 relative z-10 card-shine">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Simulated Trade History Log</span>
          </h4>
          <span className="text-[11px] font-mono text-slate-400 font-semibold">
            {trades.length} Closed Trades
          </span>
        </div>

        <div className="overflow-x-auto max-h-[300px]">
          <table className="w-full text-left text-xs font-mono tabular-nums">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-400 text-[11px] sticky top-0 bg-[#060A14]">
                <th className="py-2 px-2.5">#</th>
                <th className="py-2 px-2.5">Exit Time</th>
                <th className="py-2 px-2.5">Side</th>
                <th className="py-2 px-2.5">Entry</th>
                <th className="py-2 px-2.5">Exit</th>
                <th className="py-2 px-2.5">Result</th>
                <th className="py-2 px-2.5">Pips</th>
                <th className="py-2 px-2.5">PnL ($)</th>
                <th className="py-2 px-2.5 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {trades.slice().reverse().map((t, i) => {
                const isWin = t.profitDollar > 0;
                return (
                  <tr key={t.id || i} className="hover:bg-white/[0.04] transition">
                    <td className="py-2.5 px-2.5 text-slate-500">{t.id}</td>
                    <td className="py-2.5 px-2.5 text-slate-400 text-[11px]">
                      {new Date(t.exitTime).toLocaleDateString()} {new Date(t.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-2.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        t.direction === 'BUY'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {t.direction}
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 text-slate-300">{t.entryPrice}</td>
                    <td className="py-2.5 px-2.5 text-slate-200">{t.exitPrice}</td>
                    <td className="py-2.5 px-2.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        t.outcome.includes('TP')
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {t.outcome.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`py-2.5 px-2.5 font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.pips >= 0 ? `+${t.pips}` : t.pips}
                    </td>
                    <td className={`py-2.5 px-2.5 font-bold ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isWin ? `+$${t.profitDollar}` : `-$${Math.abs(t.profitDollar)}`}
                    </td>
                    <td className="py-2.5 px-2.5 text-right font-bold text-white">
                      ${t.balanceAfter?.toLocaleString()}
                    </td>
                  </tr>
                );
              })}

              {trades.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-slate-500 italic">
                    No trades in current window. Click 'Run Backtest Simulation' to simulate historical execution.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BacktestConsole;
