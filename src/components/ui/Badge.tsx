import type { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'gold' | 'ink' | 'charcoal' | 'success' | 'warning' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const variants = {
  gold: 'bg-gold/20 text-ink border border-gold/40 font-semibold',
  ink: 'bg-ink text-white font-medium',
  charcoal: 'bg-charcoal/10 text-charcoal border border-charcoal/20 font-medium',
  success: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-medium',
  warning: 'bg-amber-50 text-amber-900 border border-amber-300 font-medium',
  neutral: 'bg-white text-charcoal border border-charcoal/20 font-medium',
  outline: 'bg-transparent text-charcoal border border-charcoal/30',
};

const dotColors = {
  gold: 'bg-gold',
  ink: 'bg-white',
  charcoal: 'bg-charcoal',
  success: 'bg-emerald-600',
  warning: 'bg-amber-600',
  neutral: 'bg-charcoal/50',
  outline: 'bg-charcoal',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({
  children,
  variant = 'gold',
  size = 'md',
  className = '',
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full transition-colors ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} aria-hidden="true" />}
      {children}
    </span>
  );
}
