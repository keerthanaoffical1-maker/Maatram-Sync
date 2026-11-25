import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type {
  EventPlan,
  OfficeActivityLog,
  OfficeOverviewMetrics,
  OfficeUser,
  StudentDirectoryItem,
} from '../../types/office';
import {
  CURRENT_OFFICE_USER,
  INITIAL_OFFICE_ACTIVITIES,
  INITIAL_OFFICE_METRICS,
} from '../../services/office/mockOfficeData';
import { officeService } from '../../services/office/officeService';
import { authService } from '../../services/auth';
import { ToastContainer } from '../ui/Toast';
import { AvailabilityAnalysisTab } from './AvailabilityAnalysisTab';
import { EventPlanningTab } from './EventPlanningTab';
import { OfficeOverviewTab } from './OfficeOverviewTab';
import { OfficeSidebar, type OfficeNavTab } from './OfficeSidebar';
import { OfficeTopNavbar } from './OfficeTopNavbar';
import { SessionManagementTab } from './SessionManagementTab';
import { StudentDirectoryTab } from './StudentDirectoryTab';

interface OfficeLayoutProps {
  initialTab?: OfficeNavTab;
}

export function OfficeLayout({ initialTab = 'overview' }: OfficeLayoutProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<OfficeNavTab>(initialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data State
  const [user] = useState<OfficeUser>(CURRENT_OFFICE_USER);
  const [metrics, setMetrics] = useState<OfficeOverviewMetrics>(INITIAL_OFFICE_METRICS);
  const [students, setStudents] = useState<StudentDirectoryItem[]>([]);
  const [events, setEvents] = useState<EventPlan[]>([]);
  const [activities, setActivities] = useState<OfficeActivityLog[]>(INITIAL_OFFICE_ACTIVITIES);
  const [loading, setLoading] = useState(true);

  // Search query propagated from TopNavbar
  const [searchQuery, setSearchQuery] = useState('');

  // Slot prefilled from Availability Analysis to Event Planning
  const [prefilledSlot, setPrefilledSlot] = useState<{
    date: string;
    timeSlot: string;
    slotId: string;
    durationHours?: number;
    targetCriteria?: any;
  } | null>(null);

  // Toast feedback state
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

  // Initial Data Fetch
  const loadDashboardData = async () => {
    try {
      const [metricsData, studentsData, eventsData, activitiesData] = await Promise.all([
        officeService.getOverviewMetrics(),
        officeService.getStudents(),
        officeService.getEvents(),
        officeService.getRecentActivities(),
      ]);

      setMetrics(metricsData);
      setStudents(studentsData);
      setEvents(eventsData);
      setActivities(activitiesData);
    } catch {
      addToast('Could not load complete Office Team data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
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
    setActiveTab('students');
  };

  const handlePlanEventWithSlot = (slot: {
    date: string;
    timeSlot: string;
    slotId: string;
    durationHours?: number;
    targetCriteria?: any;
  }) => {
    setPrefilledSlot(slot);
    setActiveTab('events');
    addToast(
      `Pre-filled event time with ${slot.date} (${slot.timeSlot}). Complete event details to schedule!`,
      'info',
    );
  };

  const handleEventCreated = (newEvent: EventPlan) => {
    setEvents((prev) => [newEvent, ...prev]);
    // Refresh metrics
    officeService.getOverviewMetrics().then(setMetrics);
    officeService.getRecentActivities().then(setActivities);
  };

  const upcomingSessions = events.filter((e) => e.status !== 'Draft' && e.status !== 'Cancelled');

  return (
    <div className="min-h-screen bg-offwhite text-ink font-sans antialiased">
      {/* Fixed Left Sidebar for Desktop & Mobile Drawer */}
      <OfficeSidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          navigate(`/office/${tab}`, { replace: true });
        }}
        onLogout={handleLogout}
        upcomingSessionsCount={upcomingSessions.length}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Sticky Top Navigation */}
        <OfficeTopNavbar
          user={user}
          activities={activities}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
            navigate(`/office/${tab}`, { replace: true });
          }}
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
                <p>Loading Maatram Sync Office Suite…</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OfficeOverviewTab
                  metrics={metrics}
                  events={events}
                  activities={activities}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                    navigate(`/office/${tab}`, { replace: true });
                  }}
                />
              )}

              {activeTab === 'students' && (
                <StudentDirectoryTab
                  students={students}
                  initialSearchQuery={searchQuery}
                />
              )}

              {activeTab === 'analysis' && (
                <AvailabilityAnalysisTab
                  onPlanEventWithSlot={handlePlanEventWithSlot}
                  onShowToast={addToast}
                />
              )}

              {activeTab === 'events' && (
                <EventPlanningTab
                  events={events}
                  students={students}
                  prefilledSlot={prefilledSlot}
                  onClearPrefilledSlot={() => setPrefilledSlot(null)}
                  onEventCreated={handleEventCreated}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                    navigate(`/office/${tab}`, { replace: true });
                  }}
                  onShowToast={addToast}
                />
              )}

              {activeTab === 'sessions' && (
                <SessionManagementTab
                  sessions={upcomingSessions}
                  onRefresh={() => {
                    officeService.getEvents().then(setEvents);
                    officeService.getOverviewMetrics().then(setMetrics);
                  }}
                  onShowToast={addToast}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Interactive Feedback Toasts */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
