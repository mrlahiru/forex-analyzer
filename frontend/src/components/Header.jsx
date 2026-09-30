import React from 'react';
import { Activity, Database, Server, User, Bell, ShieldCheck } from 'lucide-react';

export const Header = ({ healthInfo, isApiOnline, latency }) => {
  const isDbConnected = healthInfo?.database?.connected;

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Market Status */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                ForexAI
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                ANALYZER
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider block">
              PHASE 1 CORE ACTIVE
            </span>
          </div>
        </div>

        {/* Market Status Indicator */}
        <div className="hidden lg:flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Forex Market:</span>
          <span className="text-emerald-400 font-semibold">24h Interbank Active</span>
        </div>
      </div>

      {/* System Status Indicators & User Profile */}
      <div className="flex items-center space-x-3 md:space-x-5">
        {/* Backend API Status */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
          <Server className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 hidden sm:inline">API (Port 5001):</span>
          {isApiOnline ? (
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-emerald-400 font-semibold font-mono">
                ONLINE {latency ? `(${latency}ms)` : ''}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-rose-400 font-semibold">OFFLINE</span>
            </div>
          )}
        </div>

        {/* Database Status */}
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 hidden sm:inline">DB:</span>
          {isDbConnected ? (
            <span className="text-emerald-400 font-semibold font-mono">CONNECTED</span>
          ) : (
            <span className="text-amber-400 font-semibold font-mono" title="Add MONGODB_URI in .env when ready">
              STANDBY
            </span>
          )}
        </div>

        {/* Notification Bell */}
        <button
          className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white transition relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-700 text-slate-200">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left text-xs">
            <div className="font-semibold text-slate-200">Analyst Session</div>
            <div className="text-[10px] text-slate-400">Admin Mode</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
