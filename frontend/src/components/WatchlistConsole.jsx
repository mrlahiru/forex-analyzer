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
    <div className="rounded-2xl bg-[#0E1320] border border-slate-800 p-6 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Star className="w-5 h-5 fill-amber-400/20" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                Workspace
              </span>
              <h3 className="text-base font-bold text-white">
                Personalized Currency Watchlist
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pin and track high-priority forex pairs with instant deterministic scores, dynamic targets, and multi-timeframe alerts
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {['ALL', 'BUY', 'SELL', 'NO_TRADE'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg transition ${
                filter === f
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Available to Add Quick Bar */}
      {availablePairsToAdd.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/40 rounded-xl border border-slate-800/80 text-xs">
          <span className="text-slate-400 flex items-center space-x-1 text-[11px] font-mono mr-1">
            <Plus className="w-3 h-3 text-blue-400" />
            <span>Add to Watchlist:</span>
          </span>
          {availablePairsToAdd.map((p) => (
            <button
              key={p.pair}
              onClick={() => toggleWatchlist(p.pair)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 font-mono text-[11px] transition flex items-center space-x-1"
            >
              <span>{p.pair}</span>
              <Plus className="w-3 h-3 text-slate-400" />
            </button>
          ))}
        </div>
      )}

      {/* Pinned Pair Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/30 rounded-xl border border-slate-800/60 text-slate-400 space-y-2">
          <Star className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-sm">No pairs match the selected filter.</p>
          <p className="text-xs text-slate-500">Pin currency pairs above to curate your active watchlist.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isBuy = item.signal === 'BUY';
            const isSell = item.signal === 'SELL';
            const isPositive = (item.changePercent || 0) >= 0;
            const isSelected = selectedPair?.pair === item.pair;

            return (
              <div
                key={item.pair}
                className={`rounded-xl p-4 border transition-all relative space-y-3 ${
                  isSelected
                    ? 'bg-[#12192A] border-blue-500/50 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-base text-white">{item.pair}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {item.timeframe || '1h'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">{item.trend}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleWatchlist(item.pair)}
                      title="Remove from watchlist"
                      className="text-amber-400 hover:text-amber-300 transition"
                    >
                      <Star className="w-4 h-4 fill-amber-400" />
                    </button>
                  </div>
                </div>

                {/* Price & Change */}
                <div className="flex items-baseline justify-between pt-1">
                  <div className="font-mono text-lg font-bold text-white">
                    {typeof item.price === 'number'
                      ? item.price.toFixed(item.pair.includes('JPY') ? 2 : 5)
                      : item.price}
                  </div>
                  <div
                    className={`font-mono text-xs font-semibold flex items-center space-x-1 ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{isPositive ? '+' : ''}{(item.changePercent || 0).toFixed(2)}%</span>
                  </div>
                </div>

                {/* Signal Badge & Score */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                      isBuy
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isSell
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.signal?.replace('_', ' ')}
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-400">
                    Score: {item.score}/100
                  </span>
                </div>

                {/* Dynamic Levels Readout */}
                {item.entry && (
                  <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 space-y-1 font-mono text-[11px]">
                    <div className="flex justify-between text-slate-400">
                      <span>Entry:</span>
                      <span className="text-white font-semibold">{item.entry}</span>
                    </div>
                    <div className="flex justify-between text-emerald-400">
                      <span>TP1 (1:1):</span>
                      <span className="font-semibold">{item.tp1}</span>
                    </div>
                    <div className="flex justify-between text-teal-400">
                      <span>TP2 (1:2):</span>
                      <span className="font-semibold">{item.tp2}</span>
                    </div>
                    <div className="flex justify-between text-rose-400">
                      <span>SL:</span>
                      <span className="font-semibold">{item.sl}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => onSelectPair && onSelectPair(item)}
                    className="flex-1 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/30 text-xs font-semibold font-mono flex items-center justify-center space-x-1 transition"
                  >
                    <span>Analyze</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  {onViewChart && (
                    <button
                      onClick={() => onViewChart(item)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition"
                      title="Open Chart View"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
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
