export type UserRole = 'student' | 'office' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  /** Always comes from the authenticated account, never from user input. */
  role: UserRole;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export type AuthErrorCode = 'invalid_credentials' | 'network' | 'unknown';

export type SignInResult =
  | { ok: true; user: AuthUser }
  | { ok: false; code: AuthErrorCode; message: string };

/** Implement this interface with Supabase Auth later; the UI won't change. */
export interface AuthService {
  readonly isMock: boolean;
  signIn(credentials: SignInCredentials): Promise<SignInResult>;
  requestPasswordReset(email: string): Promise<void>;
}
