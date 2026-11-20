import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Filter,
  Flame,
  Info,
  Layers,
  Loader2,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  Trophy,
  UserCheck,
  UserX,
  Users,
  X,
} from 'lucide-react';
import type {
  AvailabilityFilterCriteria,
  RecommendationCard,
  SmartRecommendationEngineResult,
  StudentDirectoryItem,
  TimeSlotAnalysisResult,
} from '../../types/office';
import {
  ACADEMIC_YEARS_LIST,
  DEPARTMENTS_LIST,
  GROUP_CATEGORIES_LIST,
  INSTITUTIONS_LIST,
} from '../../services/office/mockOfficeData';
import { officeService } from '../../services/office/officeService';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { AvailabilityChart } from './AvailabilityChart';

interface AvailabilityAnalysisTabProps {
  onPlanEventWithSlot?: (slot: {
    date: string;
    timeSlot: string;
    slotId: string;
    durationHours?: number;
    targetCriteria?: AvailabilityFilterCriteria;
  }) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function AvailabilityAnalysisTab({
  onPlanEventWithSlot,
  onShowToast,
}: AvailabilityAnalysisTabProps) {
  // Filter Criteria State
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Scheduling Parameters
  const [durationHours, setDurationHours] = useState<number>(2);
  const [minThresholdPercentage, setMinThresholdPercentage] = useState<number>(60);
  const [filterByThreshold, setFilterByThreshold] = useState<boolean>(false);

  // Date Range: defaults to upcoming weekend
  const [startDate, setStartDate] = useState<string>('2026-11-21');
  const [endDate, setEndDate] = useState<string>('2026-11-23');
  const [datePreset, setDatePreset] = useState<'weekend' | 'fullweek' | 'nextweekend' | 'custom'>('weekend');

  // All Students for picker
  const [allStudents, setAllStudents] = useState<StudentDirectoryItem[]>([]);
  const [isStudentPickerOpen, setIsStudentPickerOpen] = useState<boolean>(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');

  // Engine Output State
  const [loading, setLoading] = useState<boolean>(true);
  const [analysisResult, setAnalysisResult] = useState<SmartRecommendationEngineResult | null>(null);

  // Selected Heatmap Cell for Inspection
  const [inspectedSlot, setInspectedSlot] = useState<TimeSlotAnalysisResult | null>(null);
  const [inspectTab, setInspectTab] = useState<'available' | 'unavailable' | 'unknown'>('available');

  // Sort State for Comparison Table
  const [tableSortBy, setTableSortBy] = useState<'percentage' | 'available' | 'coverage' | 'date'>('percentage');
  const [tableSortOrder, setTableSortOrder] = useState<'asc' | 'desc'>('desc');

  // Initial student directory fetch
  useEffect(() => {
    officeService.getStudents().then(setAllStudents);
  }, []);

  // Quick Date Preset Handler
  const handleDatePreset = (preset: 'weekend' | 'fullweek' | 'nextweekend') => {
    setDatePreset(preset);
    if (preset === 'weekend') {
      setStartDate('2026-11-21');
      setEndDate('2026-11-22');
    } else if (preset === 'fullweek') {
      setStartDate('2026-11-21');
      setEndDate('2026-11-27');
    } else if (preset === 'nextweekend') {
      setStartDate('2026-11-28');
      setEndDate('2026-11-29');
    }
  };

  // Run Smart Recommendation Engine
  const runAnalysis = async () => {
    setLoading(true);
    try {
      const criteria: AvailabilityFilterCriteria = {
        institutions: selectedInstitutions,
        academicYears: selectedYears,
        departments: selectedDepartments,
        groupCategories: selectedGroups,
        selectedStudentIds: selectedStudentIds.length > 0 ? selectedStudentIds : undefined,
        startDate,
        endDate,
        durationHours,
        minThresholdPercentage,
      };

      const data = await officeService.analyzeAvailability(criteria);
      setAnalysisResult(data);

      if (data.results.length > 0) {
        const topResult = data.results.find(
          (r) =>
            data.topRecommendations[0] &&
            r.date === data.topRecommendations[0].date &&
            r.slotId === data.topRecommendations[0].slotId,
        );
        setInspectedSlot(topResult || data.results[0]);
      } else {
        setInspectedSlot(null);
      }
    } catch {
      onShowToast('Failed to run smart availability analysis', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Trigger analysis when parameters change
  useEffect(() => {
    runAnalysis();
  }, [
    selectedInstitutions,
    selectedYears,
    selectedDepartments,
    selectedGroups,
    selectedStudentIds,
    startDate,
    endDate,
    durationHours,
    minThresholdPercentage,
  ]);

  // Toggle helpers
  const toggleInstitution = (inst: string) => {
    setSelectedInstitutions((prev) =>
      prev.includes(inst) ? prev.filter((i) => i !== inst) : [...prev, inst],
    );
  };

  const toggleYear = (year: string) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year],
    );
  };

  const toggleDepartment = (dept: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept],
    );
  };

  const toggleGroup = (grp: string) => {
    setSelectedGroups((prev) =>
      prev.includes(grp) ? prev.filter((g) => g !== grp) : [...prev, grp],
    );
  };

  const toggleIndividualStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId],
    );
  };

  const clearAllFilters = () => {
    setSelectedInstitutions([]);
    setSelectedYears([]);
    setSelectedDepartments([]);
    setSelectedGroups([]);
    setSelectedStudentIds([]);
    setMinThresholdPercentage(60);
    setFilterByThreshold(false);
  };

  const handlePlanSlot = (slot: { date: string; timeSlot: string; slotId: string }) => {
    if (onPlanEventWithSlot) {
      onPlanEventWithSlot({
        date: slot.date,
        timeSlot: slot.timeSlot,
        slotId: slot.slotId,
        durationHours,
        targetCriteria: {
          institutions: selectedInstitutions,
          academicYears: selectedYears,
          departments: selectedDepartments,
          groupCategories: selectedGroups,
          selectedStudentIds: selectedStudentIds.length > 0 ? selectedStudentIds : undefined,
          startDate,
          endDate,
          durationHours,
          minThresholdPercentage,
        },
      });
    }
  };

  const results = analysisResult?.results || [];
  const recommendations = analysisResult?.topRecommendations || [];
  const eligibleCount = analysisResult?.eligibleCount || 0;
  const eligibleStudents = analysisResult?.eligibleStudents || [];

  // Distinct dates in the results
  const distinctDates = useMemo(() => {
    const dates = Array.from(new Set(results.map((r) => r.date)));
    return dates.map((dStr) => {
      const cur = new Date(dStr + 'T00:00:00');
      return {
        dateStr: dStr,
        dayName: cur.toLocaleDateString('en-US', { weekday: 'short' }),
        dayMonth: cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isWeekend: cur.getDay() === 0 || cur.getDay() === 6,
      };
    });
  }, [results]);

  // Distinct slot IDs
  const distinctSlotIds = useMemo(() => {
    return Array.from(new Set(results.map((r) => r.slotId)));
  }, [results]);

  // Filtered results for comparison table
  const displayedTableResults = useMemo(() => {
    let list = [...results];
    if (filterByThreshold) {
      list = list.filter((r) => r.percentage >= minThresholdPercentage);
    }
    list.sort((a, b) => {
      let diff = 0;
      if (tableSortBy === 'percentage') diff = b.percentage - a.percentage;
      else if (tableSortBy === 'available') diff = b.availableCount - a.availableCount;
      else if (tableSortBy === 'coverage') diff = b.submissionCoveragePercentage - a.submissionCoveragePercentage;
      else if (tableSortBy === 'date') diff = a.date.localeCompare(b.date);
      return tableSortOrder === 'asc' ? -diff : diff;
    });
    return list;
  }, [results, filterByThreshold, minThresholdPercentage, tableSortBy, tableSortOrder]);

  // Cell heatmap background helper
  const getHeatmapColor = (slot: TimeSlotAnalysisResult | undefined) => {
    if (!slot) return 'bg-charcoal/5 text-charcoal/40';
    if (slot.availableCount === 0 && slot.unavailableCount === 0) {
      return 'bg-charcoal/[0.03] text-charcoal/40 border border-dashed border-charcoal/20';
    }
    if (slot.percentage >= 80) return 'bg-gold text-ink font-extrabold ring-1 ring-gold shadow-xs';
    if (slot.percentage >= 65) return 'bg-[#F9CE54] text-ink font-bold';
    if (slot.percentage >= 50) return 'bg-[#FBE49A] text-ink font-semibold';
    if (slot.percentage >= 30) return 'bg-amber-100/70 text-ink';
    return 'bg-offwhite text-charcoal/80 border border-charcoal/15';
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-ink p-6 sm:p-8 text-white shadow-xl ring-1 ring-white/10">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold ring-1 ring-gold/40">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Smart Availability Recommendation Engine</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Data-Driven Overlap Optimization
            </h2>
            <p className="text-sm leading-relaxed text-white/75">
              The engine retrieves live scholar availability from Supabase, rigorously treats missing records as unknown, respects multi-hour event continuity, and computes peak overlap slots for maximum attendance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={runAnalysis}
              loading={loading}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Recalculate Overlap
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (recommendations[0]) {
                  handlePlanSlot({
                    date: recommendations[0].date,
                    timeSlot: recommendations[0].timeSlot,
                    slotId: recommendations[0].slotId,
                  });
                }
              }}
              disabled={recommendations.length === 0}
              className="shadow-md shadow-gold/20 text-xs font-bold"
            >
              <Flame className="h-3.5 w-3.5 mr-1 text-ink" />
              Schedule Peak Slot
            </Button>
          </div>
        </div>
      </div>

      {/* Target Audience & Schedule Filter Toolbar */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gold" />
                <span>Audience & Scheduling Configuration</span>
              </div>
              <div className="flex items-center gap-2">
                {(selectedInstitutions.length > 0 ||
                  selectedYears.length > 0 ||
                  selectedDepartments.length > 0 ||
                  selectedGroups.length > 0 ||
                  selectedStudentIds.length > 0) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs text-charcoal/70 hover:text-ink underline"
                  >
                    Reset all filters
                  </Button>
                )}
                <Badge variant="gold" size="sm">
                  {eligibleCount} Matching Scholars
                </Badge>
              </div>
            </div>
          }
          subtitle="Define cohort audience criteria, date window, event duration, and minimum acceptable turnout threshold"
        />

        <CardContent className="space-y-5 pt-0">
          {/* Row 1: Partner Colleges Multi-Select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal">
              <span>Partner Institutions ({selectedInstitutions.length || 'All colleges'})</span>
              <button
                type="button"
                onClick={() => setSelectedInstitutions([])}
                className="text-[11px] text-charcoal/60 hover:text-ink underline"
              >
                Select All
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {INSTITUTIONS_LIST.map((inst) => {
                const isSelected = selectedInstitutions.includes(inst);
                return (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => toggleInstitution(inst)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-ink text-gold font-bold shadow-xs'
                        : 'bg-charcoal/5 text-charcoal hover:bg-charcoal/10'
                    }`}
                  >
                    {inst}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Academic Year & Departments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-charcoal block">
                Academic Year ({selectedYears.length || 'All Years'})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ACADEMIC_YEARS_LIST.map((yr) => (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => toggleYear(yr)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      selectedYears.includes(yr)
                        ? 'bg-ink text-gold font-bold'
                        : 'bg-charcoal/5 text-charcoal hover:bg-charcoal/10'
                    }`}
                  >
                    {yr}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-charcoal block">
                Departments ({selectedDepartments.length || 'All Departments'})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DEPARTMENTS_LIST.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => toggleDepartment(dept)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      selectedDepartments.includes(dept)
                        ? 'bg-ink text-gold font-bold'
                        : 'bg-charcoal/5 text-charcoal hover:bg-charcoal/10'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Cohort Groups & Individual Scholar Picker */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-charcoal/10">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-charcoal block">
                Scholar Cohort Group ({selectedGroups.length || 'All Groups'})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {GROUP_CATEGORIES_LIST.map((grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => toggleGroup(grp)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                      selectedGroups.includes(grp)
                        ? 'bg-ink text-gold font-bold'
                        : 'bg-charcoal/5 text-charcoal hover:bg-charcoal/10'
                    }`}
                  >
                    {grp}
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Scholar Selection Trigger */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-charcoal">
                <span>Individual Scholar Filter</span>
                {selectedStudentIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedStudentIds([])}
                    className="text-[11px] text-charcoal/60 hover:text-ink underline"
                  >
                    Clear selection
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsStudentPickerOpen(true)}
                  className="text-xs flex items-center gap-1.5 w-full justify-between"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Users className="h-3.5 w-3.5 text-charcoal/60" />
                    {selectedStudentIds.length === 0
                      ? 'Select individual students…'
                      : `${selectedStudentIds.length} individual scholars selected`}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-charcoal/50" />
                </Button>
              </div>
            </div>
          </div>

          {/* Row 4: Scheduling Parameters (Duration & Threshold) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-charcoal/10">
            {/* Date Preset */}
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                Date Preset
              </label>
              <div className="flex rounded-lg border border-charcoal/20 p-1 bg-charcoal/[0.02]">
                <button
                  type="button"
                  onClick={() => handleDatePreset('weekend')}
                  className={`flex-1 rounded py-1 text-xs font-medium transition-colors ${
                    datePreset === 'weekend' ? 'bg-ink text-white font-bold' : 'text-charcoal hover:text-ink'
                  }`}
                >
                  Weekend
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePreset('fullweek')}
                  className={`flex-1 rounded py-1 text-xs font-medium transition-colors ${
                    datePreset === 'fullweek' ? 'bg-ink text-white font-bold' : 'text-charcoal hover:text-ink'
                  }`}
                >
                  7 Days
                </button>
                <button
                  type="button"
                  onClick={() => handleDatePreset('nextweekend')}
                  className={`flex-1 rounded py-1 text-xs font-medium transition-colors ${
                    datePreset === 'nextweekend' ? 'bg-ink text-white font-bold' : 'text-charcoal hover:text-ink'
                  }`}
                >
                  Next Wknd
                </button>
              </div>
            </div>

            {/* Event Duration */}
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                Session Duration
              </label>
              <select
                value={durationHours}
                onChange={(e) => setDurationHours(parseFloat(e.target.value))}
                className="w-full rounded-lg border border-charcoal/25 bg-white p-2 text-xs font-medium text-ink focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value={1}>1.0 Hour (Quick Briefing)</option>
                <option value={1.5}>1.5 Hours (Standard Session)</option>
                <option value={2}>2.0 Hours (Workshop / Mock Interview)</option>
                <option value={3}>3.0 Hours (Intensive Bootcamp)</option>
              </select>
            </div>

            {/* Custom Dates */}
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1.5">
                Date Range
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="w-full rounded-lg border border-charcoal/25 bg-white p-1.5 text-xs text-ink focus:border-ink focus:outline-none"
                />
                <span className="text-xs text-charcoal/40">–</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="w-full rounded-lg border border-charcoal/25 bg-white p-1.5 text-xs text-ink focus:border-ink focus:outline-none"
                />
              </div>
            </div>

            {/* Minimum Threshold */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-charcoal">
                  Min Turnout Threshold: {minThresholdPercentage}%
                </label>
                <button
                  type="button"
                  onClick={() => setFilterByThreshold((prev) => !prev)}
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    filterByThreshold ? 'bg-gold text-ink' : 'bg-charcoal/10 text-charcoal'
                  }`}
                >
                  {filterByThreshold ? 'Filter Active' : 'Highlight Only'}
                </button>
              </div>
              <input
                type="range"
                min={20}
                max={90}
                step={5}
                value={minThresholdPercentage}
                onChange={(e) => setMinThresholdPercentage(parseInt(e.target.value, 10))}
                className="w-full accent-gold cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-charcoal/50">
                <span>20% Low</span>
                <span>60% Balanced</span>
                <span>90% Strict</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Coverage Indicator Banner */}
      <div className="rounded-xl border border-charcoal/15 bg-white p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-gold/20 p-2 text-ink mt-0.5">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-ink">Submission Coverage Status</h4>
              <Badge
                variant={
                  analysisResult?.overallCoveragePercentage && analysisResult.overallCoveragePercentage >= 75
                    ? 'success'
                    : analysisResult?.overallCoveragePercentage && analysisResult.overallCoveragePercentage >= 40
                      ? 'gold'
                      : 'warning'
                }
                size="sm"
              >
                {analysisResult?.overallCoveragePercentage || 0}% Audience Coverage
              </Badge>
            </div>
            <p className="text-xs text-charcoal/70 mt-0.5">
              Missing submissions are evaluated as <strong>unknown</strong> rather than confirmed unavailable. Only verified available responses are counted toward turnout.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-xs font-bold text-ink">
              {eligibleCount > 0
                ? `${Math.round(((analysisResult?.overallCoveragePercentage || 0) / 100) * eligibleCount)} of ${eligibleCount} scholars submitted`
                : '0 scholars matching'}
            </div>
            <div className="text-[10px] text-charcoal/50">Active for {startDate} to {endDate}</div>
          </div>
        </div>
      </div>

      {/* Empty State: If No Students or No Submissions */}
      {eligibleCount === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-3">
            <Users className="mx-auto h-10 w-10 text-charcoal/30" />
            <h3 className="text-base font-bold text-ink">No scholars match the selected audience filters</h3>
            <p className="text-xs text-charcoal/70 max-w-md mx-auto">
              Please relax your institution, academic year, department, or individual scholar filters to evaluate candidate event timings.
            </p>
            <Button variant="outline" size="sm" onClick={clearAllFilters} className="text-xs mt-2">
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      ) : analysisResult?.hasSubmissions === false ? (
        <Card>
          <CardContent className="p-12 text-center space-y-3 border border-amber-200 bg-amber-50/50 rounded-xl">
            <AlertCircle className="mx-auto h-10 w-10 text-amber-600" />
            <h3 className="text-base font-bold text-ink">No availability submissions recorded for this date window</h3>
            <p className="text-xs text-charcoal/80 max-w-md mx-auto">
              None of the {eligibleCount} matching scholars have submitted availability between {startDate} and {endDate}. Missing records are treated as unknown to prevent scheduling false positives.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDatePreset('fullweek')}
                className="text-xs"
              >
                Expand to 7-Day Window
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Top 3 Recommendation Cards Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-ink flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-gold" />
                  Top Recommended Event Windows
                </h3>
                <p className="text-xs text-charcoal/70">
                  Calculated dynamically from verified scholar submissions for {durationHours}-hour sessions
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec) => {
                const isSelected =
                  inspectedSlot?.date === rec.date && inspectedSlot?.slotId === rec.slotId;
                return (
                  <Card
                    key={`${rec.date}_${rec.slotId}`}
                    variant="interactive"
                    onClick={() => {
                      const match = results.find(
                        (r) => r.date === rec.date && r.slotId === rec.slotId,
                      );
                      if (match) setInspectedSlot(match);
                    }}
                    className={`relative overflow-hidden transition-all ${
                      isSelected
                        ? 'ring-2 ring-gold border-gold shadow-md'
                        : 'hover:border-charcoal/40'
                    }`}
                  >
                    <div className="p-5 space-y-3.5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                              rec.rank === 1
                                ? 'bg-gold text-ink ring-1 ring-gold/40'
                                : rec.rank === 2
                                  ? 'bg-charcoal/10 text-charcoal ring-1 ring-charcoal/20'
                                  : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            #{rec.rank}
                          </span>
                          <span className="text-xs font-semibold text-charcoal/80">
                            {rec.tag}
                          </span>
                        </div>
                        <Badge variant={rec.percentage >= 75 ? 'success' : 'gold'} size="sm">
                          {rec.percentage}% Available
                        </Badge>
                      </div>

                      <div>
                        <div className="text-base font-bold text-ink">
                          {rec.dayName}, {rec.date}
                        </div>
                        <div className="text-xs font-semibold text-charcoal/80 flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3.5 w-3.5 text-gold" />
                          <span>{rec.timeSlot}</span>
                          <span className="text-[10px] text-charcoal/50">({rec.durationHours}h)</span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-charcoal/70 bg-charcoal/[0.03] p-2.5 rounded-lg border border-charcoal/10">
                        <div className="flex justify-between font-medium">
                          <span>Confirmed Turnout:</span>
                          <span className="font-mono font-bold text-ink">
                            {rec.availableCount} / {rec.totalEligible}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span>Submission Coverage:</span>
                          <span className="font-mono text-charcoal">
                            {rec.submissionCoveragePercentage}%
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-charcoal/75 leading-relaxed">
                        {rec.reason}
                      </p>

                      <div className="pt-2 border-t border-charcoal/10 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-ink group-hover:underline">
                          Inspect scholars
                        </span>
                        {onPlanEventWithSlot && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlanSlot({
                                date: rec.date,
                                timeSlot: rec.timeSlot,
                                slotId: rec.slotId,
                              });
                            }}
                            className="text-xs font-bold"
                          >
                            Plan Event
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Availability Heatmap & Inspection Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Heatmap Matrix (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader
                  title={
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Flame className="h-4 w-4 text-gold" />
                        <span>Availability Overlap Heatmap</span>
                      </div>
                      <span className="text-xs text-charcoal/60">
                        Click cell to inspect student list
                      </span>
                    </div>
                  }
                  subtitle={`Audience turnout matrix for ${durationHours}-hour candidate slots`}
                />

                <CardContent className="overflow-x-auto p-4">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr>
                        <th className="p-2 text-left font-semibold text-charcoal/70 bg-charcoal/5 rounded-l-lg text-[11px] uppercase tracking-wider">
                          Time Slot
                        </th>
                        {distinctDates.map((d) => (
                          <th
                            key={d.dateStr}
                            className={`p-2 text-center font-bold text-xs ${
                              d.isWeekend ? 'bg-gold/10 text-ink' : 'bg-charcoal/5 text-charcoal'
                            }`}
                          >
                            <div>{d.dayName}</div>
                            <div className="text-[10px] font-normal text-charcoal/60">{d.dayMonth}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-charcoal/10">
                      {distinctSlotIds.map((sId) => {
                        const sampleSlot = results.find((r) => r.slotId === sId);
                        const label = sampleSlot ? sampleSlot.slotLabel : sId;

                        return (
                          <tr key={sId} className="hover:bg-charcoal/[0.01]">
                            <td className="p-2 font-mono text-[11px] text-ink font-semibold whitespace-nowrap bg-white">
                              {label}
                            </td>
                            {distinctDates.map((d) => {
                              const slot = results.find(
                                (r) => r.date === d.dateStr && r.slotId === sId,
                              );
                              const isInspected =
                                inspectedSlot?.date === d.dateStr && inspectedSlot?.slotId === sId;

                              return (
                                <td key={d.dateStr} className="p-1.5 text-center">
                                  {slot ? (
                                    <button
                                      type="button"
                                      onClick={() => setInspectedSlot(slot)}
                                      className={`w-full rounded-lg py-2 px-1 text-xs transition-all ${getHeatmapColor(
                                        slot,
                                      )} ${
                                        isInspected
                                          ? 'ring-2 ring-ink ring-offset-1 scale-[1.03] shadow-md font-extrabold'
                                          : 'hover:scale-[1.02]'
                                      }`}
                                    >
                                      <div className="font-extrabold leading-none">
                                        {slot.percentage}%
                                      </div>
                                      <div className="text-[10px] opacity-80 mt-1">
                                        {slot.availableCount}/{slot.totalEligible}
                                      </div>
                                    </button>
                                  ) : (
                                    <span className="text-charcoal/20 text-xs">–</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Heatmap Legend */}
                  <div className="mt-4 pt-3 border-t border-charcoal/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-charcoal/70">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-ink">Turnout Scale:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="h-3 w-4 rounded bg-gold" />
                        <span>Peak ($\ge 80\%$)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-3 w-4 rounded bg-[#F9CE54]" />
                        <span>Strong (65–79%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-3 w-4 rounded bg-[#FBE49A]" />
                        <span>Moderate (50–64%)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="h-3 w-4 rounded bg-offwhite border border-charcoal/20" />
                        <span>Low (&lt;50%)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Inspection Panel (1 col) */}
            <div className="space-y-4">
              <Card className="h-full flex flex-col">
                <CardHeader
                  title={
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gold" />
                        <span>Slot Roster Inspector</span>
                      </div>
                      {inspectedSlot && (
                        <Badge
                          variant={inspectedSlot.percentage >= 70 ? 'success' : 'gold'}
                          size="sm"
                        >
                          {inspectedSlot.percentage}% Free
                        </Badge>
                      )}
                    </div>
                  }
                  subtitle={
                    inspectedSlot
                      ? `${inspectedSlot.dayName}, ${inspectedSlot.date} • ${inspectedSlot.slotLabel}`
                      : 'Select a cell on the heatmap to view scholar breakdown'
                  }
                />

                <CardContent className="flex-1 flex flex-col justify-between p-4 pt-0 space-y-4">
                  {inspectedSlot ? (
                    <>
                      {/* Metric Summary */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                          <span className="text-[10px] text-emerald-800 font-semibold block uppercase">
                            Available
                          </span>
                          <span className="text-base font-extrabold text-emerald-900 font-mono">
                            {inspectedSlot.availableCount}
                          </span>
                        </div>
                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-2">
                          <span className="text-[10px] text-rose-800 font-semibold block uppercase">
                            Unavailable
                          </span>
                          <span className="text-base font-extrabold text-rose-900 font-mono">
                            {inspectedSlot.unavailableCount}
                          </span>
                        </div>
                        <div className="bg-charcoal/5 border border-charcoal/15 rounded-lg p-2">
                          <span className="text-[10px] text-charcoal/70 font-semibold block uppercase">
                            Unknown
                          </span>
                          <span className="text-base font-extrabold text-charcoal font-mono">
                            {inspectedSlot.unknownCount}
                          </span>
                        </div>
                      </div>

                      {/* Tab toggles */}
                      <div className="flex rounded-lg border border-charcoal/20 p-1 bg-charcoal/[0.02] text-xs">
                        <button
                          type="button"
                          onClick={() => setInspectTab('available')}
                          className={`flex-1 rounded py-1 font-semibold transition-colors ${
                            inspectTab === 'available'
                              ? 'bg-ink text-white font-bold'
                              : 'text-charcoal hover:text-ink'
                          }`}
                        >
                          Available ({inspectedSlot.availableCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setInspectTab('unavailable')}
                          className={`flex-1 rounded py-1 font-semibold transition-colors ${
                            inspectTab === 'unavailable'
                              ? 'bg-ink text-white font-bold'
                              : 'text-charcoal hover:text-ink'
                          }`}
                        >
                          Unavailable ({inspectedSlot.unavailableCount})
                        </button>
                        <button
                          type="button"
                          onClick={() => setInspectTab('unknown')}
                          className={`flex-1 rounded py-1 font-semibold transition-colors ${
                            inspectTab === 'unknown'
                              ? 'bg-ink text-white font-bold'
                              : 'text-charcoal hover:text-ink'
                          }`}
                        >
                          Unknown ({inspectedSlot.unknownCount})
                        </button>
                      </div>

                      {/* Scholar List */}
                      <div className="flex-1 max-h-72 overflow-y-auto space-y-2 pr-1 text-xs">
                        {inspectTab === 'available' &&
                          (inspectedSlot.matchingStudentIds.length === 0 ? (
                            <p className="text-center text-charcoal/50 py-8">
                              No scholars confirmed available for this window.
                            </p>
                          ) : (
                            inspectedSlot.matchingStudentIds.map((id) => {
                              const s = eligibleStudents.find((st) => st.id === id);
                              if (!s) return null;
                              return (
                                <div
                                  key={s.id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/50 border border-emerald-200"
                                >
                                  <div>
                                    <div className="font-semibold text-ink">{s.name}</div>
                                    <div className="text-[10px] text-charcoal/70">
                                      {s.institution} • {s.department}
                                    </div>
                                  </div>
                                  <UserCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                </div>
                              );
                            })
                          ))}

                        {inspectTab === 'unavailable' &&
                          (inspectedSlot.unavailableStudentIds.length === 0 ? (
                            <p className="text-center text-charcoal/50 py-8">
                              No scholars marked explicitly unavailable.
                            </p>
                          ) : (
                            inspectedSlot.unavailableStudentIds.map((id) => {
                              const s = eligibleStudents.find((st) => st.id === id);
                              if (!s) return null;
                              return (
                                <div
                                  key={s.id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-rose-50/50 border border-rose-200"
                                >
                                  <div>
                                    <div className="font-semibold text-ink">{s.name}</div>
                                    <div className="text-[10px] text-charcoal/70">
                                      {s.institution} • {s.department}
                                    </div>
                                  </div>
                                  <UserX className="h-4 w-4 text-rose-600 shrink-0" />
                                </div>
                              );
                            })
                          ))}

                        {inspectTab === 'unknown' &&
                          (inspectedSlot.unknownStudentIds.length === 0 ? (
                            <p className="text-center text-charcoal/50 py-8">
                              All matching scholars have submitted availability!
                            </p>
                          ) : (
                            inspectedSlot.unknownStudentIds.map((id) => {
                              const s = eligibleStudents.find((st) => st.id === id);
                              if (!s) return null;
                              return (
                                <div
                                  key={s.id}
                                  className="flex items-center justify-between p-2 rounded-lg bg-charcoal/5 border border-charcoal/10"
                                >
                                  <div>
                                    <div className="font-semibold text-ink">{s.name}</div>
                                    <div className="text-[10px] text-charcoal/60">
                                      {s.institution} • No submission recorded
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-mono text-charcoal/50">Unknown</span>
                                </div>
                              );
                            })
                          ))}
                      </div>

                      {/* Action CTA */}
                      {onPlanEventWithSlot && (
                        <div className="pt-2 border-t border-charcoal/10">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              handlePlanSlot({
                                date: inspectedSlot.date,
                                timeSlot: inspectedSlot.slotLabel,
                                slotId: inspectedSlot.slotId,
                              })
                            }
                            className="w-full text-xs font-bold"
                          >
                            Plan Event for {inspectedSlot.dayShort} ({inspectedSlot.slotId})
                            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-16 text-charcoal/50">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p>Select any cell on the heatmap to view turnouts and student rosters.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Visualisation: Availability Percentage Chart */}
          <AvailabilityChart
            slots={results}
            minThreshold={minThresholdPercentage}
            selectedSlot={inspectedSlot}
            onSelectSlot={(slot) => setInspectedSlot(slot)}
            onPlanEventWithSlot={handlePlanSlot}
          />

          {/* Time Slot Comparison Table */}
          <Card>
            <CardHeader
              title={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-gold" />
                    <span>Candidate Time-Slot Comparison</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-charcoal/60">Sort by:</span>
                    <select
                      value={tableSortBy}
                      onChange={(e) => setTableSortBy(e.target.value as any)}
                      className="rounded-lg border border-charcoal/20 bg-white p-1 text-xs text-ink focus:border-ink"
                    >
                      <option value="percentage">Availability % (Highest first)</option>
                      <option value="available">Available Count</option>
                      <option value="coverage">Submission Coverage %</option>
                      <option value="date">Date</option>
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        setTableSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                      }
                      className="text-xs font-mono font-bold text-charcoal hover:text-ink px-1.5 py-0.5 border border-charcoal/20 rounded"
                    >
                      {tableSortOrder.toUpperCase()}
                    </button>
                  </div>
                </div>
              }
              subtitle={`Complete comparison of ${displayedTableResults.length} evaluated candidate windows`}
            />

            <CardContent className="overflow-x-auto p-0">
              <table className="w-full border-collapse text-left text-xs">
                <thead className="bg-charcoal/5 text-charcoal uppercase tracking-wider text-[11px] font-semibold border-y border-charcoal/15">
                  <tr>
                    <th className="px-4 py-3">Date & Day</th>
                    <th className="px-4 py-3">Time Window</th>
                    <th className="px-4 py-3 text-center">Duration</th>
                    <th className="px-4 py-3 text-center">Confirmed Available</th>
                    <th className="px-4 py-3 text-center">Unavailable</th>
                    <th className="px-4 py-3 text-center">Unknown</th>
                    <th className="px-4 py-3 text-center">Turnout %</th>
                    <th className="px-4 py-3 text-center">Coverage %</th>
                    <th className="px-4 py-3 text-center">Threshold</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal/10 text-charcoal">
                  {displayedTableResults.map((item) => (
                    <tr
                      key={`${item.date}_${item.slotId}`}
                      className="hover:bg-charcoal/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-ink whitespace-nowrap">
                        {item.dayName}, {item.date}
                      </td>
                      <td className="px-4 py-3 font-mono text-ink font-semibold whitespace-nowrap">
                        {item.slotLabel}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-charcoal/80">
                        {item.durationHours}h
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-emerald-800">
                        {item.availableCount} / {item.totalEligible}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-rose-700">
                        {item.unavailableCount}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-charcoal/60">
                        {item.unknownCount}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={
                            item.percentage >= 80
                              ? 'success'
                              : item.percentage >= 60
                                ? 'gold'
                                : item.percentage >= 40
                                  ? 'warning'
                                  : 'neutral'
                          }
                          size="sm"
                        >
                          {item.percentage}%
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-charcoal/70">
                        {item.submissionCoveragePercentage}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.meetsThreshold ? (
                          <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700">
                            <Check className="h-3 w-3 mr-0.5" /> Pass
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] font-semibold text-charcoal/40">
                            Below {minThresholdPercentage}%
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {onPlanEventWithSlot && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handlePlanSlot({
                                date: item.date,
                                timeSlot: item.slotLabel,
                                slotId: item.slotId,
                              })
                            }
                            className="text-[11px] font-semibold px-2 py-1"
                          >
                            Plan Event
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Individual Student Picker Modal */}
      {isStudentPickerOpen && (
        <Modal
          isOpen={isStudentPickerOpen}
          onClose={() => setIsStudentPickerOpen(false)}
          title="Select Specific Scholars for Availability Analysis"
          description="Limit the recommendation calculations to a targeted list of individual scholars"
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
              {allStudents
                .filter((s) => {
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
                          onChange={() => toggleIndividualStudent(s.id)}
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
