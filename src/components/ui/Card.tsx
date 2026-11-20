import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'flat' | 'interactive' | 'gold-accent';
  className?: string;
}

export function Card({
  children,
  variant = 'default',
  className = '',
  ...props
}: CardProps) {
  const variantStyles = {
    default: 'bg-white border border-charcoal/10 shadow-sm rounded-xl',
    flat: 'bg-white/80 border border-charcoal/10 rounded-xl',
    interactive:
      'bg-white border border-charcoal/15 shadow-sm rounded-xl hover:border-gold hover:shadow-md transition-all cursor-pointer',
    'gold-accent':
      'bg-white border-l-4 border-l-gold border-y border-r border-charcoal/10 shadow-sm rounded-xl',
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className = '',
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 border-b border-charcoal/10 p-5 sm:p-6 ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-ink sm:text-lg">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-charcoal/70 sm:text-sm">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardContent({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function CardFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between border-t border-charcoal/10 px-5 py-3 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}
