import { useEffect, useRef, useState } from 'react';
import { Calendar, ChevronDown, LogOut, Menu, Sparkles, User, UserCircle } from 'lucide-react';
import type { StudentNotification, StudentProfile } from '../../types/student';
import { formatDate } from '../../lib/utils';
import { NotificationPopover } from './NotificationPopover';

interface TopNavbarProps {
  profile: StudentProfile;
  notifications: StudentNotification[];
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onNavigateTab: (tab: any) => void;
  onLogout: () => void;
  onToggleMobileMenu: () => void;
}

export function TopNavbar({
  profile,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onNavigateTab,
  onLogout,
  onToggleMobileMenu,
}: TopNavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const formattedDate = formatDate(new Date());

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-charcoal/10 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md">
      {/* Left: Mobile hamburger & Welcome */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-charcoal/15 bg-white text-charcoal hover:border-ink hover:text-ink transition-colors"
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold tracking-tight text-ink sm:text-xl lg:text-2xl">
            Welcome back, {profile.name.split(' ')[0]}
          </h1>
          <div className="flex items-center gap-2 text-xs text-charcoal/65 sm:text-sm">
            <Calendar className="h-3.5 w-3.5 text-gold shrink-0" aria-hidden="true" />
            <span>{formattedDate}</span>
            <span className="hidden sm:inline text-charcoal/30">•</span>
            <span className="hidden sm:inline text-charcoal/60">{profile.institution.split('(')[0].trim()}</span>
          </div>
        </div>
      </div>

      {/* Right: Notifications & User Avatar Dropdown */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notifications Popover */}
        <NotificationPopover
          notifications={notifications}
          onMarkRead={onMarkNotificationRead}
          onMarkAllRead={onMarkAllNotificationsRead}
          onNavigateTab={onNavigateTab}
        />

        {/* Profile Avatar & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
            className="flex items-center gap-2.5 rounded-xl border border-charcoal/15 bg-white p-1.5 sm:px-3 sm:py-2 text-left hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-all"
          >
            {/* Avatar Pill */}
            <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-xs sm:text-sm font-bold text-gold ring-1 ring-charcoal/20">
              {initials}
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="hidden text-left md:block">
              <p className="text-xs font-bold text-ink leading-tight">{profile.name}</p>
              <p className="text-[11px] text-charcoal/60 truncate max-w-[130px]">
                {profile.academicYear.split(' (')[0] || 'Scholar'}
              </p>
            </div>

            <ChevronDown className="hidden h-4 w-4 text-charcoal/60 md:block transition-transform duration-200" />
          </button>

          {/* Profile Menu Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-charcoal/15 bg-white shadow-2xl ring-1 ring-charcoal/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="border-b border-charcoal/10 bg-offwhite/50 p-4">
                <p className="text-xs font-semibold text-charcoal/70">Signed in as</p>
                <p className="font-bold text-sm text-ink truncate">{profile.name}</p>
                <p className="text-xs text-charcoal/60 truncate">{profile.email}</p>
                <div className="mt-2 inline-flex items-center gap-1 rounded bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-ink">
                  <Sparkles className="h-3 w-3 text-gold" />
                  <span>ID: {profile.studentId}</span>
                </div>
              </div>

              <div className="p-1.5 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onNavigateTab('profile');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-charcoal hover:bg-offwhite hover:text-ink transition-colors"
                >
                  <UserCircle className="h-4 w-4 text-charcoal/70" />
                  <span>My Profile & Contact</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onNavigateTab('availability');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-charcoal hover:bg-offwhite hover:text-ink transition-colors"
                >
                  <Calendar className="h-4 w-4 text-charcoal/70" />
                  <span>Update Availability</span>
                </button>
              </div>

              <div className="border-t border-charcoal/10 p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
