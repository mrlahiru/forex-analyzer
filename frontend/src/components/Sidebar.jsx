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
  { id: 'backtesting', name: 'Backtesting', icon: TestTube2, badge: 'Quant' },
  { id: 'alerts', name: 'Alerts & Scanner', icon: BellRing, badge: 'Auto' },
  { id: 'deployment', name: 'Deployment', icon: Boxes, badge: 'Docker' },
  { id: 'settings', name: 'Settings', icon: Settings, badge: 'Config' },
];

export const Sidebar = ({ activeTab = 'dashboard', setActiveTab }) => {
  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#090D16] flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isCurrent = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab && setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isCurrent
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/25 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isCurrent ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 border border-slate-700/50">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Safety Notice Footer Card */}
      <div className="p-4 m-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>Analytical Platform</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Signals are rule-based quantitative evaluations. Real trade execution is prohibited.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
