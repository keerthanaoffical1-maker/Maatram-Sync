import { useNavigate } from 'react-router-dom';
import { BrandMark } from '../components/auth/BrandMark';
import { BrandPanel } from '../components/auth/BrandPanel';
import { LoginForm } from '../components/auth/LoginForm';
import { ROLE_HOME } from '../lib/roles';
import type { AuthUser } from '../types/auth';

export default function LoginPage() {
  const navigate = useNavigate();

  // Destination is decided by the role on the authenticated account only.
  const handleSuccess = (user: AuthUser) => navigate(ROLE_HOME[user.role], { replace: true });

  return (
    <div className="grid min-h-screen bg-offwhite lg:grid-cols-2">
      <BrandPanel />
      <main className="flex flex-col">
        {/* Compact branding for mobile and tablet */}
        <header className="bg-ink px-6 py-5 sm:px-10 lg:hidden">
          <BrandMark />
          <p className="mt-3 max-w-sm text-sm text-white/70">Your Time. Your Opportunities. Better Together.</p>
        </header>
        <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            <LoginForm onSuccess={handleSuccess} />
          </div>
        </div>
      </main>
    </div>
  );
}
