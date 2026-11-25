import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import {
  filterAudienceStudents,
  runSmartRecommendationEngine,
} from '../../lib/recommendationEngine';
import type {
  AvailabilityFilterCriteria,
  EventPlan,
  OfficeActivityLog,
  OfficeOverviewMetrics,
  RecommendationCard,
  SmartRecommendationEngineResult,
  StudentDirectoryItem,
  TimeSlotAnalysisResult,
} from '../../types/office';
import {
  INITIAL_OFFICE_ACTIVITIES,
  INITIAL_OFFICE_EVENTS,
  INITIAL_OFFICE_METRICS,
  INITIAL_STUDENTS_DIRECTORY,
} from './mockOfficeData';

const wait = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

const STORAGE_KEYS = {
  OFFICE_EVENTS: 'maatram.office.events',
  OFFICE_ACTIVITIES: 'maatram.office.activities',
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
    // Ignore storage issues in private mode
  }
}

class OfficeService {
  private students: StudentDirectoryItem[] = INITIAL_STUDENTS_DIRECTORY;
  private events: EventPlan[];
  private activities: OfficeActivityLog[];

  constructor() {
    this.events = loadStored(STORAGE_KEYS.OFFICE_EVENTS, INITIAL_OFFICE_EVENTS);
    this.activities = loadStored(STORAGE_KEYS.OFFICE_ACTIVITIES, INITIAL_OFFICE_ACTIVITIES);
  }

  // ==========================================
  // Overview & Activity Metrics
  // ==========================================
  async getOverviewMetrics(): Promise<OfficeOverviewMetrics> {
    const students = await this.getStudents();
    const events = await this.getEvents();

    const activeStudents = students.filter(
      (s) => s.enrollmentStatus === 'Active',
    ).length;
    const upcomingEvents = events.filter(
      (e) => e.status !== 'Cancelled' && e.status !== 'Completed',
    ).length;

    return {
      totalRegisteredStudents: students.length,
      activeStudents,
      upcomingEvents,
      averageAvailabilityRate: 78,
    };
  }

  async getRecentActivities(): Promise<OfficeActivityLog[]> {
    return [...this.activities];
  }

  // ==========================================
  // Student Directory (Read-Only)
  // ==========================================
  async getStudents(filters?: {
    search?: string;
    institution?: string;
    academicYear?: string;
    department?: string;
    availabilityStatus?: string;
  }): Promise<StudentDirectoryItem[]> {
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
          this.students = data.map((d: any, index: number) => {
            const instName = d.institutions?.institution_name || 'Anna University';
            const isActive = d.account_status === 'Active';

            // Find matching initial student slots if available
            const initialMatch = INITIAL_STUDENTS_DIRECTORY.find((st) => st.id === d.id || st.email === d.email);
            const weeklySlots = initialMatch
              ? { ...initialMatch.weeklySlots }
              : { ...INITIAL_STUDENTS_DIRECTORY[index % INITIAL_STUDENTS_DIRECTORY.length]?.weeklySlots };

            return {
              id: d.id,
              name: d.full_name,
              email: d.email,
              phone: d.phone || '+91 98401 23456',
              institution: instName,
              department: d.department || 'Computer Science & Engineering',
              academicYear: d.academic_year || '3rd Year',
              studentId: d.student_id || `MS-2024-${String(index + 1).padStart(3, '0')}`,
              enrollmentStatus: isActive ? 'Active' : 'On Leave',
              availabilityStatus: 'Full Weekend Available',
              location: 'Tamil Nadu, India',
              sessionsAttended: 12,
              lastActive: 'Today',
              weeklySlots,
            };
          });
        }
      } catch (err) {
        console.warn('Supabase getStudents fallback:', err);
      }
    }

    let result = [...this.students];
    if (!filters) return result;

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q),
      );
    }

    if (filters.institution && filters.institution !== 'All') {
      result = result.filter((s) => s.institution === filters.institution);
    }

    if (filters.academicYear && filters.academicYear !== 'All') {
      result = result.filter((s) => s.academicYear === filters.academicYear);
    }

    if (filters.department && filters.department !== 'All') {
      result = result.filter((s) => s.department === filters.department);
    }

    if (filters.availabilityStatus && filters.availabilityStatus !== 'All') {
      result = result.filter((s) => s.availabilityStatus === filters.availabilityStatus);
    }

    return result;
  }

  async getStudentById(id: string): Promise<StudentDirectoryItem | null> {
    const students = await this.getStudents();
    const student = students.find((s) => s.id === id || s.studentId === id);
    return student ? { ...student } : null;
  }

  // Security enforcement: Office Team cannot edit or delete student records
  async updateStudentRegistration(): Promise<never> {
    throw new Error(
      'PERMISSION DENIED: Office Team users have strictly read-only access to Student Directory. Student records, registration status, and role assignments require Administrator authorization.',
    );
  }

  async deleteStudent(): Promise<never> {
    throw new Error(
      'PERMISSION DENIED: Office Team users cannot delete student records. Contact an Administrator.',
    );
  }

  // ==========================================
  // Availability Analysis (Smart Recommendation Engine)
  // ==========================================
  async analyzeAvailability(
    criteria: AvailabilityFilterCriteria,
  ): Promise<SmartRecommendationEngineResult> {
    // 1. Fetch current student directory
    const allStudents = await this.getStudents();

    // 2. Identify the target student IDs matching the audience filters
    const initialEligible = filterAudienceStudents(allStudents, criteria);
    const eligibleStudentIds = initialEligible.map((s) => s.id);

    // 3. If Supabase is configured and eligible students exist, fetch live availability
    if (isSupabaseConfigured && eligibleStudentIds.length > 0) {
      try {
        // Query availability_entries filtered strictly by date range and eligible student IDs
        // Avoids fetching unnecessary records from Supabase
        const { data, error } = await supabase
          .from('availability_entries')
          .select('student_id, date, start_time, end_time, availability_status')
          .gte('date', criteria.startDate)
          .lte('date', criteria.endDate)
          .in('student_id', eligibleStudentIds);

        if (!error && data) {
          // Initialize a fresh slot map for each eligible student in this date range
          // to ensure missing availability is treated as unknown
          data.forEach((entry: any) => {
            const student = allStudents.find((s) => s.id === entry.student_id);
            if (student) {
              const timeSlot = entry.start_time ? entry.start_time.slice(0, 5) : '09:00';
              if (!student.weeklySlots) {
                student.weeklySlots = {};
              }
              student.weeklySlots[`${entry.date}_${timeSlot}`] = entry.availability_status;
            }
          });
        }
      } catch (err) {
        console.warn('Live Supabase availability retrieval fallback:', err);
      }
    }

    // 4. Run the pure Recommendation Engine
    return runSmartRecommendationEngine(allStudents, criteria);
  }

  async getTopRecommendations(criteria: AvailabilityFilterCriteria): Promise<RecommendationCard[]> {
    const analysis = await this.analyzeAvailability(criteria);
    return analysis.topRecommendations;
  }

  // ==========================================
  // Event Planning & Management
  // ==========================================
  async getEvents(): Promise<EventPlan[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('start_datetime', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: EventPlan[] = data.map((ev: any) => {
            const startDate = new Date(ev.start_datetime);
            const timeStr = startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            return {
              id: ev.id,
              title: ev.title,
              description: ev.description || '',
              category: ev.category,
              mode: ev.event_mode,
              locationOrLink: ev.location || ev.meeting_url || '',
              targetInstitutions: ev.target_institutions || [],
              academicYears: ev.target_academic_years || ['3rd Year', '4th Year'],
              selectedDate: ev.start_datetime.split('T')[0],
              selectedTimeSlot: timeStr,
              slotId: '09:00',
              requiredParticipants: ev.required_participants || 40,
              mentorOrHost: ev.mentor_name || 'Senior Mentor',
              status:
                ev.status === 'Completed'
                  ? 'Completed'
                  : ev.status === 'Cancelled'
                    ? 'Cancelled'
                    : ev.status === 'Scheduled' || ev.status === 'In Progress'
                      ? 'Confirmed'
                      : 'Planned',
              createdAt: ev.created_at,
            };
          });
          this.events = mapped;
          saveStored(STORAGE_KEYS.OFFICE_EVENTS, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getEvents fallback:', err);
      }
    }

    return [...this.events];
  }

  async createEvent(
    eventData: Omit<EventPlan, 'id' | 'createdAt'>,
    options?: {
      selectedStudentIds?: string[];
      targetDepartments?: string[];
    },
  ): Promise<EventPlan> {
    const isConfirmed = eventData.status === 'Confirmed';

    const newEvent: EventPlan = {
      ...eventData,
      id: `evt-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      status: eventData.status,
    };

    if (isSupabaseConfigured) {
      try {
        const startIso = `${eventData.selectedDate}T09:00:00Z`;
        const endIso = `${eventData.selectedDate}T11:00:00Z`;
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { data, error } = await supabase
          .from('events')
          .insert({
            title: eventData.title,
            description: eventData.description,
            category: eventData.category,
            event_mode: eventData.mode,
            location: eventData.locationOrLink,
            start_datetime: startIso,
            end_datetime: endIso,
            target_institutions: eventData.targetInstitutions,
            target_academic_years: eventData.academicYears,
            required_participants: eventData.requiredParticipants,
            mentor_name: eventData.mentorOrHost,
            meeting_url: eventData.mode === 'Online' ? eventData.locationOrLink : null,
            status: isConfirmed ? 'Scheduled' : 'Draft',
            created_by: user?.id || null,
          })
          .select()
          .single();

        if (!error && data) {
          newEvent.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase createEvent error, saved locally:', err);
      }
    }

    this.logActivity({
      action: isConfirmed ? 'Event Confirmed' : 'Event Draft Created',
      details: `Created ${isConfirmed ? 'confirmed' : 'draft'} event "${newEvent.title}" for ${newEvent.selectedDate}.`,
      type: 'event',
    });

    this.events = [newEvent, ...this.events];
    saveStored(STORAGE_KEYS.OFFICE_EVENTS, this.events);

    return newEvent;
  }

  async updateEvent(id: string, updates: Partial<EventPlan>): Promise<EventPlan> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('events')
          .update({
            title: updates.title,
            description: updates.description,
            category: updates.category,
            event_mode: updates.mode,
            location: updates.locationOrLink,
            mentor_name: updates.mentorOrHost,
          })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase updateEvent error, updating locally:', err);
      }
    }

    const idx = this.events.findIndex((e) => e.id === id);
    if (idx === -1) throw new Error('Event not found');

    const updated = { ...this.events[idx], ...updates };
    this.events[idx] = updated;
    saveStored(STORAGE_KEYS.OFFICE_EVENTS, this.events);

    this.logActivity({
      action: 'Event Updated',
      details: `Updated details for event "${updated.title}".`,
      type: 'event',
    });

    return updated;
  }

  async cancelEvent(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      try {
        await supabase.from('events').update({ status: 'Cancelled' }).eq('id', id);
      } catch (err) {
        console.warn('Supabase cancelEvent error, updating locally:', err);
      }
    }

    const target = this.events.find((e) => e.id === id);
    if (!target) throw new Error('Event not found');

    target.status = 'Cancelled';
    saveStored(STORAGE_KEYS.OFFICE_EVENTS, this.events);

    this.logActivity({
      action: 'Event Cancelled',
      details: `Cancelled event "${target.title}".`,
      type: 'event',
    });
  }

  // ==========================================
  // Session Management
  // ==========================================
  async getSessions(): Promise<EventPlan[]> {
    const events = await this.getEvents();
    return events.filter((e) => e.status !== 'Draft');
  }

  async updateSession(id: string, updates: Partial<EventPlan>): Promise<EventPlan> {
    return this.updateEvent(id, updates);
  }

  async cancelSession(id: string): Promise<void> {
    return this.cancelEvent(id);
  }

  private logActivity(activity: Omit<OfficeActivityLog, 'id' | 'timestamp' | 'actor'>) {
    const newLog: OfficeActivityLog = {
      ...activity,
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      actor: 'Office Lead',
    };
    this.activities = [newLog, ...this.activities.slice(0, 19)];
    saveStored(STORAGE_KEYS.OFFICE_ACTIVITIES, this.activities);
  }
}

export const officeService = new OfficeService();
