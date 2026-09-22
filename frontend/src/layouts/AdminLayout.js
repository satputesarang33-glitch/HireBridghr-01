import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  Building,
  Users2,
  FileCheck2,
  ScrollText,
  ArrowLeft,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { cn } from '../utils/cn.js';

export function AdminLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const adminNav = [
    { label: 'Admin Metrics', path: '/admin', icon: ShieldAlert, exact: true },
    { label: 'Publication Queue', path: '/admin/job-publications', icon: FileCheck2 },
    { label: 'Organizations', path: '/admin/organizations', icon: Building },
    { label: 'Global Users', path: '/admin/users', icon: Users2 },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ScrollText },
  ];

  return (
    <div className="app-shell flex h-screen overflow-hidden text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Liquid Accent Glow */}
      <div className="liquid-glow-accent -top-20 -left-20 opacity-40 pointer-events-none" />

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={cn(
          'app-sidebar fixed lg:static inset-y-0 left-0 z-[60] p-4 flex flex-col justify-between border-r border-indigo-200/80 dark:border-indigo-500/20 bg-white/85 dark:bg-slate-950/90 overflow-y-auto max-h-screen',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between px-2 pt-1">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-glow-accent">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  Super<span className="text-indigo-600 dark:text-indigo-400">Admin</span>
                </span>
                <span className="block text-[9px] uppercase font-bold tracking-widest text-indigo-600 dark:text-indigo-400">
                  Platform Operations
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 min-w-[38px] min-h-[38px] flex items-center justify-center transition-colors"
              aria-label="Close admin sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30">
            <p className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300">System Operator</p>
            <p className="text-xs font-semibold text-slate-900 dark:text-white">{user?.name || 'Alex Mercer'}</p>
          </div>

          <nav className="flex flex-col gap-1">
            {adminNav.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'sidebar-link',
                    isActive && 'sidebar-link-active !border-indigo-500/40 !shadow-glow-accent'
                  )}
                >
                  <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex flex-col gap-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Recruiter ATS</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="glass-header h-16 px-4 sm:px-6 flex items-center justify-between z-20 flex-shrink-0 border-b border-indigo-200/80 dark:border-indigo-500/20">
          <div className="flex items-center gap-2.5 sm:gap-3 text-xs min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 -ml-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="hidden sm:inline text-slate-500 dark:text-slate-400">Platform Admin</span>
            <span className="hidden sm:inline text-slate-400 dark:text-slate-600">/</span>
            <span className="text-indigo-700 dark:text-indigo-300 font-semibold uppercase tracking-wider text-[11px] truncate">
              {location.pathname.replace('/admin', '').replace('/', '') || 'Overview'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-600" />}
            </button>
            <Link
              to="/dashboard"
              className="text-xs bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-500/40 px-3 py-1.5 rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              Recruiter ATS View
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
