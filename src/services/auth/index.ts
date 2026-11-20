import { supabaseAuthService } from './supabaseAuthService';
import type { AuthService } from '../../types/auth';

// Real Supabase Auth Service with automatic fallback
export const authService: AuthService = supabaseAuthService;
export { supabaseAuthService };
