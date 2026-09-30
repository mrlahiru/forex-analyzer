import React, { useState } from 'react';
import {
  Radio,
  RefreshCw,
  Activity,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Flame,
  Layers,
} from 'lucide-react';

export const ScannerConsole = ({
  scannerData = null,
  events = [],
  loading = false,
  onRunScan = () => {},
  onSelectPair = () => {},
}) => {
  const isRunning = scannerData?.running ?? true;
  const isScanning = scannerData?.isScanning || loading;
  const scanCount = scannerData?.scanCount || 0;
  const lastScan = scannerData?.lastScanTime
    ? new Date(scannerData.lastScanTime).toLocaleTimeString()
    : 'Initializing...';
  const trackedSignals = scannerData?.trackedSignals || [];
  const displayEvents = events?.length > 0 ? events : (scannerData?.recentEvents || []);

  const getEventBadge = (type) => {
    switch (type) {
      case 'TP3_HIT':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case 'TP2_HIT':
        return 'bg-teal-500/20 text-teal-400 border-teal-500/40';
      case 'TP1_HIT':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'SL_HIT':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      case 'CREATED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/[0.08] shadow-2xl space-y-6 relative overflow-hidden card-shine">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5 relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="relative p-3 rounded-2xl bg-gradient-to-tr from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/10">
            <Radio className="w-5 h-5 text-emerald-400" />
            {isRunning && (
              <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center space-x-2 tracking-tight">
              <span>Automatic Market Scanner & Background Engine</span>
            </h3>
            <p className="text-xs text-slate-400">
              Autonomous node-cron scheduler, real-time lifecycle tracking, and instant target/stop detection
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs font-mono bg-black/40 px-3.5 py-1.5 rounded-xl border border-white/[0.08] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>node-cron: <b>*/1 min</b></span>
          </div>

          <button
            onClick={onRunScan}
            disabled={isScanning}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600/30 to-teal-600/30 hover:from-emerald-600/40 hover:to-teal-600/40 text-xs font-mono font-bold text-emerald-300 hover:text-white border border-emerald-500/40 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm shadow-emerald-500/10"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isScanning ? 'Scanning Pairs...' : 'Run Scan Now'}</span>
          </button>
        </div>
      </div>

      {/* Diagnostics Readout Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs relative z-10 tabular-nums">
        <div className="glass-card p-3.5 rounded-2xl border border-white/[0.08] space-y-1 card-shine">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Engine Status</span>
          <div className="text-sm font-bold flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
            <span className={isRunning ? 'text-emerald-400' : 'text-rose-400'}>
              {isRunning ? 'ACTIVE (1m Interval)' : 'PAUSED'}
            </span>
          </div>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-white/[0.08] space-y-1 card-shine">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Last Scan Time</span>
          <div className="text-sm font-bold text-white flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>{lastScan}</span>
          </div>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-white/[0.08] space-y-1 card-shine">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total Cycles Run</span>
          <div className="text-sm font-bold text-amber-400 flex items-center space-x-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{scanCount} Complete Cycles</span>
          </div>
        </div>

        <div className="glass-card p-3.5 rounded-2xl border border-white/[0.08] space-y-1 card-shine">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Actively Tracked Setups</span>
          <div className="text-sm font-bold text-blue-400 flex items-center space-x-1.5">
            <Target className="w-3.5 h-3.5 text-blue-400" />
            <span>{trackedSignals.length} Active Positions</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Active Monitored Setups Table (7 cols) */}
        <div className="lg:col-span-7 space-y-3 bg-[#060A14]/70 p-4.5 rounded-2xl border border-white/[0.08] card-shine">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Real-Time Monitored Signal Matrix</span>
            </h4>
            <span className="text-[11px] font-mono text-slate-400 font-semibold">
              {trackedSignals.length} Setups Tracked
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono tabular-nums">
              <thead>
                <tr className="border-b border-white/[0.06] text-slate-400 text-[11px]">
                  <th className="py-2.5 px-2.5">Pair</th>
                  <th className="py-2.5 px-2.5">Direction</th>
                  <th className="py-2.5 px-2.5">Score</th>
                  <th className="py-2.5 px-2.5">Status</th>
                  <th className="py-2.5 px-2.5">Entry</th>
                  <th className="py-2.5 px-2.5">TP1</th>
                  <th className="py-2.5 px-2.5">SL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {trackedSignals.map((item) => {
                  const isBuy = item.direction === 'BUY';
                  const isSell = item.direction === 'SELL';

                  return (
                    <tr
                      key={item.pair}
                      onClick={() => onSelectPair(item.pair)}
                      className="hover:bg-white/[0.04] cursor-pointer transition"
                    >
                      <td className="py-2.5 px-2.5 font-bold text-white flex items-center space-x-1">
                        <span>{item.pair}</span>
                      </td>
                      <td className="py-2.5 px-2.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isBuy
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : isSell
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {item.direction}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 font-semibold text-amber-400">
                        {item.score}/100
                      </td>
                      <td className="py-2.5 px-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getEventBadge(item.status)}`}>
                          {item.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-slate-300">{item.entry}</td>
                      <td className="py-2.5 px-2.5 text-emerald-400 font-semibold">{item.tp1}</td>
                      <td className="py-2.5 px-2.5 text-rose-400">{item.stopLoss}</td>
                    </tr>
                  );
                })}

                {trackedSignals.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-slate-500 italic">
                      Scanner active. Evaluating market conditions on next cycle...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Signal Lifecycle Event Stream (5 cols) */}
        <div className="lg:col-span-5 space-y-3 bg-[#060A14]/70 p-4.5 rounded-2xl border border-white/[0.08] flex flex-col card-shine">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Live Signal Event Stream</span>
            </h4>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Real-Time</span>
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1 flex-1">
            {displayEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-black/40 p-3 rounded-xl border border-white/[0.06] space-y-1.5 text-xs font-mono transition hover:border-white/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{evt.pair}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getEventBadge(evt.eventType)}`}>
                      {evt.eventType.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 tabular-nums">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 leading-snug font-sans">
                  {evt.notes}
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-white/[0.04] tabular-nums">
                  <span>Price: <b>{evt.price}</b></span>
                  <span>TF: <b>{evt.timeframe}</b></span>
                </div>
              </div>
            ))}

            {displayEvents.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-xs italic">
                Awaiting upcoming signal lifecycle events...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerConsole;
