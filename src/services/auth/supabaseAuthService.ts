import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import type { AuthService, AuthUser, SignInCredentials, SignInResult, UserRole } from '../../types/auth';
import { mockAuthService } from './mockAuthService';

export class SupabaseAuthService implements AuthService {
  get isMock(): boolean {
    return !isSupabaseConfigured;
  }

  async signIn({ email, password }: SignInCredentials): Promise<SignInResult> {
    // If Supabase environment is not configured, fallback gracefully to mock accounts
    if (!isSupabaseConfigured) {
      return mockAuthService.signIn({ email, password });
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data.user) {
        return {
          ok: false,
          code: 'invalid_credentials',
          message: error?.message || "That email and password don't match. Please try again.",
        };
      }

      // Fetch user's assigned role and account status from the profiles table
      const profileRes = await supabase
        .from('profiles')
        .select('id, full_name, email, role, account_status')
        .eq('id', data.user.id)
        .single();
      const profile: any = profileRes.data;

      if (profileRes.error || !profile) {
        // Fallback: Check metadata if profile row is pending trigger execution
        const metaRole = (data.user.user_metadata?.role as UserRole) || 'student';
        const metaName = data.user.user_metadata?.full_name || cleanEmail;
        return {
          ok: true,
          user: {
            id: data.user.id,
            email: cleanEmail,
            name: metaName,
            role: metaRole,
          },
        };
      }

      // Check account status
      if (profile.account_status === 'Inactive') {
        await supabase.auth.signOut();
        return {
          ok: false,
          code: 'invalid_credentials',
          message: 'Your account has been deactivated by an administrator. Please contact Maatram support.',
        };
      }

      const authUser: AuthUser = {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role,
      };

      return { ok: true, user: authUser };
    } catch (err: any) {
      return {
        ok: false,
        code: 'network',
        message: err?.message || 'Network connection error while connecting to authentication service.',
      };
    }
  }

  async signOut(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('maatram.auth.session');
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    if (!isSupabaseConfigured) {
      // Return cached user from local storage if any
      const stored = localStorage.getItem('maatram.auth.session');
      return stored ? JSON.parse(stored) : null;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const profileRes = await supabase
        .from('profiles')
        .select('id, full_name, email, role, account_status')
        .eq('id', user.id)
        .single();
      const profile: any = profileRes.data;

      if (!profile || profile.account_status === 'Inactive') return null;

      return {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        role: profile.role,
      };
    } catch {
      return null;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    if (!isSupabaseConfigured) {
      return mockAuthService.requestPasswordReset(email);
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}

export const supabaseAuthService = new SupabaseAuthService();
