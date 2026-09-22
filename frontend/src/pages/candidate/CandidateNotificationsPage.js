import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Calendar,
  Award,
  AlertCircle,
  FileText,
  Clock,
  CheckCheck,
} from 'lucide-react';
import {
  useCandidateNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '../../hooks/useCandidatePortal.js';
import { Button } from '../../components/ui/Button.js';
import { cn } from '../../utils/cn.js';

export function CandidateNotificationsPage() {
  const navigate = useNavigate();
  const { data: notifications = [], isLoading } = useCandidateNotifications();
  const markAsReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD'

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'APPLICATION_SUBMITTED':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'CANDIDATE_SHORTLISTED':
      case 'APPLICATION_STATUS_CHANGED':
        return <CheckCircle2 className="w-4 h-4 text-cyan-400" />;
      case 'INTERVIEW_SCHEDULED':
      case 'INTERVIEW_UPDATED':
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'OFFER_RECEIVED':
        return <Award className="w-4 h-4 text-emerald-400" />;
      case 'APPLICATION_REJECTED':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <Bell className="w-4 h-4 text-cyan-400" />;
    }
  };

  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      markAsReadMutation.mutate(item.id);
    }
    if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-white/80 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Candidate Notifications
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time alerts for application status changes, interviews, and offers.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={CheckCheck}
              isLoading={markAllReadMutation.isPending}
              onClick={() => markAllReadMutation.mutate()}
            >
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-3 border-t border-white/10">
          <button
            onClick={() => setFilter('ALL')}
            className={cn(
              'px-3 py-1 rounded-xl text-xs font-semibold transition-colors',
              filter === 'ALL'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            )}
          >
            All Notifications ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('UNREAD')}
            className={cn(
              'px-3 py-1 rounded-xl text-xs font-semibold transition-colors',
              filter === 'UNREAD'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            )}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-2">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-white/80 dark:border-white/10">
          <Bell className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {filter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            When recruiters review your applications or schedule interviews, you will be notified here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={cn(
                'glass-card rounded-2xl p-4 border transition-all cursor-pointer flex items-start gap-4',
                notif.isRead
                  ? 'border-white/80 dark:border-white/10 bg-transparent opacity-80 hover:opacity-100'
                  : 'border-cyan-500/30 bg-cyan-500/10 shadow-sm'
              )}
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                {getNotificationIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(notif.createdAt).toLocaleDateString()} at{' '}
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {notif.link && (
                  <div className="mt-2">
                    <span className="text-xs font-semibold text-cyan-400 hover:underline">
                      View details &rarr;
                    </span>
                  </div>
                )}
              </div>

              {!notif.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0 self-center shadow-glow-brand" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
