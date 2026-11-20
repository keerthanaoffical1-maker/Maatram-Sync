export type SlotStatus = 'available' | 'unavailable' | 'unselected';

export interface StudentProfile {
  id: string;
  name: string;
  preferredName?: string;
  email: string;
  role: 'student';
  avatarUrl?: string;
  // Locked fields - require administrative approval
  institution: string;
  department: string;
  academicYear: string;
  groupCategory: string;
  studentId: string;
  enrollmentStatus: 'Active' | 'On Leave' | 'Graduated';
  // Permitted editable fields
  phone: string;
  alternateEmail?: string;
  bio: string;
  skills: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  location: string;
  notificationPreferences: {
    emailAlerts: boolean;
    smsAlerts: boolean;
    sessionReminders: boolean;
    invitationAlerts: boolean;
  };
}

export interface TimeSlotConfig {
  id: string; // e.g. "09:00"
  label: string; // "09:00 AM - 10:00 AM"
  period: 'morning' | 'afternoon' | 'evening';
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  dayName: string; // "Monday", "Tuesday", etc.
  dayShort: string; // "Mon", "Tue", etc.
  isWeekend: boolean;
  isToday: boolean;
  slots: Record<string, SlotStatus>; // slotId -> status
}

export interface WeeklyAvailability {
  weekStart: string; // Monday YYYY-MM-DD
  weekEnd: string; // Sunday YYYY-MM-DD
  weekNumber: number;
  year: number;
  slots: Record<string, SlotStatus>; // Key: `${date}_${slotId}`
  isSubmitted: boolean;
  lastUpdated?: string;
}

export type InvitationStatus = 'Pending' | 'Accepted' | 'Declined';

export type EventCategory =
  | 'Mock Interview'
  | 'Industry Mentorship'
  | 'Resume Review'
  | 'Technical Workshop'
  | 'Soft Skills'
  | 'Placement Drive';

export interface EventInvitation {
  id: string;
  eventName: string;
  category: EventCategory;
  date: string; // "Saturday, Nov 21, 2026"
  rawDate: string; // "2026-11-21"
  time: string; // "10:00 AM - 11:30 AM"
  institutionTarget: string; // "Maatram Foundation - Tech Scholars 2026"
  status: InvitationStatus;
  organizer: string;
  speaker?: string;
  description: string;
  mode: 'Online' | 'Offline';
  location: string;
  actionDeadline: string;
  slotsRemaining?: number;
}

export type SessionStatus = 'Confirmed' | 'Starting Soon' | 'Completed';

export interface StudentSession {
  id: string;
  sessionTitle: string;
  category: EventCategory;
  date: string; // "Friday, Nov 20, 2026"
  rawDate: string; // "2026-11-20"
  time: string; // "04:00 PM - 05:30 PM"
  mode: 'Online' | 'Offline';
  locationOrLink: string;
  status: SessionStatus;
  mentorOrHost: string;
  mentorRole?: string;
  preparationNotes?: string;
  meetingPlatform?: 'Google Meet' | 'Zoom' | 'MS Teams' | 'In-Person';
  calendarUrl?: string;
}

export interface StudentNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'invitation' | 'session' | 'availability' | 'system';
  targetTab?: 'overview' | 'availability' | 'invitations' | 'sessions' | 'profile';
}

export interface AvailabilitySummary {
  status: 'Updated' | 'Pending Review' | 'Not Set';
  totalSlotsMarked: number;
  availableHours: number;
  unavailableHours: number;
  upcomingInvitationsCount: number;
  confirmedSessionsCount: number;
  pendingResponsesCount: number;
}
