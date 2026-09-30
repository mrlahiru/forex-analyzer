import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Key,
  Database,
  Radio,
  Sliders,
  DollarSign,
  Percent,
  Clock,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Cpu,
} from 'lucide-react';

export const SettingsConsole = ({
  healthInfo,
  providerStatus,
  defaultBalance = 1000,
  defaultRisk = 1.0,
  onSavePreferences,
}) => {
  const [balance, setBalance] = useState(defaultBalance);
  const [riskPct, setRiskPct] = useState(defaultRisk);
  const [defaultTf, setDefaultTf] = useState('1h');
  const [autoRefreshRate, setAutoRefreshRate] = useState(30);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    if (onSavePreferences) {
      onSavePreferences({ balance, riskPct, defaultTf, autoRefreshRate });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    setBalance(1000);
    setRiskPct(1.0);
    setDefaultTf('1h');
    setAutoRefreshRate(30);
  };

  const isDbConnected = healthInfo?.database?.status === 'connected';

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/[0.08] shadow-2xl space-y-6 relative overflow-hidden card-shine">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5 relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-purple-600/15 border border-purple-500/30 text-purple-400 shadow-sm shadow-purple-500/10">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30">
                Workspace
              </span>
              <h3 className="text-lg font-black text-white tracking-tight">
                Platform Preferences & System Configuration
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage risk parameters, connected market data feeds, AI synthesis models, and alert thresholds
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-400 hover:text-white border border-white/[0.08] text-xs font-mono transition flex items-center space-x-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold font-mono transition flex items-center space-x-1.5 shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left: Risk & Account Defaults (6 cols) */}
        <div className="lg:col-span-6 space-y-4 bg-[#060A14]/70 p-5 rounded-2xl border border-white/[0.08] card-shine">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2 border-b border-white/[0.06] pb-2.5">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Default Risk & Sizing Parameters</span>
          </h4>

          {/* Account Balance */}
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 flex justify-between font-semibold">
              <span>Default Simulation Balance</span>
              <span className="font-mono text-white font-black">${balance.toLocaleString()}</span>
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="number"
                min="100"
                step="500"
                value={balance}
                onChange={(e) => setBalance(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#080D1A] border border-white/[0.08] text-sm font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Risk Percentage */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs text-slate-400 flex justify-between font-semibold">
              <span>Risk Percentage Per Setup</span>
              <span className="font-mono text-amber-400 font-black">{riskPct}%</span>
            </label>
            <div className="relative">
              <Percent className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="number"
                min="0.5"
                max="5.0"
                step="0.5"
                value={riskPct}
                onChange={(e) => setRiskPct(Number(e.target.value))}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#080D1A] border border-white/[0.08] text-sm font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Preserves capital by sizing lots so that hitting the Stop Loss loses no more than {riskPct}% of balance.
            </p>
          </div>

          {/* Default Timeframe */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs text-slate-400 flex justify-between font-semibold">
              <span>Default Analysis Timeframe</span>
              <span className="font-mono text-blue-400 font-bold">{defaultTf}</span>
            </label>
            <div className="grid grid-cols-4 gap-2 font-mono text-xs">
              {['15m', '30m', '1h', '4h'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setDefaultTf(tf)}
                  className={`py-2 rounded-xl border text-center transition cursor-pointer font-bold ${
                    defaultTf === tf
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                      : 'bg-black/40 text-slate-400 border-white/[0.06] hover:text-white hover:border-white/20'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: API Connectivity & Integrations (6 cols) */}
        <div className="lg:col-span-6 space-y-4 bg-[#060A14]/70 p-5 rounded-2xl border border-white/[0.08] card-shine">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2 border-b border-white/[0.06] pb-2.5">
            <Key className="w-4 h-4 text-blue-400" />
            <span>Active Integrations & Provider Connectivity</span>
          </h4>

          <div className="space-y-3 font-mono text-xs">
            {/* Market Data */}
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">Market Data Layer</span>
                <span className="text-[10px] text-slate-400">Yahoo Finance (Free/Unlimited) + Twelve Data Eco</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Operational
              </span>
            </div>

            {/* OpenAI Synthesis */}
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">OpenAI Synthesis Engine</span>
                <span className="text-[10px] text-slate-400">GPT-4o-mini / Fallback Synthesis</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                Ready
              </span>
            </div>

            {/* Telegram Alerts */}
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">Telegram Alert Bot</span>
                <span className="text-[10px] text-slate-400">Live Bot + In-App Simulation Console</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                Armed
              </span>
            </div>

            {/* MongoDB Connection */}
            <div className="bg-black/40 p-3.5 rounded-xl border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-slate-200 font-bold block">MongoDB Database</span>
                <span className="text-[10px] text-slate-400">Signal Persistence & Timeseries Store</span>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  isDbConnected
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                }`}
              >
                {isDbConnected ? 'Connected' : 'Fallback / Memory'}
              </span>
            </div>
          </div>

          {/* Safety & Compliance Box */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start space-x-2.5 text-xs text-amber-300">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <p className="text-[11px] leading-relaxed">
              <b>Regulatory Guardrail:</b> ForexAI Analyzer is strictly an analytical calculation and signal generation suite. No live broker execution or automated order placement is permitted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsConsole;
