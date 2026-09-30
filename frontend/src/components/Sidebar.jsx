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
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, badge: 'Master' },
  { id: 'markets', name: 'Markets', icon: TrendingUp, badge: 'Live' },
  { id: 'signals', name: 'Signals', icon: Radio, badge: '100-Pt' },
  { id: 'watchlist', name: 'Watchlist', icon: Star, badge: 'Custom' },
  { id: 'history', name: 'Signal History', icon: History, badge: 'Sec 15' },
  { id: 'backtesting', name: 'Backtesting', icon: TestTube2, badge: 'Quant' },
  { id: 'alerts', name: 'Alerts & Scanner', icon: BellRing, badge: 'Auto' },
  { id: 'deployment', name: 'Deployment', icon: Boxes, badge: 'Docker' },
  { id: 'settings', name: 'Settings', icon: Settings, badge: 'Config' },
];

export const Sidebar = ({ activeTab = 'dashboard', setActiveTab }) => {
  return (
    <aside className="w-64 border-r border-white/[0.07] bg-[#070A12]/90 backdrop-blur-xl flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16 z-20">
      <div className="p-4 space-y-1.5">
        <div className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
          <span>Command Center</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isCurrent = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab && setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                isCurrent
                  ? 'bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-transparent text-white border-l-2 border-l-blue-400 border-y border-r border-white/[0.06] shadow-lg shadow-blue-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40 hover:translate-x-0.5'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                    isCurrent ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="tracking-tight">{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold transition-colors ${
                    isCurrent
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                      : 'bg-slate-800/80 text-slate-400 border border-slate-700/40 group-hover:text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Safety Notice Footer Card */}
      <div className="p-4 m-3.5 rounded-2xl bg-gradient-to-b from-[#0F172A]/80 to-[#0A0F1D]/90 border border-amber-500/20 shadow-lg relative overflow-hidden card-shine">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center space-x-2 text-xs font-bold text-amber-400">
          <div className="p-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <span className="tracking-tight">Analytical Station</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mt-2">
          Signals are rule-based quantitative evaluations. Real trade broker execution is prohibited.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
