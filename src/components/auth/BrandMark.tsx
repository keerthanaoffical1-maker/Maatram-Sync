import { Calendar, Sparkles } from 'lucide-react';

interface BrandMarkProps {
  className?: string;
  collapsed?: boolean;
  variant?: 'light' | 'dark'; // dark = for black/dark backgrounds; light = for offwhite/white
}

export function BrandMark({ className = '', collapsed = false, variant = 'dark' }: BrandMarkProps) {
  const isLight = variant === 'light';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Visual Logo Emblem */}
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-charcoal ring-1 ring-white/15 shadow-sm">
        <div className="absolute -inset-0.5 rounded-xl bg-gold/20 blur-[2px]" aria-hidden="true" />
        <div className="relative flex items-center justify-center">
          <Calendar className="h-5 w-5 text-gold" aria-hidden="true" />
          <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-gold animate-pulse" aria-hidden="true" />
        </div>
      </div>

      {!collapsed && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-lg font-bold tracking-tight ${
                isLight ? 'text-ink' : 'text-white'
              }`}
            >
              Maatram
            </span>
            <span className="rounded bg-gold px-1.5 py-0.5 text-xs font-extrabold uppercase tracking-wider text-ink shadow-sm">
              Sync
            </span>
          </div>
          <span className={`text-[10px] font-medium tracking-wide uppercase ${isLight ? 'text-charcoal/60' : 'text-white/45'}`}>
            Student Portal
          </span>
        </div>
      )}
    </div>
  );
}
