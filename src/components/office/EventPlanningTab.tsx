import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calendar,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Info,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trophy,
  Users,
  Video,
  X,
} from 'lucide-react';
import type { EventCategory } from '../../types/student';
import type {
  AvailabilityFilterCriteria,
  EventPlan,
  RecommendationCard,
  SmartRecommendationEngineResult,
  StudentDirectoryItem,
} from '../../types/office';
import {
  ACADEMIC_YEARS_LIST,
  DEPARTMENTS_LIST,
  INSTITUTIONS_LIST,
} from '../../services/office/mockOfficeData';
import { officeService } from '../../services/office/officeService';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface EventPlanningTabProps {
  events: EventPlan[];
  students: StudentDirectoryItem[];
  prefilledSlot?: {
    date: string;
    timeSlot: string;
    slotId: string;
    durationHours?: number;
    targetCriteria?: AvailabilityFilterCriteria;
  } | null;
  onClearPrefilledSlot?: () => void;
  onEventCreated: (event: EventPlan) => void;
  onNavigateTab: (tab: any) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function EventPlanningTab({
  events,
  students,
  prefilledSlot,
  onClearPrefilledSlot,
  onEventCreated,
  onNavigateTab,
  onShowToast,
}: EventPlanningTabProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(Boolean(prefilledSlot));

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('Technical Workshop');
  const [mode, setMode] = useState<'Online' | 'Offline'>('Online');
  const [locationOrLink, setLocationOrLink] = useState('https://meet.google.com/syn-maat-ram');
  const [mentorOrHost, setMentorOrHost] = useState('');
  const [mentorRole, setMentorRole] = useState('');
  const [preparationNotes, setPreparationNotes] = useState('');
  const [requiredParticipants, setRequiredParticipants] = useState<number>(30);

  // 1. Audience Target Criteria
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([
    'College of Engineering, Guindy',
    'Madras Institute of Technology',
  ]);
  const [selectedYears, setSelectedYears] = useState<string[]>(['3rd Year']);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isStudentPickerOpen, setIsStudentPickerOpen] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // 2. Date Range & Duration
  const [startDate, setStartDate] = useState<string>('2026-11-21');
  const [endDate, setEndDate] = useState<string>('2026-11-27');
  const [durationHours, setDurationHours] = useState<number>(2);

  // 3. Chosen Timing
  const [selectedDate, setSelectedDate] = useState(prefilledSlot?.date || '2026-11-22');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(
    prefilledSlot?.timeSlot || '02:00 PM - 04:00 PM',
  );
  const [slotId, setSlotId] = useState(prefilledSlot?.slotId || '14:00');

  // Inline Availability Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisRan, setAnalysisRan] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<SmartRecommendationEngineResult | null>(null);

  // Confirmation
  const [isTimeConfirmed, setIsTimeConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  // When prefilledSlot arrives from Availability Analysis Tab
  useEffect(() => {
    if (prefilledSlot) {
      setSelectedDate(prefilledSlot.date);
      setSelectedTimeSlot(prefilledSlot.timeSlot);
      setSlotId(prefilledSlot.slotId);
      if (prefilledSlot.durationHours) {
        setDurationHours(prefilledSlot.durationHours);
      }
      if (prefilledSlot.targetCriteria) {
        setSelectedInstitutions(prefilledSlot.targetCriteria.institutions || []);
        setSelectedYears(prefilledSlot.targetCriteria.academicYears || []);
        setSelectedDepartments(prefilledSlot.targetCriteria.departments || []);
        if (prefilledSlot.targetCriteria.selectedStudentIds) {
          setSelectedStudentIds(prefilledSlot.targetCriteria.selectedStudentIds);
        }
        if (prefilledSlot.targetCriteria.startDate) {
          setStartDate(prefilledSlot.targetCriteria.startDate);
        }
        if (prefilledSlot.targetCriteria.endDate) {
          setEndDate(prefilledSlot.targetCriteria.endDate);
        }
      }
      setIsCreateModalOpen(true);
      setIsTimeConfirmed(true);
    }
  }, [prefilledSlot]);

  // Dynamically calculate eligible audience count
  const eligibleStudents = useMemo(() => {
    return students.filter((s) => {
      // Exclude inactive
      if (s.enrollmentStatus && s.enrollmentStatus !== 'Active') {
        return false;
      }
      // Individual student selection
      if (selectedStudentIds.length > 0) {
        return selectedStudentIds.includes(s.id);
      }
      if (selectedInstitutions.length > 0 && !selectedInstitutions.includes(s.institution)) {
        return false;
      }
      if (selectedYears.length > 0 && !selectedYears.includes(s.academicYear)) {
        return false;
      }
      if (selectedDepartments.length > 0 && !selectedDepartments.includes(s.department)) {
        return false;
      }
      return true;
    });
  }, [students, selectedInstitutions, selectedYears, selectedDepartments, selectedStudentIds]);

  // Run availability analysis for the specified audience & scheduling parameters
  const handleAnalyzeAudienceAvailability = async () => {
    if (eligibleStudents.length === 0) {
      onShowToast('Please select at least one active student in the audience filters', 'error');
      return;
    }

    setIsAnalyzing(true);
    try {
      const criteria: AvailabilityFilterCriteria = {
        institutions: selectedInstitutions,
        academicYears: selectedYears,
        departments: selectedDepartments,
        selectedStudentIds: selectedStudentIds.length > 0 ? selectedStudentIds : undefined,
        startDate,
        endDate,
        durationHours,
      };

      const data = await officeService.analyzeAvailability(criteria);
      setAnalysisResult(data);
      setAnalysisRan(true);

      if (data.topRecommendations.length > 0) {
        onShowToast(
          `Analyzed availability for ${data.eligibleCount} scholars! ${data.topRecommendations.length} recommendations available.`,
          'info',
        );
      } else {
        onShowToast('No overlapping slots found matching this audience and date range', 'info');
      }
    } catch {
      onShowToast('Could not analyze audience availability', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyRecommendation = (rec: RecommendationCard) => {
    setSelectedDate(rec.date);
    setSelectedTimeSlot(rec.timeSlot);
    setSlotId(rec.slotId);
    setIsTimeConfirmed(true);
    onShowToast(`Selected Rank #${rec.rank}: ${rec.dayName} (${rec.timeSlot}) with ${rec.percentage}% free`, 'success');
  };

  const toggleInst = (inst: string) => {
    setSelectedInstitutions((prev) =>
      prev.includes(inst) ? prev.filter((i) => i !== inst) : [...prev, inst],
    );
    setAnalysisRan(false);
  };

  const toggleYr = (yr: string) => {
    setSelectedYears((prev) =>
      prev.includes(yr) ? prev.filter((y) => y !== yr) : [...prev, yr],
    );
    setAnalysisRan(false);
  };

  const toggleDept = (dept: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept],
    );
    setAnalysisRan(false);
  };

  const toggleStudentId = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
    setAnalysisRan(false);
  };

  // Submit Handler: Event creation and session confirmation
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      onShowToast('Please provide an event title', 'error');
      return;
    }
    if (!isTimeConfirmed) {
      onShowToast('Please verify and confirm the session time slot', 'error');
      return;
    }
    if (eligibleStudents.length === 0) {
      onShowToast('Target audience contains no matching scholars', 'error');
      return;
    }

    setSaving(true);
    try {
      // Create confirmed event
      const newEvent = await officeService.createEvent(
        {
          title: title.trim(),
          description: description.trim(),
          category,
          mode,
          locationOrLink: locationOrLink.trim(),
          targetInstitutions: selectedInstitutions,
          academicYears: selectedYears,
          selectedDate,
          selectedTimeSlot,
          slotId,
          requiredParticipants: Number(requiredParticipants) || 30,
          mentorOrHost: mentorOrHost.trim() || 'Maatram Industry Mentor',
          mentorRole: mentorRole.trim() || 'Senior Professional',
          preparationNotes: preparationNotes.trim(),
          status: 'Confirmed',
        },
        {
          selectedStudentIds: selectedStudentIds.length > 0 ? selectedStudentIds : undefined,
          targetDepartments: selectedDepartments,
        },
      );

      onEventCreated(newEvent);

      onShowToast(`Event "${newEvent.title}" planned successfully!`, 'success');

      setIsCreateModalOpen(false);
      if (onClearPrefilledSlot) onClearPrefilledSlot();

      // Reset Form State
      setTitle('');
      setDescription('');
      setIsTimeConfirmed(false);
      setAnalysisRan(false);
      setAnalysisResult(null);
    } catch {
      onShowToast('Failed to create event', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inlineRecommendations = analysisResult?.topRecommendations || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 border border-charcoal/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-ink sm:text-2xl">Event Planning & Scheduling</h2>
          <p className="mt-1 text-xs text-charcoal/70 sm:text-sm">
            Design targeted workshops and mentorship drives backed by dynamic student availability analysis.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setIsCreateModalOpen(true);
            setIsTimeConfirmed(false);
          }}
          className="font-bold text-xs px-5 shadow-sm shrink-0 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Event</span>
        </Button>
      </div>

      {/* Planned Events Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-ink">Active & Planned Drives ({events.length})</h3>
          <span className="text-xs text-charcoal/60">Real-time scheduling pipeline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((evt) => (
            <Card
              key={evt.id}
              className="border-charcoal/15 shadow-sm hover:border-gold/60 transition-all flex flex-col justify-between"
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded bg-gold/20 px-2 py-0.5 text-xs font-bold text-ink">
                    {evt.category}
                  </span>
                  <Badge
                    variant={
                      evt.status === 'Confirmed'
                        ? 'success'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {evt.status}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-base font-bold text-ink sm:text-lg leading-snug">
                    {evt.title}
                  </h4>
                  <p className="mt-1 text-xs text-charcoal/75 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-offwhite p-3 border border-charcoal/10 text-xs text-charcoal">
                  <div>
                    <span className="text-[10px] text-charcoal/50 uppercase font-bold block">
                      Date & Time
                    </span>
                    <span className="font-bold text-ink">
                      {evt.selectedDate} • {evt.selectedTimeSlot}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-charcoal/50 uppercase font-bold block">
                      Target Capacity
                    </span>
                    <span className="font-bold text-ink">
                      {evt.requiredParticipants} Scholars
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-charcoal/10">
                  <span className="text-charcoal/70">
                    Mode: <strong className="text-ink">{evt.mode}</strong>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateTab('sessions')}
                    className="text-xs font-semibold"
                  >
                    Manage Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* EVENT CREATION MODAL WITH 8-STEP INTEGRATED WORKFLOW */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            if (onClearPrefilledSlot) onClearPrefilledSlot();
          }}
          maxWidth="xl"
          title={
            <div className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-gold" />
              <span>Plan New Maatram Event</span>
            </div>
          }
          description="Design event details, filter the target audience, analyse schedule overlap, and confirm the session."
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                loading={saving}
                onClick={handleCreateSubmit}
                disabled={!isTimeConfirmed || eligibleStudents.length === 0}
                className="font-bold text-xs px-6"
              >
                <span>Confirm & Create Event</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          }
        >
          <form onSubmit={handleCreateSubmit} className="space-y-6 text-xs text-charcoal">
            {/* 1. Basic Event Information */}
            <div className="space-y-3.5 rounded-xl border border-charcoal/15 bg-white p-4">
              <h4 className="text-sm font-bold text-ink flex items-center gap-1.5 border-b border-charcoal/10 pb-2">
                1. Event Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <Input
                    label="Event Title"
                    placeholder="e.g. Full-Stack Mock Technical Interview with Microsoft Mentors"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-charcoal mb-1">
                    Event Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe session goals, syllabus, format, and participant expectations…"
                    className="w-full rounded-lg border border-charcoal/25 p-2.5 text-xs text-ink focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                    className="w-full rounded-lg border border-charcoal/25 bg-white p-2.5 text-xs text-ink focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
                  >
                    <option value="Mock Interview">Mock Interview</option>
                    <option value="Technical Workshop">Technical Workshop</option>
                    <option value="Resume Review">Resume Review</option>
                    <option value="Industry Mentorship">Industry Mentorship</option>
                    <option value="Placement Drive">Placement Drive</option>
                    <option value="Soft Skills">Soft Skills</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1">
                    Session Mode
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        checked={mode === 'Online'}
                        onChange={() => setMode('Online')}
                        className="accent-gold"
                      />
                      <span>Online (Meet/Zoom)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer ml-3">
                      <input
                        type="radio"
                        checked={mode === 'Offline'}
                        onChange={() => setMode('Offline')}
                        className="accent-gold"
                      />
                      <span>Offline (Campus Venue)</span>
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Input
                    label={mode === 'Online' ? 'Meeting URL / Link' : 'Physical Venue Address'}
                    value={locationOrLink}
                    onChange={(e) => setLocationOrLink(e.target.value)}
                    placeholder={mode === 'Online' ? 'https://meet.google.com/...' : 'Guindy Campus Hall B, Chennai'}
                  />
                </div>

                <div>
                  <Input
                    label="Lead Mentor / Host Name"
                    value={mentorOrHost}
                    onChange={(e) => setMentorOrHost(e.target.value)}
                    placeholder="e.g. Sridhar Natarajan"
                  />
                </div>

                <div>
                  <Input
                    label="Mentor Professional Role"
                    value={mentorRole}
                    onChange={(e) => setMentorRole(e.target.value)}
                    placeholder="e.g. Staff Software Engineer @ Google"
                  />
                </div>
              </div>
            </div>

            {/* 2. Target Audience Selection (Requirement 2 & 8) */}
            <div className="space-y-3.5 rounded-xl border border-charcoal/15 bg-white p-4">
              <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
                <h4 className="text-sm font-bold text-ink flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-gold" />
                  <span>2. Target Audience Selection</span>
                </h4>
                <div className="flex items-center gap-2">
                  <Badge variant={eligibleStudents.length > 0 ? 'gold' : 'warning'} size="sm">
                    {eligibleStudents.length} Matching Scholars
                  </Badge>
                </div>
              </div>

              {/* Institution Filter */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-charcoal/80 mb-1">
                  <span>Target Institutions ({selectedInstitutions.length || 'All colleges'})</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInstitutions([]);
                      setAnalysisRan(false);
                    }}
                    className="text-[10px] text-charcoal/60 hover:text-ink underline"
                  >
                    Select All
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {INSTITUTIONS_LIST.map((inst) => (
                    <button
                      key={inst}
                      type="button"
                      onClick={() => toggleInst(inst)}
                      className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                        selectedInstitutions.includes(inst)
                          ? 'bg-ink text-gold font-bold shadow-xs'
                          : 'bg-offwhite text-charcoal border border-charcoal/20'
                      }`}
                    >
                      {inst.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Academic Year & Departments */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="block font-semibold text-charcoal/80 text-[11px] mb-1">
                    Academic Year ({selectedYears.length || 'All Years'})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ACADEMIC_YEARS_LIST.map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => toggleYr(yr)}
                        className={`rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${
                          selectedYears.includes(yr)
                            ? 'bg-ink text-gold font-bold'
                            : 'bg-offwhite text-charcoal border border-charcoal/20'
                        }`}
                      >
                        {yr}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block font-semibold text-charcoal/80 text-[11px] mb-1">
                    Departments ({selectedDepartments.length || 'All Departments'})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {DEPARTMENTS_LIST.map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => toggleDept(dept)}
                        className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
                          selectedDepartments.includes(dept)
                            ? 'bg-ink text-gold font-bold'
                            : 'bg-offwhite text-charcoal border border-charcoal/20'
                        }`}
                      >
                        {dept.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Individual Student Filter */}
              <div className="pt-1 border-t border-charcoal/10">
                <div className="max-w-md">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-charcoal/80 mb-1">
                    <span>Individual Scholar Selection</span>
                    {selectedStudentIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudentIds([]);
                          setAnalysisRan(false);
                        }}
                        className="text-[10px] text-charcoal/60 hover:text-ink underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsStudentPickerOpen(true)}
                    className="w-full text-xs justify-between"
                  >
                    <span className="truncate">
                      {selectedStudentIds.length === 0
                        ? 'Target all in audience'
                        : `${selectedStudentIds.length} scholars explicitly selected`}
                    </span>
                    <Users className="h-3 w-3 opacity-60 ml-1 shrink-0" />
                  </Button>
                </div>
              </div>

              <div className="pt-1">
                <Input
                  label="Required Participants / Target Capacity"
                  type="number"
                  min="1"
                  max="100"
                  value={requiredParticipants}
                  onChange={(e) => setRequiredParticipants(Number(e.target.value))}
                  helperText="Participant seats planned for this event"
                />
              </div>
            </div>

            {/* 3. Availability Recommendation Engine (Requirement 8) */}
            <div className="space-y-4 rounded-xl border-2 border-gold/40 bg-gold/5 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gold/30 pb-2">
                <div>
                  <h4 className="text-sm font-extrabold text-ink flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-gold" />
                    <span>3. Smart Availability Recommendation Engine</span>
                  </h4>
                  <p className="text-[11px] text-charcoal/80">
                    Analyse actual student availability for the {eligibleStudents.length} eligible scholars before finalising time.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  loading={isAnalyzing}
                  onClick={handleAnalyzeAudienceAvailability}
                  className="font-bold text-xs shrink-0"
                >
                  <BarChart3 className="h-3.5 w-3.5 mr-1" />
                  <span>{analysisRan ? 'Re-Analyse Availability' : 'Run Audience Analysis'}</span>
                </Button>
              </div>

              {/* Date Range & Duration Selector for Analysis */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-charcoal/15">
                <div>
                  <label className="block text-[11px] font-bold text-charcoal mb-1">
                    Analysis Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setAnalysisRan(false);
                    }}
                    className="w-full rounded border border-charcoal/20 p-1.5 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-charcoal mb-1">
                    Analysis End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setAnalysisRan(false);
                    }}
                    className="w-full rounded border border-charcoal/20 p-1.5 text-xs text-ink"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-charcoal mb-1">
                    Session Duration
                  </label>
                  <select
                    value={durationHours}
                    onChange={(e) => {
                      setDurationHours(parseFloat(e.target.value));
                      setAnalysisRan(false);
                    }}
                    className="w-full rounded border border-charcoal/20 bg-white p-1.5 text-xs text-ink"
                  >
                    <option value={1}>1.0 Hour</option>
                    <option value={1.5}>1.5 Hours</option>
                    <option value={2}>2.0 Hours</option>
                    <option value={3}>3.0 Hours</option>
                  </select>
                </div>
              </div>

              {/* Submission Coverage Banner */}
              {analysisRan && analysisResult && (
                <div className="rounded-lg bg-white p-3 border border-charcoal/15 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-gold" />
                    <span>
                      Audience Submission Coverage:{' '}
                      <strong>{analysisResult.overallCoveragePercentage}%</strong> (
                      {analysisResult.eligibleCount} scholars evaluated)
                    </span>
                  </div>
                  <span className="text-[10px] text-charcoal/60">Missing treated as unknown</span>
                </div>
              )}

              {/* Inline Top 3 Recommendations Preview */}
              {analysisRan && inlineRecommendations.length > 0 && (
                <div className="space-y-2 pt-1 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-ink uppercase flex items-center gap-1.5">
                      <Trophy className="h-3.5 w-3.5 text-gold" />
                      <span>Top 3 Recommended Windows (Click to Select):</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {inlineRecommendations.map((rec) => {
                      const isChosen =
                        selectedDate === rec.date && slotId === rec.slotId;
                      return (
                        <div
                          key={`${rec.date}_${rec.slotId}`}
                          onClick={() => handleApplyRecommendation(rec)}
                          className={`rounded-xl p-3 border transition-all cursor-pointer ${
                            isChosen
                              ? 'border-ink bg-white shadow-md ring-2 ring-gold'
                              : 'border-charcoal/15 bg-white/80 hover:bg-white hover:border-gold'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                rec.rank === 1
                                  ? 'bg-gold text-ink'
                                  : 'bg-charcoal/10 text-charcoal'
                              }`}
                            >
                              Rank #{rec.rank}
                            </span>
                            <span className="font-extrabold text-xs text-ink font-mono">
                              {rec.percentage}% Free
                            </span>
                          </div>
                          <p className="font-bold text-xs text-ink mt-2">
                            {rec.dayName}, {rec.date}
                          </p>
                          <p className="text-[11px] text-charcoal/70 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3 text-gold" />
                            {rec.timeSlot}
                          </p>
                          <p className="text-[10px] text-emerald-800 font-semibold mt-1">
                            {rec.availableCount}/{rec.totalEligible} scholars confirmed
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Manual Confirmation and Timing Selection */}
              <div className="rounded-xl bg-white p-3.5 border border-charcoal/15 space-y-3">
                <span className="text-[11px] font-bold text-ink uppercase block">
                  Chosen Event Timing & Session Confirmation:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-charcoal mb-1">
                      Event Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setIsTimeConfirmed(false);
                      }}
                      className="w-full rounded-lg border border-charcoal/25 p-2 text-xs text-ink"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-charcoal mb-1">
                      Time Slot
                    </label>
                    <input
                      type="text"
                      value={selectedTimeSlot}
                      onChange={(e) => {
                        setSelectedTimeSlot(e.target.value);
                        setIsTimeConfirmed(false);
                      }}
                      placeholder="e.g. 02:00 PM - 04:00 PM"
                      className="w-full rounded-lg border border-charcoal/25 p-2 text-xs text-ink"
                    />
                  </div>
                </div>

                {/* Mandatory Review Confirmation Checkbox (Requirement 6 & 8) */}
                <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-offwhite border border-charcoal/15 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTimeConfirmed}
                    onChange={(e) => setIsTimeConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-charcoal/40 accent-gold"
                  />
                  <span className="text-[11px] leading-tight text-charcoal">
                    <strong>Confirm Session Timing:</strong> I have reviewed schedule overlap and verified availability for <strong>{selectedDate} ({selectedTimeSlot})</strong>.
                  </span>
                </label>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Individual Scholar Selection Modal */}
      {isStudentPickerOpen && (
        <Modal
          isOpen={isStudentPickerOpen}
          onClose={() => setIsStudentPickerOpen(false)}
          title="Select Target Scholars for Event"
          description="Limit the event audience to specific individual scholars"
          footer={
            <div className="flex justify-between w-full">
              <span className="text-xs text-charcoal/70 self-center">
                {selectedStudentIds.length} scholars explicitly selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedStudentIds([])}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsStudentPickerOpen(false)}
                >
                  Apply Selection
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-charcoal/40" />
              <input
                type="text"
                placeholder="Search scholar by name, college, or student ID…"
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-charcoal/20 bg-white py-2 pl-9 pr-3 text-xs text-ink placeholder:text-charcoal/40 focus:border-ink focus:outline-none"
              />
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-charcoal/10 border border-charcoal/15 rounded-lg text-xs">
              {students
                .filter((s) => {
                  if (s.enrollmentStatus !== 'Active') return false;
                  if (!studentSearchTerm.trim()) return true;
                  const q = studentSearchTerm.toLowerCase();
                  return (
                    s.name.toLowerCase().includes(q) ||
                    s.institution.toLowerCase().includes(q) ||
                    s.studentId.toLowerCase().includes(q) ||
                    s.department.toLowerCase().includes(q)
                  );
                })
                .map((s) => {
                  const isChecked = selectedStudentIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className="flex items-center justify-between p-2.5 hover:bg-charcoal/[0.02] cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleStudentId(s.id)}
                          className="h-4 w-4 rounded border-charcoal/30 accent-gold"
                        />
                        <div>
                          <div className="font-bold text-ink">{s.name}</div>
                          <div className="text-[11px] text-charcoal/60">
                            {s.institution} • {s.department} ({s.academicYear})
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] text-charcoal/50">{s.studentId}</span>
                    </label>
                  );
                })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
