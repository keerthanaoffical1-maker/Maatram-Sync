import type { AuthService, AuthUser, SignInResult } from '../../types/auth';

/**
 * ⚠️ DEVELOPMENT-ONLY MOCK. NOT SECURE.
 * Passwords are hard-coded in client code and anyone can read them.
 * It refuses to run in production builds. Replace with Supabase Auth.
 */
const MOCK_ACCOUNTS: Array<AuthUser & { password: string }> = [
  { id: 'mock-student', email: 'student@maatram.dev', password: 'Student@123', name: 'Demo Student', role: 'student' },
  { id: 'mock-office', email: 'office@maatram.dev', password: 'Office@123', name: 'Demo Office Member', role: 'office' },
  { id: 'mock-admin', email: 'admin@maatram.dev', password: 'Admin@123', name: 'Demo Admin', role: 'admin' },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockAuthService: AuthService = {
  isMock: true,

  async signIn({ email, password }): Promise<SignInResult> {
    await wait(900);
    if (!import.meta.env.DEV) {
      return { ok: false, code: 'unknown', message: 'Sign-in is not configured yet. Contact the Maatram team.' };
    }
    const account = MOCK_ACCOUNTS.find((a) => a.email === email.trim().toLowerCase());
    if (!account || account.password !== password) {
      return { ok: false, code: 'invalid_credentials', message: "That email and password don't match. Check them and try again." };
    }
    const { password: _omit, ...user } = account;
    return { ok: true, user };
  },

  async requestPasswordReset(): Promise<void> {
    await wait(700); // Placeholder: no email is actually sent.
  },
};
