import { useParams } from 'react-router-dom';
import { StudentLayout } from '../../components/student/StudentLayout';
import type { StudentNavTab } from '../../components/student/Sidebar';

export default function StudentDashboardPage() {
  const { tab } = useParams<{ tab?: string }>();
  const validTabs: StudentNavTab[] = ['overview', 'availability', 'sessions', 'profile'];
  const initialTab = (tab && validTabs.includes(tab as StudentNavTab)) ? (tab as StudentNavTab) : 'overview';

  return <StudentLayout initialTab={initialTab} />;
}
