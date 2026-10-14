import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Building2, ShieldCheck, Sparkles, Zap } from 'lucide-react';

export function AuthLayout() {
  return (
    <div className="auth-hub-layout min-h-screen text-slate-900 flex flex-col justify-between relative overflow-hidden">
      {/* Auth Top Header */}
      <header className="p-6 flex items-center justify-between z-10 border-b border-slate-200/80 bg-white/70 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Hirebridge<span className="text-brand-600">HR</span>
          </span>
        </Link>
        <Link to="/" className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
          &larr; Back to Platform Home
        </Link>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Pitch (Hidden on mobile) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col gap-5 pr-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Enterprise ATS & Distribution Hub</span>
            </div>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Recruit faster. <br />
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
                Collaborate with clarity.
              </span>
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md">
              Designed for high-performance recruitment agencies, staffing firms, and corporate talent teams. Complete candidate tracking, automated interview scheduling, and intelligent job distribution.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="auth-feature-card flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="auth-feature-title">Strict Tenant Isolation</p>
                  <p className="auth-feature-desc">Enterprise RBAC & candidate vaults</p>
                </div>
              </div>
              <div className="auth-feature-card flex items-start gap-2.5">
                <Zap className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="auth-feature-title">Instant Distribution</p>
                  <p className="auth-feature-desc">Multi-channel publication workflow</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="w-full lg:col-span-6 flex justify-center px-1 sm:px-0">
            <div className="w-full max-w-md auth-card-responsive auth-hub-card p-6 sm:p-8">
              <Outlet />
            </div>
          </div>
        </div>
      </main>

      {/* Auth Footer */}
      <footer className="p-6 text-center text-xs text-slate-500 border-t border-slate-200/80 bg-white/50 z-10">
        &copy; {new Date().getFullYear()} HirebridgeHR SaaS. All rights reserved. &bull; Enterprise Grade Recruitment Architecture
      </footer>
    </div>
  );
}
