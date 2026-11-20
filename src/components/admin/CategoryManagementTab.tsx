import { useMemo, useState } from 'react';
import {
  Building2,
  Check,
  Edit2,
  FolderTree,
  GraduationCap,
  Info,
  Layers,
  Plus,
  Sparkles,
  Users,
} from 'lucide-react';
import type { CategoryGroupItem } from '../../types/admin';
import { adminService } from '../../services/admin/adminService';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';

interface CategoryManagementTabProps {
  categories: CategoryGroupItem[];
  onCategoryUpdated: (category: CategoryGroupItem) => void;
  onCategoryAdded: (category: CategoryGroupItem) => void;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function CategoryManagementTab({
  categories,
  onCategoryUpdated,
  onCategoryAdded,
  onShowToast,
}: CategoryManagementTabProps) {
  const [activeType, setActiveType] = useState<CategoryGroupItem['type']>('cohortGroup');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryGroupItem | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<CategoryGroupItem['type']>('cohortGroup');
  const [formDesc, setFormDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const currentCategories = useMemo(() => {
    return categories.filter((c) => c.type === activeType);
  }, [categories, activeType]);

  const handleOpenAdd = () => {
    setFormName('');
    setFormType(activeType);
    setFormDesc('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryGroupItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormType(cat.type);
    setFormDesc(cat.description || '');
    setFormError('');
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setSaving(true);
    try {
      const added = await adminService.addCategory({
        name: formName.trim(),
        type: formType,
        description: formDesc.trim(),
      });

      onCategoryAdded(added);
      onShowToast(`Category "${added.name}" created successfully!`, 'success');
      setIsAddModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to add category');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setSaving(true);
    try {
      const updated = await adminService.updateCategory(editingCategory.id, {
        name: formName.trim(),
        description: formDesc.trim(),
      });

      onCategoryUpdated(updated);
      onShowToast(`Category "${updated.name}" updated successfully!`, 'success');
      setEditingCategory(null);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 border border-charcoal/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-ink sm:text-2xl">
            Scholar Categorization & Taxonomies
          </h2>
          <p className="mt-1 text-xs text-charcoal/70 sm:text-sm">
            Configure academic batches, departments, and learning cohorts used across Student and Office modules.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenAdd}
          className="font-bold text-xs px-5 shadow-sm shrink-0 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Category</span>
        </Button>
      </div>

      {/* Shared Taxonomy Info Banner */}
      <div className="rounded-xl bg-gold/10 p-3.5 border border-gold/30 text-xs text-ink flex items-start gap-2.5">
        <Sparkles className="h-4 w-4 text-gold shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Shared Taxonomy Architecture:</strong> These categories are universally synchronized across the Maatram platform. The Office Team relies on these exact classifications to filter scholars and schedule targeted placement workshops.
        </p>
      </div>

      {/* Subtab Selector */}
      <div className="flex items-center rounded-xl bg-white p-1 border border-charcoal/15 shadow-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveType('cohortGroup')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all shrink-0 ${
            activeType === 'cohortGroup'
              ? 'bg-ink text-white shadow-xs'
              : 'text-charcoal hover:text-ink hover:bg-offwhite'
          }`}
        >
          <FolderTree className="h-4 w-4" />
          <span>Scholar Cohorts ({categories.filter((c) => c.type === 'cohortGroup').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveType('department')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all shrink-0 ${
            activeType === 'department'
              ? 'bg-ink text-white shadow-xs'
              : 'text-charcoal hover:text-ink hover:bg-offwhite'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>Departments ({categories.filter((c) => c.type === 'department').length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveType('academicYear')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all shrink-0 ${
            activeType === 'academicYear'
              ? 'bg-ink text-white shadow-xs'
              : 'text-charcoal hover:text-ink hover:bg-offwhite'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          <span>Academic Years ({categories.filter((c) => c.type === 'academicYear').length})</span>
        </button>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentCategories.map((cat) => (
          <Card
            key={cat.id}
            className="border-charcoal/15 shadow-sm hover:border-gold/60 transition-all flex flex-col justify-between"
          >
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-ink">{cat.name}</h3>
                <span className="rounded bg-gold/20 px-2 py-0.5 text-xs font-extrabold text-ink shrink-0">
                  {cat.studentCount} Scholars
                </span>
              </div>

              <p className="text-xs text-charcoal/70 leading-relaxed min-h-[36px]">
                {cat.description || 'Standard academic category classification for student targeting.'}
              </p>

              <div className="pt-2 border-t border-charcoal/10 flex items-center justify-between text-xs text-charcoal/60">
                <span>Created {cat.createdAt}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEdit(cat)}
                  className="text-xs font-bold"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Edit Name</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ADD / EDIT CATEGORY MODAL */}
      {(isAddModalOpen || editingCategory) && (
        <Modal
          isOpen={isAddModalOpen || Boolean(editingCategory)}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingCategory(null);
          }}
          title={editingCategory ? 'Edit Category' : 'Create New Taxonomy Category'}
          description="Categories are available immediately for student registration and event targeting."
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCategory(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                loading={saving}
                onClick={editingCategory ? handleSaveEdit : handleSaveAdd}
                className="font-bold text-xs px-6"
              >
                {editingCategory ? 'Save Changes' : 'Confirm & Create Category'}
              </Button>
            </div>
          }
        >
          <form onSubmit={editingCategory ? handleSaveEdit : handleSaveAdd} className="space-y-4 text-xs text-charcoal">
            {formError && (
              <div className="rounded-xl bg-red-50 p-3 text-red-900 border border-red-200">
                {formError}
              </div>
            )}

            {!editingCategory && (
              <div>
                <label className="block text-xs font-medium text-charcoal mb-1">
                  Taxonomy Type
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as CategoryGroupItem['type'])}
                  className="w-full rounded-lg border border-charcoal/25 bg-white p-2.5 text-xs text-ink"
                >
                  <option value="cohortGroup">Scholar Cohort Group</option>
                  <option value="department">Department / Branch</option>
                  <option value="academicYear">Academic Year</option>
                </select>
              </div>
            )}

            <Input
              label="Category Name"
              placeholder="e.g. Cloud & DevOps Cohort"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />

            <div>
              <label className="block text-xs font-medium text-charcoal mb-1">
                Description / Curriculum Focus
              </label>
              <textarea
                rows={3}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Briefly describe the purpose of this categorization…"
                className="w-full rounded-lg border border-charcoal/25 p-2.5 text-xs text-ink focus:border-ink focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
