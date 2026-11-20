import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const variants = {
  primary: 'bg-gold text-ink hover:bg-[#e4ad12] disabled:hover:bg-gold shadow-sm',
  secondary: 'bg-white text-ink border border-charcoal/25 hover:border-ink hover:bg-offwhite',
  outline: 'bg-transparent text-charcoal border border-charcoal/25 hover:border-ink hover:text-ink',
  ghost: 'bg-transparent text-charcoal hover:bg-black/5 hover:text-ink',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizes = {
  sm: 'min-h-9 px-3 text-xs rounded-md',
  md: 'min-h-11 px-4 text-sm rounded-lg',
  lg: 'min-h-12 px-5 text-base rounded-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'lg', loading = false, disabled, className = '', children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99] ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none shrink-0" aria-hidden="true" />}
      {children}
    </button>
  );
});
