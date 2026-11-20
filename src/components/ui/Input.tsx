import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  /** Interactive element rendered inside the field's right edge (e.g. show/hide). */
  trailing?: ReactNode;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, trailing, icon, id, className = '', ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-charcoal">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-charcoal/60">{icon}</span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={`min-h-11 w-full rounded-lg border bg-white py-2.5 text-sm text-ink placeholder:text-charcoal/45 transition-colors focus:outline-none focus:ring-2 focus:ring-gold ${
            icon ? 'pl-11' : 'pl-4'
          } ${trailing ? 'pr-12' : 'pr-4'} ${
            error ? 'border-red-600 ring-1 ring-red-600' : 'border-charcoal/25 focus:border-ink'
          } ${className}`}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={helperId} className="mt-1 text-xs text-charcoal/60">
          {helperText}
        </p>
      )}
    </div>
  );
});
