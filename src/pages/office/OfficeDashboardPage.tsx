import { useParams } from 'react-router-dom';
import { OfficeLayout } from '../../components/office/OfficeLayout';
import type { OfficeNavTab } from '../../components/office/OfficeSidebar';

export default function OfficeDashboardPage() {
  const { tab } = useParams<{ tab?: string }>();
  const validTabs: OfficeNavTab[] = [
    'overview',
    'students',
    'analysis',
    'events',
    'invitations',
    'sessions',
  ];

  const initialTab = tab && validTabs.includes(tab as OfficeNavTab) ? (tab as OfficeNavTab) : 'overview';

  return <OfficeLayout initialTab={initialTab} />;
}
