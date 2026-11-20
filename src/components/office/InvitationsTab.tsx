import { useMemo, useState } from 'react';
import {
  BellRing,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Mail,
  MailCheck,
  RotateCcw,
  Search,
  Send,
  Sparkles,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import type {
  EventPlan,
  StudentDirectoryItem,
  StudentInvitationRecord,
} from '../../types/office';
import { officeService } from '../../services/office/officeService';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Modal } from '../ui/Modal';

interface InvitationsTabProps {
  events: EventPlan[];
  students: StudentDirectoryItem[];
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onRefreshEvents?: () => void;
}

export function InvitationsTab({
  events,
  students,
  onShowToast,
  onRefreshEvents,
}: InvitationsTabProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Accepted' | 'Declined'>('All');
  const [search, setSearch] = useState('');
  const [invitations, setInvitations] = useState<StudentInvitationRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Send Batch Invitations Modal State
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [targetEventForBatch, setTargetEventForBatch] = useState<string>(events[0]?.id || '');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [sendingBatch, setSendingBatch] = useState(false);

  // Load invitations
  const loadInvitations = async () => {
    setLoading(true);
    try {
      const data = await officeService.getInvitations(selectedEventId);
      setInvitations(data);
    } catch {
      onShowToast('Could not load invitation records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useMemo(() => {
    loadInvitations();
  }, [selectedEventId]);

  // Filtered invitations list
  const filteredInvitations = useMemo(() => {
    return invitations.filter((inv) => {
      if (statusFilter !== 'All' && inv.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        return (
          inv.studentName.toLowerCase().includes(q) ||
          inv.studentEmail.toLowerCase().includes(q) ||
          inv.institution.toLowerCase().includes(q) ||
          inv.eventName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [invitations, statusFilter, search]);

  // Aggregate stats
  const totalCount = invitations.length;
  const acceptedCount = invitations.filter((i) => i.status === 'Accepted').length;
  const pendingCount = invitations.filter((i) => i.status === 'Pending').length;
  const declinedCount = invitations.filter((i) => i.status === 'Declined').length;

  const acceptedPct = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0;
  const pendingPct = totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0;
  const declinedPct = totalCount > 0 ? Math.round((declinedCount / totalCount) * 100) : 0;

  // Resend invitation reminder
  const handleResend = async (id: string, name: string) => {
    try {
      await officeService.resendInvitation(id);
      onShowToast(`Reminder dispatched to ${name}`, 'success');
      loadInvitations();
    } catch {
      onShowToast('Could not dispatch reminder', 'error');
    }
  };

  // Open batch modal
  const handleOpenBatchModal = () => {
    if (events.length > 0) {
      setTargetEventForBatch(events[0].id);
      // Pre-select first 15 eligible students
      setSelectedStudentIds(students.slice(0, 15).map((s) => s.id));
      setIsSendModalOpen(true);
    }
  };

  // Execute Batch Send
  const handleExecuteBatchSend = async () => {
    if (selectedStudentIds.length === 0) {
      onShowToast('Please select at least one student to invite', 'error');
      return;
    }
    setSendingBatch(true);
    try {
      const res = await officeService.sendBatchInvitations(targetEventForBatch, selectedStudentIds);
      onShowToast(`Dispatched ${res.count} invitations for "${res.event.title}"!`, 'success');
      setIsSendModalOpen(false);
      loadInvitations();
      if (onRefreshEvents) onRefreshEvents();
    } catch {
      onShowToast('Could not dispatch batch invitations', 'error');
    } finally {
      setSendingBatch(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 border border-charcoal/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-ink sm:text-2xl">
            Invitations & Response Tracking
          </h2>
          <p className="mt-1 text-xs text-charcoal/70 sm:text-sm">
            Monitor real-time RSVP confirmations, track attendance quotas, and dispatch batch reminders.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenBatchModal}
          className="font-bold text-xs px-5 shadow-sm shrink-0 self-start md:self-auto"
        >
          <Send className="h-4 w-4" />
          <span>Dispatch Batch Invitations</span>
        </Button>
      </div>

      {/* Response Breakdown Cards with Visual Percentages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal/60">
              Total Dispatched
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-ink">{totalCount}</span>
              <Badge variant="neutral" size="sm">
                Invitations
              </Badge>
            </div>
            <p className="mt-2 text-xs text-charcoal/70">
              Across {events.length} workshops and mock interview drives
            </p>
          </CardContent>
        </Card>

        {/* Accepted Response Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Accepted (Confirmed)
              </span>
              <span className="text-xs font-extrabold text-emerald-700">{acceptedPct}%</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-900">{acceptedCount}</span>
              <Badge variant="success" size="sm" dot>
                Confirmed
              </Badge>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-charcoal/10 overflow-hidden">
              <div className="h-full bg-emerald-600" style={{ width: `${acceptedPct}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* Pending Response Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Pending Responses
              </span>
              <span className="text-xs font-extrabold text-amber-700">{pendingPct}%</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-amber-950">{pendingCount}</span>
              <Badge variant="warning" size="sm">
                Awaiting RSVP
              </Badge>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-charcoal/10 overflow-hidden">
              <div className="h-full bg-gold" style={{ width: `${pendingPct}%` }} />
            </div>
          </CardContent>
        </Card>

        {/* Declined Response Card */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-charcoal/70">
                Declined
              </span>
              <span className="text-xs font-extrabold text-charcoal">{declinedPct}%</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-charcoal">{declinedCount}</span>
              <Badge variant="charcoal" size="sm">
                Declined
              </Badge>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-charcoal/10 overflow-hidden">
              <div className="h-full bg-charcoal/50" style={{ width: `${declinedPct}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Controls */}
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Event Filter Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-charcoal mb-1">
                Filter by Event:
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full rounded-lg border border-charcoal/20 bg-white p-2 text-xs text-ink focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="all">All Events ({events.length})</option>
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({evt.invitedCount} invited)
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter Pills */}
            <div>
              <label className="block text-[11px] font-bold text-charcoal mb-1">
                Filter by Status:
              </label>
              <div className="flex items-center rounded-lg bg-offwhite p-1 border border-charcoal/15">
                {(['All', 'Pending', 'Accepted', 'Declined'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`flex-1 rounded py-1 text-xs font-semibold transition-all ${
                      statusFilter === st
                        ? 'bg-ink text-white font-bold shadow-xs'
                        : 'text-charcoal hover:text-ink'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-[11px] font-bold text-charcoal mb-1">
                Search Students:
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-charcoal/45" />
                <input
                  type="text"
                  placeholder="Search student or email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-charcoal/20 bg-white py-1.5 pl-8 pr-3 text-xs text-ink placeholder:text-charcoal/45 focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Roster Table */}
      <div className="overflow-x-auto rounded-2xl border border-charcoal/15 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-charcoal/15 bg-offwhite/80 text-[11px] font-extrabold uppercase tracking-wider text-charcoal/70">
              <th className="py-3 pl-6 pr-3">Invited Scholar</th>
              <th className="py-3 px-3">Institution & Year</th>
              <th className="py-3 px-3">Event</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Dispatched / Responded</th>
              <th className="py-3 pl-3 pr-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10 text-xs">
            {filteredInvitations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-charcoal/60">
                  No invitation records found matching criteria.
                </td>
              </tr>
            ) : (
              filteredInvitations.map((inv) => (
                <tr key={inv.id} className="hover:bg-offwhite/40 transition-colors">
                  <td className="py-3.5 pl-6 pr-3">
                    <p className="font-bold text-ink">{inv.studentName}</p>
                    <p className="font-mono text-[11px] text-charcoal/60">{inv.studentEmail}</p>
                  </td>

                  <td className="py-3.5 px-3">
                    <p className="font-semibold text-ink truncate max-w-[180px]">{inv.institution}</p>
                    <p className="text-[11px] text-charcoal/60">{inv.academicYear}</p>
                  </td>

                  <td className="py-3.5 px-3 max-w-xs">
                    <p className="font-medium text-ink truncate">{inv.eventName}</p>
                  </td>

                  <td className="py-3.5 px-3">
                    {inv.status === 'Accepted' && (
                      <Badge variant="success" dot>
                        Accepted
                      </Badge>
                    )}
                    {inv.status === 'Pending' && (
                      <Badge variant="warning" dot>
                        Pending
                      </Badge>
                    )}
                    {inv.status === 'Declined' && (
                      <Badge variant="charcoal">
                        Declined
                      </Badge>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    <p className="text-charcoal/80 text-[11px]">Sent: {inv.sentAt}</p>
                    {inv.respondedAt && (
                      <p className="text-emerald-800 text-[10px] font-semibold">
                        RSVP: {inv.respondedAt}
                      </p>
                    )}
                    {inv.declineReason && (
                      <p className="text-red-700 text-[10px] italic truncate max-w-[160px]">
                        Reason: {inv.declineReason}
                      </p>
                    )}
                  </td>

                  <td className="py-3.5 pl-3 pr-6 text-right">
                    {inv.status === 'Pending' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResend(inv.id, inv.studentName)}
                        className="text-[11px] font-semibold"
                      >
                        <RotateCcw className="h-3 w-3 text-gold" />
                        <span>Send Reminder</span>
                      </Button>
                    ) : (
                      <span className="text-[11px] text-charcoal/40 font-medium">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* SEND BATCH INVITATIONS MODAL */}
      {isSendModalOpen && (
        <Modal
          isOpen={isSendModalOpen}
          onClose={() => setIsSendModalOpen(false)}
          maxWidth="lg"
          title={
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-gold" />
              <span>Dispatch Batch Invitations</span>
            </div>
          }
          description="Send calendar invitations directly to eligible scholars based on analyzed availability."
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsSendModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                loading={sendingBatch}
                onClick={handleExecuteBatchSend}
                className="font-bold text-xs px-6"
              >
                <span>Dispatch {selectedStudentIds.length} Invitations</span>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs text-charcoal">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">
                Select Target Event:
              </label>
              <select
                value={targetEventForBatch}
                onChange={(e) => setTargetEventForBatch(e.target.value)}
                className="w-full rounded-lg border border-charcoal/25 bg-white p-2.5 text-xs text-ink"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({evt.selectedDate} • {evt.selectedTimeSlot})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-ink">
                  Select Scholars to Invite ({selectedStudentIds.length} Selected):
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedStudentIds(students.map((s) => s.id))}
                    className="text-[11px] text-ink font-semibold hover:underline"
                  >
                    Select All ({students.length})
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentIds([])}
                    className="text-[11px] text-charcoal/60 hover:underline"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Scrollable checklist */}
              <div className="max-h-56 overflow-y-auto divide-y divide-charcoal/10 rounded-xl border border-charcoal/20 bg-white p-2">
                {students.map((s) => {
                  const isChecked = selectedStudentIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className="flex items-center justify-between p-2 hover:bg-offwhite rounded-lg cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedStudentIds((prev) =>
                              isChecked ? prev.filter((id) => id !== s.id) : [...prev, s.id],
                            );
                          }}
                          className="h-4 w-4 rounded border-charcoal/30 accent-gold"
                        />
                        <div>
                          <p className="font-bold text-ink text-xs">{s.name}</p>
                          <p className="text-[10px] text-charcoal/60">
                            {s.institution.split(',')[0]} • {s.academicYear}
                          </p>
                        </div>
                      </div>
                      <Badge variant="gold" size="sm">
                        {s.availabilityStatus.split(' ')[0]}
                      </Badge>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl bg-offwhite p-3 border border-charcoal/15 text-xs text-charcoal/80 space-y-1">
              <p className="font-semibold text-ink">Notification Delivery Notice:</p>
              <p className="text-[11px]">
                Invitations will immediately populate the scholars' Student Portal under <em>My Invitations</em> with action buttons to Accept or Decline.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
