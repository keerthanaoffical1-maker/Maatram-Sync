import { useState } from 'react';
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Inbox,
  MapPin,
  Search,
  Sparkles,
  Users,
  Video,
  X,
  XCircle,
} from 'lucide-react';
import type { EventInvitation, InvitationStatus } from '../../types/student';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

interface InvitationsTabProps {
  invitations: EventInvitation[];
  onRespond: (id: string, status: 'Accepted' | 'Declined') => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateTab: (tab: any) => void;
}

export function InvitationsTab({
  invitations,
  onRespond,
  onShowToast,
  onNavigateTab,
}: InvitationsTabProps) {
  const [filterStatus, setFilterStatus] = useState<'All' | InvitationStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const pendingCount = invitations.filter((i) => i.status === 'Pending').length;
  const acceptedCount = invitations.filter((i) => i.status === 'Accepted').length;
  const declinedCount = invitations.filter((i) => i.status === 'Declined').length;

  const handleAction = async (id: string, status: 'Accepted' | 'Declined', eventName: string) => {
    setActionLoadingId(id);
    try {
      await onRespond(id, status);
      if (status === 'Accepted') {
        onShowToast(`Accepted invitation for "${eventName}"! Added to Upcoming Sessions.`, 'success');
      } else {
        onShowToast(`Declined invitation for "${eventName}".`, 'info');
      }
    } catch {
      onShowToast('Could not process invitation response', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filtered = invitations.filter((item) => {
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    const matchesSearch =
      item.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.institutionTarget.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.speaker && item.speaker.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 border border-charcoal/10 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-ink sm:text-2xl">Event & Workshop Invitations</h2>
          <p className="mt-1 text-xs text-charcoal/70 sm:text-sm">
            Invitations sent by the Maatram Academic Team and corporate partners based on your availability.
          </p>
        </div>

        {pendingCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-gold/20 px-3.5 py-2 border border-gold/40 text-xs font-bold text-ink shrink-0">
            <Sparkles className="h-4 w-4 text-gold shrink-0" />
            <span>{pendingCount} invitation{pendingCount > 1 ? 's' : ''} awaiting your response</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center rounded-xl bg-white p-1 border border-charcoal/15 shadow-xs overflow-x-auto">
          {(['All', 'Pending', 'Accepted', 'Declined'] as const).map((tab) => {
            const count =
              tab === 'All'
                ? invitations.length
                : tab === 'Pending'
                  ? pendingCount
                  : tab === 'Accepted'
                    ? acceptedCount
                    : declinedCount;

            const isActive = filterStatus === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterStatus(tab)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-ink text-white shadow-xs'
                    : 'text-charcoal hover:bg-offwhite hover:text-ink'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    isActive ? 'bg-gold text-ink font-extrabold' : 'bg-charcoal/10 text-charcoal'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Field */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/50" />
          <input
            type="text"
            placeholder="Search by title, company, mentor…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-charcoal/20 bg-white py-2 pl-9 pr-3 text-xs text-ink placeholder:text-charcoal/50 focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Invitations Grid / List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-charcoal/10 bg-white p-12 text-center">
          <Inbox className="mx-auto h-12 w-12 text-charcoal/30" />
          <h3 className="mt-4 text-base font-bold text-ink">No invitations found</h3>
          <p className="mt-1 text-xs text-charcoal/60">
            {searchQuery
              ? 'No event matches your search query. Try clearing the filter.'
              : `You have no ${filterStatus !== 'All' ? filterStatus.toLowerCase() : ''} invitations at this time.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((inv) => {
            const isLoading = actionLoadingId === inv.id;

            return (
              <Card
                key={inv.id}
                className={`transition-all ${
                  inv.status === 'Pending'
                    ? 'border-gold/50 shadow-md ring-1 ring-gold/30'
                    : 'border-charcoal/10'
                }`}
              >
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                    {/* Left: Event Details */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-gold/25 px-2.5 py-0.5 text-xs font-bold text-ink">
                          {inv.category}
                        </span>

                        {/* Status Indicator */}
                        {inv.status === 'Pending' && (
                          <Badge variant="warning" dot>
                            Pending Response
                          </Badge>
                        )}
                        {inv.status === 'Accepted' && (
                          <Badge variant="success" dot>
                            Accepted • Confirmed
                          </Badge>
                        )}
                        {inv.status === 'Declined' && (
                          <Badge variant="charcoal">
                            Declined
                          </Badge>
                        )}

                        <Badge variant={inv.mode === 'Online' ? 'gold' : 'neutral'}>
                          {inv.mode === 'Online' ? (
                            <span className="flex items-center gap-1">
                              <Video className="h-3 w-3" /> Online
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> Offline Venue
                            </span>
                          )}
                        </Badge>
                      </div>

                      <h3 className="text-lg font-bold text-ink sm:text-xl leading-snug">
                        {inv.eventName}
                      </h3>

                      <p className="text-xs text-charcoal/80 leading-relaxed sm:text-sm">
                        {inv.description}
                      </p>

                      {/* Meta Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1 text-xs text-charcoal">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gold shrink-0" />
                          <span className="font-medium">{inv.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gold shrink-0" />
                          <span>{inv.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gold shrink-0" />
                          <span className="truncate">For: {inv.institutionTarget}</span>
                        </div>
                        {inv.speaker && (
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <Sparkles className="h-4 w-4 text-gold shrink-0" />
                            <span className="font-semibold text-ink">Mentor/Speaker: {inv.speaker}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 sm:col-span-2">
                          <MapPin className="h-4 w-4 text-gold shrink-0" />
                          <span className="truncate font-mono text-[11px] text-charcoal/70">
                            {inv.location}
                          </span>
                        </div>
                      </div>

                      {inv.actionDeadline && inv.status === 'Pending' && (
                        <p className="text-[11px] font-semibold text-amber-900 bg-amber-50 rounded-lg p-2 border border-amber-200">
                          ⚠️ Please accept or decline by <strong>{inv.actionDeadline}</strong> so coordinators can finalize slot allotments.
                        </p>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-row lg:flex-col items-center justify-end gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-charcoal/10">
                      {inv.status === 'Pending' ? (
                        <>
                          <Button
                            variant="primary"
                            size="md"
                            loading={isLoading}
                            onClick={() => handleAction(inv.id, 'Accepted', inv.eventName)}
                            className="w-full sm:w-auto font-bold text-xs px-5 shadow-sm"
                          >
                            <Check className="h-4 w-4" />
                            <span>Accept</span>
                          </Button>

                          <Button
                            variant="secondary"
                            size="md"
                            loading={isLoading}
                            onClick={() => handleAction(inv.id, 'Declined', inv.eventName)}
                            className="w-full sm:w-auto font-semibold text-xs px-4"
                          >
                            <X className="h-4 w-4 text-charcoal" />
                            <span>Decline</span>
                          </Button>
                        </>
                      ) : inv.status === 'Accepted' ? (
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>Confirmed</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAction(inv.id, 'Declined', inv.eventName)}
                            className="text-[11px] font-medium text-charcoal/60 hover:text-red-600 underline"
                          >
                            Change to Decline
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-charcoal bg-charcoal/10 px-3 py-1.5 rounded-lg">
                            <XCircle className="h-4 w-4 text-charcoal/60" />
                            <span>Declined</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAction(inv.id, 'Accepted', inv.eventName)}
                            className="text-[11px] font-medium text-ink hover:text-gold underline"
                          >
                            Re-accept invitation
                          </button>
                        </div>
                      )}
                    </div>
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
