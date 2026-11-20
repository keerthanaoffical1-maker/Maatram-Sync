import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({
  id,
  type = 'success',
  title,
  message,
  duration = 4000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-gold shrink-0 mt-0.5" aria-hidden="true" />,
    error: <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" aria-hidden="true" />,
    info: <Info className="h-5 w-5 text-gold shrink-0 mt-0.5" aria-hidden="true" />,
  };

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl bg-ink p-4 text-white shadow-xl ring-1 ring-white/10 transition-all animate-in fade-in slide-in-from-top-2 max-w-md w-full"
    >
      {icons[type]}
      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold text-white mb-0.5">{title}</h4>}
        <p className="text-white/80 leading-relaxed">{message}</p>
      </div>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="rounded p-1 text-white/50 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold"
        aria-label="Dismiss toast"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onClose,
}: {
  toasts: Array<{ id: string; type?: 'success' | 'error' | 'info'; title?: string; message: string }>;
  onClose: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-auto"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
}
