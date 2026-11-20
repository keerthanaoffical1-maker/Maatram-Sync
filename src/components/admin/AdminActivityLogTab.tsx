import { useMemo, useState } from 'react';
import {
  Activity,
  Calendar,
  Clock,
  Download,
  Filter,
  History,
  Info,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import type { AdminActivityItem } from '../../types/admin';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';

interface AdminActivityLogTabProps {
  logs: AdminActivityItem[];
}

type ActionFilterType = 'All' | 'Create' | 'Update' | 'Status Change' | 'Import' | 'Delete';

export function AdminActivityLogTab({ logs }: AdminActivityLogTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActionType, setSelectedActionType] = useState<ActionFilterType>('All');
  const [selectedLog, setSelectedLog] = useState<AdminActivityItem | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Action type filter
      if (selectedActionType !== 'All' && log.actionType !== selectedActionType) {
        return false;
      }
      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesAction = log.action.toLowerCase().includes(q);
        const matchesAdmin = log.adminName.toLowerCase().includes(q);
        const matchesRecord = log.affectedRecord.toLowerCase().includes(q);
        const matchesDetails = log.details.toLowerCase().includes(q);
        if (!matchesAction && !matchesAdmin && !matchesRecord && !matchesDetails) {
          return false;
        }
      }
      return true;
    });
  }, [logs, selectedActionType, searchTerm]);

  // Action badge renderer
  const renderActionBadge = (actionType: AdminActivityItem['actionType']) => {
    switch (actionType) {
      case 'Create':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Create
          </span>
        );
      case 'Update':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            Update
          </span>
        );
      case 'Status Change':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            Status Change
          </span>
        );
      case 'Import':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            Import
          </span>
        );
      case 'Delete':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            Delete
          </span>
        );
      default:
        return <Badge variant="outline">{actionType}</Badge>;
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Admin Name', 'Action Type', 'Action', 'Affected Record', 'Details'];
    const rows = filteredLogs.map((l) => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.adminName}"`,
      `"${l.actionType}"`,
      `"${l.action.replace(/"/g, '""')}"`,
      `"${l.affectedRecord.replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Maatram_Admin_Activity_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-ink">Administrative Activity Log</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-charcoal/5 px-2.5 py-0.5 text-[11px] font-medium text-charcoal">
              <ShieldCheck className="h-3 w-3 text-gold" />
              Audit Trail
            </span>
          </div>
          <p className="mt-1 text-sm text-charcoal/70">
            Immutable log of all administrative actions, student registrations, institution updates, and bulk imports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-2 text-xs"
          >
            <Download className="h-3.5 w-3.5 text-charcoal/70" />
            Export Audit Log
          </Button>
        </div>
      </div>

      {/* Security notice banner */}
      <div className="flex items-start gap-3 rounded-xl border border-charcoal/15 bg-white p-4 shadow-sm">
        <div className="rounded-lg bg-gold/15 p-2 text-ink mt-0.5">
          <History className="h-4 w-4" />
        </div>
        <div className="text-xs">
          <h4 className="font-semibold text-ink">Tamper-evident Administrative Audit Trail</h4>
          <p className="text-charcoal/75 mt-0.5">
            Every record creation, category amendment, student account suspension, or bulk CSV upload is tracked with the author's identity and exact timestamp to ensure complete compliance and accountability.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-charcoal/40" />
              <input
                type="text"
                placeholder="Search by action, administrator, affected record, or keyword…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-charcoal/20 bg-white py-2 pl-9 pr-8 text-xs text-ink placeholder:text-charcoal/40 focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2.5 text-charcoal/40 hover:text-ink"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Action Type Filter pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
              <span className="text-[11px] font-medium text-charcoal/60 mr-1 flex items-center gap-1 shrink-0">
                <Filter className="h-3 w-3" /> Type:
              </span>
              {(['All', 'Create', 'Update', 'Status Change', 'Import', 'Delete'] as ActionFilterType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedActionType(type)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedActionType === type
                      ? 'bg-ink text-white font-semibold'
                      : 'bg-charcoal/5 text-charcoal hover:bg-charcoal/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-charcoal/60 pt-2 border-t border-charcoal/10">
            <span>
              Showing <strong className="text-ink">{filteredLogs.length}</strong> of{' '}
              <strong className="text-ink">{logs.length}</strong> recorded activities
            </span>
            {(searchTerm || selectedActionType !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedActionType('All');
                }}
                className="text-xs text-charcoal hover:text-ink font-medium underline"
              >
                Reset filters
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal/5 text-charcoal font-semibold border-b border-charcoal/15 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Action Performed</th>
                <th className="px-4 py-3">Administrator</th>
                <th className="px-4 py-3">Affected Record</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10 text-charcoal">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-charcoal/60">
                    <History className="mx-auto h-8 w-8 text-charcoal/30 mb-2" />
                    <p className="text-sm font-medium text-ink">No activity records found</p>
                    <p className="text-xs mt-1">Try relaxing your search terms or filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const dateObj = new Date(log.timestamp);
                  const formattedDate = dateObj.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const formattedTime = dateObj.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  });

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-charcoal/[0.02] cursor-pointer transition-colors"
                    >
                      {/* Timestamp */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-ink">
                          <Clock className="h-3.5 w-3.5 text-charcoal/40" />
                          <span>{formattedDate}</span>
                        </div>
                        <span className="text-[10px] text-charcoal/50 ml-5">{formattedTime}</span>
                      </td>

                      {/* Action Type */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {renderActionBadge(log.actionType)}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 font-semibold text-ink">
                        {log.action}
                      </td>

                      {/* Admin */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-ink text-gold font-bold flex items-center justify-center text-[10px]">
                            {log.adminName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span className="font-medium text-ink">{log.adminName}</span>
                        </div>
                      </td>

                      {/* Affected Record */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded bg-charcoal/5 font-mono text-[11px] text-charcoal font-medium border border-charcoal/10">
                          {log.affectedRecord}
                        </span>
                      </td>

                      {/* Details preview */}
                      <td className="px-4 py-3.5 max-w-xs truncate text-charcoal/70">
                        <span title={log.details}>{log.details}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-charcoal/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-charcoal/50 uppercase">{selectedLog.id}</span>
                  {renderActionBadge(selectedLog.actionType)}
                </div>
                <h3 className="text-base font-bold text-ink mt-1">{selectedLog.action}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="rounded-lg p-1.5 text-charcoal/60 hover:bg-charcoal/10 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-charcoal/10">
                <span className="text-charcoal/60 font-medium">Administrator</span>
                <span className="font-semibold text-ink">{selectedLog.adminName}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-charcoal/10">
                <span className="text-charcoal/60 font-medium">Timestamp</span>
                <span className="font-medium text-ink">
                  {new Date(selectedLog.timestamp).toLocaleString('en-IN', {
                    dateStyle: 'full',
                    timeStyle: 'medium',
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-charcoal/10">
                <span className="text-charcoal/60 font-medium">Affected Record</span>
                <span className="font-mono bg-charcoal/5 px-2 py-0.5 rounded text-ink border border-charcoal/10">
                  {selectedLog.affectedRecord}
                </span>
              </div>

              <div>
                <span className="text-charcoal/60 font-medium block mb-1">Execution Details / Payload</span>
                <div className="p-3 rounded-lg bg-charcoal/5 border border-charcoal/10 font-mono text-[11px] text-ink leading-relaxed break-words">
                  {selectedLog.details}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-charcoal/10">
              <Button variant="outline" size="sm" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
