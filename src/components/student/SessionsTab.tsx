import { useState } from 'react';
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  MapPin,
  Sparkles,
  Users,
  Video,
} from 'lucide-react';
import type { StudentSession } from '../../types/student';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface SessionsTabProps {
  sessions: StudentSession[];
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateTab: (tab: any) => void;
}

export function SessionsTab({ sessions, onShowToast, onNavigateTab }: SessionsTabProps) {
  const [modeFilter, setModeFilter] = useState<'All' | 'Online' | 'Offline'>('All');

  const filteredSessions = sessions.filter((s) => {
    if (modeFilter === 'All') return true;
    return s.mode === modeFilter;
  });

  const handleCopyLink = (link: string, title: string) => {
    try {
      navigator.clipboard.writeText(link);
      onShowToast(`Copied meeting link for "${title}"!`, 'success');
    } catch {
      onShowToast('Could not copy link to clipboard', 'error');
    }
  };

  const handleDownloadCalendar = (session: StudentSession) => {
    // Generate simple .ics calendar file download
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Maatram Foundation//Maatram Sync//EN
BEGIN:VEVENT
SUMMARY:${session.sessionTitle}
DESCRIPTION:${session.preparationNotes || 'Maatram Scholar Session'}
LOCATION:${session.locationOrLink}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${session.sessionTitle.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onShowToast(`Downloaded calendar invite for "${session.sessionTitle}"`, 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 border border-charcoal/10 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-ink sm:text-2xl">Confirmed Upcoming Sessions</h2>
          <p className="mt-1 text-xs text-charcoal/70 sm:text-sm">
            Interactive sessions, workshops, and 1-on-1 mentor appointments scheduled with you.
          </p>
        </div>

        {/* Mode Filter Pills */}
        <div className="flex items-center rounded-xl bg-offwhite p-1 border border-charcoal/15 shrink-0 self-start md:self-auto">
          {(['All', 'Online', 'Offline'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setModeFilter(mode)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                modeFilter === mode
                  ? 'bg-ink text-white shadow-xs'
                  : 'text-charcoal hover:text-ink'
              }`}
            >
              {mode === 'All' ? 'All Modes' : mode === 'Online' ? 'Online' : 'In-Person'}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <div className="rounded-2xl border border-charcoal/10 bg-white p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-charcoal/30" />
          <h3 className="mt-4 text-base font-bold text-ink">No sessions scheduled</h3>
          <p className="mt-1 text-xs text-charcoal/60">
            {modeFilter !== 'All'
              ? `You currently have no ${modeFilter.toLowerCase()} sessions scheduled.`
              : 'Accept event invitations or keep your weekly availability updated to be matched with upcoming sessions.'}
          </p>
          <div className="mt-5">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigateTab('invitations')}
              className="text-xs font-bold"
            >
              Browse Invitations
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {filteredSessions.map((session) => {
            const isOnline = session.mode === 'Online';

            return (
              <Card
                key={session.id}
                className="overflow-hidden border-charcoal/15 shadow-sm hover:border-gold/60 transition-all"
              >
                <CardContent className="p-5 sm:p-6 space-y-4">
                  {/* Top line: Category, Status, Mode */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-gold/25 px-2.5 py-0.5 text-xs font-bold text-ink">
                        {session.category}
                      </span>
                      <Badge variant="success" dot>
                        {session.status}
                      </Badge>
                    </div>

                    <Badge variant={isOnline ? 'gold' : 'neutral'}>
                      {isOnline ? (
                        <span className="flex items-center gap-1.5">
                          <Video className="h-3.5 w-3.5 text-gold" />
                          <span>Online • {session.meetingPlatform || 'Google Meet'}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-charcoal" />
                          <span>In-Person Campus Session</span>
                        </span>
                      )}
                    </Badge>
                  </div>

                  {/* Title & Host */}
                  <div>
                    <h3 className="text-lg font-bold text-ink sm:text-xl">
                      {session.sessionTitle}
                    </h3>
                    <p className="mt-1 flex items-center gap-2 text-xs text-charcoal font-medium">
                      <Users className="h-4 w-4 text-gold shrink-0" />
                      <span>Led by: <strong className="text-ink">{session.mentorOrHost}</strong></span>
                      {session.mentorRole && (
                        <span className="text-charcoal/60 hidden sm:inline">• {session.mentorRole}</span>
                      )}
                    </p>
                  </div>

                  {/* Date, Time, Location Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 rounded-xl bg-offwhite/75 p-3.5 border border-charcoal/10 text-xs text-charcoal">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gold shrink-0" />
                      <div>
                        <span className="block text-[10px] text-charcoal/50 uppercase font-semibold">Date</span>
                        <span className="font-bold text-ink">{session.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gold shrink-0" />
                      <div>
                        <span className="block text-[10px] text-charcoal/50 uppercase font-semibold">Time</span>
                        <span className="font-bold text-ink">{session.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
                      {isOnline ? (
                        <Video className="h-4 w-4 text-gold shrink-0" />
                      ) : (
                        <MapPin className="h-4 w-4 text-gold shrink-0" />
                      )}
                      <div className="min-w-0">
                        <span className="block text-[10px] text-charcoal/50 uppercase font-semibold">
                          {isOnline ? 'Access Link' : 'Venue'}
                        </span>
                        <span className="font-mono text-xs font-semibold text-ink truncate block">
                          {session.locationOrLink}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Prep Notes */}
                  {session.preparationNotes && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-charcoal/15 bg-white p-3.5 text-xs text-charcoal/80">
                      <Sparkles className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-ink font-semibold">Preparation & Guidelines: </strong>
                        <span>{session.preparationNotes}</span>
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-charcoal/10">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownloadCalendar(session)}
                        className="text-xs font-semibold"
                      >
                        <CalendarCheck className="h-3.5 w-3.5 text-gold" />
                        <span>Add to Calendar (.ics)</span>
                      </Button>

                      {isOnline && (
                        <button
                          type="button"
                          onClick={() => handleCopyLink(session.locationOrLink, session.sessionTitle)}
                          className="flex items-center gap-1 text-xs text-charcoal hover:text-ink font-semibold px-2 py-1 rounded transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5 text-charcoal/60" />
                          <span>Copy Link</span>
                        </button>
                      )}
                    </div>

                    {isOnline ? (
                      <a
                        href={session.locationOrLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-gold px-5 text-xs font-bold text-ink hover:bg-[#e4ad12] shadow-sm transition-all"
                      >
                        <span>Join Meeting</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal/80 bg-offwhite px-3 py-2 rounded-lg border border-charcoal/15">
                        <MapPin className="h-4 w-4 text-gold" />
                        <span>Physical Attendance Required</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
