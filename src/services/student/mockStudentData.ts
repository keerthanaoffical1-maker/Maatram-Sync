import type {
  EventInvitation,
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
  preferredName: 'Priya',
  email: 'student@maatram.dev',
  role: 'student',
  avatarUrl: '',
  // Officially verified locked fields
  institution: 'College of Engineering, Guindy (Anna University)',
  department: 'Computer Science and Engineering',
  academicYear: '3rd Year (B.E. 2024 - 2028)',
  groupCategory: 'Maatram Scholar - Tech Cohort 2024',
  studentId: 'MS-2024-0482',
  enrollmentStatus: 'Active',
  // Editable fields
  phone: '+91 98765 43210',
  alternateEmail: 'priya.ceg2024@gmail.com',
  bio: 'Passionate computer science scholar focusing on full-stack web engineering, cloud technologies, and technical problem solving. Eager to contribute to community mentoring.',
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'Tailwind CSS', 'SQL & PostgreSQL', 'System Design Basics'],
  linkedinUrl: 'https://linkedin.com/in/priya-dharshini-maatram',
  githubUrl: 'https://github.com/priyadharshini-k',
  location: 'Chennai, Tamil Nadu, India',
  notificationPreferences: {
    emailAlerts: true,
    smsAlerts: false,
    sessionReminders: true,
    invitationAlerts: true,
  },
};

export const INITIAL_INVITATIONS: EventInvitation[] = [
  {
    id: 'inv-101',
    eventName: 'Full-Stack Mock Technical Interview with Amazon Mentors',
    category: 'Mock Interview',
    date: 'Saturday, Nov 21, 2026',
    rawDate: '2026-11-21',
    time: '10:00 AM – 11:30 AM',
    institutionTarget: 'Maatram Foundation • Tech Scholars 2026',
    status: 'Pending',
    organizer: 'Maatram Placement Cell',
    speaker: 'Ramesh Sundaram (Senior SDE @ Amazon)',
    description: '1-on-1 simulated software engineering interview focusing on Data Structures, Algorithms, and React architecture. Real-time feedback provided.',
    mode: 'Online',
    location: 'Google Meet (Link issued upon acceptance)',
    actionDeadline: 'Nov 20, 2026 • 06:00 PM',
    slotsRemaining: 4,
  },
  {
    id: 'inv-102',
    eventName: 'Resume Critique & Personal Tech Branding Lab',
    category: 'Resume Review',
    date: 'Sunday, Nov 22, 2026',
    rawDate: '2026-11-22',
    time: '02:00 PM – 04:00 PM',
    institutionTarget: 'Anna University & Affiliated Scholars',
    status: 'Pending',
    organizer: 'Maatram Career Guidance Guild',
    speaker: 'Meenakshi Iyer (Talent Acquisition Lead @ Freshworks)',
    description: 'Comprehensive review of scholar resumes, ATS optimization, and GitHub/LinkedIn profiling before early 2027 internship drives.',
    mode: 'Offline',
    location: 'Maatram Innovation Hub, Hall B, Guindy, Chennai',
    actionDeadline: 'Nov 21, 2026 • 12:00 PM',
    slotsRemaining: 12,
  },
  {
    id: 'inv-103',
    eventName: 'Introduction to System Design & Microservices Architecture',
    category: 'Technical Workshop',
    date: 'Wednesday, Nov 25, 2026',
    rawDate: '2026-11-25',
    time: '06:30 PM – 08:30 PM',
    institutionTarget: 'Computer Science & IT Scholars (All Years)',
    status: 'Accepted',
    organizer: 'Maatram Tech Circle',
    speaker: 'Sridhar Natarajan (Staff Engineer @ Google)',
    description: 'Deep dive into scalable web architectures, caching patterns with Redis, database sharding, and real-world system case studies.',
    mode: 'Online',
    location: 'Google Meet: meet.google.com/syn-maat-ram',
    actionDeadline: 'Nov 24, 2026',
  },
  {
    id: 'inv-104',
    eventName: 'Campus Aptitude & Quantitative Speed Practice',
    category: 'Placement Drive',
    date: 'Sunday, Nov 15, 2026',
    rawDate: '2026-11-15',
    time: '09:30 AM – 12:30 PM',
    institutionTarget: 'All Registered 2026 Scholars',
    status: 'Declined',
    organizer: 'Aptitude Training Team',
    description: 'Speed math shortcuts, logical puzzles, and verbal reasoning drills for upcoming tier-1 campus tests.',
    mode: 'Online',
    location: 'Zoom Conference',
    actionDeadline: 'Nov 14, 2026',
  },
];

export const INITIAL_SESSIONS: StudentSession[] = [
  {
    id: 'sess-201',
    sessionTitle: 'Introduction to System Design & Microservices Architecture',
    category: 'Technical Workshop',
    date: 'Wednesday, Nov 25, 2026',
    rawDate: '2026-11-25',
    time: '06:30 PM – 08:30 PM',
    mode: 'Online',
    locationOrLink: 'https://meet.google.com/syn-maat-ram',
    status: 'Confirmed',
    mentorOrHost: 'Sridhar Natarajan',
    mentorRole: 'Staff Software Engineer @ Google',
    preparationNotes: 'Review fundamental HTTP methods, load balancing concepts, and client-server caching before attending.',
    meetingPlatform: 'Google Meet',
    calendarUrl: '#',
  },
  {
    id: 'sess-202',
    sessionTitle: 'Corporate Etiquette & High-Impact Presentation Masterclass',
    category: 'Soft Skills',
    date: 'Saturday, Nov 28, 2026',
    rawDate: '2026-11-28',
    time: '10:00 AM – 01:00 PM',
    mode: 'Offline',
    locationOrLink: 'Maatram Foundation Auditorium, Guindy, Hall 3, Chennai',
    status: 'Confirmed',
    mentorOrHost: 'Dr. Ananya Sundaram',
    mentorRole: 'Executive Leadership Coach & Author',
    preparationNotes: 'Formal professional attire is mandatory. Please bring your physical spiral notebook and Maatram ID card.',
    meetingPlatform: 'In-Person',
    calendarUrl: '#',
  },
  {
    id: 'sess-203',
    sessionTitle: '1-on-1 Bi-weekly Career Mentorship Check-in',
    category: 'Industry Mentorship',
    date: 'Wednesday, Dec 02, 2026',
    rawDate: '2026-12-02',
    time: '05:00 PM – 05:45 PM',
    mode: 'Online',
    locationOrLink: 'https://zoom.us/j/9482710492',
    status: 'Confirmed',
    mentorOrHost: 'Karthik Subramanian',
    mentorRole: 'Director of Engineering @ Zoho',
    preparationNotes: 'Prepare your 3 core questions regarding your final year capstone architecture and open-source project progress.',
    meetingPlatform: 'Zoom',
    calendarUrl: '#',
  },
];

export const INITIAL_NOTIFICATIONS: StudentNotification[] = [
  {
    id: 'notif-1',
    title: 'New Invitation Received',
    message: 'You have been invited to Full-Stack Mock Technical Interview with Amazon Mentors. Confirm your slot before Nov 20.',
    timestamp: '15 minutes ago',
    read: false,
    type: 'invitation',
    targetTab: 'invitations',
  },
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
