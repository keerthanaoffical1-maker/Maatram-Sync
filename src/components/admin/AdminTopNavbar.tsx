import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  Building2,
  Calendar,
  ChevronDown,
  History,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import type { AdminActivityItem, AdminUser } from '../../types/admin';
import { formatDate } from '../../lib/utils';
import type { AdminNavTab } from './AdminSidebar';

interface AdminTopNavbarProps {
  user: AdminUser;
  activities: AdminActivityItem[];
  onNavigateTab: (tab: AdminNavTab) => void;
  onGlobalSearch?: (query: string) => void;
  onLogout: () => void;
  onToggleMobileMenu: () => void;
}

export function AdminTopNavbar({
  user,
  activities,
  onNavigateTab,
  onGlobalSearch,
  onLogout,
  onToggleMobileMenu,
}: AdminTopNavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onGlobalSearch) onGlobalSearch(searchQuery.trim());
      onNavigateTab('students');
      setIsSearchOpen(false);
    }
  };

  const currentDateFormatted = formatDate(new Date());

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
            Maatram Sync Administration
          </h1>
          <div className="flex items-center gap-2 text-xs text-charcoal/65 sm:text-sm">
            <span className="font-semibold text-ink">System & Scholar Governance</span>
            <span className="text-charcoal/30">•</span>
            <span className="hidden sm:inline">{currentDateFormatted}</span>
          </div>
        </div>
      </div>

      {/* Middle/Right: Global Admin Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/45" />
          <input
            type="text"
            placeholder="Search scholars, institutions, or departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-charcoal/20 bg-offwhite/50 py-2 pl-10 pr-10 text-xs text-ink placeholder:text-charcoal/50 transition-all focus:bg-white focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </form>
      </div>

      {/* Right: Actions, Notifications & Profile Menu */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Search Toggle */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-charcoal/15 bg-white text-charcoal hover:text-ink"
          aria-label="Open search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            aria-label="Admin Activity Alerts"
            aria-expanded={isNotifOpen}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-charcoal/15 bg-white text-charcoal hover:border-ink hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-all"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-extrabold text-ink shadow-sm ring-2 ring-white">
              {activities.length}
            </span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-charcoal/15 bg-white shadow-2xl ring-1 ring-charcoal/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between border-b border-charcoal/10 bg-offwhite/50 px-4 py-3">
                <span className="font-semibold text-sm text-ink">Administrative Audit Trail</span>
                <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-ink">
                  {activities.length} logs
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-charcoal/5">
                {activities.slice(0, 6).map((act) => (
                  <div key={act.id} className="flex items-start gap-3 p-3.5 hover:bg-offwhite/80 transition-colors">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-ink mt-0.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-ink truncate">{act.action}</p>
                        <span className="text-[10px] text-charcoal/50 shrink-0">{act.timestamp}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-charcoal/75 line-clamp-2 leading-relaxed">
                        {act.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-charcoal/10 bg-offwhite/50 p-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotifOpen(false);
                    onNavigateTab('activity');
                  }}
                  className="text-xs font-semibold text-ink hover:text-gold"
                >
                  View full activity log
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-expanded={isDropdownOpen}
            className="flex items-center gap-2.5 rounded-xl border border-charcoal/15 bg-white p-1.5 sm:px-3 sm:py-2 text-left hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-all"
          >
            <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-xs sm:text-sm font-bold text-gold ring-1 ring-charcoal/20">
              AS
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-white" />
            </div>

            <div className="hidden text-left md:block">
              <p className="text-xs font-bold text-ink leading-tight">{user.name}</p>
              <p className="text-[10px] text-charcoal/60 truncate max-w-[120px]">{user.title}</p>
            </div>

            <ChevronDown className="hidden h-4 w-4 text-charcoal/60 md:block transition-transform duration-200" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-charcoal/15 bg-white shadow-2xl ring-1 ring-charcoal/10 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="border-b border-charcoal/10 bg-offwhite/50 p-4">
                <p className="text-xs font-semibold text-charcoal/70">Authenticated Admin</p>
                <p className="font-bold text-sm text-ink">{user.name}</p>
                <p className="text-xs text-charcoal/60">{user.email}</p>
                <div className="mt-2 inline-flex items-center gap-1 rounded bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-ink">
                  <ShieldCheck className="h-3 w-3 text-gold" />
                  <span>Role: System Administrator</span>
                </div>
              </div>

              <div className="p-1.5 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onNavigateTab('registration');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-charcoal hover:bg-offwhite hover:text-ink transition-colors"
                >
                  <UserPlus className="h-4 w-4 text-charcoal/70" />
                  <span>Register New Scholar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onNavigateTab('institutions');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-charcoal hover:bg-offwhite hover:text-ink transition-colors"
                >
                  <Building2 className="h-4 w-4 text-charcoal/70" />
                  <span>Manage Institutions</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onNavigateTab('activity');
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-charcoal hover:bg-offwhite hover:text-ink transition-colors"
                >
                  <History className="h-4 w-4 text-charcoal/70" />
                  <span>Audit Activity Log</span>
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

      {/* Mobile Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm p-4 flex items-start justify-center pt-20">
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-charcoal/15">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <Search className="h-5 w-5 text-charcoal/60" />
              <input
                type="text"
                autoFocus
                placeholder="Search scholars, institutions, or departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 py-2 text-sm text-ink focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="rounded-lg p-1.5 text-charcoal/50 hover:bg-offwhite hover:text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
