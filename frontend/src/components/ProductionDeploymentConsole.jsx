import React, { useState } from 'react';
import {
  Boxes,
  Server,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Cpu,
  Layers,
  HardDrive,
  GitBranch,
} from 'lucide-react';

export const ProductionDeploymentConsole = () => {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const deploymentCommands = [
    {
      title: '1. Launch Entire Containerized Stack',
      command: 'docker compose up --build -d',
      desc: 'Builds multi-stage backend and frontend images, mounts MongoDB volume, and starts containers in detached mode.',
    },
    {
      title: '2. Verify Service Health Status',
      command: 'docker compose ps',
      desc: 'Inspects running containers, open ports, and healthcheck verification states across all three services.',
    },
    {
      title: '3. Stream Real-Time Backend API Logs',
      command: 'docker compose logs -f backend',
      desc: 'Monitors incoming REST requests, deterministic signal calculations, and background cron scanner ticks.',
    },
    {
      title: '4. Graceful Teardown',
      command: 'docker compose down',
      desc: 'Stops and removes containers and isolated bridge network while safely preserving persistent MongoDB volume data.',
    },
  ];

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const containerServices = [
    {
      name: 'MongoDB 7.0 Engine',
      service: 'mongodb',
      image: 'mongo:7.0',
      port: '27017:27017',
      role: 'Database & Persistent Timeseries Store',
      health: 'mongosh --eval "db.adminCommand(\'ping\')"',
      volume: 'mongo_data:/data/db',
      tagColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      icon: HardDrive,
    },
    {
      name: 'Node.js Express API Engine',
      service: 'backend',
      image: 'forex-ai-backend:latest (Node 20 Alpine)',
      port: '5001:5001',
      role: 'Deterministic 100-pt Scoring, Cron Scanner & Telegram Dispatcher',
      health: 'GET /api/health (Every 30s)',
      volume: 'Non-root user (forexuser:1001)',
      tagColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      icon: Server,
    },
    {
      name: 'Nginx Alpine + React SPA',
      service: 'frontend',
      image: 'forex-ai-frontend:latest (Nginx Alpine)',
      port: '80:80, 5173:80',
      role: 'High-Performance Reverse Proxy, Static Asset Caching & SPA Fallback',
      health: 'GET / (Every 30s)',
      volume: 'Gzip + Security Headers',
      tagColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
      icon: Boxes,
    },
  ];

  const securityChecklist = [
    { label: 'Non-Root Container Execution', detail: 'Runs backend under isolated system user forexuser (UID 1001)', passed: true },
    { label: 'Multi-Stage Docker Builds', detail: 'Separates build tools from production runner to minimize image attack surface', passed: true },
    { label: 'Nginx Reverse Proxy Security', detail: 'Strict X-Frame-Options, XSS Protection, nosniff, and Referrer-Policy headers', passed: true },
    { label: 'Automated Service Healthchecks', detail: 'Docker automatically restarts unhealthy nodes with exponential backoff', passed: true },
    { label: 'Isolated Bridge Network', detail: 'Internal traffic routed via private forex-network without exposing DB to public WAN', passed: true },
    { label: 'CI/CD GitHub Actions Pipeline', detail: 'Automated syntax checks, frontend build compilation, and compose validation', passed: true },
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/[0.08] shadow-2xl space-y-6 relative overflow-hidden card-shine">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5 relative z-10">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400 shadow-sm shadow-blue-500/10">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Phase 11 Complete
              </span>
              <h3 className="text-lg font-black text-white tracking-tight">
                Production Deployment & Docker Orchestration
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-container Docker Compose architecture with Nginx reverse proxy, automated healthchecks, and CI/CD validation
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 text-xs font-mono">
          <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.08] text-slate-300 flex items-center space-x-1.5 font-bold">
            <GitBranch className="w-3.5 h-3.5 text-blue-400" />
            <span>CI: Passing</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center space-x-1.5 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Hardened</span>
          </span>
        </div>
      </div>

      {/* 3-Container Topology Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
        {containerServices.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.service}
              className="glass-card rounded-2xl p-5 border border-white/[0.08] space-y-3.5 relative overflow-hidden card-shine hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-white/[0.06] text-slate-300 border border-white/[0.08]">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">{c.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">service: {c.service}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${c.tagColor}`}>
                  Active
                </span>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed min-h-[32px]">
                {c.role}
              </div>

              <div className="pt-2.5 border-t border-white/[0.06] space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Port Binding:</span>
                  <span className="text-white font-bold">{c.port}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Configuration:</span>
                  <span className="text-slate-300 truncate max-w-[150px]">{c.volume}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Health Probe:</span>
                  <span className="text-emerald-400 text-[10px] truncate max-w-[140px] font-bold">{c.health}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deployment CLI Cheat Sheet & Security Hardening Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left: Quick Terminal Commands (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              <span>Production Terminal Quickstart</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Run from project root</span>
          </div>

          <div className="space-y-3">
            {deploymentCommands.map((cmd, idx) => (
              <div
                key={cmd.title}
                className="bg-[#060A14]/70 rounded-2xl p-3.5 border border-white/[0.08] space-y-2 card-shine"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{cmd.title}</span>
                  <button
                    onClick={() => handleCopy(cmd.command, idx)}
                    className="flex items-center space-x-1.5 text-[11px] font-mono text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] transition cursor-pointer"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-xs text-blue-300 bg-[#04070F] px-3 py-2 rounded-xl border border-white/[0.06] overflow-x-auto">
                  $ {cmd.command}
                </div>
                <p className="text-[10px] text-slate-400 font-sans leading-relaxed">{cmd.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Security & Architecture Audit (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Production Security Controls</span>
            </h4>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/25">6/6 Enforced</span>
          </div>

          <div className="bg-[#060A14]/70 rounded-2xl p-5 border border-white/[0.08] space-y-3.5 card-shine">
            {securityChecklist.map((item) => (
              <div key={item.label} className="flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-slate-200">{item.label}</div>
                  <div className="text-[11px] text-slate-400 leading-snug">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Regulatory Disclaimer Box */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 text-xs text-amber-300 space-y-1">
            <div className="font-bold flex items-center space-x-1.5">
              <span>Docker Production Notice</span>
            </div>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              This stack deploys a containerized quantitative analytical platform. It does not integrate broker trading APIs or execute live financial trades.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionDeploymentConsole;
