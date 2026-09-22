import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  GitPullRequest,
  Calendar,
  BarChart3,
  Bell,
  Settings,
  ShieldAlert,
  LogOut,
  Sun,
  Moon,
  Search,
  Plus,
  ChevronRight,
  Menu,
  X,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { useNotifications } from '../hooks/useNotifications.js';
import { Button } from '../components/ui/Button.js';
import { cn } from '../utils/cn.js';

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, logout, switchUser, availableUsers } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Jobs', path: '/jobs', icon: Briefcase },
    { label: 'Candidates', path: '/candidates', icon: Users },
    { label: 'Applications', path: '/applications', icon: GitPullRequest },
    { label: 'Interviews', path: '/interviews', icon: Calendar },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  const secondaryNavItems = [
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  // Derive breadcrumb from pathname
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbTitle = pathSegments.length > 0
    ? pathSegments[pathSegments.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    : 'Dashboard';

  return (
    <div className="app-shell flex h-screen overflow-hidden text-slate-900 dark:text-slate-100 selection:bg-brand-500/30 selection:text-brand-200">
      {/* Background ambient liquid glows */}
      <div className="liquid-glow-brand -top-24 -left-24 opacity-60" />
      <div className="liquid-glow-accent top-1/3 -right-24 opacity-40" />

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-md lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside
        className={cn(
          'app-sidebar fixed lg:static inset-y-0 left-0 z-50 flex flex-col justify-between p-4',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col gap-6">
          {/* Brand Logo & Tenant */}
          <div className="flex items-center justify-between px-2 pt-1">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-accent-600 flex items-center justify-center text-white shadow-glow-brand group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Hirebridge<span className="text-brand-500">HR</span>
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
                  Enterprise ATS
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Tenant / Organization badge */}
          <div className="p-2.5 rounded-xl glass-panel border border-white/80 dark:border-white/10 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Organization</p>
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.organizationName || 'Apex Global Tech'}</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-500/20 dark:text-brand-300 dark:border-brand-500/30">
              {role}
            </span>
          </div>

          {/* Main Navigation Links */}
          <nav className="flex flex-col gap-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Recruitment Core
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn('sidebar-link', isActive && 'sidebar-link-active')}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-4 mb-1">
              System
            </p>
            {secondaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn('sidebar-link', isActive && 'sidebar-link-active')}
                >
                  <Icon className="w-4 h-4" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-brand-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Admin Portal Shortcut if user is Owner or Admin */}
            {(role === 'OWNER' || role === 'ADMIN' || role === 'SUPER_ADMIN') && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="sidebar-link mt-2 text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Operations</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Bottom User Area & Role Persona Switcher */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex flex-col gap-2">
          {/* Quick Role Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
              className="w-full text-left p-2 rounded-xl text-xs bg-white/70 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/90 dark:border-white/10 text-slate-700 dark:text-slate-300 flex items-center justify-between transition-colors shadow-sm dark:shadow-none"
              title="Test ATS under different recruiter & manager personas"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="truncate">Persona: <strong className="text-slate-900 dark:text-white">{role}</strong></span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleSwitcher && (
              <div className="absolute bottom-full left-0 mb-2 w-64 glass-panel rounded-2xl p-2 border border-white/80 dark:border-white/15 shadow-glass-lg z-50 animate-scale-in">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-1">
                  Switch Persona / Role:
                </p>
                {availableUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setShowRoleSwitcher(false);
                    }}
                    className={cn(
                      'w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/10 transition-colors',
                      user?.id === u.id ? 'bg-brand-50 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 font-semibold' : 'text-slate-700 dark:text-slate-300'
                    )}
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{u.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{u.role} &bull; {u.jobTitle}</p>
                    </div>
                    {user?.id === u.id && <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Card */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full border border-white/40 dark:border-white/20 object-cover shadow-sm"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main-content flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="glass-header h-16 px-6 flex items-center justify-between gap-4 z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Dynamic Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">HirebridgeHR</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
              <span className="text-slate-900 dark:text-white font-bold">{breadcrumbTitle}</span>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-3">
            {/* Quick Search Bar */}
            <div className="relative hidden md:block w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Quick search jobs, candidates..."
                className="glass-input w-full pl-8 pr-3 py-1.5 text-xs rounded-xl text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                onClick={() => navigate('/candidates')}
              />
            </div>

            {/* Post Job Quick CTA */}
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => navigate('/jobs/new')}
              className="hidden sm:inline-flex text-xs py-1.5 px-3"
            >
              Create Job
            </Button>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 shadow-glow-brand" />
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl p-4 border border-white/80 dark:border-white/15 shadow-glass-lg z-50 animate-scale-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10 mb-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Notifications</h4>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-[10px] text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No notifications</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markAsRead(n.id);
                            if (n.link) navigate(n.link);
                            setShowNotifMenu(false);
                          }}
                          className={cn(
                            'p-2.5 rounded-xl text-xs cursor-pointer transition-colors border',
                            n.isRead
                              ? 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-white/5'
                              : 'bg-brand-50/70 dark:bg-brand-500/10 border-brand-200/70 dark:border-brand-500/20 text-slate-800 dark:text-slate-200 hover:bg-brand-100/70'
                          )}
                        >
                          <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-200/80 dark:border-white/10 text-center">
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifMenu(false)}
                      className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-semibold"
                    >
                      View all notifications &rarr;
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle Theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-600" />}
            </button>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
