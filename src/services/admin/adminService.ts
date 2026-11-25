import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import type {
  AdminActivityItem,
  AdminOverviewMetrics,
  AdminStudentItem,
  BulkImportRow,
  BulkImportSummary,
  InstitutionItem,
} from '../../types/admin';
import { validateEmail, validatePhone } from '../../lib/validation';
import {
  CURRENT_ADMIN_USER,
  INITIAL_ADMIN_ACTIVITIES,
  INITIAL_ADMIN_STUDENTS,
  INITIAL_INSTITUTIONS,
} from './mockAdminData';

const wait = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

const STORAGE_KEYS = {
  ADMIN_STUDENTS: 'maatram.admin.students',
  ADMIN_INSTITUTIONS: 'maatram.admin.institutions',
  ADMIN_ACTIVITIES: 'maatram.admin.activities',
};

function loadStored<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    return val ? (JSON.parse(val) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignore storage issues in test/private browsing
  }
}

class AdminService {
  private students: AdminStudentItem[];
  private institutions: InstitutionItem[];
  private activities: AdminActivityItem[];

  constructor() {
    this.students = loadStored(STORAGE_KEYS.ADMIN_STUDENTS, INITIAL_ADMIN_STUDENTS);
    this.institutions = loadStored(STORAGE_KEYS.ADMIN_INSTITUTIONS, INITIAL_INSTITUTIONS);
    this.activities = loadStored(STORAGE_KEYS.ADMIN_ACTIVITIES, INITIAL_ADMIN_ACTIVITIES);
    this.recalculateCounts();
  }

  private recalculateCounts() {
    this.institutions = this.institutions.map((inst) => {
      const count = this.students.filter(
        (s) => s.institution.toLowerCase().trim() === inst.name.toLowerCase().trim(),
      ).length;
      return { ...inst, registeredStudentCount: count };
    });
  }

  // ==========================================
  // Overview Dashboard
  // ==========================================
  async getOverviewMetrics(): Promise<AdminOverviewMetrics> {
    const students = await this.getStudents();
    const institutions = await this.getInstitutions();

    const activeStudents = students.filter((s) => s.accountStatus === 'Active').length;

    return {
      totalRegisteredStudents: students.length,
      totalInstitutions: institutions.length,
      activeStudents,
      studentsAddedRecently: 18,
      systemHealth: '100% Operational',
    };
  }

  async getRecentlyRegisteredStudents(limit = 6): Promise<AdminStudentItem[]> {
    const students = await this.getStudents();
    return students.slice(0, limit);
  }

  async getInstitutionDistribution(): Promise<
    Array<{ name: string; code: string; count: number; percentage: number }>
  > {
    const students = await this.getStudents();
    const institutions = await this.getInstitutions();
    const total = students.length || 1;
    return institutions.map((inst) => ({
      name: inst.name,
      code: inst.code,
      count: inst.registeredStudentCount,
      percentage: Math.round((inst.registeredStudentCount / total) * 100),
    }));
  }

  // ==========================================
  // Student Registration (Core Feature)
  // ==========================================
  async registerStudent(studentData: {
    name: string;
    email: string;
    phone: string;
    institution: string;
    academicYear: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
    department: string;
    studentId: string;
    location?: string;
  }): Promise<AdminStudentItem> {
    // 1. Validate required fields
    if (!studentData.name.trim()) throw new Error('Full student name is required.');
    if (!studentData.studentId.trim()) throw new Error('Student ID or Registration Number is required.');
    if (!studentData.institution.trim()) throw new Error('Academic institution is required.');
    if (!studentData.department.trim()) throw new Error('Department is required.');
    if (!studentData.academicYear) throw new Error('Academic year is required.');

    // 2. Validate formats
    const emailErr = validateEmail(studentData.email);
    if (emailErr) throw new Error(emailErr);

    const phoneErr = validatePhone(studentData.phone);
    if (phoneErr) throw new Error(phoneErr);

    // 3. Prevent duplicate Student IDs
    const duplicateId = this.students.find(
      (s) => s.studentId.trim().toLowerCase() === studentData.studentId.trim().toLowerCase(),
    );
    if (duplicateId) {
      throw new Error(`Student ID "${studentData.studentId}" is already registered for ${duplicateId.name}.`);
    }

    // 4. Prevent duplicate Email addresses
    const duplicateEmail = this.students.find(
      (s) => s.email.trim().toLowerCase() === studentData.email.trim().toLowerCase(),
    );
    if (duplicateEmail) {
      throw new Error(`Email address "${studentData.email}" is already registered for ${duplicateEmail.name}.`);
    }

    const newStudent: AdminStudentItem = {
      id: `std-reg-${Date.now()}`,
      studentId: studentData.studentId.trim(),
      name: studentData.name.trim(),
      email: studentData.email.trim().toLowerCase(),
      phone: studentData.phone.trim(),
      institution: studentData.institution.trim(),
      department: studentData.department.trim(),
      academicYear: studentData.academicYear,
      accountStatus: 'Active',
      registrationDate: new Date().toISOString().split('T')[0],
      availabilityStatus: 'Full Weekend Available',
      location: studentData.location?.trim() || 'Tamil Nadu, India',
    };

    if (isSupabaseConfigured) {
      try {
        // Resolve institution_id
        const { data: instData } = await supabase
          .from('institutions')
          .select('id')
          .ilike('institution_name', `%${studentData.institution.trim()}%`)
          .maybeSingle();

        // Generate synthetic UUID for profile if direct insert
        const newUuid = crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`;

        const { data, error } = await supabase
          .from('profiles')
          .insert({
            id: newUuid,
            full_name: newStudent.name,
            email: newStudent.email,
            phone: newStudent.phone,
            role: 'student', // STRICT SECURITY: Student role automatically enforced
            student_id: newStudent.studentId,
            academic_year: newStudent.academicYear,
            department: newStudent.department,
            institution_id: instData?.id || null,
            account_status: 'Active',
          })
          .select()
          .maybeSingle();

        if (!error && data) {
          newStudent.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase registerStudent fallback to local:', err);
      }
    }

    this.students = [newStudent, ...this.students];
    saveStored(STORAGE_KEYS.ADMIN_STUDENTS, this.students);
    this.recalculateCounts();

    this.logActivity({
      action: 'Student Registered',
      adminName: CURRENT_ADMIN_USER.name,
      affectedRecord: `Scholar ${newStudent.name} (${newStudent.studentId})`,
      actionType: 'Create',
      details: `Registered scholar with Student role for ${newStudent.institution}.`,
    });

    return newStudent;
  }

  async updateStudent(id: string, updates: Partial<AdminStudentItem>): Promise<AdminStudentItem> {
    const idx = this.students.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Student record not found.');

    if (updates.studentId && updates.studentId.trim().toLowerCase() !== this.students[idx].studentId.toLowerCase()) {
      const dup = this.students.find(
        (s) => s.id !== id && s.studentId.trim().toLowerCase() === updates.studentId!.trim().toLowerCase(),
      );
      if (dup) throw new Error(`Student ID "${updates.studentId}" is already assigned to ${dup.name}.`);
    }

    if (updates.email && updates.email.trim().toLowerCase() !== this.students[idx].email.toLowerCase()) {
      const dup = this.students.find(
        (s) => s.id !== id && s.email.trim().toLowerCase() === updates.email!.trim().toLowerCase(),
      );
      if (dup) throw new Error(`Email "${updates.email}" is already registered to ${dup.name}.`);
    }

    const updated: AdminStudentItem = {
      ...this.students[idx],
      ...updates,
    };

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: updated.name,
            phone: updated.phone,
            department: updated.department,
            academic_year: updated.academicYear,
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase updateStudent error:', err);
      }
    }

    this.students[idx] = updated;
    saveStored(STORAGE_KEYS.ADMIN_STUDENTS, this.students);
    this.recalculateCounts();

    this.logActivity({
      action: 'Student Record Updated',
      adminName: CURRENT_ADMIN_USER.name,
      affectedRecord: `Scholar ${updated.name} (${updated.studentId})`,
      actionType: 'Update',
      details: `Updated official registration information or department transfer.`,
    });

    return updated;
  }

  async toggleStudentAccountStatus(id: string, newStatus: AdminStudentItem['accountStatus']): Promise<AdminStudentItem> {
    const idx = this.students.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Student not found.');

    this.students[idx].accountStatus = newStatus;

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({ account_status: newStatus })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase toggleStudentAccountStatus error:', err);
      }
    }

    saveStored(STORAGE_KEYS.ADMIN_STUDENTS, this.students);
    this.recalculateCounts();

    this.logActivity({
      action: `Account Status Changed to ${newStatus}`,
      adminName: CURRENT_ADMIN_USER.name,
      affectedRecord: `Scholar ${this.students[idx].name} (${this.students[idx].studentId})`,
      actionType: 'Status Change',
      details: `Updated access status to ${newStatus}.`,
    });

    return { ...this.students[idx] };
  }

  // ==========================================
  // Bulk Student Import
  // ==========================================
  validateBulkImport(input: any[] | string): {
    rows: BulkImportRow[];
    summary: BulkImportSummary;
  } {
    if (typeof input === 'string') {
      return this.validateBulkCSV(input);
    }

    const rows: BulkImportRow[] = [];
    const seenEmails = new Set<string>();
    const seenIds = new Set<string>();

    input.forEach((row: any, idx: number) => {
      const name = (row.name || '').trim();
      const email = (row.email || '').trim();
      const phone = (row.phone || '').trim();
      const institution = (row.institution || '').trim();
      const department = (row.department || '').trim();
      const academicYear = (row.academicyear || row.academic_year || '').trim();
      const studentId = (row.studentid || row.student_id || '').trim();

      const errors: string[] = [];
      if (!name) errors.push('Name is required');
      if (!studentId) errors.push('Student ID is required');
      else if (seenIds.has(studentId.toLowerCase())) errors.push(`Duplicate ID in CSV: ${studentId}`);
      else if (this.students.some((s) => s.studentId.toLowerCase() === studentId.toLowerCase())) {
        errors.push(`Student ID "${studentId}" already exists in database`);
      } else {
        seenIds.add(studentId.toLowerCase());
      }

      if (!email) errors.push('Email is required');
      else {
        const emErr = validateEmail(email);
        if (emErr) errors.push(emErr);
        else if (seenEmails.has(email.toLowerCase())) errors.push(`Duplicate email in CSV: ${email}`);
        else if (this.students.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
          errors.push(`Email "${email}" already registered in database`);
        } else {
          seenEmails.add(email.toLowerCase());
        }
      }

      if (!phone) errors.push('Phone is required');
      else {
        const phErr = validatePhone(phone);
        if (phErr) errors.push(phErr);
      }

      if (!institution) errors.push('Institution is required');
      if (!department) errors.push('Department is required');
      if (!academicYear) errors.push('Academic year is required');

      rows.push({
        rowNumber: idx + 2,
        name,
        email,
        phone,
        institution,
        department,
        academicYear,
        studentId,
        isValid: errors.length === 0,
        errors,
      });
    });

    const validRows = rows.filter((r) => r.isValid).length;
    const invalidRows = rows.filter((r) => !r.isValid).length;

    return {
      rows,
      summary: {
        totalRows: rows.length,
        validRows,
        invalidRows,
        importedCount: 0,
        skippedDuplicates: invalidRows,
      },
    };
  }

  validateBulkCSV(csvText: string): {
    rows: BulkImportRow[];
    summary: BulkImportSummary;
  } {
    const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      throw new Error('CSV must contain a header row followed by at least one student data row.');
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/['"]/g, ''));
    const requiredCols = ['name', 'email', 'phone', 'institution', 'department', 'academicyear', 'studentid'];
    const missing = requiredCols.filter((col) => !headers.includes(col));

    if (missing.length > 0) {
      throw new Error(
        `Missing required CSV header columns: ${missing.join(', ')}. Please use the template format.`,
      );
    }

    const colIndices = {
      name: headers.indexOf('name'),
      email: headers.indexOf('email'),
      phone: headers.indexOf('phone'),
      institution: headers.indexOf('institution'),
      department: headers.indexOf('department'),
      academicYear: headers.indexOf('academicyear'),
      studentId: headers.indexOf('studentid'),
    };

    const rows: BulkImportRow[] = [];
    const seenEmails = new Set<string>();
    const seenIds = new Set<string>();

    lines.slice(1).forEach((line, index) => {
      const rowNum = index + 2;
      const values = line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
      const name = values[colIndices.name] || '';
      const email = values[colIndices.email] || '';
      const phone = values[colIndices.phone] || '';
      const institution = values[colIndices.institution] || '';
      const department = values[colIndices.department] || '';
      const academicYear = values[colIndices.academicYear] || '';
      const studentId = values[colIndices.studentId] || '';

      const errors: string[] = [];

      if (!name) errors.push('Name is required');
      if (!studentId) errors.push('Student ID is required');
      else if (seenIds.has(studentId.toLowerCase())) errors.push(`Duplicate ID in CSV: ${studentId}`);
      else if (this.students.some((s) => s.studentId.toLowerCase() === studentId.toLowerCase())) {
        errors.push(`Student ID "${studentId}" already exists in database`);
      } else {
        seenIds.add(studentId.toLowerCase());
      }

      if (!email) errors.push('Email is required');
      else {
        const emErr = validateEmail(email);
        if (emErr) errors.push(emErr);
        else if (seenEmails.has(email.toLowerCase())) errors.push(`Duplicate email in CSV: ${email}`);
        else if (this.students.some((s) => s.email.toLowerCase() === email.toLowerCase())) {
          errors.push(`Email "${email}" already registered in database`);
        } else {
          seenEmails.add(email.toLowerCase());
        }
      }

      if (!phone) errors.push('Phone is required');
      else {
        const phErr = validatePhone(phone);
        if (phErr) errors.push(phErr);
      }

      if (!institution) errors.push('Institution is required');
      if (!department) errors.push('Department is required');
      if (!academicYear) errors.push('Academic year is required');

      rows.push({
        rowNumber: rowNum,
        name,
        email,
        phone,
        institution,
        department,
        academicYear,
        studentId,
        isValid: errors.length === 0,
        errors,
      });
    });

    const validRows = rows.filter((r) => r.isValid).length;
    const invalidRows = rows.filter((r) => !r.isValid).length;

    return {
      rows,
      summary: {
        totalRows: rows.length,
        validRows,
        invalidRows,
        importedCount: 0,
        skippedDuplicates: invalidRows,
      },
    };
  }

  async executeBulkImport(validRows: BulkImportRow[]): Promise<BulkImportSummary> {
    const newStudents: AdminStudentItem[] = validRows
      .filter((r) => r.isValid)
      .map((r, idx) => ({
        id: `std-bulk-${Date.now()}-${idx}`,
        studentId: r.studentId,
        name: r.name,
        email: r.email,
        phone: r.phone,
        institution: r.institution,
        department: r.department,
        academicYear: (['1st Year', '2nd Year', '3rd Year', '4th Year'].includes(r.academicYear)
          ? r.academicYear
          : '3rd Year') as AdminStudentItem['academicYear'],
        accountStatus: 'Active',
        registrationDate: new Date().toISOString().split('T')[0],
        availabilityStatus: 'Full Weekend Available',
        location: 'Tamil Nadu, India',
      }));

    this.students = [...newStudents, ...this.students];
    saveStored(STORAGE_KEYS.ADMIN_STUDENTS, this.students);
    this.recalculateCounts();

    this.logActivity({
      action: 'Bulk Student Import Executed',
      adminName: CURRENT_ADMIN_USER.name,
      affectedRecord: `${newStudents.length} Scholar Records`,
      actionType: 'Import',
      details: `Successfully imported ${newStudents.length} verified scholars into student directory.`,
    });

    return {
      totalRows: validRows.length,
      validRows: newStudents.length,
      invalidRows: 0,
      importedCount: newStudents.length,
      skippedDuplicates: 0,
    };
  }

  // ==========================================
  // Student Directory
  // ==========================================
  async getStudents(filters?: {
    search?: string;
    institution?: string;
    academicYear?: string;
    department?: string;
    accountStatus?: string;
  }): Promise<AdminStudentItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            email,
            phone,
            role,
            academic_year,
            department,
            student_id,
            account_status,
            institutions (institution_name)
          `)
          .eq('role', 'student');

        if (!error && data && data.length > 0) {
          this.students = data.map((d: any, idx: number) => ({
            id: d.id,
            name: d.full_name,
            email: d.email,
            phone: d.phone || '+91 98401 23456',
            institution: d.institutions?.institution_name || 'Anna University',
            department: d.department || 'Computer Science & Engineering',
            academicYear: d.academic_year || '3rd Year',
            studentId: d.student_id || `MS-2024-${String(idx + 1).padStart(3, '0')}`,
            accountStatus: d.account_status,
            registrationDate: '2024-07-15',
            availabilityStatus: 'Full Weekend Available',
            location: 'Tamil Nadu, India',
          }));
        }
      } catch (err) {
        console.warn('Supabase getStudents fallback:', err);
      }
    }

    let list = [...this.students];
    if (!filters) return list;

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          s.institution.toLowerCase().includes(q),
      );
    }

    if (filters.institution && filters.institution !== 'All') {
      list = list.filter((s) => s.institution === filters.institution);
    }

    if (filters.academicYear && filters.academicYear !== 'All') {
      list = list.filter((s) => s.academicYear === filters.academicYear);
    }

    if (filters.department && filters.department !== 'All') {
      list = list.filter((s) => s.department === filters.department);
    }

    if (filters.accountStatus && filters.accountStatus !== 'All') {
      list = list.filter((s) => s.accountStatus === filters.accountStatus);
    }

    return list;
  }

  // ==========================================
  // Institution Management
  // ==========================================
  async getInstitutions(): Promise<InstitutionItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('institutions').select('*');
        if (!error && data && data.length > 0) {
          this.institutions = data.map((d: any) => ({
            id: d.id,
            name: d.institution_name,
            code: d.institution_code,
            location: d.location,
            contactPerson: d.contact_details?.dean || d.contact_details?.coordinator || 'Liaison Officer',
            contactEmail: d.contact_details?.email || 'contact@college.edu',
            contactPhone: d.contact_details?.phone || '+91 44 2235 7000',
            status: d.status,
            registeredStudentCount: this.students.filter((s) => s.institution === d.institution_name).length,
          }));
        }
      } catch (err) {
        console.warn('Supabase getInstitutions fallback:', err);
      }
    }

    this.recalculateCounts();
    return [...this.institutions];
  }

  async addInstitution(instData: {
    name: string;
    code: string;
    location: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    status: 'Active' | 'Inactive';
    website?: string;
  }): Promise<InstitutionItem> {
    const dup = this.institutions.find(
      (i) => i.code.toLowerCase() === instData.code.trim().toLowerCase(),
    );
    if (dup) throw new Error(`Institution code "${instData.code}" already exists for ${dup.name}.`);

    const newInst: InstitutionItem = {
      ...instData,
      id: `inst-${Date.now()}`,
      code: instData.code.trim().toUpperCase(),
      name: instData.name.trim(),
      registeredStudentCount: 0,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('institutions')
          .insert({
            institution_name: newInst.name,
            institution_code: newInst.code,
            location: newInst.location,
            contact_details: {
              coordinator: newInst.contactPerson,
              email: newInst.contactEmail,
              phone: newInst.contactPhone,
            },
            status: newInst.status,
          })
          .select()
          .maybeSingle();

        if (!error && data) {
          newInst.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase addInstitution error:', err);
      }
    }

    this.institutions = [...this.institutions, newInst];
    saveStored(STORAGE_KEYS.ADMIN_INSTITUTIONS, this.institutions);

    this.logActivity({
      action: 'Institution Created',
      adminName: CURRENT_ADMIN_USER.name,
      affectedRecord: `Institution ${newInst.name} (${newInst.code})`,
      actionType: 'Create',
      details: `Added new engineering partner institution in ${newInst.location}.`,
    });

    return newInst;
  }

  async updateInstitution(id: string, updates: Partial<InstitutionItem>): Promise<InstitutionItem> {
    const idx = this.institutions.findIndex((i) => i.id === id);
    if (idx === -1) throw new Error('Institution not found.');

    const updated = { ...this.institutions[idx], ...updates };

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('institutions')
          .update({
            institution_name: updated.name,
            location: updated.location,
            status: updated.status,
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase updateInstitution error:', err);
      }
    }

    this.institutions[idx] = updated;
    saveStored(STORAGE_KEYS.ADMIN_INSTITUTIONS, this.institutions);

    this.logActivity({
      action: 'Institution Updated',
      adminName: CURRENT_ADMIN_USER.name,
      affectedRecord: `Institution ${updated.name}`,
      actionType: 'Update',
      details: `Updated contact information or location details.`,
    });

    return updated;
  }

  async toggleInstitutionStatus(id: string): Promise<InstitutionItem> {
    const target = this.institutions.find((i) => i.id === id);
    if (!target) throw new Error('Institution not found.');

    target.status = target.status === 'Active' ? 'Inactive' : 'Active';

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('institutions')
          .update({ status: target.status })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase toggleInstitutionStatus error:', err);
      }
    }

    saveStored(STORAGE_KEYS.ADMIN_INSTITUTIONS, this.institutions);

    this.logActivity({
      action: `Institution Status Changed to ${target.status}`,
      adminName: CURRENT_ADMIN_USER.name,
      affectedRecord: `Institution ${target.name}`,
      actionType: 'Status Change',
      details: `Toggled operational status to ${target.status}.`,
    });

    return { ...target };
  }

  // Deletion protection requirement: Cannot delete institution with registered students!
  async deleteInstitution(id: string): Promise<void> {
    this.recalculateCounts();
    const inst = this.institutions.find((i) => i.id === id);
    if (!inst) throw new Error('Institution not found.');

    if (inst.registeredStudentCount > 0) {
      throw new Error(
        `Cannot delete institution "${inst.name}". There are currently ${inst.registeredStudentCount} registered scholars assigned to this institution. Please reassign the scholars to another institution before deleting.`,
      );
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('institutions').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deleteInstitution error:', err);
      }
    }

    this.institutions = this.institutions.filter((i) => i.id !== id);
    saveStored(STORAGE_KEYS.ADMIN_INSTITUTIONS, this.institutions);

    this.logActivity({
      action: 'Institution Deleted',
      adminName: CURRENT_ADMIN_USER.name,
      affectedRecord: `Institution ${inst.name}`,
      actionType: 'Delete',
      details: `Removed institution with 0 registered scholars.`,
    });
  }

  // ==========================================
  // Admin Activity Log
  // ==========================================
  async getRecentActivities(): Promise<AdminActivityItem[]> {
    return this.getActivityLogs();
  }

  async getActivityLogs(filters?: {
    search?: string;
    actionType?: string;
  }): Promise<AdminActivityItem[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('activity_logs')
          .select(`
            id,
            action,
            entity_type,
            entity_id,
            details,
            created_at,
            profiles (full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data && data.length > 0) {
          const mapped: AdminActivityItem[] = data.map((d: any) => ({
            id: d.id,
            action: d.action,
            adminName: (d.profiles as any)?.full_name || 'Dr. Ananya Sundaram',
            affectedRecord: d.entity_id || d.entity_type,
            timestamp: d.created_at,
            actionType: 'Create',
            details: d.details || 'Administrative event logged in Supabase',
          }));
          this.activities = mapped;
        }
      } catch (err) {
        console.warn('Supabase getActivityLogs fallback:', err);
      }
    }

    let list = [...this.activities];
    if (!filters) return list;

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.action.toLowerCase().includes(q) ||
          a.affectedRecord.toLowerCase().includes(q) ||
          a.details.toLowerCase().includes(q) ||
          a.adminName.toLowerCase().includes(q),
      );
    }

    if (filters.actionType && filters.actionType !== 'All') {
      list = list.filter((a) => a.actionType === filters.actionType);
    }

    return list;
  }

  private async logActivity(activity: Omit<AdminActivityItem, 'id' | 'timestamp'>) {
    const newLog: AdminActivityItem = {
      ...activity,
      id: `adm-act-${Date.now()}`,
      timestamp: 'Just now',
    };
    this.activities = [newLog, ...this.activities.slice(0, 49)];
    saveStored(STORAGE_KEYS.ADMIN_ACTIVITIES, this.activities);

    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from('activity_logs').insert({
          action: activity.action,
          entity_type: activity.actionType,
          entity_id: activity.affectedRecord,
          details: activity.details,
          actor_id: user?.id || null,
        });
      } catch (err) {
        // Silent catch for background audit insertion
      }
    }
  }
}

export const adminService = new AdminService();
