import { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Edit2,
  ExternalLink,
  MapPin,
  Sparkles,
  Trash2,
  Users,
  Video,
  XCircle,
} from 'lucide-react';
import type { EventPlan } from '../../types/office';
import { officeService } from '../../services/office/officeService';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface SessionManagementTabProps {
  sessions: EventPlan[];
  onRefresh: () => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function SessionManagementTab({
  sessions,
  onRefresh,
  onShowToast,
}: SessionManagementTabProps) {
  const [editingSession, setEditingSession] = useState<EventPlan | null>(null);
  const [cancellingSession, setCancellingSession] = useState<EventPlan | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editMentor, setEditMentor] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const handleOpenEdit = (session: EventPlan) => {
    setEditingSession(session);
    setEditTitle(session.title);
    setEditLocation(session.locationOrLink);
    setEditDate(session.selectedDate);
    setEditTime(session.selectedTimeSlot);
    setEditMentor(session.mentorOrHost);
    setEditNotes(session.preparationNotes || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;

    setSavingEdit(true);
    try {
      await officeService.updateSession(editingSession.id, {
        title: editTitle.trim(),
        locationOrLink: editLocation.trim(),
        selectedDate: editDate.trim(),
        selectedTimeSlot: editTime.trim(),
        mentorOrHost: editMentor.trim(),
        preparationNotes: editNotes.trim(),
      });
      onShowToast(`Session "${editTitle}" updated successfully!`, 'success');
      setEditingSession(null);
      onRefresh();
    } catch {
      onShowToast('Could not save session changes', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancellingSession) return;

    setCancelling(true);
    try {
      await officeService.cancelSession(cancellingSession.id);
      onShowToast(`Cancelled session "${cancellingSession.title}".`, 'info');
      setCancellingSession(null);
      onRefresh();
    } catch {
      onShowToast('Could not cancel session', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleCopyLink = (link: string, title: string) => {
    try {
      navigator.clipboard.writeText(link);
      onShowToast(`Copied access link for "${title}"!`, 'success');
    } catch {
      onShowToast('Failed to copy link', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 border border-charcoal/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-ink sm:text-2xl">
            Confirmed Session Management
          </h2>
          <p className="mt-1 text-xs text-charcoal/70 sm:text-sm">
            Live directory of confirmed sessions. Office coordinators can edit logistics or cancel sessions as needed.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-gold/20 px-3.5 py-2 border border-gold/40 text-xs font-bold text-ink shrink-0">
          <CalendarDays className="h-4 w-4 text-gold shrink-0" />
          <span>{sessions.length} Scheduled Sessions</span>
        </div>
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-charcoal/10 bg-white p-12 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-charcoal/30" />
          <h3 className="mt-4 text-base font-bold text-ink">No sessions scheduled yet</h3>
          <p className="mt-1 text-xs text-charcoal/60">
            Create an event in Event Planning to schedule your first cohort session.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const isOnline = session.mode === 'Online';
            const isCancelled = session.status === 'Cancelled';
            const acceptedRate =
              session.invitedCount > 0
                ? Math.round((session.acceptedCount / session.invitedCount) * 100)
                : 0;

            return (
              <Card
                key={session.id}
                className={`overflow-hidden transition-all ${
                  isCancelled
                    ? 'border-charcoal/20 opacity-70 bg-offwhite/40'
                    : 'border-charcoal/15 shadow-sm hover:border-gold/60'
                }`}
              >
                <CardContent className="p-5 sm:p-6 space-y-4">
                  {/* Top Bar: Category, Status, Mode */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-gold/20 px-2.5 py-0.5 text-xs font-bold text-ink">
                        {session.category}
                      </span>
                      <Badge
                        variant={
                          isCancelled
                            ? 'charcoal'
                            : session.status === 'Confirmed'
                              ? 'success'
                              : 'gold'
                        }
                        dot={!isCancelled}
                      >
                        {session.status}
                      </Badge>
                    </div>

                    <Badge variant={isOnline ? 'gold' : 'neutral'}>
                      {isOnline ? (
                        <span className="flex items-center gap-1.5">
                          <Video className="h-3.5 w-3.5 text-gold" />
                          <span>Online Meeting</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-charcoal" />
                          <span>Campus Venue</span>
                        </span>
                      )}
                    </Badge>
                  </div>

                  {/* Title & Host */}
                  <div>
                    <h3 className="text-lg font-bold text-ink sm:text-xl">
                      {session.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-2 text-xs text-charcoal font-medium">
                      <Users className="h-4 w-4 text-gold shrink-0" />
                      <span>Led by: <strong className="text-ink">{session.mentorOrHost}</strong></span>
                      {session.mentorRole && (
                        <span className="text-charcoal/60 hidden sm:inline">• {session.mentorRole}</span>
                      )}
                    </p>
                  </div>

                  {/* Details Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-xl bg-offwhite/80 p-3.5 border border-charcoal/10 text-xs text-charcoal">
                    <div>
                      <span className="text-[10px] text-charcoal/50 uppercase font-bold block">
                        Confirmed Date
                      </span>
                      <span className="font-bold text-ink">{session.selectedDate}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-charcoal/50 uppercase font-bold block">
                        Time Slot
                      </span>
                      <span className="font-bold text-ink">{session.selectedTimeSlot}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-charcoal/50 uppercase font-bold block">
                        Target Institution(s)
                      </span>
                      <span className="font-medium text-ink truncate block">
                        {session.targetInstitutions.map((i) => i.split(',')[0]).join(', ') || 'All Colleges'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-charcoal/50 uppercase font-bold block">
                        Access Link / Venue
                      </span>
                      <span className="font-mono text-[11px] text-ink truncate block">
                        {session.locationOrLink}
                      </span>
                    </div>
                  </div>

                  {/* Quota & Responses Meter */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    <div className="rounded-lg border border-charcoal/10 bg-white p-2.5">
                      <span className="text-[10px] uppercase font-bold text-charcoal/60 block">
                        Invited Scholars
                      </span>
                      <span className="text-base font-extrabold text-ink">{session.invitedCount}</span>
                    </div>

                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                        Confirmed Attendees
                      </span>
                      <span className="text-base font-extrabold text-emerald-900">
                        {session.acceptedCount} ({acceptedRate}%)
                      </span>
                    </div>

                    <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-2.5">
                      <span className="text-[10px] uppercase font-bold text-amber-900 block">
                        Pending RSVPs
                      </span>
                      <span className="text-base font-extrabold text-amber-950">
                        {session.pendingCount}
                      </span>
                    </div>
                  </div>

                  {/* Preparation Guidelines */}
                  {session.preparationNotes && (
                    <div className="rounded-lg border border-charcoal/15 bg-white p-3 text-xs text-charcoal/80">
                      <strong className="text-ink font-semibold">Prep Guidelines: </strong>
                      {session.preparationNotes}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-charcoal/10">
                    <div className="flex items-center gap-2">
                      {!isCancelled && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenEdit(session)}
                          className="text-xs font-semibold"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Edit Details</span>
                        </Button>
                      )}

                      {!isCancelled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCancellingSession(session)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Cancel Session</span>
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isOnline && (
                        <button
                          type="button"
                          onClick={() => handleCopyLink(session.locationOrLink, session.title)}
                          className="flex items-center gap-1 text-xs text-charcoal hover:text-ink font-semibold px-2 py-1 rounded transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5 text-charcoal/60" />
                          <span>Copy Meeting Link</span>
                        </button>
                      )}

                      {isOnline ? (
                        <a
                          href={session.locationOrLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-gold px-4 text-xs font-bold text-ink hover:bg-[#e4ad12] shadow-xs"
                        >
                          <span>Open Meeting</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-xs font-bold text-charcoal/80 bg-offwhite px-3 py-1.5 rounded-lg border border-charcoal/15">
                          Physical Attendance Required
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* EDIT SESSION MODAL */}
      {editingSession && (
        <Modal
          isOpen={Boolean(editingSession)}
          onClose={() => setEditingSession(null)}
          title="Edit Session Logistics"
          description="Update session timing, access link, mentor details, or guidelines."
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="md"
                onClick={() => setEditingSession(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                loading={savingEdit}
                onClick={handleSaveEdit}
                className="font-bold text-xs px-6"
              >
                Save Changes
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs text-charcoal">
            <Input
              label="Session Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Confirmed Date"
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                required
              />
              <Input
                label="Time Window"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                required
              />
            </div>

            <Input
              label={editingSession.mode === 'Online' ? 'Meeting URL' : 'Venue Address'}
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
              required
            />

            <Input
              label="Lead Mentor / Host"
              value={editMentor}
              onChange={(e) => setEditMentor(e.target.value)}
            />

            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">
                Preparation Guidelines
              </label>
              <textarea
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full rounded-lg border border-charcoal/25 p-2.5 text-xs text-ink"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* CANCEL SESSION CONFIRMATION MODAL */}
      {cancellingSession && (
        <Modal
          isOpen={Boolean(cancellingSession)}
          onClose={() => setCancellingSession(null)}
          title="Cancel Scheduled Session"
          description="Are you sure you want to cancel this session? This will alert invited scholars and mentors."
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="md"
                onClick={() => setCancellingSession(null)}
              >
                Keep Session
              </Button>
              <Button
                variant="danger"
                size="md"
                loading={cancelling}
                onClick={handleConfirmCancel}
                className="font-bold text-xs px-6"
              >
                Yes, Cancel Session
              </Button>
            </div>
          }
        >
          <div className="space-y-3 rounded-xl bg-red-50 p-4 border border-red-200 text-xs text-red-900">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              <div>
                <p className="font-bold text-sm">
                  Cancelling "{cancellingSession.title}"
                </p>
                <p className="mt-1 leading-relaxed">
                  Scheduled for <strong>{cancellingSession.selectedDate}</strong> at{' '}
                  <strong>{cancellingSession.selectedTimeSlot}</strong> with{' '}
                  <strong>{cancellingSession.acceptedCount} confirmed participants</strong>.
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
