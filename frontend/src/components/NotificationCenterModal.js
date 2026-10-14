import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Calendar,
  User,
  MessageSquare,
  Gift,
  X
} from 'lucide-react';
import { getNotifications, markNotificationsAsRead } from '../utils/activityService.js';
import './NotificationCenterModal.css';

export function NotificationCenterModal({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setNotifications(getNotifications());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    const updated = markNotificationsAsRead();
    setNotifications([...updated]);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'interview':
        return <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />;
      case 'offer':
        return <Gift className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />;
      case 'mention':
      case 'note':
        return <MessageSquare className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />;
      default:
        return <User className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="ats-notif-dropdown" onClick={(e) => e.stopPropagation()}>
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-900">Notifications & Alerts</h3>
        </div>

        <button
          type="button"
          onClick={handleMarkAllRead}
          className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          Mark all read
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`ats-notif-item ${!n.isRead ? 'unread' : ''}`}
            >
              {getIcon(n.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.message}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">
            No notifications yet
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationCenterModal;
