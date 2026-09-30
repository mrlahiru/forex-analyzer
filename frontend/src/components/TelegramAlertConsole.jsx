import React, { useState } from 'react';
import {
  Send,
  Bell,
  CheckCircle2,
  Clock,
  Radio,
  Sliders,
  ShieldCheck,
  RefreshCw,
  Zap,
  Target,
  AlertTriangle,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

export const TelegramAlertConsole = ({
  status = null,
  onSendTest = () => {},
  onUpdatePreferences = () => {},
  loading = false,
}) => {
  const [testSentToast, setTestSentToast] = useState(false);
  const [selectedAlertIdx, setSelectedAlertIdx] = useState(0);

  const isConfigured = status?.isConfigured;
  const preferences = status?.preferences || {
    enabled: true,
    notifyNewSignals: true,
    notifyTp1: true,
    notifyTp2: true,
    notifyTp3: true,
    notifyStopLoss: true,
  };

  const recentAlerts = status?.recentAlerts || [];
  const activeAlert = recentAlerts[selectedAlertIdx] || recentAlerts[0];

  const handleTestClick = async () => {
    await onSendTest();
    setTestSentToast(true);
    setTimeout(() => setTestSentToast(false), 4000);
  };

  const handleToggle = (key) => {
    onUpdatePreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/[0.08] shadow-2xl space-y-6 relative overflow-hidden card-shine">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5 relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 shadow-sm shadow-cyan-500/10">
            <Send className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white flex items-center space-x-2 tracking-tight">
              <span>Telegram Notifications & Institutional Alerts</span>
            </h3>
            <p className="text-xs text-slate-400">
              Automated signal broadcasts, milestone target alerts, and disciplined stop loss execution notices
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Connection Status Badge */}
          <div className="flex items-center space-x-2 text-xs font-mono px-3.5 py-1.5 rounded-xl border bg-black/40 border-white/[0.08]">
            <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400' : 'bg-cyan-400'}`}></span>
            <span className={isConfigured ? 'text-emerald-400 font-bold' : 'text-cyan-400 font-bold'}>
              {isConfigured ? 'Bot Live: Connected' : 'Simulated Dispatch Active'}
            </span>
          </div>

          {/* Send Test Alert Button */}
          <button
            onClick={handleTestClick}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/40 hover:to-blue-600/40 text-xs font-mono font-bold text-cyan-300 hover:text-white border border-cyan-500/40 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm shadow-cyan-500/10"
          >
            <Send className={`w-3.5 h-3.5 ${loading ? 'animate-pulse' : ''}`} />
            <span>{loading ? 'Sending...' : 'Send Test Alert'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {testSentToast && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 p-3.5 rounded-2xl flex items-center justify-between text-xs text-emerald-300 font-mono animate-fade-in relative z-10 shadow-lg shadow-emerald-500/10">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">Telegram alert test successfully dispatched and archived in real-time stream!</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30">Delivered</span>
        </div>
      )}

      {/* Alert Preferences Controls Strip */}
      <div className="bg-[#060A14]/70 p-4.5 rounded-2xl border border-white/[0.08] space-y-3.5 relative z-10 card-shine">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Broadcast Subscriptions & Event Filters</span>
          </h4>
          <span className="text-[11px] font-mono text-slate-400 font-semibold">
            Instant Dispatch &bull; Cooldown Guard Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
          {/* New Signals */}
          <label className="flex items-center space-x-2.5 bg-black/40 p-3 rounded-xl border border-white/[0.06] cursor-pointer hover:border-white/20 transition">
            <input
              type="checkbox"
              checked={preferences.notifyNewSignals}
              onChange={() => handleToggle('notifyNewSignals')}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-slate-300 text-[11px] font-semibold">New Signals</span>
          </label>

          {/* TP1 */}
          <label className="flex items-center space-x-2.5 bg-black/40 p-3 rounded-xl border border-white/[0.06] cursor-pointer hover:border-white/20 transition">
            <input
              type="checkbox"
              checked={preferences.notifyTp1}
              onChange={() => handleToggle('notifyTp1')}
              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span className="text-emerald-400 text-[11px] font-semibold">TP1 (1:1.0)</span>
          </label>

          {/* TP2 */}
          <label className="flex items-center space-x-2.5 bg-black/40 p-3 rounded-xl border border-white/[0.06] cursor-pointer hover:border-white/20 transition">
            <input
              type="checkbox"
              checked={preferences.notifyTp2}
              onChange={() => handleToggle('notifyTp2')}
              className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-0"
            />
            <span className="text-teal-400 text-[11px] font-semibold">TP2 (1:2.0)</span>
          </label>

          {/* TP3 */}
          <label className="flex items-center space-x-2.5 bg-black/40 p-3 rounded-xl border border-white/[0.06] cursor-pointer hover:border-white/20 transition">
            <input
              type="checkbox"
              checked={preferences.notifyTp3}
              onChange={() => handleToggle('notifyTp3')}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-cyan-400 text-[11px] font-semibold">TP3 (1:3.0)</span>
          </label>

          {/* Stop Loss */}
          <label className="flex items-center space-x-2.5 bg-black/40 p-3 rounded-xl border border-white/[0.06] cursor-pointer hover:border-white/20 transition col-span-2 sm:col-span-1">
            <input
              type="checkbox"
              checked={preferences.notifyStopLoss}
              onChange={() => handleToggle('notifyStopLoss')}
              className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0"
            />
            <span className="text-rose-400 text-[11px] font-semibold">Stop Loss Hits</span>
          </label>
        </div>
      </div>

      {/* Main Two-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Dispatched Alerts Feed (6 cols) */}
        <div className="lg:col-span-6 space-y-3 bg-[#060A14]/70 p-4.5 rounded-2xl border border-white/[0.08] flex flex-col card-shine">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span>Broadcast Activity Stream</span>
            </h4>
            <span className="text-[11px] font-mono text-slate-400 font-semibold">
              {recentAlerts.length} Alerts Dispatched
            </span>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1 flex-1">
            {recentAlerts.map((alert, idx) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlertIdx(idx)}
                className={`p-3.5 rounded-xl border cursor-pointer transition text-xs font-mono space-y-2 tabular-nums ${
                  selectedAlertIdx === idx
                    ? 'bg-blue-950/30 border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                    : 'bg-black/40 border-white/[0.06] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">
                      {alert.metadata?.pair || 'SYSTEM'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      {alert.metadata?.eventType?.replace('_', ' ') || 'BROADCAST'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed font-sans">
                  {alert.preview}
                </p>

                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1.5 border-t border-white/[0.04]">
                  <span>Channel: <b className="text-slate-300">{alert.channel}</b></span>
                  <span className="text-emerald-400 font-semibold">&bull; Delivered</span>
                </div>
              </div>
            ))}

            {recentAlerts.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs italic">
                Awaiting upcoming notifications. Run a market scan or click 'Send Test Alert'.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Telegram Mobile Chat Preview (6 cols) */}
        <div className="lg:col-span-6 bg-[#060A14]/70 p-4.5 rounded-2xl border border-white/[0.08] flex flex-col space-y-3 card-shine">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>Telegram Mobile Client Preview</span>
            </h4>
            <span className="text-[10px] font-mono text-cyan-400 flex items-center space-x-1 font-semibold">
              <span>Live Render</span>
            </span>
          </div>

          {/* Telegram Phone Window Simulation */}
          <div className="flex-1 bg-[#121A24] rounded-2xl border border-white/[0.08] p-4 flex flex-col justify-between shadow-2xl min-h-[340px]">
            {/* Top Telegram Chat Header */}
            <div className="flex items-center space-x-2.5 pb-2.5 border-b border-white/[0.08]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-white text-xs shadow-sm shadow-blue-500/20">
                FX
              </div>
              <div>
                <div className="text-xs font-bold text-white">ForexAI Signals Bot</div>
                <div className="text-[10px] text-cyan-400">bot &bull; official signal feed</div>
              </div>
            </div>

            {/* Telegram Message Bubble */}
            <div className="my-auto py-3">
              <div className="bg-[#1E3A5F] rounded-2xl p-4 max-w-[95%] shadow-lg space-y-2 border border-blue-400/20">
                <div
                  className="text-xs text-white leading-relaxed font-sans prose prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: activeAlert?.html || '<p>No alert selected. Click an alert in the activity stream.</p>',
                  }}
                />
                <div className="text-[9px] text-blue-200/60 text-right font-mono tabular-nums">
                  {new Date(activeAlert?.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                </div>
              </div>
            </div>

            {/* Simulated Input Bar */}
            <div className="pt-2.5 border-t border-white/[0.08] flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="text-[11px] text-slate-500">Broadcast channel (read-only)</span>
              <span className="text-[10px] text-cyan-400 font-semibold">Real-time alerts active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramAlertConsole;
