import type {
  StudentNotification,
  StudentProfile,
  StudentSession,
  TimeSlotConfig,
} from '../../types/student';

export const TIME_SLOTS: TimeSlotConfig[] = [
  { id: '08:00', label: '08:00 AM - 09:00 AM', period: 'morning' },
  { id: '09:00', label: '09:00 AM - 10:00 AM', period: 'morning' },
  { id: '10:00', label: '10:00 AM - 11:00 AM', period: 'morning' },
  { id: '11:00', label: '11:00 AM - 12:00 PM', period: 'morning' },
  { id: '13:00', label: '01:00 PM - 02:00 PM', period: 'afternoon' },
  { id: '14:00', label: '02:00 PM - 03:00 PM', period: 'afternoon' },
  { id: '15:00', label: '03:00 PM - 04:00 PM', period: 'afternoon' },
  { id: '16:00', label: '04:00 PM - 05:00 PM', period: 'afternoon' },
  { id: '17:00', label: '05:00 PM - 06:00 PM', period: 'evening' },
  { id: '18:00', label: '06:00 PM - 07:00 PM', period: 'evening' },
  { id: '19:00', label: '07:00 PM - 08:00 PM', period: 'evening' },
  { id: '20:00', label: '08:00 PM - 09:00 PM', period: 'evening' },
];

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  id: 'mock-student',
  name: 'Priya Dharshini K',
  email: 'student@maatram.dev',
  role: 'student',
  avatarUrl: '',
  institution: 'College of Engineering, Guindy (Anna University)',
  department: 'Computer Science and Engineering',
  academicYear: '3rd Year (B.E. 2024 - 2028)',
  studentId: 'MS-2024-0482',
  enrollmentStatus: 'Active',
  phone: '+91 98765 43210',
  location: 'Chennai, Tamil Nadu, India',
  notificationPreferences: {
    emailAlerts: true,
    smsAlerts: false,
    sessionReminders: true,
  },
};

export const INITIAL_SESSIONS: StudentSession[] = [
  {
    id: 'sess-001',
    sessionTitle: 'Full-Stack System Design & Microservices Workshop',
    category: 'Technical Workshop',
    date: 'Saturday, Nov 21, 2026',
    rawDate: '2026-11-21',
    time: '10:00 AM - 12:00 PM',
    mode: 'Online',
    locationOrLink: 'https://meet.google.com/syn-maat-ram',
    status: 'Confirmed',
    mentorOrHost: 'Ramesh Sundaram',
    mentorRole: 'Senior SDE @ Amazon',
    preparationNotes: 'Review fundamental Redis caching and SQL indexing principles.',
    meetingPlatform: 'Google Meet',
  },
  {
    id: 'sess-002',
    sessionTitle: 'Resume Critique & Personal Tech Branding Lab',
    category: 'Resume Review',
    date: 'Sunday, Nov 22, 2026',
    rawDate: '2026-11-22',
    time: '02:00 PM - 04:00 PM',
    mode: 'Offline',
    locationOrLink: 'Maatram Innovation Hub, Hall B, Guindy, Chennai',
    status: 'Confirmed',
    mentorOrHost: 'Meenakshi Iyer',
    mentorRole: 'Head of Campus Hiring @ Freshworks',
    preparationNotes: 'Bring two printed copies of your one-page technical resume.',
    meetingPlatform: 'In-Person',
  },
];

export const INITIAL_NOTIFICATIONS: StudentNotification[] = [
  {
    id: 'notif-2',
    title: 'Session Confirmed',
    message: 'System Design & Microservices Workshop has been added to your Upcoming Sessions for Wednesday, Nov 25.',
    timestamp: '2 hours ago',
    read: false,
    type: 'session',
    targetTab: 'sessions',
  },
  {
    id: 'notif-3',
    title: 'Weekly Availability Reminder',
    message: 'Maatram Event Coordinators are planning next week’s schedules. Update your availability for Nov 23 - Nov 29.',
    timestamp: '1 day ago',
    read: true,
    type: 'availability',
    targetTab: 'availability',
  },
  {
    id: 'notif-4',
    title: 'Scholar Record Verified',
    message: 'Your institutional enrollment details have been officially verified by the Maatram Academic Office.',
    timestamp: '3 days ago',
    read: true,
    type: 'system',
    targetTab: 'profile',
  },
];

/**
 * Builds standard default slots for a week:
 * - Weekday college hours (09:00 - 16:00) = unavailable (class)
 * - Weekday evenings (17:00 - 20:00) = available
 * - Weekend (Saturday & Sunday 09:00 - 18:00) = available
 */
export function generateDefaultWeekSlots(mondayDateStr: string): Record<string, 'available' | 'unavailable'> {
  const slots: Record<string, 'available' | 'unavailable'> = {};
  const monday = new Date(mondayDateStr);

  for (let d = 0; d < 7; d++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + d);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const dayNum = String(cur.getDate()).padStart(2, '0');
    const dateKey = `${y}-${m}-${dayNum}`;
    const dayOfWeek = cur.getDay(); // 0 is Sun, 6 is Sat

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend: Available in morning & afternoon
      ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].forEach((time) => {
        slots[`${dateKey}_${time}`] = 'available';
      });
    } else {
      // Weekday: College hours unavailable, evening available
      ['09:00', '10:00', '11:00', '14:00', '15:00'].forEach((time) => {
        slots[`${dateKey}_${time}`] = 'unavailable';
      });
      ['17:00', '18:00', '19:00'].forEach((time) => {
        slots[`${dateKey}_${time}`] = 'available';
      });
    }
  }
  return slots;
}
