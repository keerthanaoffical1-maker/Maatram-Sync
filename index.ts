import { mockAuthService } from './mockAuthService';
import type { AuthService } from '../../types/auth';

// Swap this export for a Supabase-backed implementation when the backend is ready.
export const authService: AuthService = mockAuthService;
