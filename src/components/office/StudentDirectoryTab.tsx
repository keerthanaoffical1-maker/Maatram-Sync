import { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  Filter,
  GraduationCap,
  Info,
  Lock,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldAlert,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';
import type { StudentDirectoryItem } from '../../types/office';
import {
  ACADEMIC_YEARS_LIST,
  INSTITUTIONS_LIST,
} from '../../services/office/mockOfficeData';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Modal } from '../ui/Modal';

interface StudentDirectoryTabProps {
  students: StudentDirectoryItem[];
  initialSearchQuery?: string;
}

export function StudentDirectoryTab({
  students,
  initialSearchQuery = '',
}: StudentDirectoryTabProps) {
  // Filters state
  const [search, setSearch] = useState(initialSearchQuery);
  const [selectedInstitution, setSelectedInstitution] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedAvailability, setSelectedAvailability] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'year' | 'sessions'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Selected student for detail modal
  const [activeStudent, setActiveStudent] = useState<StudentDirectoryItem | null>(null);

  // Filter application
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesEmail = s.email.toLowerCase().includes(q);
        const matchesId = s.studentId.toLowerCase().includes(q);
        const matchesDept = s.department.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesId && !matchesDept) return false;
      }

      // Institution filter
      if (selectedInstitution !== 'All' && s.institution !== selectedInstitution) {
        return false;
      }

      // Academic Year filter
      if (selectedYear !== 'All' && s.academicYear !== selectedYear) {
        return false;
      }

      // Availability Status filter
      if (selectedAvailability !== 'All' && s.availabilityStatus !== selectedAvailability) {
        return false;
      }

      return true;
    });
  }, [students, search, selectedInstitution, selectedYear, selectedAvailability]);

  // Sort application
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      if (sortBy === 'name') {
        const res = a.name.localeCompare(b.name);
        return sortOrder === 'asc' ? res : -res;
      }
      if (sortBy === 'year') {
        const res = a.academicYear.localeCompare(b.academicYear);
        return sortOrder === 'asc' ? res : -res;
      }
      if (sortBy === 'sessions') {
        return sortOrder === 'asc'
          ? a.sessionsAttended - b.sessionsAttended
          : b.sessionsAttended - a.sessionsAttended;
      }
      return 0;
    });
  }, [filteredStudents, sortBy, sortOrder]);

  const activeFiltersCount =
    (selectedInstitution !== 'All' ? 1 : 0) +
    (selectedYear !== 'All' ? 1 : 0) +
    (selectedAvailability !== 'All' ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedInstitution('All');
    setSelectedYear('All');
    setSelectedAvailability('All');
  };

  const getAvailabilityBadge = (status: StudentDirectoryItem['availabilityStatus']) => {
    switch (status) {
      case 'Full Weekend Available':
        return <Badge variant="gold" dot>{status}</Badge>;
      case 'Weekday Evenings Available':
        return <Badge variant="neutral" dot>{status}</Badge>;
      case 'High Availability':
        return <Badge variant="success" dot>{status}</Badge>;
      case 'Partial Availability':
        return <Badge variant="charcoal">{status}</Badge>;
      default:
        return <Badge variant="outline">Not Submitted</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Card */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 border border-charcoal/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-ink sm:text-2xl">Scholar Directory</h2>
          <p className="mt-1 text-xs text-charcoal/70 sm:text-sm">
            Comprehensive roster of all registered Maatram scholars across affiliated engineering institutions.
          </p>
        </div>

        {/* Read-only Security Banner */}
        <div className="flex items-center gap-2 rounded-xl bg-charcoal/5 px-3.5 py-2 border border-charcoal/15 text-xs text-charcoal shrink-0">
          <Lock className="h-4 w-4 text-charcoal/70 shrink-0" />
          <span>Read-only: Registration records & role modifications are protected</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Top row: Search and Reset */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/50" />
              <input
                type="text"
                placeholder="Search by student name, email, ID (e.g. MS-2024-001) or dept…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-charcoal/20 bg-white py-2 pl-10 pr-10 text-xs text-ink placeholder:text-charcoal/50 focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-xs text-charcoal/70">
                Showing <strong className="text-ink">{sortedStudents.length}</strong> of{' '}
                {students.length} scholars
              </span>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-xs text-charcoal"
                >
                  Clear all ({activeFiltersCount})
                </Button>
              )}
            </div>
          </div>

          {/* Bottom row: Dropdown filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-charcoal/10">
            {/* Institution Filter */}
            <div>
              <label className="block text-[11px] font-bold text-charcoal/70 mb-1">
                Institution
              </label>
              <select
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className="w-full rounded-lg border border-charcoal/20 bg-offwhite/50 px-3 py-2 text-xs text-ink focus:bg-white focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="All">All Institutions (7)</option>
                {INSTITUTIONS_LIST.map((inst) => (
                  <option key={inst} value={inst}>
                    {inst}
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year Filter */}
            <div>
              <label className="block text-[11px] font-bold text-charcoal/70 mb-1">
                Academic Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full rounded-lg border border-charcoal/20 bg-offwhite/50 px-3 py-2 text-xs text-ink focus:bg-white focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="All">All Academic Years</option>
                {ACADEMIC_YEARS_LIST.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Status Filter */}
            <div>
              <label className="block text-[11px] font-bold text-charcoal/70 mb-1">
                Availability Status
              </label>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="w-full rounded-lg border border-charcoal/20 bg-offwhite/50 px-3 py-2 text-xs text-ink focus:bg-white focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="All">All Statuses</option>
                <option value="Full Weekend Available">Full Weekend Available</option>
                <option value="Weekday Evenings Available">Weekday Evenings Available</option>
                <option value="High Availability">High Availability</option>
                <option value="Partial Availability">Partial Availability</option>
                <option value="Unavailable / Not Submitted">Unavailable / Not Submitted</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-charcoal/15 bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-charcoal/15 bg-offwhite/80 text-[11px] font-extrabold uppercase tracking-wider text-charcoal/70">
              <th className="py-3.5 pl-6 pr-3">Scholar</th>
              <th className="py-3.5 px-3">Institution & Dept</th>
              <th className="py-3.5 px-3">Academic Year</th>
              <th className="py-3.5 px-3">Availability Status</th>
              <th className="py-3.5 px-3">Contact</th>
              <th className="py-3.5 pl-3 pr-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10 text-xs">
            {sortedStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-charcoal/60">
                  <Users className="mx-auto h-8 w-8 text-charcoal/30 mb-2" />
                  <p className="font-semibold text-ink">No scholars match the selected filter criteria</p>
                  <p className="text-xs text-charcoal/50 mt-1">Try resetting the filters or modifying your search query.</p>
                </td>
              </tr>
            ) : (
              sortedStudents.map((student) => {
                const initials = student.name
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('');

                return (
                  <tr
                    key={student.id}
                    className="hover:bg-offwhite/50 transition-colors cursor-pointer"
                    onClick={() => setActiveStudent(student)}
                  >
                    {/* Scholar Name & ID */}
                    <td className="py-4 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-xs font-bold text-gold ring-1 ring-charcoal/20">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-ink text-sm leading-tight hover:underline">
                            {student.name}
                          </p>
                          <p className="text-[11px] text-charcoal/60 font-mono mt-0.5">
                            {student.studentId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Institution & Department */}
                    <td className="py-4 px-3 max-w-xs">
                      <p className="font-semibold text-ink truncate">{student.institution}</p>
                      <p className="text-[11px] text-charcoal/60 truncate">{student.department}</p>
                    </td>

                    {/* Academic Year */}
                    <td className="py-4 px-3">
                      <span className="font-semibold text-ink block">{student.academicYear}</span>
                    </td>

                    {/* Availability Status */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      {getAvailabilityBadge(student.availabilityStatus)}
                    </td>

                    {/* Contact Info */}
                    <td className="py-4 px-3">
                      <p className="text-charcoal/80 font-mono text-[11px]">{student.email}</p>
                      <p className="text-charcoal/60 text-[11px] mt-0.5">{student.phone}</p>
                    </td>

                    {/* Action */}
                    <td className="py-4 pl-3 pr-6 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveStudent(student);
                        }}
                        className="text-xs font-bold"
                      >
                        View Profile
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Individual Student Profile Modal */}
      {activeStudent && (
        <Modal
          isOpen={Boolean(activeStudent)}
          onClose={() => setActiveStudent(null)}
          maxWidth="lg"
          title={
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink text-sm font-bold text-gold">
                {activeStudent.name
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join('')}
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink">{activeStudent.name}</h3>
                <p className="text-xs text-charcoal/60 font-mono">
                  {activeStudent.studentId} • {activeStudent.academicYear}
                </p>
              </div>
            </div>
          }
          description="Institutional Scholar Record (Read-Only)"
          footer={
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5 text-xs text-charcoal/60">
                <Lock className="h-3.5 w-3.5" />
                <span>Protected by Maatram Academic Office</span>
              </span>
              <Button
                variant="primary"
                size="md"
                onClick={() => setActiveStudent(null)}
                className="text-xs font-bold"
              >
                Close Profile
              </Button>
            </div>
          }
        >
          <div className="space-y-5 text-xs text-charcoal">
            {/* Status & Availability Overview */}
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-offwhite p-4 border border-charcoal/10">
              <div>
                <span className="text-[10px] uppercase font-bold text-charcoal/50 block">Status</span>
                <span className="font-bold text-ink text-sm">{activeStudent.enrollmentStatus}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-charcoal/50 block">Sessions Attended</span>
                <span className="font-bold text-ink text-sm">{activeStudent.sessionsAttended} Completed</span>
              </div>
            </div>

            {/* Locked Institutional Information */}
            <div className="rounded-xl border border-charcoal/15 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
                <h4 className="font-bold text-ink text-sm flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-gold" /> Institutional Details
                </h4>
                <span className="rounded bg-charcoal/10 px-2 py-0.5 text-[9px] font-bold text-charcoal flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] font-semibold text-charcoal/60 block">Institution</span>
                  <span className="font-medium text-ink">{activeStudent.institution}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-charcoal/60 block">Department</span>
                  <span className="font-medium text-ink">{activeStudent.department}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-charcoal/60 block">Academic Year</span>
                  <span className="font-medium text-ink">{activeStudent.academicYear}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-charcoal/60 block">Current Availability Tag</span>
                  <span className="mt-0.5 inline-block">{getAvailabilityBadge(activeStudent.availabilityStatus)}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="rounded-xl border border-charcoal/15 bg-white p-4 space-y-3">
              <h4 className="font-bold text-ink text-sm flex items-center gap-1.5 border-b border-charcoal/10 pb-2">
                <Phone className="h-4 w-4 text-gold" /> Contact Information
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-charcoal/50" />
                  <span className="font-mono">{activeStudent.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-charcoal/50" />
                  <span>{activeStudent.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-charcoal/50" />
                  <span>{activeStudent.location}</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
