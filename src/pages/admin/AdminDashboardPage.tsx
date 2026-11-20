import { useParams } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import type { AdminNavTab } from '../../components/admin/AdminSidebar';

export default function AdminDashboardPage() {
  const { tab } = useParams<{ tab?: string }>();
  const validTabs: AdminNavTab[] = [
    'overview',
    'registration',
    'students',
    'institutions',
    'categories',
    'activity',
  ];

  const initialTab = tab && validTabs.includes(tab as AdminNavTab) ? (tab as AdminNavTab) : 'overview';

  return <AdminLayout initialTab={initialTab} />;
}
