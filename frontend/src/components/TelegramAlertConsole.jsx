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
    <div className="rounded-2xl bg-[#0E1320] border border-blue-500/40 p-6 space-y-6 shadow-2xl relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400">
            <Send className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Phase 9 Telegram Notifications & Institutional Alerts</span>
            </h3>
            <p className="text-xs text-slate-400">
              Automated signal broadcasts, milestone target alerts, and disciplined stop loss execution notices
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Connection Status Badge */}
          <div className="flex items-center space-x-2 text-xs font-mono px-3 py-1.5 rounded-xl border bg-slate-900 border-slate-800">
            <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-emerald-400' : 'bg-cyan-400'}`}></span>
            <span className={isConfigured ? 'text-emerald-400' : 'text-cyan-400'}>
              {isConfigured ? 'Bot Live: Connected' : 'Simulated Dispatch Active'}
            </span>
          </div>

          {/* Send Test Alert Button */}
          <button
            onClick={handleTestClick}
            disabled={loading}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-xs font-semibold text-cyan-400 border border-cyan-500/40 transition active:scale-95 disabled:opacity-50"
          >
            <Send className={`w-3.5 h-3.5 ${loading ? 'animate-pulse' : ''}`} />
            <span>{loading ? 'Sending...' : 'Send Test Alert'}</span>
          </button>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {testSentToast && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-300 font-mono animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Telegram alert test successfully dispatched and archived in real-time stream!</span>
          </div>
          <span className="text-[11px] text-emerald-400/80">Delivered</span>
        </div>
      )}

      {/* Alert Preferences Controls Strip */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3 relative z-10">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Broadcast Subscriptions & Event Filters</span>
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            Instant Dispatch &bull; Cooldown Guard Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-xs">
          {/* New Signals */}
          <label className="flex items-center space-x-2 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700 transition">
            <input
              type="checkbox"
              checked={preferences.notifyNewSignals}
              onChange={() => handleToggle('notifyNewSignals')}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-slate-300 text-[11px]">New Signals</span>
          </label>

          {/* TP1 */}
          <label className="flex items-center space-x-2 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700 transition">
            <input
              type="checkbox"
              checked={preferences.notifyTp1}
              onChange={() => handleToggle('notifyTp1')}
              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span className="text-emerald-400 text-[11px]">TP1 (1:1.0)</span>
          </label>

          {/* TP2 */}
          <label className="flex items-center space-x-2 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700 transition">
            <input
              type="checkbox"
              checked={preferences.notifyTp2}
              onChange={() => handleToggle('notifyTp2')}
              className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-0"
            />
            <span className="text-teal-400 text-[11px]">TP2 (1:2.0)</span>
          </label>

          {/* TP3 */}
          <label className="flex items-center space-x-2 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700 transition">
            <input
              type="checkbox"
              checked={preferences.notifyTp3}
              onChange={() => handleToggle('notifyTp3')}
              className="rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <span className="text-cyan-400 text-[11px]">TP3 (1:3.0)</span>
          </label>

          {/* Stop Loss */}
          <label className="flex items-center space-x-2 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700 transition col-span-2 sm:col-span-1">
            <input
              type="checkbox"
              checked={preferences.notifyStopLoss}
              onChange={() => handleToggle('notifyStopLoss')}
              className="rounded bg-slate-900 border-slate-700 text-rose-500 focus:ring-0"
            />
            <span className="text-rose-400 text-[11px]">Stop Loss Hits</span>
          </label>
        </div>
      </div>

      {/* Main Two-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Dispatched Alerts Feed (6 cols) */}
        <div className="lg:col-span-6 space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Bell className="w-4 h-4 text-cyan-400" />
              <span>Broadcast Activity Stream</span>
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              {recentAlerts.length} Alerts Dispatched
            </span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1 flex-1">
            {recentAlerts.map((alert, idx) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlertIdx(idx)}
                className={`p-3 rounded-lg border cursor-pointer transition text-xs font-mono space-y-1.5 ${
                  selectedAlertIdx === idx
                    ? 'bg-slate-900 border-cyan-500/50 shadow-md ring-1 ring-cyan-500/20'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">
                      {alert.metadata?.pair || 'SYSTEM'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {alert.metadata?.eventType?.replace('_', ' ') || 'BROADCAST'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                  {alert.preview}
                </p>

                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                  <span>Channel: <b className="text-slate-400">{alert.channel}</b></span>
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
        <div className="lg:col-span-6 bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>Telegram Mobile Client Preview</span>
            </h4>
            <span className="text-[10px] font-mono text-cyan-400 flex items-center space-x-1">
              <span>Live Render</span>
            </span>
          </div>

          {/* Telegram Phone Window Simulation */}
          <div className="flex-1 bg-[#17212B] rounded-xl border border-slate-700/80 p-4 flex flex-col justify-between shadow-inner min-h-[340px]">
            {/* Top Telegram Chat Header */}
            <div className="flex items-center space-x-2.5 pb-2 border-b border-[#242F3D]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-white text-xs">
                FX
              </div>
              <div>
                <div className="text-xs font-bold text-white">ForexAI Signals Bot</div>
                <div className="text-[10px] text-cyan-400">bot &bull; official signal feed</div>
              </div>
            </div>

            {/* Telegram Message Bubble */}
            <div className="my-auto py-3">
              <div className="bg-[#2B5278] rounded-xl p-3.5 max-w-[95%] shadow-md space-y-2 border border-blue-400/20">
                <div
                  className="text-xs text-white leading-relaxed font-sans prose prose-invert"
                  dangerouslySetInnerHTML={{
                    __html: activeAlert?.html || '<p>No alert selected. Click an alert in the activity stream.</p>',
                  }}
                />
                <div className="text-[9px] text-blue-200/60 text-right font-mono">
                  {new Date(activeAlert?.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                </div>
              </div>
            </div>

            {/* Simulated Input Bar */}
            <div className="pt-2 border-t border-[#242F3D] flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="text-[11px] text-slate-500">Broadcast channel (read-only)</span>
              <span className="text-[10px] text-cyan-400">Real-time alerts active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelegramAlertConsole;
