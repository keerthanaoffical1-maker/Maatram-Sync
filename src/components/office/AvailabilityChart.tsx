import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Info,
  Sliders,
  Sparkles,
  Trophy,
} from 'lucide-react';
import type { TimeSlotAnalysisResult } from '../../types/office';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface AvailabilityChartProps {
  slots: TimeSlotAnalysisResult[];
  minThreshold: number;
  onSelectSlot?: (slot: TimeSlotAnalysisResult) => void;
  onPlanEventWithSlot?: (slot: { date: string; timeSlot: string; slotId: string }) => void;
  selectedSlot?: TimeSlotAnalysisResult | null;
}

export function AvailabilityChart({
  slots,
  minThreshold,
  onSelectSlot,
  onPlanEventWithSlot,
  selectedSlot,
}: AvailabilityChartProps) {
  const [viewMode, setViewMode] = useState<'chronological' | 'ranked'>('chronological');
  const [filterDate, setFilterDate] = useState<string>('all');
  const [hoveredSlot, setHoveredSlot] = useState<TimeSlotAnalysisResult | null>(null);

  // Distinct dates in the slots
  const distinctDates = useMemo(() => {
    return Array.from(new Set(slots.map((s) => s.date)));
  }, [slots]);

  // Filtered & sorted slots for the chart
  const displayedSlots = useMemo(() => {
    let list = [...slots];
    if (filterDate !== 'all') {
      list = list.filter((s) => s.date === filterDate);
    }
    if (viewMode === 'ranked') {
      list.sort((a, b) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        return b.availableCount - a.availableCount;
      });
    } else {
      list.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.startTime.localeCompare(b.startTime);
      });
    }
    return list;
  }, [slots, filterDate, viewMode]);

  // Color helper according to Maatram turnout palette
  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-gold hover:bg-[#E5B020] text-ink';
    if (percentage >= 65) return 'bg-[#F9CE54] hover:bg-[#EFC245] text-ink';
    if (percentage >= 50) return 'bg-[#FBE49A] hover:bg-[#F2D785] text-ink';
    return 'bg-charcoal/20 hover:bg-charcoal/30 text-charcoal';
  };

  const activeSlot = hoveredSlot || selectedSlot;

  if (slots.length === 0) {
    return null;
  }

  return (
    <Card className="border border-charcoal/15 shadow-sm overflow-hidden">
      <CardHeader
        title={
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-gold" />
              <span>Availability Percentage Distribution</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Date Filter */}
              {distinctDates.length > 1 && (
                <select
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="rounded-lg border border-charcoal/20 bg-white px-2 py-1 text-xs text-ink focus:border-ink focus:outline-none"
                >
                  <option value="all">All Dates ({distinctDates.length})</option>
                  {distinctDates.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              )}

              {/* View Mode Toggle */}
              <div className="flex rounded-lg border border-charcoal/20 bg-charcoal/[0.03] p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('chronological')}
                  className={`rounded px-2 py-1 font-medium transition-colors ${
                    viewMode === 'chronological'
                      ? 'bg-ink text-white font-bold shadow-xs'
                      : 'text-charcoal hover:text-ink'
                  }`}
                >
                  Timeline
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('ranked')}
                  className={`rounded px-2 py-1 font-medium transition-colors ${
                    viewMode === 'ranked'
                      ? 'bg-ink text-white font-bold shadow-xs'
                      : 'text-charcoal hover:text-ink'
                  }`}
                >
                  Ranked
                </button>
              </div>
            </div>
          </div>
        }
        subtitle="Visual representation of student availability percentage across candidate event slots"
      />

      <CardContent className="space-y-4 pt-2">
        {/* Main Chart Container */}
        <div className="relative pt-6 pb-2">
          {/* Threshold Reference Line */}
          <div
            className="absolute left-8 right-2 border-b-2 border-dashed border-rose-500 z-10 pointer-events-none transition-all duration-300"
            style={{ bottom: `calc(${minThreshold}% * 0.72 + 32px)` }}
          >
            <span className="absolute -top-5 right-0 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
              Min Threshold: {minThreshold}%
            </span>
          </div>

          {/* Chart Grid & Bars */}
          <div className="flex items-end gap-1.5 sm:gap-2 h-64 pl-8 pr-2 overflow-x-auto pb-8 border-b border-charcoal/15">
            {/* Y-Axis scale indicators */}
            <div className="absolute left-1 top-6 bottom-10 flex flex-col justify-between text-[10px] font-mono text-charcoal/40 pointer-events-none">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            {/* Bars */}
            {displayedSlots.map((slot) => {
              const isSelected =
                selectedSlot?.date === slot.date && selectedSlot?.slotId === slot.slotId;
              const isHovered =
                hoveredSlot?.date === slot.date && hoveredSlot?.slotId === slot.slotId;
              const meetsThreshold = slot.percentage >= minThreshold;

              return (
                <div
                  key={`${slot.date}_${slot.slotId}`}
                  className="flex-1 min-w-[38px] max-w-[64px] flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  onClick={() => onSelectSlot && onSelectSlot(slot)}
                  onMouseEnter={() => setHoveredSlot(slot)}
                  onMouseLeave={() => setHoveredSlot(null)}
                >
                  {/* Percentage label above bar */}
                  <span
                    className={`text-[10px] font-bold mb-1 transition-all font-mono ${
                      isSelected || isHovered
                        ? 'text-ink font-extrabold scale-110'
                        : meetsThreshold
                          ? 'text-ink'
                          : 'text-charcoal/50'
                    }`}
                  >
                    {slot.percentage}%
                  </span>

                  {/* Vertical Bar */}
                  <div className="w-full bg-charcoal/5 rounded-t-lg h-full flex flex-col justify-end overflow-hidden">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 ${getBarColor(
                        slot.percentage,
                      )} ${
                        isSelected
                          ? 'ring-2 ring-ink ring-offset-1 shadow-md'
                          : isHovered
                            ? 'ring-1 ring-gold/80'
                            : ''
                      }`}
                      style={{ height: `${Math.max(slot.percentage, 4)}%` }}
                    />
                  </div>

                  {/* X-Axis Slot Label */}
                  <div className="absolute -bottom-7 flex flex-col items-center text-center pointer-events-none">
                    <span className="text-[10px] font-mono font-semibold text-charcoal whitespace-nowrap">
                      {slot.slotId}
                    </span>
                    <span className="text-[9px] text-charcoal/50 whitespace-nowrap">
                      {slot.dayShort}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active / Inspected Slot Details Banner */}
        {activeSlot ? (
          <div className="rounded-xl border border-charcoal/15 bg-charcoal/[0.02] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-ink text-sm">
                  {activeSlot.dayName}, {activeSlot.date}
                </span>
                <span className="font-mono text-charcoal/80 font-semibold">
                  ({activeSlot.slotLabel})
                </span>
                <Badge
                  variant={activeSlot.percentage >= 80 ? 'success' : activeSlot.percentage >= 60 ? 'gold' : 'neutral'}
                  size="sm"
                >
                  {activeSlot.percentage}% Available
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-charcoal/70 text-[11px]">
                <span>
                  Confirmed Available: <strong className="text-ink">{activeSlot.availableCount}</strong> / {activeSlot.totalEligible}
                </span>
                <span>•</span>
                <span>
                  Unavailable: <strong className="text-rose-700">{activeSlot.unavailableCount}</strong>
                </span>
                <span>•</span>
                <span>
                  Unknown / Missing: <strong className="text-charcoal/60">{activeSlot.unknownCount}</strong>
                </span>
                <span>•</span>
                <span>
                  Audience Coverage: <strong className="text-ink">{activeSlot.submissionCoveragePercentage}%</strong>
                </span>
              </div>
            </div>

            {onPlanEventWithSlot && (
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  onPlanEventWithSlot({
                    date: activeSlot.date,
                    timeSlot: activeSlot.slotLabel,
                    slotId: activeSlot.slotId,
                  })
                }
                className="shrink-0 font-bold text-xs"
              >
                Plan Event for this Slot
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-charcoal/60 pt-1">
            <span className="flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-charcoal/40" />
              Hover or click any bar to inspect specific turnout counts and schedule details.
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded bg-gold" /> Peak ($\ge 80\%$)
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded bg-[#F9CE54]" /> 65–79%
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded bg-[#FBE49A]" /> 50–64%
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded bg-charcoal/20" /> &lt;50%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
