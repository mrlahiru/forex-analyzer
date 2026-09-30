import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  Zap,
} from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

export const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await loginUser({ email, password });
        if (res.success) {
          setSuccessMsg('Logged in successfully');
          if (onAuthSuccess) onAuthSuccess(res.data.user);
          setTimeout(() => onClose(), 600);
        } else {
          setError(res.error || 'Failed to authenticate');
        }
      } else {
        const res = await registerUser({ name, email, password });
        if (res.success) {
          setSuccessMsg('Account created successfully');
          if (onAuthSuccess) onAuthSuccess(res.data.user);
          setTimeout(() => onClose(), 600);
        } else {
          setError(res.error || 'Failed to register account');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    const res = await loginUser({
      email: 'trader@forexai.local',
      password: 'ForexAI@2026',
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Connected as Demo Institutional Trader');
      if (onAuthSuccess) onAuthSuccess(res.data.user);
      setTimeout(() => onClose(), 600);
    } else {
      setError(res.error || 'Demo login failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      {/* Background ambient radial glow */}
      <div className="absolute w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl bg-[#090E1A]/95 border border-white/[0.12] shadow-2xl overflow-hidden card-shine">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.08] bg-black/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm shadow-blue-500/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight">ForexAI Access Control</h3>
              <p className="text-xs text-slate-400">JWT Authenticated Institutional Terminal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-black/40 border-b border-white/[0.06] text-xs font-mono">
          <button
            type="button"
            onClick={() => { setTab('login'); setError(''); }}
            className={`py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); }}
            className={`py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center space-x-2.5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center space-x-2.5 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {tab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#060A14] border border-white/[0.08] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-slate-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="name@institution.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#060A14] border border-white/[0.08] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#060A14] border border-white/[0.08] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-slate-600 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold font-mono shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 active:scale-95"
          >
            {tab === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{loading ? 'Processing...' : tab === 'login' ? 'Sign In to Terminal' : 'Create Account'}</span>
          </button>

          {/* Quick Demo Trader Login */}
          <div className="pt-2 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-cyan-300 text-xs font-mono font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>One-Click Demo Trader Login</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
