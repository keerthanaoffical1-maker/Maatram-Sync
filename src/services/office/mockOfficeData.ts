import type {
  EventPlan,
  OfficeActivityLog,
  OfficeOverviewMetrics,
  OfficeUser,
  StudentDirectoryItem,
} from '../../types/office';
import { TIME_SLOTS } from '../student/mockStudentData';

export const CURRENT_OFFICE_USER: OfficeUser = {
  id: 'mock-office',
  name: 'Karthik Subramanian',
  email: 'office@maatram.dev',
  role: 'office',
  title: 'Lead Coordinator',
  department: 'Placement & Industry Mentorship',
  avatarUrl: '',
};

export const INSTITUTIONS_LIST = [
  'College of Engineering, Guindy',
  'Madras Institute of Technology',
  'PSG College of Technology',
  'Coimbatore Institute of Technology',
  'SSN College of Engineering',
  'Thiagarajar College of Engineering',
  'Government College of Technology',
];

export const ACADEMIC_YEARS_LIST = ['2nd Year', '3rd Year', '4th Year'] as const;

export const DEPARTMENTS_LIST = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Data Science & AI',
];

// Helper to deterministically generate weekly availability slots for each student
function generateStudentSlots(seed: number): Record<string, 'available' | 'unavailable' | 'unselected'> {
  const slots: Record<string, 'available' | 'unavailable' | 'unselected'> = {};
  const dates = [
    '2026-11-21', // Sat
    '2026-11-22', // Sun
    '2026-11-23', // Mon
    '2026-11-24', // Tue
    '2026-11-25', // Wed
    '2026-11-26', // Thu
    '2026-11-27', // Fri
    '2026-11-28', // Sat
    '2026-11-29', // Sun
  ];

  dates.forEach((dateStr) => {
    const isWeekend = dateStr === '2026-11-21' || dateStr === '2026-11-22' || dateStr === '2026-11-28' || dateStr === '2026-11-29';
    const isSunday = dateStr === '2026-11-22' || dateStr === '2026-11-29';

    TIME_SLOTS.forEach((ts) => {
      const key = `${dateStr}_${ts.id}`;
      // Use pseudo-random hash from seed + date + time
      const hash = Math.abs(Math.sin(seed * 37 + ts.id.charCodeAt(0) * 11 + dateStr.charCodeAt(9) * 17)) * 100;

      if (isSunday) {
        // Sunday 2 PM - 5 PM has the highest overlap (~90%)
        if (ts.id === '14:00' || ts.id === '15:00' || ts.id === '16:00') {
          slots[key] = hash < 92 ? 'available' : 'unavailable';
        } else if (ts.id === '09:00' || ts.id === '10:00' || ts.id === '11:00') {
          // Sunday morning ~65%
          slots[key] = hash < 68 ? 'available' : 'unavailable';
        } else {
          slots[key] = hash < 50 ? 'available' : 'unselected';
        }
      } else if (isWeekend) {
        // Saturday afternoon 2 PM - 5 PM ~78%
        if (ts.id === '14:00' || ts.id === '15:00' || ts.id === '16:00') {
          slots[key] = hash < 80 ? 'available' : 'unavailable';
        } else if (ts.id === '09:00' || ts.id === '10:00' || ts.id === '11:00') {
          // Saturday morning ~45%
          slots[key] = hash < 45 ? 'available' : 'unavailable';
        } else {
          slots[key] = hash < 40 ? 'available' : 'unselected';
        }
      } else {
        // Weekdays: 08:00 to 16:00 busy with college
        if (ts.period === 'morning' || (ts.period === 'afternoon' && ts.id !== '16:00')) {
          slots[key] = 'unavailable';
        } else if (ts.id === '17:00' || ts.id === '18:00' || ts.id === '19:00') {
          // Weekday evenings ~60% available
          slots[key] = hash < 62 ? 'available' : 'unavailable';
        } else {
          slots[key] = 'unselected';
        }
      }
    });
  });

  return slots;
}

// Generate 65 students for directory
const FIRST_NAMES = [
  'Priya', 'Arun', 'Kavitha', 'Vijay', 'Deepa', 'Sanjay', 'Ananya', 'Rohan', 'Sneha', 'Manoj',
  'Divya', 'Karthik', 'Swetha', 'Naveen', 'Harini', 'Dinesh', 'Keerthana', 'Surya', 'Aarthi', 'Ganesh',
  'Pavithra', 'Siddharth', 'Nandhini', 'Ashwin', 'Varsha', 'Pranav', 'Gayathri', 'Vignesh', 'Sandhya', 'Akash',
  'Meera', 'Gautam', 'Lavanya', 'Harish', 'Preethi', 'Ajay', 'Shreya', 'Balaji', 'Archana', 'Vasant',
  'Ishwarya', 'Mukund', 'Sangeetha', 'Madhav', 'Pooja', 'Rahul', 'Nithya', 'Saravanan', 'Vinitha', 'Abishek',
  'Monisha', 'Gopinath', 'Yamini', 'Rajesh', 'Bhavani', 'Venkatesh', 'Malini', 'Sudharsan', 'Ranjani', 'Kishore',
  'Subhashree', 'Jayanth', 'Indira', 'Raghav', 'Mythili'
];

const LAST_NAMES = [
  'Dharshini K', 'Kumar M', 'Rajan S', 'Venkatesh P', 'Lakshmi B', 'Raghavan T', 'Sundaram N', 'Varma R',
  'Menon C', 'Selvam G', 'Krishnan V', 'Natarajan K', 'Subramanian L', 'Prasad A', 'Balasubramaniam R',
  'Chandran P', 'Murugan E', 'Vasan S', 'Iyer M', 'Pandian R', 'Narayanan S', 'Pillai D', 'Sekar V',
  'Srinivasan K', 'Ramanujan S', 'Chettiar A', 'Ganesan P', 'Thyagarajan M', 'Moorthy S', 'Kannan V'
];

export const INITIAL_STUDENTS_DIRECTORY: StudentDirectoryItem[] = FIRST_NAMES.map((firstName, idx) => {
  const lastName = LAST_NAMES[idx % LAST_NAMES.length];
  const fullName = `${firstName} ${lastName}`;
  const idNum = String(idx + 1).padStart(3, '0');
  const institution = INSTITUTIONS_LIST[idx % INSTITUTIONS_LIST.length];
  const academicYear = ACADEMIC_YEARS_LIST[idx % ACADEMIC_YEARS_LIST.length];
  const studentId = `MS-2024-${idNum}`;
  const seed = idx + 1;
  const slots = generateStudentSlots(seed);

  const availableSlotsCount = Object.values(slots).filter((s) => s === 'available').length;
  let availabilityStatus: StudentDirectoryItem['availabilityStatus'] = 'High Availability';
  if (availableSlotsCount > 20) availabilityStatus = 'Full Weekend Available';
  else if (availableSlotsCount > 14) availabilityStatus = 'Weekday Evenings Available';
  else if (availableSlotsCount > 8) availabilityStatus = 'Partial Availability';
  else availabilityStatus = 'Unavailable / Not Submitted';

  const depts = [
    'Computer Science & Engineering',
    'Information Technology',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Data Science & AI',
  ];
  const department = depts[idx % depts.length];

  return {
    id: `std-${idNum}`,
    studentId,
    name: fullName,
    email: `${firstName.toLowerCase()}.${lastName.split(' ')[0].toLowerCase()}@maatram.dev`,
    phone: `+91 98${(40000000 + idx * 8329).toString().substring(0, 8)}`,
    institution,
    department,
    academicYear,
    enrollmentStatus: 'Active',
    availabilityStatus,
    location: 'Chennai, Tamil Nadu',
    sessionsAttended: 3 + (idx % 7),
    lastActive: idx % 3 === 0 ? 'Today' : idx % 3 === 1 ? 'Yesterday' : '3 days ago',
    weeklySlots: slots,
  };
});

// Pre-configured events
export const INITIAL_OFFICE_EVENTS: EventPlan[] = [
  {
    id: 'evt-301',
    title: 'Full-Stack Mock Technical Interview with Amazon Mentors',
    description: '1-on-1 simulated software engineering interviews focusing on Data Structures, Algorithms, and System Architecture.',
    category: 'Mock Interview',
    mode: 'Online',
    locationOrLink: 'https://meet.google.com/syn-maat-ram',
    targetInstitutions: ['College of Engineering, Guindy', 'Madras Institute of Technology', 'PSG College of Technology'],
    academicYears: ['3rd Year', '4th Year'],
    selectedDate: '2026-11-21',
    selectedTimeSlot: '10:00 AM - 12:00 PM',
    slotId: '10:00',
    requiredParticipants: 24,
    mentorOrHost: 'Ramesh Sundaram (Senior SDE @ Amazon)',
    mentorRole: 'Senior SDE & Alumni Mentor',
    preparationNotes: 'Scholars should keep their resume PDF open and ensure webcam/mic are functioning.',
    status: 'Confirmed',
    createdAt: '2026-11-16T10:00:00Z',
  },
  {
    id: 'evt-302',
    title: 'Resume Critique & Personal Tech Branding Lab',
    description: 'Comprehensive review of scholar resumes, ATS keyword optimization, and GitHub/LinkedIn profiling before 2027 internship drives.',
    category: 'Resume Review',
    mode: 'Offline',
    locationOrLink: 'Maatram Innovation Hub, Hall B, Guindy, Chennai',
    targetInstitutions: ['College of Engineering, Guindy', 'SSN College of Engineering', 'Madras Institute of Technology'],
    academicYears: ['2nd Year', '3rd Year'],
    selectedDate: '2026-11-22',
    selectedTimeSlot: '02:00 PM - 04:00 PM',
    slotId: '14:00',
    requiredParticipants: 35,
    mentorOrHost: 'Meenakshi Iyer (Talent Acquisition Lead @ Freshworks)',
    mentorRole: 'Head of Campus Hiring',
    preparationNotes: 'Bring two printed copies of your one-page technical resume.',
    status: 'Confirmed',
    createdAt: '2026-11-17T11:30:00Z',
  },
  {
    id: 'evt-303',
    title: 'Introduction to System Design & Microservices Architecture',
    description: 'Deep dive into scalable architectures, Redis caching, database sharding, and real-world system case studies.',
    category: 'Technical Workshop',
    mode: 'Online',
    locationOrLink: 'https://meet.google.com/syn-sys-dsgn',
    targetInstitutions: [
      'College of Engineering, Guindy',
      'Madras Institute of Technology',
      'PSG College of Technology',
      'Coimbatore Institute of Technology',
    ],
    academicYears: ['3rd Year', '4th Year'],
    selectedDate: '2026-11-25',
    selectedTimeSlot: '06:30 PM - 08:30 PM',
    slotId: '18:00',
    requiredParticipants: 45,
    mentorOrHost: 'Sridhar Natarajan (Staff Engineer @ Google)',
    mentorRole: 'Staff Software Engineer',
    preparationNotes: 'Review fundamental HTTP methods, load balancing concepts, and client-server caching.',
    status: 'Confirmed',
    createdAt: '2026-11-15T09:00:00Z',
  },
  {
    id: 'evt-304',
    title: 'Embedded Firmware & Automotive Microcontroller Masterclass',
    description: 'Hands-on embedded C programming, CAN protocol fundamentals, and AUTOSAR overview for core electronics scholars.',
    category: 'Technical Workshop',
    mode: 'Offline',
    locationOrLink: 'Maatram Training Lab 2, CIT Campus, Coimbatore',
    targetInstitutions: ['Coimbatore Institute of Technology', 'PSG College of Technology', 'Government College of Technology'],
    academicYears: ['3rd Year', '4th Year'],
    selectedDate: '2026-11-28',
    selectedTimeSlot: '10:00 AM - 01:00 PM',
    slotId: '10:00',
    requiredParticipants: 25,
    mentorOrHost: 'K. Balaji (Principal Architect @ Bosch India)',
    mentorRole: 'Automotive Systems Lead',
    preparationNotes: 'Laptops with STM32CubeIDE pre-installed.',
    status: 'Planned',
    createdAt: '2026-11-18T14:00:00Z',
  },
];

export const INITIAL_OFFICE_ACTIVITIES: OfficeActivityLog[] = [
  {
    id: 'act-1',
    action: 'Event Created',
    details: 'Created "Embedded Firmware Masterclass" targeting Core Engineering scholars across Coimbatore colleges.',
    timestamp: '1 hour ago',
    type: 'event',
    actor: 'Karthik S.',
  },
  {
    id: 'act-3',
    action: 'Availability Analysis Run',
    details: 'Analyzed weekend schedule for Engineering scholars (identified Sunday 2 PM as 91% overlap peak).',
    timestamp: '5 hours ago',
    type: 'student',
    actor: 'Karthik S.',
  },
  {
    id: 'act-5',
    action: 'Session Confirmed',
    details: 'Confirmed Google Meet session for System Design Workshop on Nov 25.',
    timestamp: '2 days ago',
    type: 'session',
    actor: 'Karthik S.',
  },
];

export const INITIAL_OFFICE_METRICS: OfficeOverviewMetrics = {
  totalRegisteredStudents: INITIAL_STUDENTS_DIRECTORY.length,
  activeStudents: INITIAL_STUDENTS_DIRECTORY.filter((s) => s.availabilityStatus !== 'Unavailable / Not Submitted').length,
  upcomingEvents: INITIAL_OFFICE_EVENTS.filter((e) => e.status !== 'Cancelled' && e.status !== 'Completed').length,
  averageAvailabilityRate: 76,
};
