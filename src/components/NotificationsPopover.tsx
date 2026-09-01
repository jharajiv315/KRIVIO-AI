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
    message: 'Your enterprise account is securely set up. Welcome to your business growth workspace.',
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
    message: 'Ask your mentor in Hindi, English, or regional voices to calculate your handmade product cost and fair margins.',
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
        className="p-2 rounded-xl text-[#0F5132] dark:text-[#34D399] hover:bg-[#0F5132]/10 dark:hover:bg-emerald-950/60 transition-all relative focus:outline-none focus:ring-2 focus:ring-[#0F5132] dark:focus:ring-emerald-400"
      >
        <Bell className="w-5 h-5 text-stone-700 dark:text-emerald-200" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#0F5132] dark:bg-[#34D399] text-white dark:text-[#0B1911] font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed left-4 right-4 top-20 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-96 max-w-sm mx-auto sm:mx-0 bg-white dark:bg-[#13251B] rounded-2xl shadow-2xl border border-[#0F5132]/15 dark:border-emerald-800/60 z-50 p-4 space-y-3 font-inter text-xs animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-emerald-900/40 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#0F5132] dark:text-emerald-400" />
                <h3 className="font-bold text-stone-900 dark:text-white font-poppins">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-[#0F5132]/10 text-[#0F5132] dark:bg-emerald-950 dark:text-emerald-300 font-extrabold rounded-full text-[10px] border border-[#0F5132]/20 dark:border-emerald-800">
                    {unreadCount} New
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    title="Mark all as read"
                    className="text-[11px] font-semibold text-[#0F5132] dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Read All
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-stone-400 dark:text-emerald-300/60 space-y-2">
                  <Bell className="w-8 h-8 mx-auto opacity-30" />
                  <p className="font-medium text-xs">No notifications right now.</p>
                  <p className="text-[10px] text-stone-500 dark:text-emerald-400/60">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                      n.read
                        ? 'bg-stone-50/70 dark:bg-[#183023]/60 border-stone-200/60 dark:border-emerald-900/40 text-stone-600 dark:text-emerald-200/70'
                        : 'bg-[#0F5132]/5 dark:bg-emerald-950/70 border-[#0F5132]/25 dark:border-emerald-700/60 text-stone-900 dark:text-white shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-xs flex items-center gap-1.5 font-poppins">
                        {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-[#0F5132] dark:text-emerald-400 shrink-0" />}
                        {n.type === 'info' && <Info className="w-3.5 h-3.5 text-[#2E7D32] dark:text-teal-400 shrink-0" />}
                        {n.type === 'mentor' && <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />}
                        {n.title}
                      </span>
                      <span className="text-[10px] text-stone-400 dark:text-emerald-400/60 shrink-0 font-mono">{n.time}</span>
                    </div>

                    <p className="text-[11px] text-stone-600 dark:text-emerald-200/80 leading-relaxed font-inter">
                      {n.message}
                    </p>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="pt-2 border-t border-stone-100 dark:border-emerald-900/40 flex justify-between items-center text-[11px]">
                <button
                  onClick={handleClearAll}
                  className="text-stone-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear list
                </button>
                <span className="text-stone-400 dark:text-emerald-400/60 text-[10px]">Live Cloud Sync</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
