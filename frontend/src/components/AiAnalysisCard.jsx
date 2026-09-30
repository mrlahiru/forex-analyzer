import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Target,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Clock,
  Zap,
  Info,
} from 'lucide-react';

export const AiAnalysisCard = ({
  aiData = null,
  loading = false,
  onRefresh = () => {},
  pair = 'EUR/USD',
  timeframe = '1h',
}) => {
  const isBuy = aiData?.direction === 'BUY';
  const isSell = aiData?.direction === 'SELL';
  const isNoTrade = aiData?.direction === 'NO_TRADE';

  return (
    <div className="rounded-2xl bg-[#0E1320] border border-blue-500/40 p-6 space-y-6 relative overflow-hidden shadow-2xl">
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 text-blue-400">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Phase 7 OpenAI Intelligence & Setup Synthesis:</span>
              <span className="text-blue-400 font-mono">{pair} ({timeframe})</span>
            </h3>
            <p className="text-xs text-slate-400">
              Institutional technical justification, scenario risks, and algorithmic invalidation parameters
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Provider Badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-mono font-semibold bg-slate-900 border border-slate-800 text-slate-300">
            <Bot className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-300">{aiData?.provider || 'ForexAI Synthesis'}</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition active:scale-95 disabled:opacity-50"
            title="Re-run AI Synthesis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            <span>{loading ? 'Synthesizing...' : 'Regenerate'}</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && !aiData && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-xs font-mono text-slate-400">
            Synthesizing technical indicators, MTF consensus, and dynamic levels...
          </p>
        </div>
      )}

      {/* Content Body */}
      {aiData && (
        <div className="space-y-6 relative z-10">
          {/* 1. Executive Summary & Direction Callout */}
          <div className={`p-4 rounded-xl border relative overflow-hidden ${
            isBuy
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
              : isSell
              ? 'bg-rose-950/20 border-rose-500/40 text-rose-100'
              : 'bg-slate-900/50 border-slate-800 text-slate-200'
          }`}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border ${
                    isBuy
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : isSell
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {aiData.direction} &bull; {aiData.score}/100
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Confidence: <b>{aiData.confidence}</b>
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-200 pt-1">
                  {aiData.executiveSummary}
                </p>
              </div>

              {/* Timestamp */}
              <div className="hidden sm:flex items-center space-x-1 text-[11px] font-mono text-slate-500 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(aiData.generatedAt || Date.now()).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* 2. Structured Key Levels Strip */}
          {aiData.keyLevels && (aiData.keyLevels.entry || aiData.keyLevels.stopLoss) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 font-mono text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase block">Entry Anchor</span>
                <span className="text-white font-bold">{aiData.keyLevels.entry || '—'}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-emerald-500/30 space-y-0.5">
                <span className="text-[10px] text-emerald-400 uppercase block">TP1 (1:1.0)</span>
                <span className="text-emerald-300 font-bold">{aiData.keyLevels.tp1 || '—'}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-teal-500/30 space-y-0.5">
                <span className="text-[10px] text-teal-400 uppercase block">TP2 (1:2.0)</span>
                <span className="text-teal-300 font-bold">{aiData.keyLevels.tp2 || '—'}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-cyan-500/30 space-y-0.5">
                <span className="text-[10px] text-cyan-400 uppercase block">TP3 (1:3.0)</span>
                <span className="text-cyan-300 font-bold">{aiData.keyLevels.tp3 || '—'}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-rose-500/30 space-y-0.5">
                <span className="text-[10px] text-rose-400 uppercase block">Stop Loss</span>
                <span className="text-rose-300 font-bold">{aiData.keyLevels.stopLoss || '—'}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-blue-500/30 space-y-0.5">
                <span className="text-[10px] text-blue-400 uppercase block">Risk Ratio</span>
                <span className="text-blue-300 font-bold">
                  {typeof aiData.keyLevels.riskRewardRatio === 'object'
                    ? '1:1 / 1:2 / 1:3'
                    : aiData.keyLevels.riskRewardRatio}
                </span>
              </div>
            </div>
          )}

          {/* 3. Technical Justification & Scenario Risks Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Technical Justification (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Institutional Technical Justification</span>
              </h4>

              <div className="space-y-2.5">
                {aiData.technicalJustification?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2.5 text-xs text-slate-200 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Invalidation & Risks (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Invalidation Criteria */}
              <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-rose-400 font-semibold text-xs uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Setup Invalidation Condition</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {aiData.invalidationCondition || 'Sustained close beyond Stop Loss level.'}
                </p>
              </div>

              {/* Scenario Risks & Warnings */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <Info className="w-4 h-4 text-blue-400" />
                  <span>Scenario Risks & Trade Management</span>
                </h4>
                <div className="space-y-2">
                  {aiData.scenarioRisks?.map((risk, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/70 leading-relaxed flex items-start space-x-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4. Strict Risk Disclaimer */}
          <div className="p-3.5 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-start space-x-3 text-xs text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-slate-200 block text-[11px] uppercase tracking-wider">
                Regulatory & Risk Compliance Notice
              </span>
              <p className="text-[11px] leading-relaxed text-slate-400">
                {aiData.disclaimer ||
                  'This algorithmic analysis is generated for educational and analytical purposes only. It is not financial or trading advice. Past performance does not guarantee future results. Real trade execution is strictly prohibited.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiAnalysisCard;
