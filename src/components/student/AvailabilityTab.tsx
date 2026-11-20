import { useEffect, useState } from 'react';
import {
  Calendar,
  CalendarCheck2,
  CalendarRange,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Info,
  Loader2,
  Minus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { SlotStatus, WeeklyAvailability } from '../../types/student';
import { TIME_SLOTS } from '../../services/student/mockStudentData';
import { studentService } from '../../services/student/studentService';
import { addWeeks, getMonday, getWeekDays, toISODateString } from '../../lib/utils';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';
import { TimeSlotGrid } from './TimeSlotGrid';

interface AvailabilityTabProps {
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onAvailabilitySaved?: () => void;
}

export function AvailabilityTab({ onShowToast, onAvailabilitySaved }: AvailabilityTabProps) {
  // Current view monday
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));
  const [weeklyData, setWeeklyData] = useState<WeeklyAvailability | null>(null);
  const [slots, setSlots] = useState<Record<string, SlotStatus>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Active Tool Mode
  const [activeTool, setActiveTool] = useState<'toggle' | 'available' | 'unavailable' | 'unselected'>('toggle');

  // Copy modal state
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [copyTargetOption, setCopyTargetOption] = useState<'from_prev' | 'to_next'>('from_prev');
  const [copying, setCopying] = useState(false);

  // Day filter for mobile view
  const [selectedDayFilter, setSelectedDayFilter] = useState<string | null>(null);

  const currentMondayStr = toISODateString(currentMonday);
  const weekDays = getWeekDays(currentMonday);

  // Load availability when week changes
  useEffect(() => {
    let active = true;
    const fetchWeek = async () => {
      setLoading(true);
      try {
        const data = await studentService.getWeeklyAvailability(currentMondayStr);
        if (active) {
          setWeeklyData(data);
          setSlots({ ...data.slots });
          setIsDirty(false);
        }
      } catch (err) {
        if (active) onShowToast('Failed to load availability for this week', 'error');
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchWeek();
    return () => {
      active = false;
    };
  }, [currentMondayStr]);

  // Navigate week
  const handlePrevWeek = () => {
    setCurrentMonday((prev) => addWeeks(prev, -1));
  };

  const handleNextWeek = () => {
    setCurrentMonday((prev) => addWeeks(prev, 1));
  };

  const handleCurrentWeek = () => {
    setCurrentMonday(getMonday(new Date()));
  };

  // Toggle slot on a specific date (Ensures absolute isolation: only touches that date's key)
  const handleToggleSlot = (date: string, slotId: string) => {
    const key = `${date}_${slotId}`;
    const current = slots[key] || 'unselected';

    let next: SlotStatus = 'unselected';
    if (activeTool === 'toggle') {
      if (current === 'unselected') next = 'available';
      else if (current === 'available') next = 'unavailable';
      else next = 'unselected';
    } else {
      next = activeTool;
    }

    setSlots((prev) => ({
      ...prev,
      [key]: next,
    }));
    setIsDirty(true);
  };

  // Set day-level availability strictly for that day
  const handleSetDayAvailability = (date: string, status: SlotStatus) => {
    const newSlots = { ...slots };
    TIME_SLOTS.forEach((ts) => {
      newSlots[`${date}_${ts.id}`] = status;
    });
    setSlots(newSlots);
    setIsDirty(true);
  };

  // Quick Preset: Weekend All-Day Available (Sat & Sun)
  const handlePresetWeekend = () => {
    const newSlots = { ...slots };
    weekDays
      .filter((d) => d.isWeekend)
      .forEach((d) => {
        ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'].forEach((slotId) => {
          newSlots[`${d.date}_${slotId}`] = 'available';
        });
      });
    setSlots(newSlots);
    setIsDirty(true);
    onShowToast('Weekend slots (Saturday & Sunday) marked available', 'info');
  };

  // Quick Preset: Weekday Evenings (Mon-Fri 17:00 - 20:00)
  const handlePresetWeekdayEvenings = () => {
    const newSlots = { ...slots };
    weekDays
      .filter((d) => !d.isWeekend)
      .forEach((d) => {
        ['17:00', '18:00', '19:00', '20:00'].forEach((slotId) => {
          newSlots[`${d.date}_${slotId}`] = 'available';
        });
      });
    setSlots(newSlots);
    setIsDirty(true);
    onShowToast('Weekday evenings (5 PM - 9 PM) marked available', 'info');
  };

  // Quick Preset: College Hours Busy (Mon-Fri 08:00 - 16:00)
  const handlePresetCollegeBusy = () => {
    const newSlots = { ...slots };
    weekDays
      .filter((d) => !d.isWeekend)
      .forEach((d) => {
        ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'].forEach((slotId) => {
          newSlots[`${d.date}_${slotId}`] = 'unavailable';
        });
      });
    setSlots(newSlots);
    setIsDirty(true);
    onShowToast('College hours (8 AM - 4 PM) marked unavailable', 'info');
  };

  // Clear current week
  const handleClearWeek = () => {
    if (confirm('Are you sure you want to clear all marked slots for this week?')) {
      const newSlots = { ...slots };
      weekDays.forEach((d) => {
        TIME_SLOTS.forEach((ts) => {
          delete newSlots[`${d.date}_${ts.id}`];
        });
      });
      setSlots(newSlots);
      setIsDirty(true);
      onShowToast('Cleared all slots for current week', 'info');
    }
  };

  // Save availability
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await studentService.saveWeeklyAvailability(currentMondayStr, slots);
      setIsDirty(false);
      onShowToast(res.message, 'success');
      if (onAvailabilitySaved) onAvailabilitySaved();
    } catch {
      onShowToast('Failed to save availability', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Execute copy availability
  const handleExecuteCopy = async () => {
    setCopying(true);
    try {
      if (copyTargetOption === 'from_prev') {
        const prevMondayStr = toISODateString(addWeeks(currentMonday, -1));
        const updated = await studentService.copyAvailability(prevMondayStr, currentMondayStr);
        setSlots({ ...updated.slots });
        setIsDirty(false);
        onShowToast('Successfully copied schedule from previous week!', 'success');
      } else {
        const nextMondayStr = toISODateString(addWeeks(currentMonday, 1));
        await studentService.saveWeeklyAvailability(currentMondayStr, slots);
        await studentService.copyAvailability(currentMondayStr, nextMondayStr);
        setIsDirty(false);
        onShowToast('Successfully saved and copied schedule to next week!', 'success');
      }
      setIsCopyModalOpen(false);
      if (onAvailabilitySaved) onAvailabilitySaved();
    } catch {
      onShowToast('Could not copy availability schedule', 'error');
    } finally {
      setCopying(false);
    }
  };

  const availableCount = Object.entries(slots).filter(
    ([k, v]) => weekDays.some((d) => k.startsWith(d.date)) && v === 'available',
  ).length;

  const unavailableCount = Object.entries(slots).filter(
    ([k, v]) => weekDays.some((d) => k.startsWith(d.date)) && v === 'unavailable',
  ).length;

  const sundayDate = addWeeks(currentMonday, 1);
  sundayDate.setDate(sundayDate.getDate() - 1);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl bg-white p-5 border border-charcoal/10 shadow-sm">
        {/* Left: Week Navigator */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-xl border border-charcoal/15 bg-offwhite p-1">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-charcoal hover:bg-white hover:text-ink transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleCurrentWeek}
              className="px-3 text-xs font-bold text-ink hover:text-gold transition-colors"
            >
              Current Week
            </button>
            <button
              type="button"
              onClick={handleNextWeek}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-charcoal hover:bg-white hover:text-ink transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-ink sm:text-lg">
              {currentMonday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
              {sundayDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </h3>
            <div className="flex items-center gap-2 text-xs text-charcoal/70">
              <span className="flex items-center gap-1 font-semibold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                {availableCount} hrs available
              </span>
              <span>•</span>
              <span className="text-charcoal/60">{unavailableCount} hrs unavailable</span>
              {isDirty && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 animate-pulse">
                  Unsaved edits
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions (Copy Week & Save) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsCopyModalOpen(true)}
            className="text-xs font-bold"
          >
            <Copy className="h-4 w-4 text-gold" />
            <span>Copy Schedule</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            loading={saving}
            onClick={handleSave}
            disabled={!isDirty && !loading}
            className="text-xs font-bold min-w-[140px]"
          >
            <Save className="h-4 w-4" />
            <span>{isDirty ? 'Save Availability' : 'Schedule Saved'}</span>
          </Button>
        </div>
      </div>

      {/* Preset Toolbar & Selection Mode Bar */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Quick Selection Presets */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white p-3.5 border border-charcoal/10 shadow-xs">
          <span className="text-xs font-bold text-ink flex items-center gap-1.5 mr-1">
            <Sparkles className="h-4 w-4 text-gold" /> Quick Presets:
          </span>
          <button
            type="button"
            onClick={handlePresetWeekend}
            className="rounded-lg bg-gold/25 hover:bg-gold px-2.5 py-1 text-xs font-bold text-ink transition-colors"
          >
            Weekend Available
          </button>
          <button
            type="button"
            onClick={handlePresetWeekdayEvenings}
            className="rounded-lg bg-offwhite hover:bg-charcoal/10 px-2.5 py-1 text-xs font-semibold text-charcoal transition-colors border border-charcoal/15"
          >
            Weekday Evenings
          </button>
          <button
            type="button"
            onClick={handlePresetCollegeBusy}
            className="rounded-lg bg-offwhite hover:bg-charcoal/10 px-2.5 py-1 text-xs font-semibold text-charcoal transition-colors border border-charcoal/15"
          >
            College Hours Busy
          </button>
          <button
            type="button"
            onClick={handleClearWeek}
            className="rounded-lg p-1.5 text-charcoal/60 hover:text-red-600 transition-colors ml-auto"
            title="Clear all slots for this week"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Click Mode Selector & Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3.5 border border-charcoal/10 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ink">Mode:</span>
            <div className="flex items-center rounded-lg border border-charcoal/15 p-0.5 bg-offwhite text-xs">
              <button
                type="button"
                onClick={() => setActiveTool('toggle')}
                className={`rounded px-2 py-1 font-semibold transition-colors ${
                  activeTool === 'toggle' ? 'bg-ink text-white' : 'text-charcoal hover:text-ink'
                }`}
              >
                Auto-Cycle
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('available')}
                className={`flex items-center gap-1 rounded px-2 py-1 font-semibold transition-colors ${
                  activeTool === 'available' ? 'bg-gold text-ink' : 'text-charcoal hover:text-ink'
                }`}
              >
                <Check className="h-3 w-3" /> Mark Free
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('unavailable')}
                className={`flex items-center gap-1 rounded px-2 py-1 font-semibold transition-colors ${
                  activeTool === 'unavailable' ? 'bg-charcoal text-white' : 'text-charcoal hover:text-ink'
                }`}
              >
                <Minus className="h-3 w-3" /> Mark Busy
              </button>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-3 text-[11px] text-charcoal/70">
            <span className="flex items-center gap-1 font-semibold text-ink">
              <span className="h-3 w-3 rounded bg-gold border border-gold" /> Available
            </span>
            <span className="flex items-center gap-1 font-semibold text-ink">
              <span className="h-3 w-3 rounded bg-charcoal" /> Busy
            </span>
            <span className="flex items-center gap-1">
              <span className="h-3 w-3 rounded border border-dashed border-charcoal/40 bg-white" /> Open
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Day Selector Pill Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:hidden">
        <button
          type="button"
          onClick={() => setSelectedDayFilter(null)}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
            selectedDayFilter === null
              ? 'bg-ink text-white'
              : 'bg-white text-charcoal border border-charcoal/15'
          }`}
        >
          All 7 Days
        </button>
        {weekDays.map((d) => (
          <button
            key={d.date}
            type="button"
            onClick={() => setSelectedDayFilter(d.date)}
            className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              selectedDayFilter === d.date
                ? 'bg-gold text-ink font-bold'
                : 'bg-white text-charcoal border border-charcoal/15'
            }`}
          >
            {d.dayShort} ({new Date(d.date + 'T00:00:00').getDate()})
          </button>
        ))}
      </div>

      {/* Instructions / Notice Banner */}
      <div className="flex items-start gap-3 rounded-xl bg-gold/10 p-3.5 border border-gold/30 text-xs text-ink">
        <Info className="h-4 w-4 text-gold shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Independent Day Management:</p>
          <p className="text-charcoal/80">
            Each date is managed independently. You can update any single date (e.g. Saturday or Monday) without modifying any other day in your schedule. Changes remain local until you click "Save Availability".
          </p>
        </div>
      </div>

      {/* Core Time Slot Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-charcoal/10">
          <div className="flex items-center gap-3 text-sm font-semibold text-charcoal">
            <Loader2 className="h-5 w-5 animate-spin text-gold" />
            <span>Loading weekly time-slots…</span>
          </div>
        </div>
      ) : (
        <TimeSlotGrid
          days={weekDays}
          timeSlots={TIME_SLOTS}
          slots={slots}
          onToggleSlot={handleToggleSlot}
          onSetDayAvailability={handleSetDayAvailability}
          selectedDayFilter={selectedDayFilter}
          activeToolMode={activeTool}
        />
      )}

      {/* Copy Availability Modal */}
      <Modal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        title="Copy Weekly Availability"
        description="Duplicate schedule patterns to save time across academic weeks."
        footer={
          <>
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsCopyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              loading={copying}
              onClick={handleExecuteCopy}
            >
              Confirm Copy
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="flex items-start gap-3 rounded-xl border border-charcoal/20 p-4 hover:border-gold cursor-pointer transition-colors">
            <input
              type="radio"
              name="copyOption"
              checked={copyTargetOption === 'from_prev'}
              onChange={() => setCopyTargetOption('from_prev')}
              className="mt-1 h-4 w-4 accent-gold"
            />
            <div>
              <p className="font-bold text-sm text-ink">Copy from Previous Week</p>
              <p className="text-xs text-charcoal/70 mt-0.5">
                Duplicate last week's exact availability slots onto this current week.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 rounded-xl border border-charcoal/20 p-4 hover:border-gold cursor-pointer transition-colors">
            <input
              type="radio"
              name="copyOption"
              checked={copyTargetOption === 'to_next'}
              onChange={() => setCopyTargetOption('to_next')}
              className="mt-1 h-4 w-4 accent-gold"
            />
            <div>
              <p className="font-bold text-sm text-ink">Copy Current Week to Next Week</p>
              <p className="text-xs text-charcoal/70 mt-0.5">
                Save current changes and duplicate this week's slots into next week's schedule.
              </p>
            </div>
          </label>
        </div>
      </Modal>
    </div>
  );
}
