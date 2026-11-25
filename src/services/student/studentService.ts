import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import type {
  AvailabilitySummary,
  SlotStatus,
  StudentNotification,
  StudentProfile,
  StudentSession,
  WeeklyAvailability,
} from '../../types/student';
import {
  INITIAL_NOTIFICATIONS,
  INITIAL_SESSIONS,
  INITIAL_STUDENT_PROFILE,
  TIME_SLOTS,
  generateDefaultWeekSlots,
} from './mockStudentData';

const wait = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

const STORAGE_KEYS = {
  PROFILE: 'maatram.student.profile',
  SESSIONS: 'maatram.student.sessions',
  NOTIFICATIONS: 'maatram.student.notifications',
  AVAILABILITY_PREFIX: 'maatram.student.availability.',
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
    // Ignore storage issues in private browsing
  }
}

class StudentService {
  private profile: StudentProfile;
  private sessions: StudentSession[];
  private notifications: StudentNotification[];
  private availabilityCache: Map<string, Record<string, SlotStatus>> = new Map();

  constructor() {
    this.profile = loadStored(STORAGE_KEYS.PROFILE, INITIAL_STUDENT_PROFILE);
    this.sessions = loadStored(STORAGE_KEYS.SESSIONS, INITIAL_SESSIONS);
    this.notifications = loadStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  }

  // ==========================================
  // Profile
  // ==========================================
  async getProfile(): Promise<StudentProfile> {
    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
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
            .eq('id', user.id)
            .single();

          if (!error && data) {
            const instName = (data.institutions as any)?.institution_name || this.profile.institution;

            this.profile = {
              ...this.profile,
              id: data.id,
              name: data.full_name,
              email: data.email,
              phone: data.phone || this.profile.phone,
              institution: instName,
              department: data.department || this.profile.department,
              academicYear: data.academic_year || this.profile.academicYear,
              studentId: data.student_id || this.profile.studentId,
              role: 'student',
              enrollmentStatus: data.account_status === 'Active' ? 'Active' : 'On Leave',
            };
            saveStored(STORAGE_KEYS.PROFILE, this.profile);
            return { ...this.profile };
          }
        }
      } catch (err) {
        console.warn('Supabase getProfile fallback:', err);
      }
    }

    await wait(80);
    return { ...this.profile };
  }

  async updateProfile(updates: Partial<StudentProfile>): Promise<StudentProfile> {
    const {
      role: _ignoreRole,
      institution: _ignoreInst,
      department: _ignoreDept,
      academicYear: _ignoreYear,
      studentId: _ignoreId,
      enrollmentStatus: _ignoreStatus,
      ...permittedUpdates
    } = updates;

    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && permittedUpdates.phone) {
          await supabase
            .from('profiles')
            .update({
              phone: permittedUpdates.phone,
            })
            .eq('id', user.id);
        }
      } catch (err) {
        console.warn('Supabase updateProfile error, saved locally:', err);
      }
    }

    this.profile = {
      ...this.profile,
      ...permittedUpdates,
    };
    saveStored(STORAGE_KEYS.PROFILE, this.profile);
    return { ...this.profile };
  }

  // ==========================================
  // Weekly Availability
  // ==========================================
  async getWeeklyAvailability(weekMondayStr: string): Promise<WeeklyAvailability> {
    const monday = new Date(weekMondayStr);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const weekEndStr = sunday.toISOString().split('T')[0];

    let slots: Record<string, SlotStatus> | undefined = this.availabilityCache.get(weekMondayStr);

    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('availability_entries')
            .select('date, start_time, availability_status')
            .eq('student_id', user.id)
            .gte('date', weekMondayStr)
            .lte('date', weekEndStr);

          if (!error && data && data.length > 0) {
            const dbSlots: Record<string, SlotStatus> = {};
            data.forEach((entry: any) => {
              const timeSlotId = entry.start_time ? entry.start_time.slice(0, 5) : '09:00';
              const key = `${entry.date}_${timeSlotId}`;
              dbSlots[key] = entry.availability_status;
            });
            slots = { ...generateDefaultWeekSlots(weekMondayStr), ...dbSlots };
            this.availabilityCache.set(weekMondayStr, slots);
            saveStored(STORAGE_KEYS.AVAILABILITY_PREFIX + weekMondayStr, slots);
          }
        }
      } catch (err) {
        console.warn('Supabase getWeeklyAvailability fallback:', err);
      }
    }

    if (!slots) {
      const key = STORAGE_KEYS.AVAILABILITY_PREFIX + weekMondayStr;
      slots = loadStored<Record<string, SlotStatus> | null>(key, null) || undefined;
      if (!slots) {
        slots = generateDefaultWeekSlots(weekMondayStr);
      }
      this.availabilityCache.set(weekMondayStr, slots);
    }

    return {
      weekStart: weekMondayStr,
      weekEnd: weekEndStr,
      weekNumber: 47,
      year: monday.getFullYear(),
      slots: { ...slots },
      isSubmitted: true,
      lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  async saveWeeklyAvailability(
    weekMondayStr: string,
    slots: Record<string, SlotStatus>,
  ): Promise<{ ok: boolean; savedCount: number; message: string }> {
    this.availabilityCache.set(weekMondayStr, { ...slots });
    saveStored(STORAGE_KEYS.AVAILABILITY_PREFIX + weekMondayStr, slots);

    if (isSupabaseConfigured) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const entries = Object.entries(slots).map(([key, status]) => {
            const [datePart, timeId] = key.split('_');
            const cleanTime = timeId || '09:00';
            const hour = parseInt(cleanTime.split(':')[0], 10);
            const nextHour = String(hour + 1).padStart(2, '0') + ':00:00';
            return {
              student_id: user.id,
              date: datePart,
              start_time: cleanTime + ':00',
              end_time: nextHour,
              availability_status: status,
              updated_at: new Date().toISOString(),
            };
          });

          if (entries.length > 0) {
            await supabase
              .from('availability_entries')
              .upsert(entries, { onConflict: 'student_id,date,start_time,end_time' });
          }
        }
      } catch (err) {
        console.warn('Supabase saveWeeklyAvailability error, persisted locally:', err);
      }
    }

    const availableCount = Object.values(slots).filter((s) => s === 'available').length;
    return {
      ok: true,
      savedCount: availableCount,
      message: `Availability updated: ${availableCount} slots marked available for this week.`,
    };
  }

  async copyAvailability(
    fromMondayStr: string,
    toMondayStr: string,
  ): Promise<WeeklyAvailability> {
    const source = await this.getWeeklyAvailability(fromMondayStr);

    const sourceMonday = new Date(fromMondayStr);
    const targetMonday = new Date(toMondayStr);
    const diffDays = Math.round((targetMonday.getTime() - sourceMonday.getTime()) / (1000 * 60 * 60 * 24));

    const copiedSlots: Record<string, SlotStatus> = {};

    Object.entries(source.slots).forEach(([key, status]) => {
      const parts = key.split('_');
      const datePart = parts[0];
      const slotPart = parts.slice(1).join('_');
      if (datePart && slotPart) {
        const curDate = new Date(datePart);
        curDate.setDate(curDate.getDate() + diffDays);
        const y = curDate.getFullYear();
        const m = String(curDate.getMonth() + 1).padStart(2, '0');
        const d = String(curDate.getDate()).padStart(2, '0');
        copiedSlots[`${y}-${m}-${d}_${slotPart}`] = status;
      }
    });

    await this.saveWeeklyAvailability(toMondayStr, copiedSlots);
    return this.getWeeklyAvailability(toMondayStr);
  }

  // ==========================================
  // Scheduled Sessions
  // ==========================================
  async getUpcomingSessions(): Promise<StudentSession[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('events')
          .select(`
            id,
            title,
            category,
            description,
            event_mode,
            location,
            start_datetime,
            end_datetime,
            mentor_name,
            meeting_url
          `)
          .eq('status', 'Scheduled')
          .order('start_datetime', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: StudentSession[] = data.map((ev: any) => {
            const startDate = new Date(ev.start_datetime);
            return {
              id: ev.id,
              sessionTitle: ev.title,
              category: ev.category,
              date: startDate.toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              }),
              rawDate: ev.start_datetime.split('T')[0],
              time: startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
              mode: ev.event_mode || 'Online',
              locationOrLink: ev.meeting_url || ev.location || 'Google Meet',
              status: 'Confirmed',
              mentorOrHost: ev.mentor_name || 'Maatram Office Team',
              preparationNotes: ev.description || 'Confirmed scheduled workshop session.',
              meetingPlatform: ev.event_mode === 'Online' ? 'Google Meet' : 'In-Person',
            };
          });
          this.sessions = mapped;
          saveStored(STORAGE_KEYS.SESSIONS, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getUpcomingSessions fallback:', err);
      }
    }

    await wait(80);
    return [...this.sessions];
  }

  // ==========================================
  // Notifications
  // ==========================================
  async getNotifications(): Promise<StudentNotification[]> {
    await wait(80);
    return [...this.notifications];
  }

  async markNotificationRead(id: string): Promise<void> {
    this.notifications = this.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    saveStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  async markAllNotificationsRead(): Promise<void> {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    saveStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  // ==========================================
  // Summary Metrics
  // ==========================================
  async getAvailabilitySummary(weekMondayStr: string): Promise<AvailabilitySummary> {
    const weekAvail = await this.getWeeklyAvailability(weekMondayStr);
    const slots = weekAvail.slots;

    const totalSlots = Object.keys(slots).length;
    const availableSlots = Object.values(slots).filter((s) => s === 'available').length;
    const unavailableSlots = Object.values(slots).filter((s) => s === 'unavailable').length;

    const sessions = await this.getUpcomingSessions();
    const confirmedSessionsCount = sessions.filter((s) => s.status === 'Confirmed').length;

    return {
      status: availableSlots >= 6 ? 'Updated' : 'Pending Review',
      totalSlotsMarked: totalSlots,
      availableHours: availableSlots,
      unavailableHours: unavailableSlots,
      confirmedSessionsCount,
    };
  }
}

export const studentService = new StudentService();
