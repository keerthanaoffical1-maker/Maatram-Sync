import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { authService } from '../../services/auth';
import { validateEmail, validatePassword } from '../../lib/validation';
import type { AuthUser } from '../../types/auth';

const REMEMBER_KEY = 'maatram.rememberedEmail';

interface LoginFormProps {
  onSuccess: (user: AuthUser) => void;
}

type FieldErrors = { email?: string; password?: string };

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [mode, setMode] = useState<'signin' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Remember me stores the email only, never the password.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setEmail(saved);
        setRemember(true);
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  const switchMode = (next: 'signin' | 'forgot') => {
    setMode(next);
    setErrors({});
    setFormError('');
    setNotice('');
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = { email: validateEmail(email), password: validatePassword(password) };
    setErrors(next);
    setFormError('');
    if (next.email) return emailRef.current?.focus();
    if (next.password) return passwordRef.current?.focus();

    setLoading(true);
    const result = await authService.signIn({ email: email.trim(), password });
    setLoading(false);

    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    try {
      if (remember) localStorage.setItem(REMEMBER_KEY, email.trim());
      else localStorage.removeItem(REMEMBER_KEY);
    } catch {
      /* storage unavailable */
    }
    onSuccess(result.user);
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    setErrors({ email: emailError });
    setNotice('');
    if (emailError) return emailRef.current?.focus();

    setLoading(true);
    await authService.requestPasswordReset(email.trim());
    setLoading(false);
    // Same message whether or not the account exists, so emails can't be probed.
    setNotice('If an account exists for that email, a reset link is on its way. Password reset isn’t connected yet in this version.');
  };

  const emailField = (
    <Input
      ref={emailRef}
      label="Email address"
      type="email"
      name="email"
      autoComplete="email"
      inputMode="email"
      placeholder="you@example.com"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      onBlur={() => email && setErrors((p) => ({ ...p, email: validateEmail(email) }))}
      error={errors.email}
      icon={<Mail className="h-5 w-5" aria-hidden="true" />}
    />
  );

  if (mode === 'forgot') {
    return (
      <form onSubmit={handleReset} noValidate className="space-y-5">
        <button
          type="button"
          onClick={() => switchMode('signin')}
          className="inline-flex min-h-11 items-center gap-1.5 rounded text-sm font-medium text-charcoal hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to sign in
        </button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Reset your password</h1>
          <p className="mt-2 text-charcoal/80">Enter your email and we’ll send you a link to choose a new password.</p>
        </div>
        {emailField}
        {notice && (
          <p role="status" className="flex gap-2 rounded-lg bg-white p-3.5 text-sm text-charcoal ring-1 ring-charcoal/15">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-ink" aria-hidden="true" />
            {notice}
          </p>
        )}
        <Button type="submit" loading={loading}>
          {loading ? 'Sending link…' : 'Send reset link'}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSignIn} noValidate className="space-y-5">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Welcome Back</h1>
        <p className="mt-2 text-charcoal/80">Sign in to continue to Maatram Sync.</p>
      </div>

      {formError && (
        <p role="alert" className="flex gap-2 rounded-lg bg-ink p-3.5 text-sm text-white">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
          {formError}
        </p>
      )}

      {emailField}

      <Input
        ref={passwordRef}
        label="Password"
        type={showPassword ? 'text' : 'password'}
        name="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        icon={<Lock className="h-5 w-5" aria-hidden="true" />}
        trailing={
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            className="flex h-10 w-10 items-center justify-center rounded-md text-charcoal/70 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        }
      />

      <div className="flex items-center justify-between gap-4">
        <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-charcoal">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-5 w-5 rounded border-charcoal/40 accent-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1"
          />
          Remember me
        </label>
        <button
          type="button"
          onClick={() => switchMode('forgot')}
          className="min-h-11 rounded text-sm font-medium text-ink underline decoration-gold decoration-2 underline-offset-4 hover:decoration-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          Forgot password?
        </button>
      </div>

      <Button type="submit" loading={loading}>
        {loading ? 'Signing in…' : 'Sign In'}
      </Button>

      {authService.isMock && import.meta.env.DEV && (
        <p className="rounded-lg border border-dashed border-charcoal/30 p-3 text-xs leading-relaxed text-charcoal/80">
          <strong className="font-semibold text-ink">Dev only, mock sign-in (not secure).</strong>
          <br />
          student@maatram.dev / Student@123
          <br />
          office@maatram.dev / Office@123
          <br />
          admin@maatram.dev / Admin@123
        </p>
      )}
    </form>
  );
}
