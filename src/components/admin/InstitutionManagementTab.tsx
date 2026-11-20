import { useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  Edit2,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  Power,
  Search,
  ShieldAlert,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import type { AdminStudentItem, InstitutionItem } from '../../types/admin';
import { adminService } from '../../services/admin/adminService';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface InstitutionManagementTabProps {
  institutions: InstitutionItem[];
  students: AdminStudentItem[];
  onInstitutionUpdated: (institution: InstitutionItem) => void;
  onInstitutionAdded: (institution: InstitutionItem) => void;
  onInstitutionDeleted: (id: string) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function InstitutionManagementTab({
  institutions,
  students,
  onInstitutionUpdated,
  onInstitutionAdded,
  onInstitutionDeleted,
  onShowToast,
}: InstitutionManagementTabProps) {
  const [search, setSearch] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingInst, setEditingInst] = useState<InstitutionItem | null>(null);
  const [viewingScholarsInst, setViewingScholarsInst] = useState<InstitutionItem | null>(null);
  const [deletingInst, setDeletingInst] = useState<InstitutionItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formContactEmail, setFormContactEmail] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Filtered institutions
  const filtered = useMemo(() => {
    return institutions.filter((inst) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        inst.name.toLowerCase().includes(q) ||
        inst.code.toLowerCase().includes(q) ||
        inst.location.toLowerCase().includes(q) ||
        inst.contactPerson.toLowerCase().includes(q)
      );
    });
  }, [institutions, search]);

  const handleOpenAdd = () => {
    setFormName('');
    setFormCode('');
    setFormLocation('Tamil Nadu, India');
    setFormContactPerson('');
    setFormContactEmail('');
    setFormContactPhone('');
    setFormWebsite('');
    setFormStatus('Active');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (inst: InstitutionItem) => {
    setEditingInst(inst);
    setFormName(inst.name);
    setFormCode(inst.code);
    setFormLocation(inst.location);
    setFormContactPerson(inst.contactPerson);
    setFormContactEmail(inst.contactEmail);
    setFormContactPhone(inst.contactPhone);
    setFormWebsite(inst.website || '');
    setFormStatus(inst.status);
    setFormError('');
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      setFormError('Institution name and code are required.');
      return;
    }

    setSaving(true);
    try {
      const added = await adminService.addInstitution({
        name: formName.trim(),
        code: formCode.trim(),
        location: formLocation.trim(),
        contactPerson: formContactPerson.trim(),
        contactEmail: formContactEmail.trim(),
        contactPhone: formContactPhone.trim(),
        website: formWebsite.trim(),
        status: formStatus,
      });

      onInstitutionAdded(added);
      onShowToast(`Institution "${added.name}" added successfully!`, 'success');
      setIsAddModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to add institution');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInst) return;

    setSaving(true);
    try {
      const updated = await adminService.updateInstitution(editingInst.id, {
        name: formName.trim(),
        code: formCode.trim(),
        location: formLocation.trim(),
        contactPerson: formContactPerson.trim(),
        contactEmail: formContactEmail.trim(),
        contactPhone: formContactPhone.trim(),
        website: formWebsite.trim(),
        status: formStatus,
      });

      onInstitutionUpdated(updated);
      onShowToast(`Institution "${updated.name}" updated successfully!`, 'success');
      setEditingInst(null);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update institution');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (inst: InstitutionItem) => {
    try {
      const updated = await adminService.toggleInstitutionStatus(inst.id);
      onInstitutionUpdated(updated);
      onShowToast(`Institution "${updated.name}" status set to ${updated.status}.`, 'info');
    } catch (err: any) {
      onShowToast(err.message || 'Failed to toggle status', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingInst) return;
    try {
      await adminService.deleteInstitution(deletingInst.id);
      onInstitutionDeleted(deletingInst.id);
      onShowToast(`Institution "${deletingInst.name}" removed successfully.`, 'info');
      setDeletingInst(null);
    } catch (err: any) {
      onShowToast(err.message || 'Could not delete institution', 'error');
    }
  };

  // Scholars in viewing institution
  const scholarsInInst = useMemo(() => {
    if (!viewingScholarsInst) return [];
    return students.filter(
      (s) => s.institution.toLowerCase().trim() === viewingScholarsInst.name.toLowerCase().trim(),
    );
  }, [students, viewingScholarsInst]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 border border-charcoal/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-ink sm:text-2xl">
            Partner Engineering Institutions
          </h2>
          <p className="mt-1 text-xs text-charcoal/70 sm:text-sm">
            Maintain affiliated colleges, liaison contacts, student rosters, and active partnership statuses.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenAdd}
          className="font-bold text-xs px-5 shadow-sm shrink-0 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Institution</span>
        </Button>
      </div>

      {/* Search and Counts Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/45" />
          <input
            type="text"
            placeholder="Search institutions by name, code, or location…"
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

        <span className="text-xs text-charcoal/70 self-end sm:self-auto">
          Showing <strong className="text-ink">{filtered.length}</strong> of{' '}
          {institutions.length} partner institutions
        </span>
      </div>

      {/* Institutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((inst) => (
          <Card
            key={inst.id}
            className="border-charcoal/15 shadow-sm hover:border-gold/60 transition-all flex flex-col justify-between"
          >
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="rounded bg-gold px-2.5 py-1 text-xs font-black text-ink shadow-xs">
                    {inst.code}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-ink leading-snug">{inst.name}</h3>
                    <p className="text-[11px] text-charcoal/60 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-gold shrink-0" />
                      <span>{inst.location}</span>
                    </p>
                  </div>
                </div>

                <Badge variant={inst.status === 'Active' ? 'success' : 'charcoal'} size="sm" dot>
                  {inst.status}
                </Badge>
              </div>

              {/* Contact and Registered Count Details */}
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-offwhite p-3 border border-charcoal/10 text-xs text-charcoal">
                <div>
                  <span className="text-[10px] text-charcoal/50 uppercase font-bold block">
                    Contact Liaison
                  </span>
                  <p className="font-semibold text-ink truncate">{inst.contactPerson}</p>
                  <p className="text-[11px] text-charcoal/60 truncate">{inst.contactEmail}</p>
                </div>

                <div>
                  <span className="text-[10px] text-charcoal/50 uppercase font-bold block">
                    Enrolled Scholars
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewingScholarsInst(inst)}
                    className="font-extrabold text-sm text-ink hover:text-gold flex items-center gap-1"
                  >
                    <span>{inst.registeredStudentCount} Scholars</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                  <p className="text-[10px] text-charcoal/50">Click to view student list</p>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-charcoal/10">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenEdit(inst)}
                    className="text-xs font-semibold"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>Edit</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(inst)}
                    className="text-xs"
                  >
                    <Power className="h-3 w-3" />
                    <span>{inst.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingInst(inst)}
                  className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete Institution (Protected)"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ADD / EDIT INSTITUTION MODAL */}
      {(isAddModalOpen || editingInst) && (
        <Modal
          isOpen={isAddModalOpen || Boolean(editingInst)}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingInst(null);
          }}
          title={editingInst ? `Edit Institution: ${editingInst.code}` : 'Add New Partner Institution'}
          description="Register university liaison information, official codes, and location."
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingInst(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                loading={saving}
                onClick={editingInst ? handleSaveEdit : handleSaveAdd}
                className="font-bold text-xs px-6"
              >
                {editingInst ? 'Save Institution Changes' : 'Confirm & Add Institution'}
              </Button>
            </div>
          }
        >
          <form onSubmit={editingInst ? handleSaveEdit : handleSaveAdd} className="space-y-4 text-xs text-charcoal">
            {formError && (
              <div className="rounded-xl bg-red-50 p-3 text-red-900 border border-red-200">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Institution Full Name"
                  placeholder="e.g. College of Engineering, Guindy"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                />
              </div>

              <div>
                <Input
                  label="Institution Code"
                  placeholder="e.g. CEG"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <Input
                  label="Campus Location / District"
                  placeholder="e.g. Anna University, Chennai, Tamil Nadu"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <Input
                  label="Liaison Contact Person / Dean"
                  placeholder="e.g. Dr. K. Senthil Kumar"
                  value={formContactPerson}
                  onChange={(e) => setFormContactPerson(e.target.value)}
                  required
                />
              </div>

              <div>
                <Input
                  label="Contact Email"
                  type="email"
                  placeholder="dean@institution.edu"
                  value={formContactEmail}
                  onChange={(e) => setFormContactEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <Input
                  label="Contact Phone"
                  placeholder="+91 44 2235 7000"
                  value={formContactPhone}
                  onChange={(e) => setFormContactPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Inactive')}
                  className="w-full rounded-lg border border-charcoal/25 bg-white p-2.5 text-xs text-ink"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* VIEW SCHOLARS MODAL */}
      {viewingScholarsInst && (
        <Modal
          isOpen={Boolean(viewingScholarsInst)}
          onClose={() => setViewingScholarsInst(null)}
          title={`Scholars Enrolled at ${viewingScholarsInst.name}`}
          description={`${scholarsInInst.length} registered scholars currently affiliated with this institution.`}
          maxWidth="lg"
          footer={
            <Button
              variant="primary"
              size="md"
              onClick={() => setViewingScholarsInst(null)}
              className="font-bold text-xs"
            >
              Close Roster
            </Button>
          }
        >
          <div className="space-y-3">
            {scholarsInInst.length === 0 ? (
              <p className="py-6 text-center text-xs text-charcoal/60">
                No scholars currently enrolled at this institution.
              </p>
            ) : (
              <div className="max-h-72 overflow-y-auto divide-y divide-charcoal/10 rounded-xl border border-charcoal/15 bg-white">
                {scholarsInInst.map((s) => (
                  <div key={s.id} className="p-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-ink">{s.name}</p>
                      <p className="font-mono text-[10px] text-charcoal/60">
                        {s.studentId} • {s.department}
                      </p>
                    </div>
                    <Badge variant="gold" size="sm">
                      {s.academicYear}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* DELETE INSTITUTION PROTECTION MODAL */}
      {deletingInst && (
        <Modal
          isOpen={Boolean(deletingInst)}
          onClose={() => setDeletingInst(null)}
          title="Delete Institution Protection Check"
          description="Verifying registered scholar dependencies before deletion."
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="md"
                onClick={() => setDeletingInst(null)}
              >
                Close
              </Button>
              {deletingInst.registeredStudentCount === 0 && (
                <Button
                  variant="danger"
                  size="md"
                  onClick={handleConfirmDelete}
                  className="font-bold text-xs"
                >
                  Confirm Delete Institution
                </Button>
              )}
            </div>
          }
        >
          {deletingInst.registeredStudentCount > 0 ? (
            <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0" />
                <div>
                  <p className="font-bold text-sm">Deletion Blocked: Associated Scholars Present</p>
                  <p className="mt-1 leading-relaxed">
                    Cannot delete institution <strong>"{deletingInst.name}"</strong> because it currently has{' '}
                    <strong>{deletingInst.registeredStudentCount} active registered scholars</strong>.
                  </p>
                  <p className="mt-2 text-[11px] text-amber-800">
                    To delete this institution, you must first reassign these {deletingInst.registeredStudentCount} scholars to another institution in the Student Directory.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-xs text-red-900 space-y-2">
              <p className="font-bold text-sm">Are you sure you want to delete "{deletingInst.name}"?</p>
              <p>This institution has 0 enrolled scholars and can be safely removed.</p>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
