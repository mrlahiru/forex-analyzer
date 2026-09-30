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
                INSTITUTIONAL QUANTITATIVE TERMINAL — ACTIVE
              </span>
            </div>
          </div>

          {/* Market Data Provider Status */}
          <div className="hidden lg:flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-300">
            <Radio className={`w-3.5 h-3.5 ${isLive ? 'text-emerald-400 animate-pulse' : 'text-cyan-400'}`} />
            <span className="text-slate-400">Data Feed:</span>
            <span className={`font-semibold ${isLive ? 'text-emerald-400' : 'text-cyan-300'}`}>
              {isLive ? `Live (${activeProvider})` : 'Simulation Fallback'}
            </span>
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

          {/* User Profile / Auth State (Section 4 & 18) */}
          <div className="relative">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2.5 p-1.5 pr-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/80 transition-all text-xs cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-bold text-white shadow-sm">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="font-semibold text-slate-200 leading-tight">{currentUser.name || 'Trader'}</div>
                    <div className="text-[10px] text-blue-400 uppercase font-mono">{currentUser.role || 'PRO'}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 top-12 w-56 rounded-xl bg-[#0F1422] border border-slate-800 shadow-2xl p-3 space-y-3 z-50 animate-fade-in">
                    <div className="border-b border-slate-800/80 pb-2.5">
                      <div className="font-semibold text-xs text-slate-100">{currentUser.name}</div>
                      <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                      <div className="inline-flex items-center space-x-1 mt-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <ShieldCheck className="w-3 h-3 text-blue-400" />
                        <span>JWT AUTHENTICATED</span>
                      </div>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
                className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
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
