import { Check, Minus, Plus, Sparkles } from 'lucide-react';
import type { SlotStatus, TimeSlotConfig } from '../../types/student';

interface DayItem {
  date: string; // YYYY-MM-DD
  dayName: string;
  dayShort: string;
  isWeekend: boolean;
  isToday: boolean;
}

interface TimeSlotGridProps {
  days: DayItem[];
  timeSlots: TimeSlotConfig[];
  slots: Record<string, SlotStatus>;
  onToggleSlot: (date: string, slotId: string) => void;
  onSetDayAvailability: (date: string, status: SlotStatus) => void;
  selectedDayFilter?: string | null; // null for all 7 days, or a date string
  activeToolMode: 'toggle' | 'available' | 'unavailable' | 'unselected';
}

export function TimeSlotGrid({
  days,
  timeSlots,
  slots,
  onToggleSlot,
  onSetDayAvailability,
  selectedDayFilter,
  activeToolMode,
}: TimeSlotGridProps) {
  const visibleDays = selectedDayFilter
    ? days.filter((d) => d.date === selectedDayFilter)
    : days;

  const getSlotStatus = (date: string, slotId: string): SlotStatus => {
    return slots[`${date}_${slotId}`] || 'unselected';
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-charcoal/15 bg-white shadow-sm">
      <div className="min-w-[700px]">
        {/* Table Header: Days */}
        <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b border-charcoal/15 bg-offwhite/75 text-center text-xs select-none">
          {/* Time Column Header */}
          <div className="flex items-center justify-center p-3 font-bold text-charcoal/70 border-r border-charcoal/10">
            Time Slot
          </div>

          {/* 7 Day Headers */}
          {days.map((day) => {
            const isHighlighted = selectedDayFilter === day.date;
            const daySlots = timeSlots.map((ts) => getSlotStatus(day.date, ts.id));
            const availableCount = daySlots.filter((s) => s === 'available').length;

            return (
              <div
                key={day.date}
                className={`relative flex flex-col justify-between p-3 border-r border-charcoal/10 last:border-r-0 transition-colors ${
                  day.isToday
                    ? 'bg-ink/5 font-semibold ring-1 ring-inset ring-ink/20'
                    : day.isWeekend
                      ? 'bg-gold/10'
                      : ''
                } ${isHighlighted ? 'ring-2 ring-gold' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="font-extrabold text-ink text-sm sm:text-base">
                      {day.dayShort}
                    </span>
                    {day.isToday && (
                      <span className="rounded bg-ink px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                        Today
                      </span>
                    )}
                    {day.isWeekend && !day.isToday && (
                      <span className="rounded bg-gold/40 px-1 py-0.5 text-[9px] font-bold text-ink uppercase">
                        W/E
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-charcoal/65 mt-0.5">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-[10px] text-emerald-800 font-semibold mt-1">
                    {availableCount > 0 ? `${availableCount} hrs free` : 'No slots set'}
                  </p>
                </div>

                {/* Day-level Quick Action Buttons (Isolated strictly to this day!) */}
                <div className="mt-2.5 flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => onSetDayAvailability(day.date, 'available')}
                    title={`Mark all ${day.dayName} available`}
                    className="flex h-6 items-center gap-1 rounded bg-gold/30 hover:bg-gold px-1.5 text-[10px] font-bold text-ink transition-colors"
                  >
                    <Check className="h-3 w-3" /> All Free
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetDayAvailability(day.date, 'unavailable')}
                    title={`Mark all ${day.dayName} unavailable`}
                    className="flex h-6 items-center rounded bg-charcoal/10 hover:bg-charcoal hover:text-white px-1 text-[10px] font-bold text-charcoal transition-colors"
                  >
                    <Minus className="h-3 w-3" /> Busy
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Slot Rows */}
        <div className="divide-y divide-charcoal/10 select-none">
          {timeSlots.map((timeSlot) => (
            <div
              key={timeSlot.id}
              className="grid grid-cols-[100px_repeat(7,1fr)] hover:bg-offwhite/40 transition-colors"
            >
              {/* Row Time Label */}
              <div className="flex flex-col items-center justify-center border-r border-charcoal/10 bg-offwhite/30 px-2 py-2 text-center text-xs font-semibold text-charcoal">
                <span>{timeSlot.id}</span>
                <span className="text-[9px] uppercase tracking-wider text-charcoal/50">
                  {timeSlot.period}
                </span>
              </div>

              {/* Slots for each day */}
              {days.map((day) => {
                const status = getSlotStatus(day.date, timeSlot.id);
                const isWeekend = day.isWeekend;

                let slotStyle = 'bg-white text-charcoal/50 hover:bg-gold/10 hover:border-charcoal/40 border-dashed border-charcoal/20';
                let label = 'Open';
                let icon = <Plus className="h-3.5 w-3.5 text-charcoal/30" />;

                if (status === 'available') {
                  slotStyle = 'bg-gold text-ink font-bold border-gold shadow-sm hover:bg-[#e4ad12]';
                  label = 'Available';
                  icon = <Check className="h-4 w-4 text-ink stroke-[2.5]" />;
                } else if (status === 'unavailable') {
                  slotStyle = 'bg-charcoal text-white font-medium border-charcoal hover:bg-ink';
                  label = 'Busy';
                  icon = <Minus className="h-3.5 w-3.5 text-white/80" />;
                }

                return (
                  <div
                    key={`${day.date}_${timeSlot.id}`}
                    className={`p-1.5 border-r border-charcoal/10 last:border-r-0 ${
                      isWeekend && status === 'unselected' ? 'bg-gold/[0.03]' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onToggleSlot(day.date, timeSlot.id)}
                      className={`group flex h-11 w-full items-center justify-center gap-1.5 rounded-lg border text-xs transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${slotStyle}`}
                      title={`${day.dayName} ${timeSlot.label}: ${label} (Click to toggle)`}
                      aria-label={`${day.dayName} ${timeSlot.label}: ${label}`}
                    >
                      {icon}
                      <span className="text-[11px]">{label}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
