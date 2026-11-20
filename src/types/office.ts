import type { EventCategory, SlotStatus } from './student';

export interface OfficeUser {
  id: string;
  name: string;
  email: string;
  role: 'office';
  title: string;
  department: string;
  avatarUrl?: string;
}

export type StudentAvailabilityCategory =
  | 'Full Weekend Available'
  | 'Weekday Evenings Available'
  | 'High Availability'
  | 'Partial Availability'
  | 'Unavailable / Not Submitted';

export interface StudentDirectoryItem {
  id: string;
  studentId: string; // e.g. "MS-2024-0482"
  name: string;
  email: string;
  phone: string;
  institution: string;
  department: string;
  academicYear: '1st Year' | '2nd Year' | '3rd Year' | '4th Year';
  groupCategory: string; // e.g. "Tech Cohort 2024", "Core Engineering Guild", etc.
  enrollmentStatus: 'Active' | 'On Leave' | 'Graduated';
  availabilityStatus: StudentAvailabilityCategory;
  skills: string[];
  location: string;
  linkedinUrl?: string;
  githubUrl?: string;
  avatarUrl?: string;
  bio?: string;
  // Activity metrics
  sessionsAttended: number;
  rsvpRate: number; // percentage (e.g. 92)
  lastActive: string;
  // Specific day-slot availability: Record<`${date}_${slotId}`, SlotStatus>
  weeklySlots: Record<string, SlotStatus>;
}

export interface AvailabilityFilterCriteria {
  institutions: string[];
  academicYears: string[];
  groupCategories: string[];
  departments?: string[];
  selectedStudentIds?: string[];
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  durationHours?: number; // 1, 1.5, 2, 3 (defaults to 1 or 2)
  minThresholdPercentage?: number; // Configurable threshold e.g. 60%
  targetSlotIds?: string[];
}

export interface TimeSlotAnalysisResult {
  date: string; // YYYY-MM-DD
  dayName: string; // "Saturday"
  dayShort: string; // "Sat"
  isWeekend: boolean;
  slotId: string; // "09:00"
  slotLabel: string; // "09:00 AM - 11:00 AM"
  startTime: string; // "09:00"
  endTime: string; // "11:00"
  durationHours: number;
  period: 'morning' | 'afternoon' | 'evening';
  availableCount: number;
  unavailableCount: number;
  unknownCount: number;
  totalEligible: number;
  percentage: number; // (availableCount / totalEligible) * 100
  submissionCoveragePercentage: number; // ((availableCount + unavailableCount) / totalEligible) * 100
  matchingStudentIds: string[];
  unavailableStudentIds: string[];
  unknownStudentIds: string[];
  meetsThreshold: boolean;
}

export interface RecommendationCard {
  rank: 1 | 2 | 3;
  date: string;
  dayName: string;
  timeSlot: string;
  slotId: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  availableCount: number;
  unavailableCount: number;
  unknownCount: number;
  totalEligible: number;
  percentage: number;
  submissionCoveragePercentage: number;
  tag: string;
  reason: string;
  meetsThreshold: boolean;
}

export interface SmartRecommendationEngineResult {
  results: TimeSlotAnalysisResult[];
  topRecommendations: RecommendationCard[];
  eligibleCount: number;
  eligibleStudents: StudentDirectoryItem[];
  totalAudienceStudents: number;
  overallCoveragePercentage: number;
  hasSubmissions: boolean;
  filterCriteria: AvailabilityFilterCriteria;
}

export type EventStatus =
  | 'Draft'
  | 'Planned'
  | 'Invitations Sent'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled';

export interface EventPlan {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  mode: 'Online' | 'Offline';
  locationOrLink: string;
  targetInstitutions: string[];
  academicYears: string[];
  groupCategories: string[];
  selectedDate: string; // YYYY-MM-DD
  selectedTimeSlot: string; // e.g. "10:00 AM - 12:00 PM"
  slotId: string;
  requiredParticipants: number;
  mentorOrHost: string;
  mentorRole?: string;
  preparationNotes?: string;
  status: EventStatus;
  invitedCount: number;
  acceptedCount: number;
  declinedCount: number;
  pendingCount: number;
  createdAt: string;
}

export interface StudentInvitationRecord {
  id: string;
  eventId: string;
  eventName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  institution: string;
  academicYear: string;
  groupCategory: string;
  status: 'Pending' | 'Accepted' | 'Declined';
  sentAt: string;
  respondedAt?: string;
  declineReason?: string;
}

export interface OfficeActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'event' | 'invitation' | 'student' | 'session';
  actor: string;
}

export interface OfficeOverviewMetrics {
  totalRegisteredStudents: number;
  activeStudents: number;
  upcomingEvents: number;
  pendingInvitations: number;
  overallRsvpRate: number;
  averageAvailabilityRate: number;
}
