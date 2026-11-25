import {
  ArrowRight,
  Calendar,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';
import type {
  AvailabilitySummary,
  StudentNotification,
  StudentSession,
  WeeklyAvailability,
} from '../../types/student';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import type { StudentNavTab } from './Sidebar';

interface OverviewTabProps {
  summary: AvailabilitySummary;
  weeklyAvailability: WeeklyAvailability | null;
  sessions: StudentSession[];
  notifications: StudentNotification[];
  onNavigateTab: (tab: StudentNavTab) => void;
}

export function OverviewTab({
  summary,
  weeklyAvailability,
  sessions,
  notifications,
  onNavigateTab,
}: OverviewTabProps) {
  const nextSession = sessions.find((s) => s.status === 'Confirmed') || sessions[0];

  // Days of current week for the visual strip
  const days = [
    { label: 'Mon', full: 'Monday', date: 'Nov 16', keyDate: '2026-11-16' },
    { label: 'Tue', full: 'Tuesday', date: 'Nov 17', keyDate: '2026-11-17' },
    { label: 'Wed', full: 'Wednesday', date: 'Nov 18', keyDate: '2026-11-18' },
    { label: 'Thu', full: 'Thursday', date: 'Nov 19', keyDate: '2026-11-19', isToday: true },
    { label: 'Fri', full: 'Friday', date: 'Nov 20', keyDate: '2026-11-20' },
    { label: 'Sat', full: 'Saturday', date: 'Nov 21', keyDate: '2026-11-21', isWeekend: true },
    { label: 'Sun', full: 'Sunday', date: 'Nov 22', keyDate: '2026-11-22', isWeekend: true },
  ];

  const getDayStatus = (dateKey: string) => {
    if (!weeklyAvailability?.slots) return { available: 0, unavailable: 0 };
    let available = 0;
    let unavailable = 0;
    Object.entries(weeklyAvailability.slots).forEach(([k, status]) => {
      if (k.startsWith(dateKey)) {
        if (status === 'available') available++;
        if (status === 'unavailable') unavailable++;
      }
    });
    return { available, unavailable };
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Prominent Update Availability Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-ink p-6 sm:p-8 text-white shadow-xl ring-1 ring-white/10">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold ring-1 ring-gold/40">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Maatram Sync • Week of Nov 16 – 22</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Your Time. Your Opportunities.
            </h2>
            <p className="text-sm leading-relaxed text-white/75 sm:text-base">
              Keep your availability current. The Maatram team and corporate mentors schedule placement workshops, mock interviews, and 1-on-1 sessions based on when you are free.
            </p>
          </div>
          <div className="shrink-0 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigateTab('availability')}
              className="w-full sm:w-auto px-6 shadow-lg shadow-gold/20 flex items-center justify-center gap-2.5 text-base font-bold"
            >
              <CalendarCheck2 className="h-5 w-5 text-ink" />
              <span>Update Availability</span>
              <ArrowRight className="h-4 w-4 text-ink" />
            </Button>
          </div>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* 1. Availability Status */}
        <Card
          variant="interactive"
          onClick={() => onNavigateTab('availability')}
          className="group hover:border-gold transition-all"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                Availability Status
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-ink group-hover:bg-gold transition-colors">
                <CalendarCheck2 className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink">
                  {summary.availableHours > 0 ? `${summary.availableHours}h Free` : 'Not Set'}
                </span>
                <Badge variant={summary.availableHours > 0 ? 'success' : 'warning'} size="sm" dot>
                  {summary.status}
                </Badge>
              </div>
              <p className="mt-1.5 text-xs text-charcoal/70">
                {summary.totalSlotsMarked} total slots defined for this week
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-ink group-hover:text-gold transition-colors">
              <span>Manage schedule</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>

        {/* 2. Confirmed Sessions */}
        <Card
          variant="interactive"
          onClick={() => onNavigateTab('sessions')}
          className="group hover:border-gold transition-all"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                Confirmed Sessions
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 group-hover:bg-emerald-200 transition-colors">
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink">
                  {summary.confirmedSessionsCount}
                </span>
                <Badge variant="success" size="sm">
                  Scheduled
                </Badge>
              </div>
              <p className="mt-1.5 text-xs text-charcoal/70">
                Next: {nextSession ? nextSession.date.split(',')[0] : 'None'}
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-ink group-hover:text-gold transition-colors">
              <span>View upcoming sessions</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>

        {/* 3. Availability Coverage */}
        <Card
          variant="interactive"
          onClick={() => onNavigateTab('availability')}
          className="group hover:border-gold transition-all sm:col-span-2 lg:col-span-1"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                Weekly Marked Hours
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-ink group-hover:bg-gold transition-colors">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink">
                  {summary.availableHours + summary.unavailableHours}h
                </span>
                <Badge variant="gold" size="sm">
                  Weekly Plan
                </Badge>
              </div>
              <p className="mt-1.5 text-xs text-charcoal/70">
                {summary.availableHours}h available • {summary.unavailableHours}h busy
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-ink group-hover:text-gold transition-colors">
              <span>Update time slots</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Availability Overview Strip */}
      <Card>
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gold" />
              <span>Weekly Availability Overview</span>
            </div>
          }
          subtitle="Quick summary of your marked hours for the current week (Nov 16 – Nov 22, 2026)"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('availability')}
              className="text-xs"
            >
              Edit Grid
            </Button>
          }
        />
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
            {days.map((day) => {
              const { available, unavailable } = getDayStatus(day.keyDate);
              const total = available + unavailable;

              return (
                <div
                  key={day.keyDate}
                  onClick={() => onNavigateTab('availability')}
                  className={`group flex flex-col justify-between rounded-xl p-3.5 border transition-all cursor-pointer ${
                    day.isToday
                      ? 'border-ink bg-white shadow-sm ring-1 ring-ink'
                      : day.isWeekend
                        ? 'border-gold/30 bg-gold/5 hover:border-gold hover:bg-gold/10'
                        : 'border-charcoal/10 bg-offwhite/50 hover:border-charcoal/25 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink">{day.label}</span>
                    {day.isToday ? (
                      <span className="rounded bg-ink px-1.5 py-0.5 text-[9px] font-bold text-white">
                        Today
                      </span>
                    ) : day.isWeekend ? (
                      <span className="rounded bg-gold/30 px-1 text-[9px] font-bold text-ink">
                        W/E
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-1 text-xs text-charcoal/60">{day.date}</p>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-700 font-semibold">{available}h free</span>
                      <span className="text-charcoal/50">{unavailable}h busy</span>
                    </div>

                    {/* Visual Bar */}
                    <div className="h-2 w-full rounded-full bg-charcoal/10 overflow-hidden flex">
                      <div
                        className="h-full bg-gold transition-all"
                        style={{ width: `${total ? (available / (total || 1)) * 100 : 0}%` }}
                        title={`${available} hours available`}
                      />
                      <div
                        className="h-full bg-charcoal/40 transition-all"
                        style={{ width: `${total ? (unavailable / (total || 1)) * 100 : 0}%` }}
                        title={`${unavailable} hours unavailable`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout: Upcoming Session Preview & Recent Notifications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Next Session Preview */}
        <Card>
          <CardHeader
            title="Next Upcoming Session"
            subtitle="Your next confirmed session with mentors"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('sessions')}
                className="text-xs"
              >
                All Sessions ({sessions.length})
              </Button>
            }
          />
          <CardContent>
            {nextSession ? (
              <div className="rounded-xl border border-charcoal/10 bg-offwhite/50 p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-block rounded bg-gold/20 px-2 py-0.5 text-xs font-bold text-ink">
                      {nextSession.category}
                    </span>
                    <h4 className="mt-2 text-base font-bold text-ink sm:text-lg">
                      {nextSession.sessionTitle}
                    </h4>
                  </div>
                  <Badge variant={nextSession.mode === 'Online' ? 'gold' : 'neutral'}>
                    {nextSession.mode === 'Online' ? (
                      <span className="flex items-center gap-1">
                        <Video className="h-3 w-3" /> Online
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> In-Person
                      </span>
                    )}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-charcoal">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gold shrink-0" />
                    <span>{nextSession.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gold shrink-0" />
                    <span>{nextSession.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gold shrink-0" />
                    <span>Host: {nextSession.mentorOrHost}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gold shrink-0" />
                    <span className="truncate">{nextSession.locationOrLink}</span>
                  </div>
                </div>

                {nextSession.preparationNotes && (
                  <div className="rounded-lg bg-white p-3 border border-charcoal/10 text-xs text-charcoal/80">
                    <strong className="text-ink font-semibold">Prep note: </strong>
                    {nextSession.preparationNotes}
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                  {nextSession.mode === 'Online' && (
                    <a
                      href={nextSession.locationOrLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-gold px-4 text-xs font-bold text-ink hover:bg-[#e4ad12] transition-colors"
                    >
                      <span>Join Meeting Link</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigateTab('sessions')}
                  >
                    View Agenda
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-charcoal/60">No confirmed sessions right now.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader
            title="Recent Notifications"
            subtitle="Real-time alerts from coordinators and instructors"
            action={
              <span className="text-xs text-charcoal/60 font-medium">
                {notifications.filter((n) => !n.read).length} unread
              </span>
            }
          />
          <CardContent className="space-y-3">
            {notifications.slice(0, 4).map((notif) => (
              <div
                key={notif.id}
                onClick={() => notif.targetTab && onNavigateTab(notif.targetTab)}
                className={`flex items-start gap-3 rounded-xl p-3 border transition-all cursor-pointer hover:border-gold/60 ${
                  !notif.read ? 'bg-gold/5 border-gold/30' : 'bg-white border-charcoal/10'
                }`}
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-charcoal/5 text-ink mt-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="text-xs font-bold text-ink truncate">{notif.title}</h5>
                    <span className="text-[10px] text-charcoal/50 shrink-0">{notif.timestamp}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-charcoal/75 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
