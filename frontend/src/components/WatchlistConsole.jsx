import React, { useState, useEffect } from 'react';
import {
  Star,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  SlidersHorizontal,
  Plus,
  Trash2,
  CheckCircle2,
  Radio,
  ArrowRight,
} from 'lucide-react';
import { fetchWatchlist, addToWatchlistApi, removeFromWatchlistApi } from '../services/api';

const STORAGE_KEY = 'forex_ai_watchlist';

export const WatchlistConsole = ({
  pairsData = [],
  selectedPair,
  onSelectPair,
  onViewChart,
}) => {
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['EUR/USD', 'GBP/USD', 'USD/JPY'];
    } catch {
      return ['EUR/USD', 'GBP/USD', 'USD/JPY'];
    }
  });

  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'BUY' | 'SELL' | 'NO_TRADE'

  // Fetch watchlist from backend if available
  useEffect(() => {
    fetchWatchlist().then((res) => {
      if (res.success && res.data?.pairs && res.data.pairs.length > 0) {
        setWatchlist(res.data.pairs);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data.pairs));
      }
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    } catch (e) {
      console.error('Failed to save watchlist to localStorage', e);
    }
  }, [watchlist]);

  const toggleWatchlist = (pair) => {
    if (watchlist.includes(pair)) {
      setWatchlist((prev) => prev.filter((p) => p !== pair));
      removeFromWatchlistApi(pair);
    } else {
      setWatchlist((prev) => [...prev, pair]);
      addToWatchlistApi(pair);
    }
  };

  const watchlistItems = pairsData.filter((p) => watchlist.includes(p.pair));
  const filteredItems = watchlistItems.filter((p) => {
    if (filter === 'ALL') return true;
    if (filter === 'BUY') return p.signal === 'BUY';
    if (filter === 'SELL') return p.signal === 'SELL';
    if (filter === 'NO_TRADE') return p.signal === 'NO_TRADE' || p.signal === 'NO TRADE';
    return true;
  });

  const availablePairsToAdd = pairsData.filter((p) => !watchlist.includes(p.pair));

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/[0.08] shadow-2xl space-y-6 card-shine relative overflow-hidden">
      {/* Ambient Radial Accent */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5 relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-sm shadow-amber-500/10">
            <Star className="w-5 h-5 fill-amber-400/20" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Workspace
              </span>
              <h3 className="text-lg font-extrabold text-white tracking-tight">
                Personalized Currency Watchlist
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pin and track high-priority forex pairs with instant deterministic scores, dynamic targets, and multi-timeframe alerts
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/[0.08] text-xs font-mono">
          {['ALL', 'BUY', 'SELL', 'NO_TRADE'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl transition-all duration-200 font-bold ${
                filter === f
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Available to Add Quick Bar */}
      {availablePairsToAdd.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3.5 bg-black/30 backdrop-blur-md rounded-2xl border border-white/[0.06] text-xs relative z-10">
          <span className="text-slate-400 flex items-center space-x-1.5 text-[11px] font-mono mr-1 font-semibold">
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>Add Pair to Watchlist:</span>
          </span>
          {availablePairsToAdd.map((p) => (
            <button
              key={p.pair}
              onClick={() => toggleWatchlist(p.pair)}
              className="px-3 py-1 rounded-xl bg-white/[0.05] hover:bg-blue-600/20 hover:border-blue-500/40 text-slate-200 hover:text-blue-300 border border-white/[0.08] font-mono text-[11px] transition flex items-center space-x-1.5 cursor-pointer"
            >
              <span>{p.pair}</span>
              <Plus className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      )}

      {/* Pinned Pair Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-black/30 backdrop-blur-md rounded-3xl border border-white/[0.06] text-slate-400 space-y-3 relative z-10">
          <Star className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-base font-semibold text-slate-300">No pairs match the selected filter.</p>
          <p className="text-xs text-slate-500">Pin currency pairs above to curate your active institutional watchlist.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
          {filteredItems.map((item) => {
            const isBuy = item.signal === 'BUY';
            const isSell = item.signal === 'SELL';
            const isPositive = (item.changePercent || 0) >= 0;
            const isSelected = selectedPair?.pair === item.pair;

            return (
              <div
                key={item.pair}
                className={`glass-card rounded-3xl p-5 border transition-all duration-300 relative space-y-4 card-shine overflow-hidden ${
                  isSelected
                    ? 'border-blue-500/60 shadow-xl shadow-blue-500/15 bg-blue-950/20 ring-1 ring-blue-500/40'
                    : 'border-white/[0.08] hover:border-white/20'
                }`}
              >
                {/* Top directional glow indicator strip */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 rounded-t-3xl transition-all ${
                    isBuy
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shadow-sm shadow-emerald-500/50'
                      : isSell
                      ? 'bg-gradient-to-r from-rose-500 via-red-400 to-rose-600 shadow-sm shadow-rose-500/50'
                      : 'bg-slate-700/60'
                  }`}
                />

                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-lg text-white tracking-tight">{item.pair}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25">
                        {item.timeframe || '1h'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium">{item.trend}</span>
                  </div>

                  <button
                    onClick={() => toggleWatchlist(item.pair)}
                    title="Remove from watchlist"
                    className="p-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition cursor-pointer"
                  >
                    <Star className="w-4 h-4 fill-amber-400" />
                  </button>
                </div>

                {/* Price & Change */}
                <div className="flex items-baseline justify-between pt-1">
                  <div className="font-mono text-xl font-black text-white tabular-nums tracking-tight">
                    {typeof item.price === 'number'
                      ? item.price.toFixed(item.pair.includes('JPY') ? 3 : 5)
                      : item.price}
                  </div>
                  <div
                    className={`font-mono text-xs font-bold flex items-center space-x-1 tabular-nums ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{isPositive ? '+' : ''}{(item.changePercent || 0).toFixed(2)}%</span>
                  </div>
                </div>

                {/* Signal Badge & Score Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-sm ${
                      isBuy
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10'
                        : isSell
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-rose-500/10'
                        : 'bg-slate-800/80 text-slate-400 border border-slate-700/80'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isBuy ? 'bg-emerald-400 animate-pulse' : isSell ? 'bg-rose-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                    <span>{item.signal?.replace('_', ' ')}</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    Score: {item.score}/100
                  </span>
                </div>

                {/* Dynamic Levels Readout */}
                {item.entry && (
                  <div className="bg-[#060A14]/75 p-3 rounded-2xl border border-white/[0.06] space-y-1.5 font-mono text-xs tabular-nums">
                    <div className="flex justify-between text-slate-400">
                      <span className="text-[11px]">Entry:</span>
                      <span className="text-white font-bold">{item.entry}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span className="text-[11px]">TP1 (1:1):</span>
                      <span className="font-bold">{item.tp1}</span>
                    </div>
                    <div className="flex justify-between text-teal-400">
                      <span className="text-[11px]">TP2 (1:2):</span>
                      <span className="font-bold">{item.tp2}</span>
                    </div>
                    <div className="flex justify-between text-rose-400 pt-1 border-t border-white/[0.06]">
                      <span className="text-[11px]">Stop Loss:</span>
                      <span className="font-bold">{item.sl}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => onSelectPair && onSelectPair(item)}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-600/50 hover:to-indigo-600/50 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-bold font-mono flex items-center justify-center space-x-1.5 transition active:scale-95 cursor-pointer shadow-sm shadow-blue-500/10"
                  >
                    <span>Analyze Terminal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  {onViewChart && (
                    <button
                      onClick={() => onViewChart(item)}
                      className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white text-xs font-mono transition border border-white/[0.08] cursor-pointer"
                      title="Open Chart View"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WatchlistConsole;
