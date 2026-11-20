import { useEffect, useRef, useState } from 'react';
import { Bell, Calendar, Check, ExternalLink, Inbox, Info, Sparkles } from 'lucide-react';
import type { StudentNotification } from '../../types/student';

interface NotificationPopoverProps {
  notifications: StudentNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigateTab: (tab: string) => void;
}

export function NotificationPopover({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onNavigateTab,
}: NotificationPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getIcon = (type: StudentNotification['type']) => {
    switch (type) {
      case 'invitation':
        return <Inbox className="h-4 w-4 text-gold shrink-0" />;
      case 'session':
        return <Calendar className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'availability':
        return <Sparkles className="h-4 w-4 text-gold shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-charcoal/15 bg-white text-charcoal hover:border-ink hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-all"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-extrabold text-ink shadow-sm ring-2 ring-white animate-in zoom-in-50">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-charcoal/15 bg-white shadow-2xl ring-1 ring-charcoal/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-charcoal/10 bg-offwhite/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-ink">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-ink">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-charcoal hover:text-ink transition-colors"
              >
                <Check className="h-3.5 w-3.5 text-gold" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-charcoal/5">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-charcoal/60">
                No notifications right now
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    onMarkRead(notif.id);
                    if (notif.targetTab) {
                      onNavigateTab(notif.targetTab);
                      setIsOpen(false);
                    }
                  }}
                  className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-offwhite/80 ${
                    !notif.read ? 'bg-gold/5' : 'bg-white'
                  }`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-charcoal/5 border border-charcoal/10 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-semibold truncate ${!notif.read ? 'text-ink' : 'text-charcoal'}`}>
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="h-2 w-2 rounded-full bg-gold shrink-0" aria-label="Unread" />
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-charcoal/80 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-charcoal/50">
                      <span>{notif.timestamp}</span>
                      {notif.targetTab && (
                        <span className="flex items-center gap-0.5 text-ink font-medium hover:underline">
                          View details <ExternalLink className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-charcoal/10 bg-offwhite/50 p-2 text-center">
            <span className="text-[11px] text-charcoal/60">
              Maatram Sync Scholar Alerts
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
