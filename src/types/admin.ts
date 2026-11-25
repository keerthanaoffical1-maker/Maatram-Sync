import type { StudentAvailabilityCategory } from './office';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  title: string;
  department: string;
  avatarUrl?: string;
}

export type AccountStatus = 'Active' | 'Inactive' | 'Suspended';

export interface AdminStudentItem {
  id: string;
  studentId: string; // e.g. "MS-2024-001"
  name: string;
  email: string;
  phone: string;
  institution: string;
  department: string;
  academicYear: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  accountStatus: AccountStatus;
  registrationDate: string; // "2026-11-15"
  availabilityStatus: StudentAvailabilityCategory;
  location: string;
}

export interface InstitutionItem {
  id: string;
  name: string;
  code: string; // e.g. "CEG", "MIT"
  location: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  status: 'Active' | 'Inactive';
  registeredStudentCount: number;
  establishedYear?: number;
  website?: string;
}

export interface AdminActivityItem {
  id: string;
  action: string;
  adminName: string;
  affectedRecord: string; // e.g. "Student MS-2024-048", "Institution CEG"
  timestamp: string;
  actionType: 'Create' | 'Update' | 'Status Change' | 'Import' | 'Delete';
  details: string;
}

export interface BulkImportRow {
  rowNumber: number;
  name: string;
  email: string;
  phone: string;
  institution: string;
  department: string;
  academicYear: string;
  studentId: string;
  isValid: boolean;
  errors: string[];
}

export interface BulkImportSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  importedCount: number;
  skippedDuplicates: number;
}

export interface AdminOverviewMetrics {
  totalRegisteredStudents: number;
  totalInstitutions: number;
  activeStudents: number;
  studentsAddedRecently: number; // added in last 30 days
  systemHealth: string;
}
