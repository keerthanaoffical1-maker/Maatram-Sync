import {
  Building2,
  FileSpreadsheet,
  FolderTree,
  History,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { BrandMark } from '../auth/BrandMark';

export type AdminNavTab =
  | 'overview'
  | 'registration'
  | 'students'
  | 'institutions'
  | 'categories'
  | 'activity';

interface AdminSidebarProps {
  activeTab: AdminNavTab;
  onSelectTab: (tab: AdminNavTab) => void;
  onLogout: () => void;
  totalStudentsCount?: number;
  totalInstitutionsCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function AdminSidebar({
  activeTab,
  onSelectTab,
  onLogout,
  totalStudentsCount = 0,
  totalInstitutionsCount = 0,
  isMobileOpen = false,
  onCloseMobile,
}: AdminSidebarProps) {
  const navItems: Array<{
    id: AdminNavTab;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: number;
    highlightBadge?: string;
  }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'registration',
      label: 'Student Registration',
      icon: UserPlus,
      highlightBadge: 'Core',
    },
    {
      id: 'students',
      label: 'Student Directory',
      icon: Users,
      badge: totalStudentsCount,
    },
    {
      id: 'institutions',
      label: 'Institutions',
      icon: Building2,
      badge: totalInstitutionsCount,
    },
    { id: 'categories', label: 'Categories & Groups', icon: FolderTree },
    { id: 'activity', label: 'Admin Activity Log', icon: History },
  ];

  const handleNavClick = (tab: AdminNavTab) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="flex h-full flex-col justify-between bg-ink text-white p-5 lg:p-6 select-none border-r border-white/10">
      {/* Top Header & Brand */}
      <div>
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex flex-col">
            <BrandMark variant="dark" />
            <span className="mt-1 text-[10px] font-bold tracking-wider uppercase text-gold">
              System Administration
            </span>
          </div>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation List */}
        <nav className="mt-6 space-y-1.5" aria-label="Admin portal navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  isActive
                    ? 'bg-gold text-ink shadow-md font-bold'
                    : 'text-white/75 hover:bg-charcoal hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      isActive ? 'text-ink' : 'text-white/60 group-hover:text-gold'
                    }`}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.highlightBadge && !isActive && (
                    <span className="rounded bg-gold/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-gold">
                      {item.highlightBadge}
                    </span>
                  )}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                        isActive ? 'bg-ink text-white' : 'bg-gold text-ink shadow-sm'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        {/* Role & Privileges Badge Card */}
        <div className="rounded-xl border border-white/10 bg-charcoal/80 p-3.5">
          <div className="flex items-start gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gold/20 text-gold mt-0.5">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white">System Administrator</p>
              <p className="text-[10px] text-white/60 leading-tight mt-0.5">
                Full Scholar & Taxonomy Authority • Isolated from Event Scheduling
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-white/75 hover:bg-red-500/10 hover:text-red-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col shadow-xl">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-ink/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl transition-transform animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
