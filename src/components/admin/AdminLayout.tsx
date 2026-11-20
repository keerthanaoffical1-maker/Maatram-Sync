import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type {
  AdminActivityItem,
  AdminOverviewMetrics,
  AdminStudentItem,
  AdminUser,
  CategoryGroupItem,
  InstitutionItem,
} from '../../types/admin';
import {
  CURRENT_ADMIN_USER,
  INITIAL_ADMIN_METRICS,
} from '../../services/admin/mockAdminData';
import { adminService } from '../../services/admin/adminService';
import { authService } from '../../services/auth';
import { ToastContainer } from '../ui/Toast';
import { AdminActivityLogTab } from './AdminActivityLogTab';
import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminSidebar, type AdminNavTab } from './AdminSidebar';
import { AdminStudentDirectoryTab } from './AdminStudentDirectoryTab';
import { AdminTopNavbar } from './AdminTopNavbar';
import { CategoryManagementTab } from './CategoryManagementTab';
import { InstitutionManagementTab } from './InstitutionManagementTab';
import { StudentRegistrationTab } from './StudentRegistrationTab';

interface AdminLayoutProps {
  initialTab?: AdminNavTab;
}

export function AdminLayout({ initialTab = 'overview' }: AdminLayoutProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminNavTab>(initialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data State
  const [user] = useState<AdminUser>(CURRENT_ADMIN_USER);
  const [metrics, setMetrics] = useState<AdminOverviewMetrics>(INITIAL_ADMIN_METRICS);
  const [students, setStudents] = useState<AdminStudentItem[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionItem[]>([]);
  const [categories, setCategories] = useState<CategoryGroupItem[]>([]);
  const [activities, setActivities] = useState<AdminActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Global search query
  const [searchQuery, setSearchQuery] = useState('');

  // Toast notifications
  const [toasts, setToasts] = useState<
    Array<{ id: string; type?: 'success' | 'error' | 'info'; title?: string; message: string }>
  >([]);

  const addToast = (
    message: string,
    type: 'success' | 'error' | 'info' = 'success',
    title?: string,
  ) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync tab change with browser URL
  const handleSelectTab = (tab: AdminNavTab) => {
    setActiveTab(tab);
    navigate(`/admin/${tab}`, { replace: true });
  };

  // Initial Data Fetch
  const loadAdminData = async () => {
    try {
      const [metricsData, studentsData, instData, catData, actData] = await Promise.all([
        adminService.getOverviewMetrics(),
        adminService.getStudents(),
        adminService.getInstitutions(),
        adminService.getCategories(),
        adminService.getRecentActivities(),
      ]);

      setMetrics(metricsData);
      setStudents(studentsData);
      setInstitutions(instData);
      setCategories(catData);
      setActivities(actData);
    } catch {
      addToast('Could not load complete Admin data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.signOut();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const handleGlobalSearch = (query: string) => {
    setSearchQuery(query);
    handleSelectTab('students');
  };

  // Refresh helper
  const refreshMetricsAndActivities = async () => {
    try {
      const [m, a, inst, cat] = await Promise.all([
        adminService.getOverviewMetrics(),
        adminService.getRecentActivities(),
        adminService.getInstitutions(),
        adminService.getCategories(),
      ]);
      setMetrics(m);
      setActivities(a);
      setInstitutions(inst);
      setCategories(cat);
    } catch {
      // ignore
    }
  };

  // Student updates
  const handleStudentCreated = (newStudent: AdminStudentItem) => {
    setStudents((prev) => [newStudent, ...prev]);
    refreshMetricsAndActivities();
  };

  const handleStudentsBulkImported = (newStudents: AdminStudentItem[]) => {
    setStudents((prev) => [...newStudents, ...prev]);
    refreshMetricsAndActivities();
  };

  const handleStudentUpdated = (updatedStudent: AdminStudentItem) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)),
    );
    refreshMetricsAndActivities();
  };

  // Institution updates
  const handleInstitutionAdded = (newInst: InstitutionItem) => {
    setInstitutions((prev) => [...prev, newInst]);
    refreshMetricsAndActivities();
  };

  const handleInstitutionUpdated = (updatedInst: InstitutionItem) => {
    setInstitutions((prev) =>
      prev.map((i) => (i.id === updatedInst.id ? updatedInst : i)),
    );
    refreshMetricsAndActivities();
  };

  const handleInstitutionDeleted = (deletedId: string) => {
    setInstitutions((prev) => prev.filter((i) => i.id !== deletedId));
    refreshMetricsAndActivities();
  };

  // Category updates
  const handleCategoryAdded = (newCat: CategoryGroupItem) => {
    setCategories((prev) => [...prev, newCat]);
    refreshMetricsAndActivities();
  };

  const handleCategoryUpdated = (updatedCat: CategoryGroupItem) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)),
    );
    refreshMetricsAndActivities();
  };

  return (
    <div className="min-h-screen bg-offwhite text-ink font-sans antialiased">
      {/* Fixed Left Sidebar for Desktop & Mobile Drawer */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onLogout={handleLogout}
        totalStudentsCount={students.length}
        totalInstitutionsCount={institutions.length}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Sticky Top Navigation */}
        <AdminTopNavbar
          user={user}
          activities={activities}
          onNavigateTab={handleSelectTab}
          onGlobalSearch={handleGlobalSearch}
          onLogout={handleLogout}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-sm font-semibold text-charcoal">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
                <span>Loading Maatram Admin Portal…</span>
              </div>
            </div>
          ) : (
            <>
              {/* Tab 1: Overview Dashboard */}
              {activeTab === 'overview' && (
                <AdminOverviewTab
                  metrics={metrics}
                  recentStudents={students.slice(0, 5)}
                  institutions={institutions}
                  categories={categories}
                  activities={activities}
                  onNavigateTab={handleSelectTab}
                />
              )}

              {/* Tab 2: Student Registration (Single & Bulk CSV) */}
              {activeTab === 'registration' && (
                <StudentRegistrationTab
                  institutions={institutions}
                  categories={categories}
                  onStudentRegistered={handleStudentCreated}
                  onBulkImportCompleted={(count) => {
                    handleStudentsBulkImported([]);
                    addToast(`Successfully imported ${count} scholars into the directory!`, 'success');
                  }}
                  onShowToast={addToast}
                  onNavigateTab={handleSelectTab}
                />
              )}

              {/* Tab 3: Student Directory */}
              {activeTab === 'students' && (
                <AdminStudentDirectoryTab
                  students={students}
                  institutions={institutions}
                  categories={categories}
                  initialSearchQuery={searchQuery}
                  onStudentUpdated={handleStudentUpdated}
                  onShowToast={addToast}
                />
              )}

              {/* Tab 4: Institution Management */}
              {activeTab === 'institutions' && (
                <InstitutionManagementTab
                  institutions={institutions}
                  students={students}
                  onInstitutionAdded={handleInstitutionAdded}
                  onInstitutionUpdated={handleInstitutionUpdated}
                  onInstitutionDeleted={handleInstitutionDeleted}
                  onShowToast={addToast}
                />
              )}

              {/* Tab 5: Categories & Groups */}
              {activeTab === 'categories' && (
                <CategoryManagementTab
                  categories={categories}
                  onCategoryAdded={handleCategoryAdded}
                  onCategoryUpdated={handleCategoryUpdated}
                  onShowToast={addToast}
                />
              )}

              {/* Tab 6: Admin Activity Log */}
              {activeTab === 'activity' && (
                <AdminActivityLogTab logs={activities} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Toast Feedback */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
