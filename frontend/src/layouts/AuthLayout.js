import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Building2, ShieldCheck, Sparkles, Zap } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-brand-500/30 selection:text-brand-200">
      {/* Radiant Ambient liquid background glows */}
      <div className="liquid-glow-brand top-10 left-10 opacity-70" />
      <div className="liquid-glow-accent bottom-10 right-10 opacity-60" />

      {/* Auth Top Header */}
      <header className="p-6 flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-600 flex items-center justify-center text-white shadow-glow-brand">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            Hirebridge<span className="text-brand-500">HR</span>
          </span>
        </Link>
        <Link to="/" className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          &larr; Back to Platform Home
        </Link>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Pitch (Hidden on mobile) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col gap-6 pr-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-brand-200 dark:border-brand-500/30 text-xs font-semibold text-brand-700 dark:text-brand-300 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
              <span>Multi-Tenant Enterprise ATS & Distribution</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Recruit faster. <br />
              <span className="bg-gradient-to-r from-brand-600 via-cyan-600 to-accent-600 bg-clip-text text-transparent">
                Collaborate with clarity.
              </span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md">
              Designed for high-performance recruitment agencies, staffing firms, and corporate talent teams. Complete candidate tracking, automated interview scheduling, and intelligent job distribution.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="glass-panel p-3.5 rounded-xl border border-white/80 dark:border-white/10 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Strict Tenant Isolation</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Enterprise RBAC & secure candidate vaults</p>
                </div>
              </div>
              <div className="glass-panel p-3.5 rounded-xl border border-white/80 dark:border-white/10 flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-brand-500 dark:text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Instant Distribution</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Multi-channel publication workflow</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="w-full lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md glass-panel rounded-2xl p-6 sm:p-8 border border-white/80 dark:border-white/15 shadow-glass-lg">
              <Outlet />
            </div>
          </div>
        </div>
      </main>

      {/* Auth Footer */}
      <footer className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 z-10">
        &copy; {new Date().getFullYear()} HirebridgeHR SaaS. All rights reserved. &bull; Enterprise Grade Recruitment Architecture
      </footer>
    </div>
  );
}
