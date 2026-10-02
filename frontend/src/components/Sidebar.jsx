import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Radio,
  Star,
  History,
  TestTube2,
  BellRing,
  Settings,
  ShieldAlert,
  Boxes,
  Terminal,
  Activity,
  Cpu,
  Zap,
} from 'lucide-react';

const navGroups = [
  {
    title: 'CORE WORKSPACE',
    items: [
      { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, badge: 'Master', color: 'blue' },
      { id: 'markets', name: 'Markets & Chart', icon: TrendingUp, badge: 'Live', color: 'emerald' },
      { id: 'signals', name: 'Deterministic Signals', icon: Radio, badge: '100-Pt', color: 'indigo' },
    ],
  },
  {
    title: 'QUANT & AUDIT',
    items: [
      { id: 'watchlist', name: 'Watchlist', icon: Star, badge: 'Custom', color: 'amber' },
      { id: 'history', name: 'Signal History', icon: History, badge: 'Audited', color: 'cyan' },
      { id: 'backtesting', name: 'Backtesting Engine', icon: TestTube2, badge: 'Sim', color: 'purple' },
    ],
  },
  {
    title: 'SYSTEM & ENGINES',
    items: [
      { id: 'alerts', name: 'Scanner & Telegram', icon: BellRing, badge: 'Auto', color: 'teal' },
      { id: 'deployment', name: 'Docker Deploy', icon: Boxes, badge: 'Cluster', color: 'blue' },
      { id: 'settings', name: 'Preferences', icon: Settings, badge: 'Config', color: 'slate' },
    ],
  },
];

export const Sidebar = ({ activeTab = 'dashboard', setActiveTab }) => {
  return (
    <aside className="w-64 border-r border-white/[0.08] bg-[#060911]/95 backdrop-blur-2xl flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 z-20 overflow-y-auto overflow-x-hidden thin-scrollbar">
      <div className="p-3.5 space-y-4">
        {/* Command Center Main Deck Header */}
        <div
          onClick={() => setActiveTab && setActiveTab('dashboard')}
          className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/60 via-indigo-950/40 to-[#060A14] border border-blue-500/30 card-shine relative overflow-hidden shadow-xl shadow-blue-950/30 cursor-pointer group hover:border-blue-400/50 transition-all duration-300"
        >
          {/* Corner Cyber HUD Accents */}
          <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-cyan-400/60 pointer-events-none" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-cyan-400/60 pointer-events-none" />
          <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-cyan-400/60 pointer-events-none" />
          <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-cyan-400/60 pointer-events-none" />

          {/* Top animated cyber line */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Terminal className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-black text-white tracking-wider uppercase group-hover:text-blue-300 transition-colors">
                    Command Center
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-[10px] font-mono text-cyan-400 font-semibold tracking-tight">MISSION CONTROL // V2.4</p>
              </div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[9px] font-mono relative z-10">
            <span className="text-slate-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>100-PT QUANT</span>
            </span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              ACTIVE
            </span>
          </div>
        </div>

        {/* Categorized Navigation Groups */}
        <div className="space-y-4">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              <div className="px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
                <span>{group.title}</span>
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
              </div>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isCurrent = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab && setActiveTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group relative cursor-pointer ${
                        isCurrent
                          ? 'bg-gradient-to-r from-blue-600/25 via-indigo-600/15 to-transparent text-white border-l-2 border-l-blue-400 border-y border-r border-white/[0.08] shadow-lg shadow-blue-500/15'
                          : 'text-slate-400 hover:text-white hover:bg-white/[0.05] hover:translate-x-1'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`p-1 rounded-lg transition-transform duration-200 group-hover:scale-110 ${
                            isCurrent
                              ? 'bg-blue-500/20 text-blue-300 shadow-sm shadow-blue-500/20'
                              : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="tracking-tight whitespace-nowrap">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold transition-all ${
                            isCurrent
                              ? 'bg-blue-500/25 text-blue-300 border border-blue-400/40 shadow-sm shadow-blue-500/20'
                              : 'bg-white/[0.04] text-slate-400 border border-white/[0.06] group-hover:text-slate-300 group-hover:border-white/10'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Area: Live Telemetry Widget & Safety Station */}
      <div className="p-3.5 space-y-3 border-t border-white/[0.06] bg-black/20">
        {/* Live System Telemetry Strip */}
        <div className="p-3 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2 font-mono text-[10px] card-shine">
          <div className="flex items-center justify-between text-slate-400 font-bold uppercase tracking-wider text-[9px]">
            <span className="flex items-center space-x-1.5 text-slate-300">
              <Activity className="w-3 h-3 text-cyan-400" />
              <span>Telemetry Feed</span>
            </span>
            <span className="text-emerald-400 flex items-center space-x-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIVE</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1.5 border-t border-white/[0.04]">
            <div className="space-y-0.5">
              <span className="text-slate-400 block text-[9px]">WS TICK STREAM</span>
              <span className="text-emerald-400 font-bold">2s Interval</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-slate-400 block text-[9px]">RISK CEILING</span>
              <span className="text-amber-400 font-bold">1.0% Max SL</span>
            </div>
          </div>
        </div>

        {/* Safety Notice Footer Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#0F172A]/80 to-[#0A0F1D]/90 border border-amber-500/25 shadow-lg relative overflow-hidden card-shine">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center space-x-2 text-xs font-black text-amber-400">
            <div className="p-1 rounded-lg bg-amber-500/15 border border-amber-500/25">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <span className="tracking-tight uppercase text-[10px]">Analytical Station</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed mt-2 font-medium">
            Rule-based quantitative evaluations. Real trade execution is prohibited.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
