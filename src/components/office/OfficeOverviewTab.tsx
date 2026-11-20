import {
  ArrowRight,
  BarChart3,
  CalendarCheck2,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  ExternalLink,
  Inbox,
  MailCheck,
  MapPin,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Video,
} from 'lucide-react';
import type { EventPlan, OfficeActivityLog, OfficeOverviewMetrics } from '../../types/office';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import type { OfficeNavTab } from './OfficeSidebar';

interface OfficeOverviewTabProps {
  metrics: OfficeOverviewMetrics;
  events: EventPlan[];
  activities: OfficeActivityLog[];
  onNavigateTab: (tab: OfficeNavTab) => void;
}

export function OfficeOverviewTab({
  metrics,
  events,
  activities,
  onNavigateTab,
}: OfficeOverviewTabProps) {
  const confirmedSessions = events.filter((e) => e.status !== 'Draft' && e.status !== 'Cancelled');

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Hero Banner: Quick Action & Insight */}
      <div className="relative overflow-hidden rounded-2xl bg-ink p-6 sm:p-8 text-white shadow-xl ring-1 ring-white/10">
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-3 py-1 text-xs font-bold text-gold ring-1 ring-gold/40">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Maatram Sync • Central Operations</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Optimize Event Timings with Synchronized Availability
            </h2>
            <p className="text-sm leading-relaxed text-white/75 sm:text-base">
              Identify maximum student schedule overlap across partner colleges, schedule high-impact workshops, and manage invitations effortlessly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onNavigateTab('analysis')}
              className="w-full sm:w-auto px-6 font-bold shadow-lg shadow-gold/20"
            >
              <BarChart3 className="h-5 w-5 text-ink" />
              <span>Analyze Availability</span>
              <ArrowRight className="h-4 w-4 text-ink" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onNavigateTab('events')}
              className="w-full sm:w-auto px-5 font-semibold"
            >
              <CalendarPlus className="h-4 w-4" />
              <span>Plan Event</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Total Registered Students */}
        <Card
          variant="interactive"
          onClick={() => onNavigateTab('students')}
          className="group hover:border-gold transition-all"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                Total Registered Students
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-ink group-hover:bg-gold transition-colors">
                <Users className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink">
                  {metrics.totalRegisteredStudents}
                </span>
                <Badge variant="gold" size="sm">
                  7 Colleges
                </Badge>
              </div>
              <p className="mt-1.5 text-xs text-charcoal/70">
                Scholars enrolled across 2nd, 3rd, and 4th years
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-ink group-hover:text-gold transition-colors">
              <span>View student directory</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>

        {/* 2. Active Students */}
        <Card
          variant="interactive"
          onClick={() => onNavigateTab('students')}
          className="group hover:border-gold transition-all"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                Active Students
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 group-hover:bg-emerald-200 transition-colors">
                <UserCheck className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink">
                  {metrics.activeStudents}
                </span>
                <Badge variant="success" size="sm" dot>
                  {Math.round((metrics.activeStudents / metrics.totalRegisteredStudents) * 100)}% Active
                </Badge>
              </div>
              <p className="mt-1.5 text-xs text-charcoal/70">
                Submitted availability for upcoming sessions
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-ink group-hover:text-gold transition-colors">
              <span>Inspect active roster</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>

        {/* 3. Upcoming Events */}
        <Card
          variant="interactive"
          onClick={() => onNavigateTab('events')}
          className="group hover:border-gold transition-all"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                Upcoming Events
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-ink group-hover:bg-gold transition-colors">
                <CalendarDays className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink">
                  {metrics.upcomingEvents}
                </span>
                <Badge variant="neutral" size="sm">
                  Active Drives
                </Badge>
              </div>
              <p className="mt-1.5 text-xs text-charcoal/70">
                Technical workshops & mock interviews planned
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-ink group-hover:text-gold transition-colors">
              <span>Manage events</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>

        {/* 4. Pending Invitations */}
        <Card
          variant="interactive"
          onClick={() => onNavigateTab('invitations')}
          className="group hover:border-gold transition-all"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                Pending Invitations
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800 group-hover:bg-amber-200 transition-colors">
                <Clock className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-ink">
                  {metrics.pendingInvitations}
                </span>
                <Badge variant="warning" size="sm">
                  Awaiting RSVP
                </Badge>
              </div>
              <p className="mt-1.5 text-xs text-charcoal/70">
                {metrics.overallRsvpRate}% overall RSVP compliance
              </p>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-ink group-hover:text-gold transition-colors">
              <span>Track responses</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Availability Overview & Peak Recommendation Spotlight */}
      <Card variant="gold-accent">
        <CardHeader
          title={
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-gold" />
              <span>Availability Overview & Optimal Timings</span>
            </div>
          }
          subtitle="Real-time overlap intelligence computed from submitted scholar weekly calendars"
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('analysis')}
              className="text-xs font-semibold"
            >
              Open Full Heatmap
            </Button>
          }
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Spotlight 1: Peak Weekend Overlap */}
            <div className="rounded-xl border border-charcoal/10 bg-offwhite/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink uppercase tracking-wide">
                  Prime Slot (Rank 1)
                </span>
                <span className="rounded bg-gold px-2 py-0.5 text-[10px] font-extrabold text-ink">
                  91% Overlap
                </span>
              </div>
              <p className="text-base font-extrabold text-ink">Sunday • 02:00 PM – 04:00 PM</p>
              <p className="text-xs text-charcoal/75 leading-relaxed">
                Highest cross-college availability. 59/65 scholars have confirmed zero conflicting tests or academic commitments.
              </p>
            </div>

            {/* Spotlight 2: Prime Saturday Window */}
            <div className="rounded-xl border border-charcoal/10 bg-offwhite/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink uppercase tracking-wide">
                  Alternative (Rank 2)
                </span>
                <span className="rounded bg-gold/40 px-2 py-0.5 text-[10px] font-extrabold text-ink">
                  78% Overlap
                </span>
              </div>
              <p className="text-base font-extrabold text-ink">Saturday • 02:00 PM – 04:00 PM</p>
              <p className="text-xs text-charcoal/75 leading-relaxed">
                Ideal for 1-on-1 mentor sessions and mock technical interviews. Strong attendance across tech cohorts.
              </p>
            </div>

            {/* Spotlight 3: Top Weekday Evening */}
            <div className="rounded-xl border border-charcoal/10 bg-offwhite/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink uppercase tracking-wide">
                  Weekday Evening
                </span>
                <span className="rounded bg-charcoal/15 px-2 py-0.5 text-[10px] font-bold text-charcoal">
                  62% Overlap
                </span>
              </div>
              <p className="text-base font-extrabold text-ink">Wednesday • 06:30 PM – 08:30 PM</p>
              <p className="text-xs text-charcoal/75 leading-relaxed">
                Post-college lecture window. Suitable for online webinars and microservices workshops.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Section: Upcoming Sessions & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Sessions Section */}
        <Card>
          <CardHeader
            title="Upcoming Scheduled Sessions"
            subtitle="Confirmed events and training drives"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('sessions')}
                className="text-xs"
              >
                View all ({confirmedSessions.length})
              </Button>
            }
          />
          <CardContent className="space-y-3.5">
            {confirmedSessions.slice(0, 3).map((session) => (
              <div
                key={session.id}
                className="rounded-xl border border-charcoal/10 bg-offwhite/50 p-4 space-y-3 hover:border-gold/60 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="rounded bg-gold/25 px-2 py-0.5 text-[10px] font-bold text-ink">
                      {session.category}
                    </span>
                    <h4 className="mt-1 text-sm font-bold text-ink sm:text-base">
                      {session.title}
                    </h4>
                  </div>
                  <Badge variant={session.status === 'Confirmed' ? 'success' : 'gold'} size="sm">
                    {session.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-charcoal">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-gold shrink-0" />
                    <span>{session.selectedDate} • {session.selectedTimeSlot}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {session.mode === 'Online' ? (
                      <Video className="h-3.5 w-3.5 text-gold shrink-0" />
                    ) : (
                      <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
                    )}
                    <span className="truncate">{session.locationOrLink}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-charcoal/10">
                  <span className="text-charcoal/70">
                    Host: <strong className="text-ink">{session.mentorOrHost}</strong>
                  </span>
                  <span className="font-semibold text-emerald-800">
                    {session.acceptedCount} confirmed scholars
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity Section */}
        <Card>
          <CardHeader
            title="Recent Operations Activity"
            subtitle="Audit log of coordination actions"
            action={
              <span className="text-xs text-charcoal/60 font-medium">
                Live Sync
              </span>
            }
          />
          <CardContent className="space-y-3">
            {activities.slice(0, 5).map((act) => (
              <div
                key={act.id}
                className="flex items-start gap-3 rounded-xl border border-charcoal/10 bg-white p-3 hover:border-gold/50 transition-colors"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-charcoal/5 text-ink mt-0.5">
                  <Sparkles className="h-3.5 w-3.5 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="text-xs font-bold text-ink truncate">{act.action}</h5>
                    <span className="text-[10px] text-charcoal/50 shrink-0">{act.timestamp}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-charcoal/75 leading-relaxed">{act.details}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
