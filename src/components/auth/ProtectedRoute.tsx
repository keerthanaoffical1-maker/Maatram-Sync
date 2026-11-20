import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_HOME } from '../../lib/roles';
import type { UserRole } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-offwhite">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-gold" />
          <p className="text-xs font-semibold tracking-wider uppercase text-charcoal/70">
            Verifying Maatram credentials…
          </p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!user || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to the user's authorized home
    const home = ROLE_HOME[role] || '/login';
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}
