import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  loading?: boolean;
}

const variants = {
  primary: 'bg-gold text-ink hover:bg-[#e4ad12] disabled:hover:bg-gold',
  secondary: 'bg-white text-ink border border-charcoal/25 hover:border-ink',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', loading = false, disabled, className = '', children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-5 text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />}
      {children}
    </button>
  );
});
