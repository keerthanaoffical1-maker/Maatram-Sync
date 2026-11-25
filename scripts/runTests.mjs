// Standalone Node.js Test Runner for Smart Availability Recommendation Engine
// Tests all 9 specification requirements

import {
  evaluateStudentSlotState,
  filterAudienceStudents,
  generateCandidateSlots,
  calculateAudienceCoverage,
  runSmartRecommendationEngine,
} from '../src/lib/recommendationEngine.ts';

function createMockStudent(id, overrides = {}) {
  return {
    id,
    studentId: `MS-${id}`,
    name: `Student ${id}`,
    email: `${id}@test.com`,
    phone: '+91 9800000000',
    institution: 'College of Engineering, Guindy',
    department: 'Computer Science & Engineering',
    academicYear: '3rd Year',
    enrollmentStatus: 'Active',
    availabilityStatus: 'Full Weekend Available',
    location: 'Chennai',
    sessionsAttended: 5,
    lastActive: 'Today',
    weeklySlots: {},
    ...overrides,
  };
}

let passed = 0;
let failed = 0;

function assert(condition, testName, detail = '') {
  if (condition) {
    passed++;
    console.log(`  \x1b[32m✓ PASS\x1b[0m: ${testName}`);
  } else {
    failed++;
    console.error(`  \x1b[31m✗ FAIL\x1b[0m: ${testName} ${detail ? `- ${detail}` : ''}`);
  }
}

console.log('\n======================================================');
console.log('SMART AVAILABILITY RECOMMENDATION ENGINE TEST SUITE');
console.log('======================================================\n');

// 1. All students available
console.log('Scenario 1: All students available');
{
  const students = Array.from({ length: 5 }, (_, i) =>
    createMockStudent(`std-${i + 1}`, {
      weeklySlots: {
        '2026-11-21_09:00': 'available',
        '2026-11-21_10:00': 'available',
      },
    }),
  );

  const criteria = {
    institutions: [],
    academicYears: [],
    startDate: '2026-11-21',
    endDate: '2026-11-21',
    durationHours: 2,
  };

  const res = runSmartRecommendationEngine(students, criteria);
  const slot09 = res.results.find((r) => r.slotId === '09:00');

  assert(slot09?.totalEligible === 5, '1.1 Total eligible count is 5');
  assert(slot09?.availableCount === 5, '1.2 All 5 students confirmed available');
  assert(slot09?.unavailableCount === 0, '1.3 Zero unavailable students');
  assert(slot09?.unknownCount === 0, '1.4 Zero unknown students');
  assert(slot09?.percentage === 100, '1.5 Availability percentage is exactly 100%');
  assert(slot09?.submissionCoveragePercentage === 100, '1.6 Submission coverage is 100%');
}

// 2. No students available
console.log('\nScenario 2: No students available');
{
  const students = Array.from({ length: 4 }, (_, i) =>
    createMockStudent(`std-${i + 1}`, {
      weeklySlots: {
        '2026-11-21_09:00': 'unavailable',
        '2026-11-21_10:00': 'available',
      },
    }),
  );

  const criteria = {
    institutions: [],
    academicYears: [],
    startDate: '2026-11-21',
    endDate: '2026-11-21',
    durationHours: 2,
  };

  const res = runSmartRecommendationEngine(students, criteria);
  const slot09 = res.results.find((r) => r.slotId === '09:00');

  assert(slot09?.availableCount === 0, '2.1 Zero students available when marked unavailable');
  assert(slot09?.unavailableCount === 4, '2.2 All 4 students marked unavailable');
  assert(slot09?.percentage === 0, '2.3 Availability percentage is 0%');
  assert(slot09?.submissionCoveragePercentage === 100, '2.4 Coverage is 100% because all submitted');
}

// 3. Partially submitted availability
console.log('\nScenario 3: Partially submitted availability');
{
  const students = [
    ...Array.from({ length: 5 }, (_, i) =>
      createMockStudent(`avail-${i}`, {
        weeklySlots: { '2026-11-21_09:00': 'available', '2026-11-21_10:00': 'available' },
      }),
    ),
    ...Array.from({ length: 3 }, (_, i) =>
      createMockStudent(`unavail-${i}`, {
        weeklySlots: { '2026-11-21_09:00': 'unavailable' },
      }),
    ),
    ...Array.from({ length: 2 }, (_, i) =>
      createMockStudent(`missing-${i}`, {
        weeklySlots: {},
      }),
    ),
  ];

  const criteria = {
    institutions: [],
    academicYears: [],
    startDate: '2026-11-21',
    endDate: '2026-11-21',
    durationHours: 2,
  };

  const res = runSmartRecommendationEngine(students, criteria);
  const slot09 = res.results.find((r) => r.slotId === '09:00');

  assert(slot09?.totalEligible === 10, '3.1 Total eligible count is 10');
  assert(slot09?.availableCount === 5, '3.2 5 confirmed available');
  assert(slot09?.unavailableCount === 3, '3.3 3 confirmed unavailable');
  assert(slot09?.unknownCount === 2, '3.4 2 unknown (unsubmitted)');
  assert(slot09?.percentage === 50, '3.5 Availability percentage is exactly 50%');
  assert(slot09?.submissionCoveragePercentage === 80, '3.6 Submission coverage is 80%');
}

// 4. Students with missing submissions
console.log('\nScenario 4: Students with missing submissions');
{
  const students = Array.from({ length: 4 }, (_, i) =>
    createMockStudent(`unsubmitted-${i}`, { weeklySlots: {} }),
  );

  const criteria = {
    institutions: [],
    academicYears: [],
    startDate: '2026-11-21',
    endDate: '2026-11-21',
    durationHours: 2,
  };

  const res = runSmartRecommendationEngine(students, criteria);
  const slot09 = res.results.find((r) => r.slotId === '09:00');

  assert(slot09?.availableCount === 0, '4.1 Missing records never counted as available');
  assert(slot09?.unavailableCount === 0, '4.2 Missing records not assumed unavailable');
  assert(slot09?.unknownCount === 4, '4.3 Missing records classified as unknown');
  assert(slot09?.percentage === 0, '4.4 Percentage is 0%');
  assert(slot09?.submissionCoveragePercentage === 0, '4.5 Coverage is 0%');
  assert(res.hasSubmissions === false, '4.6 hasSubmissions correctly flagged false');
}

// 5. Multiple institutions
console.log('\nScenario 5: Multiple institutions');
{
  const students = [
    createMockStudent('s1', { institution: 'College of Engineering, Guindy' }),
    createMockStudent('s2', { institution: 'College of Engineering, Guindy' }),
    createMockStudent('s3', { institution: 'Madras Institute of Technology' }),
    createMockStudent('s4', { institution: 'PSG College of Technology' }),
    createMockStudent('s5', { institution: 'SSN College of Engineering' }),
  ];

  const criteria = {
    institutions: ['College of Engineering, Guindy', 'Madras Institute of Technology'],
    academicYears: [],
    startDate: '2026-11-21',
    endDate: '2026-11-21',
  };

  const filtered = filterAudienceStudents(students, criteria);
  assert(filtered.length === 3, '5.1 Filter selects exactly CEG and MIT students (3 total)');
  assert(
    filtered.every(
      (s) =>
        s.institution === 'College of Engineering, Guindy' ||
        s.institution === 'Madras Institute of Technology',
    ),
    '5.2 No PSG or SSN students included',
  );
}

// 6. Multiple academic years
console.log('\nScenario 6: Multiple academic years');
{
  const students = [
    createMockStudent('s1', { academicYear: '2nd Year' }),
    createMockStudent('s2', { academicYear: '3rd Year' }),
    createMockStudent('s3', { academicYear: '3rd Year' }),
    createMockStudent('s4', { academicYear: '4th Year' }),
  ];

  const criteria = {
    institutions: [],
    academicYears: ['3rd Year', '4th Year'],
    startDate: '2026-11-21',
    endDate: '2026-11-21',
  };

  const filtered = filterAudienceStudents(students, criteria);
  assert(filtered.length === 3, '6.1 Filter selects 3rd and 4th years only (3 total)');
  assert(!filtered.some((s) => s.academicYear === '2nd Year'), '6.2 2nd Year student excluded');
}

// 7. Overlapping time slots & Event duration continuity
console.log('\nScenario 7: Overlapping time slots (multi-hour duration)');
{
  const s1State = evaluateStudentSlotState(
    { '2026-11-21_09:00': 'available', '2026-11-21_10:00': 'unavailable' },
    '2026-11-21',
    ['09:00', '10:00'],
  );
  assert(s1State === 'unavailable', '7.1 Partial unavailability causes window unavailability');

  const s2State = evaluateStudentSlotState(
    { '2026-11-21_09:00': 'available' },
    '2026-11-21',
    ['09:00', '10:00'],
  );
  assert(s2State === 'unknown', '7.2 Partial missing submission causes window to be unknown');

  const s3State = evaluateStudentSlotState(
    { '2026-11-21_09:00': 'available', '2026-11-21_10:00': 'available' },
    '2026-11-21',
    ['09:00', '10:00'],
  );
  assert(s3State === 'available', '7.3 Full continuity across subslots confirms availability');
}

// 8. Equal availability percentages
console.log('\nScenario 8: Equal availability percentages (tie-breaking)');
{
  const students = [
    createMockStudent('s1', {
      weeklySlots: {
        '2026-11-21_09:00': 'available',
        '2026-11-21_10:00': 'available',
        '2026-11-21_14:00': 'available',
        '2026-11-21_15:00': 'available',
      },
    }),
    createMockStudent('s2', {
      weeklySlots: {
        '2026-11-21_09:00': 'available',
        '2026-11-21_10:00': 'available',
        '2026-11-21_14:00': 'available',
        '2026-11-21_15:00': 'available',
      },
    }),
    createMockStudent('s3', {
      weeklySlots: {
        '2026-11-21_09:00': 'unavailable',
      },
    }),
  ];

  const criteria = {
    institutions: [],
    academicYears: [],
    startDate: '2026-11-21',
    endDate: '2026-11-21',
    durationHours: 2,
  };

  const res = runSmartRecommendationEngine(students, criteria);
  const slot09 = res.results.find((r) => r.slotId === '09:00');
  const slot14 = res.results.find((r) => r.slotId === '14:00');

  assert(slot09?.percentage === 67, '8.1 Slot 09:00 has 67% availability');
  assert(slot14?.percentage === 67, '8.2 Slot 14:00 has 67% availability');
  assert(slot09?.submissionCoveragePercentage === 100, '8.3 Slot 09:00 has 100% coverage');
  assert(slot14?.submissionCoveragePercentage === 67, '8.4 Slot 14:00 has 67% coverage');

  const rec1 = res.topRecommendations[0];
  assert(rec1?.slotId === '09:00', '8.5 Equal percentage tie-breaker chooses higher coverage slot');
}

// 9. Empty student selection
console.log('\nScenario 9: Empty student selection');
{
  const students = [createMockStudent('s1')];

  const criteria = {
    institutions: ['NonExistent College'],
    academicYears: [],
    startDate: '2026-11-21',
    endDate: '2026-11-21',
    durationHours: 2,
  };

  const res = runSmartRecommendationEngine(students, criteria);
  assert(res.eligibleCount === 0, '9.1 Eligible student count is 0');
  assert(res.topRecommendations.length === 0, '9.2 No recommendations returned');
  assert(
    res.results.every((r) => r.percentage === 0),
    '9.3 Percentages are 0 with no division by zero error',
  );
}

console.log('\n======================================================');
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
}
