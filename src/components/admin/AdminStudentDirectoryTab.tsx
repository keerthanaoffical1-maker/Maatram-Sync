import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Edit2,
  ExternalLink,
  Filter,
  GraduationCap,
  Lock,
  Mail,
  MapPin,
  Phone,
  Power,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  UserX,
  Users,
  X,
} from 'lucide-react';
import type {
  AdminStudentItem,
  InstitutionItem,
} from '../../types/admin';
import { adminService } from '../../services/admin/adminService';
import { DEPARTMENTS_LIST } from '../../services/office/mockOfficeData';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface AdminStudentDirectoryTabProps {
  students: AdminStudentItem[];
  institutions: InstitutionItem[];
  initialSearchQuery?: string;
  onStudentUpdated: (student: AdminStudentItem) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function AdminStudentDirectoryTab({
  students,
  institutions,
  initialSearchQuery = '',
  onStudentUpdated,
  onShowToast,
}: AdminStudentDirectoryTabProps) {
  // Filter States
  const [search, setSearch] = useState(initialSearchQuery);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearch(initialSearchQuery);
    }
  }, [initialSearchQuery]);
  const [selectedInst, setSelectedInst] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Sorting
  const [sortBy, setSortBy] = useState<'name' | 'studentId' | 'date' | 'year'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals State
  const [viewingStudent, setViewingStudent] = useState<AdminStudentItem | null>(null);
  const [editingStudent, setEditingStudent] = useState<AdminStudentItem | null>(null);
  const [statusConfirmStudent, setStatusConfirmStudent] = useState<AdminStudentItem | null>(null);

  // Edit Form Fields
  const [editName, setEditName] = useState('');
  const [editId, setEditId] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editInst, setEditInst] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editYear, setEditYear] = useState<AdminStudentItem['academicYear']>('3rd Year');
  const [savingEdit, setSavingEdit] = useState(false);

  // Filter application
  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matches =
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.studentId.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q) ||
          s.institution.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (selectedInst !== 'All' && s.institution !== selectedInst) return false;
      if (selectedYear !== 'All' && s.academicYear !== selectedYear) return false;
      if (selectedDept !== 'All' && s.department !== selectedDept) return false;
      if (selectedStatus !== 'All' && s.accountStatus !== selectedStatus) return false;

      return true;
    });
  }, [students, search, selectedInst, selectedYear, selectedDept, selectedStatus]);

  // Sort application
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') {
        const res = a.name.localeCompare(b.name);
        return sortOrder === 'asc' ? res : -res;
      }
      if (sortBy === 'studentId') {
        const res = a.studentId.localeCompare(b.studentId);
        return sortOrder === 'asc' ? res : -res;
      }
      if (sortBy === 'date') {
        const res = a.registrationDate.localeCompare(b.registrationDate);
        return sortOrder === 'asc' ? res : -res;
      }
      if (sortBy === 'year') {
        const res = a.academicYear.localeCompare(b.academicYear);
        return sortOrder === 'asc' ? res : -res;
      }
      return 0;
    });
  }, [filtered, sortBy, sortOrder]);

  const activeFiltersCount =
    (selectedInst !== 'All' ? 1 : 0) +
    (selectedYear !== 'All' ? 1 : 0) +
    (selectedDept !== 'All' ? 1 : 0) +
    (selectedStatus !== 'All' ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedInst('All');
    setSelectedYear('All');
    setSelectedDept('All');
    setSelectedStatus('All');
  };

  const handleOpenEdit = (student: AdminStudentItem) => {
    setEditingStudent(student);
    setEditName(student.name);
    setEditId(student.studentId);
    setEditEmail(student.email);
    setEditPhone(student.phone);
    setEditInst(student.institution);
    setEditDept(student.department);
    setEditYear(student.academicYear);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    setSavingEdit(true);
    try {
      const updated = await adminService.updateStudent(editingStudent.id, {
        name: editName.trim(),
        studentId: editId.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        institution: editInst.trim(),
        department: editDept.trim(),
        academicYear: editYear,
      });

      onStudentUpdated(updated);
      onShowToast(`Scholar record for "${updated.name}" updated successfully!`, 'success');
      setEditingStudent(null);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to update student record', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = async (student: AdminStudentItem) => {
    const nextStatus = student.accountStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const updated = await adminService.toggleStudentAccountStatus(student.id, nextStatus);
      onStudentUpdated(updated);
      onShowToast(`Scholar ${updated.name} account status set to "${nextStatus}".`, 'info');
      setStatusConfirmStudent(null);
    } catch (err: any) {
      onShowToast(err.message || 'Failed to toggle account status', 'error');
    }
  };

  const departmentsList = DEPARTMENTS_LIST;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 border border-charcoal/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-ink sm:text-2xl">
            Scholar Master Directory
          </h2>
          <p className="mt-1 text-xs text-charcoal/70 sm:text-sm">
            Complete student management table. Search, filter, view details, edit records, and toggle account activation.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-gold/20 px-3.5 py-2 border border-gold/40 text-xs font-bold text-ink shrink-0">
          <ShieldCheck className="h-4 w-4 text-gold shrink-0" />
          <span>Admin Privilege: Full Edit & Status Authority</span>
        </div>
      </div>

      {/* Multi-Filter Bar */}
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/45" />
              <input
                type="text"
                placeholder="Search by name, student ID, email, or department…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-charcoal/20 bg-white py-2 pl-10 pr-10 text-xs text-ink placeholder:text-charcoal/45 focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
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
                Showing <strong className="text-ink">{sorted.length}</strong> of{' '}
                {students.length} scholars
              </span>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-xs text-charcoal"
                >
                  Reset ({activeFiltersCount})
                </Button>
              )}
            </div>
          </div>

          {/* 4 Dropdown Filters */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-charcoal/10">
            {/* Institution */}
            <div>
              <label className="block text-[10px] font-bold text-charcoal/70 mb-1">
                Institution
              </label>
              <select
                value={selectedInst}
                onChange={(e) => setSelectedInst(e.target.value)}
                className="w-full rounded-lg border border-charcoal/20 bg-offwhite/50 p-2 text-xs text-ink focus:bg-white focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="All">All Institutions</option>
                {institutions.map((i) => (
                  <option key={i.id} value={i.name}>
                    {i.code} ({i.name.split(',')[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Year */}
            <div>
              <label className="block text-[10px] font-bold text-charcoal/70 mb-1">
                Academic Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full rounded-lg border border-charcoal/20 bg-offwhite/50 p-2 text-xs text-ink focus:bg-white focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="All">All Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            {/* Department */}
            <div>
              <label className="block text-[10px] font-bold text-charcoal/70 mb-1">
                Department
              </label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full rounded-lg border border-charcoal/20 bg-offwhite/50 p-2 text-xs text-ink focus:bg-white focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="All">All Departments</option>
                {departmentsList.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-[10px] font-bold text-charcoal/70 mb-1">
                Account Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-lg border border-charcoal/20 bg-offwhite/50 p-2 text-xs text-ink focus:bg-white focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Admin Scholar Table */}
      <div className="overflow-x-auto rounded-2xl border border-charcoal/15 bg-white shadow-sm">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-charcoal/15 bg-offwhite/80 text-[11px] font-extrabold uppercase tracking-wider text-charcoal/70">
              <th className="py-3.5 pl-6 pr-3">Scholar & ID</th>
              <th className="py-3.5 px-3">Email Address</th>
              <th className="py-3.5 px-3">Institution & Dept</th>
              <th className="py-3.5 px-3">Academic Year</th>
              <th className="py-3.5 px-3">Reg. Date</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 pl-3 pr-6 text-right">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10 text-xs">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-charcoal/60">
                  No scholars match the chosen filter combinations.
                </td>
              </tr>
            ) : (
              sorted.map((student) => (
                <tr key={student.id} className="hover:bg-offwhite/50 transition-colors">
                  {/* Scholar Name & ID */}
                  <td className="py-3.5 pl-6 pr-3">
                    <p className="font-bold text-ink text-sm leading-tight">{student.name}</p>
                    <p className="font-mono text-[11px] text-charcoal/60 mt-0.5">{student.studentId}</p>
                  </td>

                  {/* Email */}
                  <td className="py-3.5 px-3 font-mono text-[11px] text-charcoal">
                    {student.email}
                  </td>

                  {/* Institution & Dept */}
                  <td className="py-3.5 px-3 max-w-xs">
                    <p className="font-semibold text-ink truncate">{student.institution}</p>
                    <p className="text-[11px] text-charcoal/60 truncate">{student.department}</p>
                  </td>

                  {/* Academic Year */}
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-ink block">{student.academicYear}</span>
                  </td>

                  {/* Registration Date */}
                  <td className="py-3.5 px-3 font-mono text-[11px] text-charcoal/70 whitespace-nowrap">
                    {student.registrationDate}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <Badge
                      variant={
                        student.accountStatus === 'Active'
                          ? 'success'
                          : student.accountStatus === 'Inactive'
                            ? 'warning'
                            : 'charcoal'
                      }
                      size="sm"
                      dot
                    >
                      {student.accountStatus}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingStudent(student)}
                        className="text-xs"
                      >
                        View
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleOpenEdit(student)}
                        className="text-xs font-semibold"
                      >
                        <Edit2 className="h-3 w-3" />
                        <span>Edit</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStatusConfirmStudent(student)}
                        className={`text-xs ${
                          student.accountStatus === 'Active' ? 'text-charcoal' : 'text-emerald-700'
                        }`}
                      >
                        <Power className="h-3 w-3" />
                        <span>{student.accountStatus === 'Active' ? 'Deactivate' : 'Activate'}</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW STUDENT DETAILS MODAL */}
      {viewingStudent && (
        <Modal
          isOpen={Boolean(viewingStudent)}
          onClose={() => setViewingStudent(null)}
          title={
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-xs font-bold text-gold">
                {viewingStudent.name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
              </div>
              <div>
                <h3 className="text-base font-bold text-ink">{viewingStudent.name}</h3>
                <p className="text-xs text-charcoal/60 font-mono">{viewingStudent.studentId}</p>
              </div>
            </div>
          }
          description="Verified Scholar Record Details"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="secondary"
                size="md"
                onClick={() => {
                  const s = viewingStudent;
                  setViewingStudent(null);
                  handleOpenEdit(s);
                }}
                className="font-bold text-xs"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit This Record</span>
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setViewingStudent(null)}
                className="font-bold text-xs px-6"
              >
                Done
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs text-charcoal">
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-offwhite p-3.5 border border-charcoal/10">
              <div>
                <span className="text-[10px] font-bold uppercase text-charcoal/50 block">Account Status</span>
                <span className="font-bold text-ink">{viewingStudent.accountStatus}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-charcoal/50 block">Assigned Role</span>
                <span className="font-bold text-ink uppercase">Student</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-charcoal/50 block">Email</span>
                <span className="font-mono text-ink">{viewingStudent.email}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-charcoal/50 block">Phone</span>
                <span className="text-ink">{viewingStudent.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-charcoal/50 block">Institution</span>
                <span className="font-semibold text-ink">{viewingStudent.institution}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-charcoal/50 block">Department</span>
                <span className="font-semibold text-ink">{viewingStudent.department}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-bold uppercase text-charcoal/50 block">Academic Year</span>
                <span className="font-semibold text-ink">{viewingStudent.academicYear}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT STUDENT MODAL */}
      {editingStudent && (
        <Modal
          isOpen={Boolean(editingStudent)}
          onClose={() => setEditingStudent(null)}
          title="Edit Scholar Registration Record"
          description="Modify official academic records, university affiliation, department, or contact details."
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="md"
                onClick={() => setEditingStudent(null)}
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
                Save Record Changes
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs text-charcoal">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Student Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />

              <Input
                label="Student ID"
                value={editId}
                onChange={(e) => setEditId(e.target.value)}
                required
              />

              <Input
                label="Student Email Address"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
              />

              <Input
                label="Contact Phone"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                required
              />

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-charcoal mb-1">
                  Institution
                </label>
                <select
                  value={editInst}
                  onChange={(e) => setEditInst(e.target.value)}
                  className="w-full rounded-lg border border-charcoal/25 bg-white p-2.5 text-xs text-ink"
                >
                  {institutions.map((i) => (
                    <option key={i.id} value={i.name}>
                      {i.name} ({i.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">
                  Department
                </label>
                <select
                  value={editDept}
                  onChange={(e) => setEditDept(e.target.value)}
                  className="w-full rounded-lg border border-charcoal/25 bg-white p-2.5 text-xs text-ink"
                >
                  {departmentsList.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">
                  Academic Year
                </label>
                <select
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value as AdminStudentItem['academicYear'])}
                  className="w-full rounded-lg border border-charcoal/25 bg-white p-2.5 text-xs text-ink"
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* TOGGLE ACCOUNT STATUS CONFIRMATION MODAL */}
      {statusConfirmStudent && (
        <Modal
          isOpen={Boolean(statusConfirmStudent)}
          onClose={() => setStatusConfirmStudent(null)}
          title={`Confirm Account Status Change`}
          description={`Are you sure you want to change account status for ${statusConfirmStudent.name}?`}
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="md"
                onClick={() => setStatusConfirmStudent(null)}
              >
                Cancel
              </Button>
              <Button
                variant={statusConfirmStudent.accountStatus === 'Active' ? 'danger' : 'primary'}
                size="md"
                onClick={() => handleToggleStatus(statusConfirmStudent)}
                className="font-bold text-xs px-6"
              >
                {statusConfirmStudent.accountStatus === 'Active' ? 'Deactivate Account' : 'Activate Account'}
              </Button>
            </div>
          }
        >
          <div className="rounded-xl bg-offwhite p-4 border border-charcoal/15 text-xs text-charcoal space-y-2">
            <p>
              Current status: <strong>{statusConfirmStudent.accountStatus}</strong>
            </p>
            <p>
              Target new status:{' '}
              <strong className="text-ink">
                {statusConfirmStudent.accountStatus === 'Active' ? 'Inactive' : 'Active'}
              </strong>
            </p>
            <p className="text-[11px] text-charcoal/70">
              This action will immediately update portal login credentials and will be logged in the Administrative Activity Trail.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
