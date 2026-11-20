import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type {
  AvailabilitySummary,
  EventInvitation,
  StudentNotification,
  StudentProfile,
  StudentSession,
  WeeklyAvailability,
} from '../../types/student';
import { INITIAL_STUDENT_PROFILE } from '../../services/student/mockStudentData';
import { studentService } from '../../services/student/studentService';
import { getMonday, toISODateString } from '../../lib/utils';
import { authService } from '../../services/auth';
import { ToastContainer } from '../ui/Toast';
import { AvailabilityTab } from './AvailabilityTab';
import { InvitationsTab } from './InvitationsTab';
import { OverviewTab } from './OverviewTab';
import { ProfileTab } from './ProfileTab';
import { SessionsTab } from './SessionsTab';
import { Sidebar, type StudentNavTab } from './Sidebar';
import { TopNavbar } from './TopNavbar';

interface StudentLayoutProps {
  initialTab?: StudentNavTab;
}

export function StudentLayout({ initialTab = 'overview' }: StudentLayoutProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<StudentNavTab>(initialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data State
  const [profile, setProfile] = useState<StudentProfile>(INITIAL_STUDENT_PROFILE);
  const [summary, setSummary] = useState<AvailabilitySummary>({
    status: 'Updated',
    totalSlotsMarked: 18,
    availableHours: 11,
    unavailableHours: 7,
    upcomingInvitationsCount: 4,
    confirmedSessionsCount: 3,
    pendingResponsesCount: 2,
  });
  const [weeklyAvailability, setWeeklyAvailability] = useState<WeeklyAvailability | null>(null);
  const [invitations, setInvitations] = useState<EventInvitation[]>([]);
  const [sessions, setSessions] = useState<StudentSession[]>([]);
  const [notifications, setNotifications] = useState<StudentNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Toast feedback state
  const [toasts, setToasts] = useState<
    Array<{ id: string; type?: 'success' | 'error' | 'info'; title?: string; message: string }>
  >([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Data Fetch
  const loadDashboardData = async () => {
    try {
      const currentMondayStr = toISODateString(getMonday(new Date()));
      const [profData, sumData, availData, invData, sessData, notifData] = await Promise.all([
        studentService.getProfile(),
        studentService.getAvailabilitySummary(currentMondayStr),
        studentService.getWeeklyAvailability(currentMondayStr),
        studentService.getInvitations(),
        studentService.getUpcomingSessions(),
        studentService.getNotifications(),
      ]);

      setProfile(profData);
      setSummary(sumData);
      setWeeklyAvailability(availData);
      setInvitations(invData);
      setSessions(sessData);
      setNotifications(notifData);
    } catch (err) {
      addToast('Could not load complete student data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update Profile
  const handleUpdateProfile = async (updates: Partial<StudentProfile>) => {
    const updated = await studentService.updateProfile(updates);
    setProfile(updated);
  };

  // Respond to Invitation (Accept / Decline) with immediate reactive state update
  const handleRespondInvitation = async (id: string, status: 'Accepted' | 'Declined') => {
    const res = await studentService.respondToInvitation(id, status);

    // Update local invitations immediately
    setInvitations((prev) => prev.map((inv) => (inv.id === id ? res.invitation : inv)));

    // If accepted and created a session, add to sessions
    if (res.newSession) {
      setSessions((prev) => [res.newSession!, ...prev]);
    }

    // Refresh summary counts
    const currentMondayStr = toISODateString(getMonday(new Date()));
    const updatedSummary = await studentService.getAvailabilitySummary(currentMondayStr);
    setSummary(updatedSummary);
  };

  // Notification actions
  const handleMarkNotificationRead = async (id: string) => {
    await studentService.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllNotificationsRead = async () => {
    await studentService.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('All notifications marked as read', 'info');
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await authService.signOut();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const pendingInvitationsCount = invitations.filter((i) => i.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-offwhite text-ink font-sans antialiased">
      {/* Fixed Left Sidebar for Desktop & Mobile Drawer */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onLogout={handleLogout}
        pendingInvitationsCount={pendingInvitationsCount}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area: Offset by sidebar width on desktop */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Sticky Top Navigation */}
        <TopNavbar
          profile={profile}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          onNavigateTab={(tab) => setActiveTab(tab)}
          onLogout={handleLogout}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-sm font-semibold text-charcoal">
                <Loader2 className="h-8 w-8 animate-spin text-gold" />
                <p>Loading Maatram Sync Student Portal…</p>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewTab
                  summary={summary}
                  weeklyAvailability={weeklyAvailability}
                  sessions={sessions}
                  invitations={invitations}
                  notifications={notifications}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                  onAcceptInvitation={(id) => handleRespondInvitation(id, 'Accepted')}
                  onDeclineInvitation={(id) => handleRespondInvitation(id, 'Declined')}
                />
              )}

              {activeTab === 'availability' && (
                <AvailabilityTab
                  onShowToast={addToast}
                  onAvailabilitySaved={async () => {
                    const currentMondayStr = toISODateString(getMonday(new Date()));
                    const sum = await studentService.getAvailabilitySummary(currentMondayStr);
                    const avail = await studentService.getWeeklyAvailability(currentMondayStr);
                    setSummary(sum);
                    setWeeklyAvailability(avail);
                  }}
                />
              )}

              {activeTab === 'invitations' && (
                <InvitationsTab
                  invitations={invitations}
                  onRespond={handleRespondInvitation}
                  onShowToast={addToast}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'sessions' && (
                <SessionsTab
                  sessions={sessions}
                  onShowToast={addToast}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileTab
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
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
