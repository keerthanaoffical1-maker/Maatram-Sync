import type { UserRole } from '../types/auth';

export const ROLE_HOME: Record<UserRole, string> = {
  student: '/student',
  office: '/office',
  admin: '/admin',
};
