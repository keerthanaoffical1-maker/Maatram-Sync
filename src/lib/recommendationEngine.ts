import type {
  AvailabilityFilterCriteria,
  RecommendationCard,
  SmartRecommendationEngineResult,
  StudentDirectoryItem,
  TimeSlotAnalysisResult,
} from '../types/office';
import type { SlotStatus } from '../types/student';

export interface CandidateSlotDefinition {
  slotId: string;
  startTime: string; // "09:00"
  endTime: string; // "11:00"
  label: string; // "09:00 AM - 11:00 AM"
  period: 'morning' | 'afternoon' | 'evening';
  subSlots: string[]; // ["09:00", "10:00"]
}

/**
 * Converts "09:00" or "09:00:00" to "09:00 AM"
 */
export function formatTimeAmPm(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  const hour = parseInt(parts[0], 10);
  const min = parts[1] || '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${String(displayHour).padStart(2, '0')}:${min} ${ampm}`;
}

/**
 * Converts "HH:MM" or "HH:MM:SS" into total minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  const parts = timeStr.split(':');
  const hour = parseInt(parts[0], 10) || 0;
  const min = parseInt(parts[1], 10) || 0;
  return hour * 60 + min;
}

/**
 * Converts total minutes from midnight into "HH:MM"
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Generate candidate slot definitions for an event duration.
 * Respects event duration and handles multi-slot windows.
 */
export function generateCandidateSlots(durationHours = 2): CandidateSlotDefinition[] {
  // 1-Hour Windows
  if (durationHours === 1) {
    return [
      { slotId: '09:00', startTime: '09:00', endTime: '10:00', label: '09:00 AM - 10:00 AM', period: 'morning', subSlots: ['09:00'] },
      { slotId: '10:00', startTime: '10:00', endTime: '11:00', label: '10:00 AM - 11:00 AM', period: 'morning', subSlots: ['10:00'] },
      { slotId: '11:00', startTime: '11:00', endTime: '12:00', label: '11:00 AM - 12:00 PM', period: 'morning', subSlots: ['11:00'] },
      { slotId: '14:00', startTime: '14:00', endTime: '15:00', label: '02:00 PM - 03:00 PM', period: 'afternoon', subSlots: ['14:00'] },
      { slotId: '15:00', startTime: '15:00', endTime: '16:00', label: '03:00 PM - 04:00 PM', period: 'afternoon', subSlots: ['15:00'] },
      { slotId: '16:00', startTime: '16:00', endTime: '17:00', label: '04:00 PM - 05:00 PM', period: 'afternoon', subSlots: ['16:00'] },
      { slotId: '17:00', startTime: '17:00', endTime: '18:00', label: '05:00 PM - 06:00 PM', period: 'evening', subSlots: ['17:00'] },
      { slotId: '18:00', startTime: '18:00', endTime: '19:00', label: '06:00 PM - 07:00 PM', period: 'evening', subSlots: ['18:00'] },
      { slotId: '19:00', startTime: '19:00', endTime: '20:00', label: '07:00 PM - 08:00 PM', period: 'evening', subSlots: ['19:00'] },
    ];
  }

  // 1.5-Hour Windows
  if (durationHours === 1.5) {
    return [
      { slotId: '09:00', startTime: '09:00', endTime: '10:30', label: '09:00 AM - 10:30 AM', period: 'morning', subSlots: ['09:00', '10:00'] },
      { slotId: '10:30', startTime: '10:30', endTime: '12:00', label: '10:30 AM - 12:00 PM', period: 'morning', subSlots: ['10:00', '11:00'] },
      { slotId: '14:00', startTime: '14:00', endTime: '15:30', label: '02:00 PM - 03:30 PM', period: 'afternoon', subSlots: ['14:00', '15:00'] },
      { slotId: '15:30', startTime: '15:30', endTime: '17:00', label: '03:30 PM - 05:00 PM', period: 'afternoon', subSlots: ['15:00', '16:00'] },
      { slotId: '17:00', startTime: '17:00', endTime: '18:30', label: '05:00 PM - 06:30 PM', period: 'evening', subSlots: ['17:00', '18:00'] },
      { slotId: '18:30', startTime: '18:30', endTime: '20:00', label: '06:30 PM - 08:00 PM', period: 'evening', subSlots: ['18:00', '19:00'] },
    ];
  }

  // 3-Hour Windows
  if (durationHours === 3) {
    return [
      { slotId: '09:00', startTime: '09:00', endTime: '12:00', label: '09:00 AM - 12:00 PM', period: 'morning', subSlots: ['09:00', '10:00', '11:00'] },
      { slotId: '14:00', startTime: '14:00', endTime: '17:00', label: '02:00 PM - 05:00 PM', period: 'afternoon', subSlots: ['14:00', '15:00', '16:00'] },
      { slotId: '17:00', startTime: '17:00', endTime: '20:00', label: '05:00 PM - 08:00 PM', period: 'evening', subSlots: ['17:00', '18:00', '19:00'] },
    ];
  }

  // Default: 2-Hour Windows
  return [
    { slotId: '09:00', startTime: '09:00', endTime: '11:00', label: '09:00 AM - 11:00 AM', period: 'morning', subSlots: ['09:00', '10:00'] },
    { slotId: '10:00', startTime: '10:00', endTime: '12:00', label: '10:00 AM - 12:00 PM', period: 'morning', subSlots: ['10:00', '11:00'] },
    { slotId: '14:00', startTime: '14:00', endTime: '16:00', label: '02:00 PM - 04:00 PM', period: 'afternoon', subSlots: ['14:00', '15:00'] },
    { slotId: '15:00', startTime: '15:00', endTime: '17:00', label: '03:00 PM - 05:00 PM', period: 'afternoon', subSlots: ['15:00', '16:00'] },
    { slotId: '16:00', startTime: '16:00', endTime: '18:00', label: '04:00 PM - 06:00 PM', period: 'afternoon', subSlots: ['16:00', '17:00'] },
    { slotId: '17:00', startTime: '17:00', endTime: '19:00', label: '05:00 PM - 07:00 PM', period: 'evening', subSlots: ['17:00', '18:00'] },
    { slotId: '18:00', startTime: '18:00', endTime: '20:00', label: '06:00 PM - 08:00 PM', period: 'evening', subSlots: ['18:00', '19:00'] },
    { slotId: '19:00', startTime: '19:00', endTime: '21:00', label: '07:00 PM - 09:00 PM', period: 'evening', subSlots: ['19:00', '20:00'] },
  ];
}

/**
 * Filter students strictly matching the target audience criteria.
 * - Deduplicates students by id.
 * - Excludes inactive students automatically.
 * - Never includes students outside the selected audience.
 */
export function filterAudienceStudents(
  students: StudentDirectoryItem[],
  criteria: AvailabilityFilterCriteria,
): StudentDirectoryItem[] {
  const seenIds = new Set<string>();
  const uniqueStudents: StudentDirectoryItem[] = [];

  for (const s of students) {
    if (!s || !s.id) continue;
    if (!seenIds.has(s.id)) {
      seenIds.add(s.id);
      uniqueStudents.push(s);
    }
  }

  return uniqueStudents.filter((s) => {
    // 1. Exclude inactive scholars
    if (s.enrollmentStatus && s.enrollmentStatus !== 'Active') {
      return false;
    }

    // 2. Individual student selection takes precedence if explicitly provided
    if (criteria.selectedStudentIds && criteria.selectedStudentIds.length > 0) {
      return criteria.selectedStudentIds.includes(s.id);
    }

    // 3. Institution filter
    if (criteria.institutions && criteria.institutions.length > 0) {
      if (!criteria.institutions.includes(s.institution)) {
        return false;
      }
    }

    // 4. Academic Year filter
    if (criteria.academicYears && criteria.academicYears.length > 0) {
      if (!criteria.academicYears.includes(s.academicYear)) {
        return false;
      }
    }

    // 5. Department filter
    if (criteria.departments && criteria.departments.length > 0) {
      if (!criteria.departments.includes(s.department)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Evaluates whether a student is 'available', 'unavailable', or 'unknown' for a candidate time window.
 */
export function evaluateStudentSlotState(
  studentSlots: Record<string, SlotStatus | string | undefined>,
  dateStr: string,
  subSlots: string[],
): 'available' | 'unavailable' | 'unknown' {
  if (!studentSlots || Object.keys(studentSlots).length === 0) {
    return 'unknown';
  }

  let anyUnavailable = false;
  let allAvailable = true;
  let hasMissing = false;

  for (const timeSlot of subSlots) {
    const key = `${dateStr}_${timeSlot}`;
    const status = studentSlots[key];

    if (status === 'unavailable') {
      anyUnavailable = true;
      break;
    } else if (status === 'available') {
      // Confirmed available
    } else {
      allAvailable = false;
      hasMissing = true;
    }
  }

  if (anyUnavailable) {
    return 'unavailable';
  }
  if (allAvailable && !hasMissing) {
    return 'available';
  }
  return 'unknown';
}

/**
 * Calculates submission coverage across the audience for a given date range.
 */
export function calculateAudienceCoverage(
  students: StudentDirectoryItem[],
  dateList: string[],
): {
  submittedStudentCount: number;
  totalStudents: number;
  coveragePercentage: number;
  hasSubmissions: boolean;
} {
  const totalStudents = students.length;
  if (totalStudents === 0) {
    return {
      submittedStudentCount: 0,
      totalStudents: 0,
      coveragePercentage: 0,
      hasSubmissions: false,
    };
  }

  let submittedCount = 0;

  students.forEach((student) => {
    const slots = student.weeklySlots || {};
    const hasAnySubmission = dateList.some((dateStr) => {
      return Object.keys(slots).some((key) => {
        if (!key.startsWith(dateStr)) return false;
        const status = slots[key];
        return status === 'available' || status === 'unavailable';
      });
    });

    if (hasAnySubmission) {
      submittedCount += 1;
    }
  });

  const coveragePercentage = Math.round((submittedCount / totalStudents) * 100);
  return {
    submittedStudentCount: submittedCount,
    totalStudents,
    coveragePercentage,
    hasSubmissions: submittedCount > 0,
  };
}

/**
 * Validates availability filter criteria inputs.
 */
export function validateCriteria(criteria: AvailabilityFilterCriteria): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!criteria.startDate) {
    errors.push('Start date is required');
  }
  if (!criteria.endDate) {
    errors.push('End date is required');
  }
  if (criteria.startDate && criteria.endDate && criteria.startDate > criteria.endDate) {
    errors.push('Start date must be before or equal to end date');
  }
  if (criteria.durationHours && (criteria.durationHours <= 0 || criteria.durationHours > 12)) {
    errors.push('Duration must be between 1 and 12 hours');
  }
  if (
    criteria.minThresholdPercentage !== undefined &&
    (criteria.minThresholdPercentage < 0 || criteria.minThresholdPercentage > 100)
  ) {
    errors.push('Minimum threshold percentage must be between 0 and 100');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generates an inclusive array of 'YYYY-MM-DD' dates between startDate and endDate.
 */
export function buildDateList(startDate: string, endDate: string): string[] {
  const dateList: string[] = [];
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dayNum = String(d.getDate()).padStart(2, '0');
    dateList.push(`${y}-${m}-${dayNum}`);
  }

  return dateList;
}

/**
 * The Core Smart Availability Recommendation Engine.
 */
export function runSmartRecommendationEngine(
  allStudents: StudentDirectoryItem[],
  criteria: AvailabilityFilterCriteria,
): SmartRecommendationEngineResult {
  const durationHours = criteria.durationHours || 2;
  const minThreshold = criteria.minThresholdPercentage ?? 0;

  // 1. Filter audience strictly & deduplicate
  const eligibleStudents = filterAudienceStudents(allStudents, criteria);
  const totalEligible = eligibleStudents.length;

  // 2. Build list of dates
  const dateList = buildDateList(criteria.startDate, criteria.endDate);

  // 3. Compute audience submission coverage
  const coverage = calculateAudienceCoverage(eligibleStudents, dateList);

  // 4. Candidate slot definitions for the requested duration
  const candidateSlots = generateCandidateSlots(durationHours);

  // 5. Evaluate every (date, slot) combination
  const results: TimeSlotAnalysisResult[] = [];

  dateList.forEach((dateStr) => {
    const curDate = new Date(dateStr + 'T00:00:00');
    const dayName = curDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dayShort = curDate.toLocaleDateString('en-US', { weekday: 'short' });
    const dayOfWeek = curDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    candidateSlots.forEach((slotDef) => {
      const matchingStudentIds: string[] = [];
      const unavailableStudentIds: string[] = [];
      const unknownStudentIds: string[] = [];

      eligibleStudents.forEach((student) => {
        const state = evaluateStudentSlotState(
          student.weeklySlots || {},
          dateStr,
          slotDef.subSlots,
        );

        if (state === 'available') {
          matchingStudentIds.push(student.id);
        } else if (state === 'unavailable') {
          unavailableStudentIds.push(student.id);
        } else {
          unknownStudentIds.push(student.id);
        }
      });

      const availableCount = matchingStudentIds.length;
      const unavailableCount = unavailableStudentIds.length;
      const unknownCount = unknownStudentIds.length;
      const submittedCount = availableCount + unavailableCount;

      const percentage =
        totalEligible > 0 ? Math.round((availableCount / totalEligible) * 100) : 0;

      const submissionCoveragePercentage =
        totalEligible > 0 ? Math.round((submittedCount / totalEligible) * 100) : 0;

      const meetsThreshold = percentage >= minThreshold;

      results.push({
        date: dateStr,
        dayName,
        dayShort,
        isWeekend,
        slotId: slotDef.slotId,
        slotLabel: slotDef.label,
        startTime: slotDef.startTime,
        endTime: slotDef.endTime,
        durationHours,
        period: slotDef.period,
        availableCount,
        unavailableCount,
        unknownCount,
        totalEligible,
        percentage,
        submissionCoveragePercentage,
        matchingStudentIds,
        unavailableStudentIds,
        unknownStudentIds,
        meetsThreshold,
      });
    });
  });

  // 6. Stable Sorting of candidate slots:
  const sortedSlots = [...results].sort((a, b) => {
    if (b.percentage !== a.percentage) return b.percentage - a.percentage;
    if (b.availableCount !== a.availableCount) return b.availableCount - a.availableCount;
    if (b.submissionCoveragePercentage !== a.submissionCoveragePercentage) {
      return b.submissionCoveragePercentage - a.submissionCoveragePercentage;
    }
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  // 7. Pick Top 3 Recommendations
  const topRecommendations: RecommendationCard[] = [];

  if (sortedSlots.length > 0 && totalEligible > 0) {
    const top1 = sortedSlots[0];
    const top2 =
      sortedSlots.find((s) => s.date !== top1.date || s.slotId !== top1.slotId) ||
      sortedSlots[1];
    const top3 =
      sortedSlots.find(
        (s) =>
          (s.date !== top1.date || s.slotId !== top1.slotId) &&
          (s.date !== top2?.date || s.slotId !== top2?.slotId),
      ) || sortedSlots[2];

    const candidates = [top1, top2, top3].filter(Boolean);

    candidates.forEach((slot, index) => {
      const rank = (index + 1) as 1 | 2 | 3;
      const tag =
        rank === 1
          ? 'Peak Attendance Window'
          : rank === 2
            ? 'Strong Alternative Window'
            : 'Viable Backup Slot';

      const reason =
        rank === 1
          ? `Highest confirmed attendance window (${slot.availableCount}/${slot.totalEligible} scholars, ${slot.percentage}% free). ${slot.submissionCoveragePercentage}% submission coverage.`
          : rank === 2
            ? `Solid alternative timing with ${slot.percentage}% turnout (${slot.availableCount}/${slot.totalEligible} scholars). Ideal fallback or parallel batch timing.`
            : `${slot.percentage}% confirmed availability (${slot.availableCount}/${slot.totalEligible} scholars). Viable for smaller breakout sessions or rescheduled tracks.`;

      topRecommendations.push({
        rank,
        date: slot.date,
        dayName: slot.dayName,
        timeSlot: slot.slotLabel,
        slotId: slot.slotId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        durationHours: slot.durationHours,
        availableCount: slot.availableCount,
        unavailableCount: slot.unavailableCount,
        unknownCount: slot.unknownCount,
        totalEligible: slot.totalEligible,
        percentage: slot.percentage,
        submissionCoveragePercentage: slot.submissionCoveragePercentage,
        tag,
        reason,
        meetsThreshold: slot.meetsThreshold,
      });
    });
  }

  return {
    results,
    topRecommendations,
    eligibleCount: totalEligible,
    eligibleStudents,
    totalAudienceStudents: allStudents.length,
    overallCoveragePercentage: coverage.coveragePercentage,
    hasSubmissions: coverage.hasSubmissions,
    filterCriteria: criteria,
  };
}
