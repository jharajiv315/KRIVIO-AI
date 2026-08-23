import React, { useState } from 'react';
import { NotificationItem } from '../types';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Info,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';

interface NotificationsPopoverProps {
  onSelectTab?: (tab: string) => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Welcome to KRIVIO AI Workspace',
    message: 'Your account is authenticated via PostgreSQL with bcrypt security. Explore your rural business dashboard.',
    time: 'Just now',
    read: false,
    type: 'success',
    linkTab: 'dashboard',
  },
  {
    id: 'notif-2',
    title: 'PM Vishwakarma Scheme Update',
    message: 'New toolkit subsidy up to ₹15,000 is open for traditional artisans and weavers.',
    time: '2 hours ago',
    read: false,
    type: 'info',
    linkTab: 'schemes',
  },
  {
    id: 'notif-3',
    title: 'Voice AI Mentor Tip',
    message: 'Ask your mentor in Hindi or English regarding calculating your handmade product cost and shipping.',
    time: '1 day ago',
    read: true,
    type: 'mentor',
    linkTab: 'mentor',
  },
];

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ onSelectTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleItemClick = (notif: NotificationItem) => {
    handleMarkAsRead(notif.id);
    if (notif.linkTab && onSelectTab) {
      onSelectTab(notif.linkTab);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View Workspace Notifications"
        className="p-2 rounded-xl text-slate-600 dark:text-emerald-200 hover:bg-slate-200/60 dark:hover:bg-emerald-900/40 transition-all relative focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <Bell className="w-5 h-5 text-slate-700 dark:text-emerald-200" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-4 space-y-3 font-inter text-xs animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 dark:text-white font-display">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold rounded-full text-[10px]">
                    {unreadCount} New
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    title="Mark all as read"
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Read All
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-2">
                  <Bell className="w-8 h-8 mx-auto opacity-30" />
                  <p className="font-medium text-xs">No notifications right now.</p>
                  <p className="text-[10px] text-slate-500">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                      n.read
                        ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800 text-slate-500'
                        : 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-800/80 text-slate-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs flex items-center gap-1.5">
                        {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                        {n.type === 'info' && <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                        {n.type === 'mentor' && <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">{n.time}</span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px]">
                <button
                  onClick={handleClearAll}
                  className="text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear list
                </button>
                <span className="text-slate-400">PostgreSQL Sync</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
