import React, { useState, useEffect } from 'react';
import { Activity, Database, Server, User, Bell, Radio, LogIn, LogOut, ShieldCheck, ChevronDown } from 'lucide-react';
import AuthModal from './AuthModal';

export const Header = ({ healthInfo, isApiOnline, latency, providerStatus }) => {
  const isDbConnected = healthInfo?.database?.connected;
  const isLive = providerStatus?.isLive;
  const activeProvider = providerStatus?.activeProvider || 'twelve_data';

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('forexai_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('forexai_token');
    localStorage.removeItem('forexai_user');
    setCurrentUser(null);
    setShowProfileMenu(false);
  };

  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
  };

  return (
    <>
      <header className="h-16 border-b border-white/[0.08] bg-[#070B14]/85 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xl shadow-black/40 card-shine">
        {/* Brand & Market Status */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3.5 group cursor-pointer">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/25 border border-white/20 transition-transform group-hover:scale-105">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#070B14]"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  ForexAI
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                  TERMINAL PRO
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider block">
                INSTITUTIONAL QUANTITATIVE RADAR
              </span>
            </div>
          </div>

          {/* Market Data Provider Status */}
          <div className="hidden lg:flex items-center space-x-2.5 text-xs font-medium px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-white/[0.07] text-slate-300 shadow-inner">
            <div className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isLive ? 'bg-emerald-400' : 'bg-cyan-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isLive ? 'bg-emerald-500' : 'bg-cyan-500'}`}></span>
            </div>
            <span className="text-slate-400 text-[11px] uppercase tracking-wider font-mono">Feed:</span>
            <span className={`font-semibold text-xs ${isLive ? 'text-emerald-400' : 'text-cyan-300'}`}>
              {activeProvider === 'yahoo_finance'
                ? 'Yahoo Live (Free & Unlimited)'
                : activeProvider === 'twelve_data'
                ? 'Twelve Data (Eco Mode)'
                : 'Simulation Engine'}
            </span>
          </div>
        </div>

        {/* System Status Indicators & User Profile */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Backend API Status */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-white/[0.06] text-xs">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 hidden sm:inline text-[11px] font-mono">PORT 5001:</span>
            {isApiOnline ? (
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400 font-bold font-mono text-[11px] tabular-nums">
                  ACTIVE {latency ? `(${latency}ms)` : ''}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span className="text-rose-400 font-bold text-[11px]">OFFLINE</span>
              </div>
            )}
          </div>

          {/* Database Status */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/70 border border-white/[0.06] text-xs">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px] font-mono">DB:</span>
            {isDbConnected ? (
              <span className="text-emerald-400 font-bold font-mono text-[11px]">ONLINE</span>
            ) : (
              <span className="text-amber-400 font-semibold font-mono text-[11px]" title="Fallback in-memory database operational">
                STANDBY
              </span>
            )}
          </div>

          {/* User Profile / Auth State (Section 4 & 18) */}
          <div className="relative">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/[0.08] transition-all text-xs cursor-pointer shadow-md hover:border-blue-500/40"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white shadow-inner">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="font-semibold text-slate-200 leading-tight text-xs">{currentUser.name || 'Trader'}</div>
                    <div className="text-[10px] text-blue-400 uppercase font-mono">{currentUser.role || 'PRO'}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-56 rounded-2xl bg-[#0F1422] border border-slate-700/80 shadow-2xl p-3.5 space-y-3 z-50 animate-fade-in card-shine">
                    <div className="border-b border-slate-800/80 pb-2.5">
                      <div className="font-bold text-xs text-white">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                      <div className="inline-flex items-center space-x-1 mt-2 px-2 py-0.5 rounded-md text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <ShieldCheck className="w-3 h-3 text-blue-400" />
                        <span>JWT AUTHENTICATED</span>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 border border-blue-400/20 transition-all active:scale-95 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Header;
