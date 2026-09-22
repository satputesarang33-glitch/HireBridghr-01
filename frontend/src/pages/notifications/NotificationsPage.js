import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Clock, Briefcase, User, Calendar, ExternalLink } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications.js';
import { Button } from '../../components/ui/Button.js';
import { Card } from '../../components/ui/Card.js';
import { EmptyState } from '../../components/ui/EmptyState.js';

export function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const [filter, setFilter] = useState('ALL'); // 'ALL' or 'UNREAD'

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'candidate':
        return <User className="w-4 h-4 text-cyan-400" />;
      case 'job':
        return <Briefcase className="w-4 h-4 text-amber-400" />;
      case 'interview':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-brand-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            System activity alerts, publication updates, and recruitment milestones.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg p-1 bg-white/5 border border-white/10 text-xs font-semibold">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filter === 'ALL' ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1 rounded-md transition-colors ${
                filter === 'UNREAD' ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400 hover:text-white'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <Button variant="glass" size="sm" icon={CheckCheck} onClick={() => markAllAsRead()}>
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description={filter === 'UNREAD' ? 'You have no unread notifications.' : 'Your notification log is clear.'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card
              key={item.id}
              interactive
              onClick={() => {
                markAsRead(item.id);
                if (item.link) navigate(item.link);
              }}
              className={`p-4 flex items-start justify-between gap-4 transition-all ${
                item.isRead
                  ? 'bg-slate-900/40 border-white/5 opacity-80'
                  : 'bg-brand-950/20 border-brand-500/30'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 mt-0.5 flex-shrink-0">
                  {getIcon(item.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-400 shadow-glow-brand flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{item.message}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-2">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {item.link && (
                <div className="flex-shrink-0 self-center">
                  <span className="text-xs text-brand-400 flex items-center gap-1">
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
