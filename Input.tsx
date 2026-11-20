import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /** Interactive element rendered inside the field's right edge (e.g. show/hide). */
  trailing?: ReactNode;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, trailing, icon, id, className = '', ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div>
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
          aria-describedby={error ? errorId : undefined}
          className={`min-h-12 w-full rounded-lg border bg-white py-2.5 text-base text-ink placeholder:text-charcoal/45 transition-colors focus:outline-none focus:ring-2 focus:ring-gold ${
            icon ? 'pl-11' : 'pl-4'
          } ${trailing ? 'pr-12' : 'pr-4'} ${
            error ? 'border-ink ring-1 ring-ink' : 'border-charcoal/25 focus:border-ink'
          } ${className}`}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-1 flex items-center">{trailing}</div>}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-ink">
          {error}
        </p>
      )}
    </div>
  );
});
