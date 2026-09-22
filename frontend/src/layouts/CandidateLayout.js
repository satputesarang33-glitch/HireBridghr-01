import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  Bookmark,
  FileText,
  User,
  Bell,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  Menu,
  X,
  Briefcase,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { useCandidateNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useCandidateProfile } from '../hooks/useCandidatePortal.js';
import { Button } from '../components/ui/Button.js';
import { cn } from '../utils/cn.js';

export function CandidateLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const { data: profile } = useCandidateProfile();
  const { data: notifications = [] } = useCandidateNotifications();
  const markAsRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const navItems = [
    { label: 'Dashboard', path: '/candidate/dashboard', icon: LayoutDashboard },
    { label: 'Find Jobs', path: '/candidate/jobs', icon: Search },
    { label: 'Saved Jobs', path: '/candidate/saved-jobs', icon: Bookmark },
    { label: 'My Applications', path: '/candidate/applications', icon: FileText },
    { label: 'My Profile', path: '/candidate/profile', icon: User },
    { label: 'Notifications', path: '/candidate/notifications', icon: Bell, badge: unreadCount },
    { label: 'Settings', path: '/candidate/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/candidate/login');
  };

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbTitle = pathSegments.length > 1
    ? pathSegments[1].replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    : 'Dashboard';

  const candidateName = profile?.fullName || user?.name || 'Alex Rivera';
  const candidateAvatar = profile?.profilePhoto || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
  const completionPercentage = profile?.completionPercentage || 90;

  return (
    <div className="app-shell flex h-screen overflow-hidden text-slate-900 dark:text-slate-100 selection:bg-brand-500/30 selection:text-brand-200">
      {/* Ambient background glows */}
      <div className="liquid-glow-brand -top-24 -left-24 opacity-60 pointer-events-none" />
      <div className="liquid-glow-accent top-1/3 -right-24 opacity-40 pointer-events-none" />

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Candidate Sidebar */}
      <aside
        className={cn(
          'app-sidebar fixed lg:static inset-y-0 left-0 z-[60] flex flex-col justify-between p-4 overflow-y-auto max-h-screen',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex flex-col gap-5">
          {/* Brand & Portal Type Header */}
          <div className="flex items-center justify-between px-2 pt-1">
            <Link to="/candidate/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-glow-brand group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Hirebridge<span className="text-cyan-400">Careers</span>
                </span>
                <span className="block text-[10px] uppercase font-bold tracking-widest text-cyan-600 dark:text-cyan-400">
                  Candidate Portal
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 min-w-[38px] min-h-[38px] flex items-center justify-center transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Completion Indicator Pill */}
          <Link
            to="/candidate/profile"
            className="p-3 rounded-xl glass-card border border-white/80 dark:border-white/10 hover:border-cyan-400/50 transition-all group"
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
                Profile Strength
              </span>
              <span className="font-bold text-cyan-600 dark:text-cyan-400">{completionPercentage}%</span>
            </div>
            <div className="completion-progress-bar h-1.5 w-full">
              <div
                className="completion-progress-fill"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
              {completionPercentage >= 90 ? 'Profile fully optimized' : 'Complete fields to boost visibility'}
            </p>
          </Link>

          {/* Candidate Navigation */}
          <nav className="flex flex-col gap-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Job Seeker Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/candidate/jobs'
                  ? location.pathname.startsWith('/candidate/jobs')
                  : location.pathname === item.path ||
                    (item.path !== '/candidate/dashboard' && location.pathname.startsWith(`${item.path}/`));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'sidebar-link candidate-nav-item',
                    isActive && 'sidebar-link-active active'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500 text-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Candidate User Card & Logout */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 shadow-sm dark:shadow-none">
            <Link
              to="/candidate/profile"
              className="flex items-center gap-2.5 min-w-0 hover:opacity-90 transition-opacity"
            >
              <img
                src={candidateAvatar}
                alt={candidateName}
                className="w-8 h-8 rounded-full border border-white/40 dark:border-white/20 object-cover shadow-sm shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{candidateName}</p>
                <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">Candidate</p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Candidate Content */}
      <div className="app-main-content flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Floating Glass Header */}
        <header className="glass-header h-16 px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4 z-20 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 -ml-1 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition-all min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs min-w-0">
              <span className="hidden sm:inline text-slate-500 dark:text-slate-400 font-medium">Candidate Portal</span>
              <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
              <span className="text-slate-900 dark:text-white font-bold truncate">{breadcrumbTitle}</span>
            </div>
          </div>

          {/* Action Header Tools */}
          <div className="flex items-center gap-3">
            {/* Quick Find Jobs Button */}
            <Button
              variant="outline"
              size="sm"
              icon={Search}
              onClick={() => navigate('/candidate/jobs')}
              className="hidden sm:inline-flex text-xs py-1.5 px-3"
            >
              Browse Jobs
            </Button>

            {/* Candidate Notification Bell with Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-cyan-500 ring-2 ring-slate-950 animate-pulse" />
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-2xl p-4 border border-white/80 dark:border-white/15 shadow-glass-lg z-50 animate-scale-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-white/10 mb-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Candidate Alerts
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Application milestones &amp; interviews
                      </p>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllRead.mutate()}
                        className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No notifications yet</p>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markAsRead.mutate(n.id);
                            if (n.link) navigate(n.link);
                            setShowNotifMenu(false);
                          }}
                          className={cn(
                            'p-2.5 rounded-xl text-xs cursor-pointer transition-colors border',
                            n.isRead
                              ? 'bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-white/5'
                              : 'bg-cyan-500/10 border-cyan-500/20 text-slate-800 dark:text-slate-200 hover:bg-cyan-500/20'
                          )}
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
                            <span className="text-[10px] text-slate-400">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-200/80 dark:border-white/10 text-center">
                    <Link
                      to="/candidate/notifications"
                      onClick={() => setShowNotifMenu(false)}
                      className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
                    >
                      View all candidate notifications &rarr;
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
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-cyan-600" />
              )}
            </button>

            {/* Candidate Header Avatar & Name */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-white/10">
              <Link to="/candidate/profile" className="flex items-center gap-2 group">
                <img
                  src={candidateAvatar}
                  alt={candidateName}
                  className="w-8 h-8 rounded-full border border-cyan-400/40 object-cover shadow-sm group-hover:scale-105 transition-transform"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 hidden md:block">
                  {candidateName}
                </span>
              </Link>
            </div>
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
