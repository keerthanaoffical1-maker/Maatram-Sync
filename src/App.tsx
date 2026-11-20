import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import OfficeDashboardPage from './pages/office/OfficeDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ROLE_HOME } from './lib/roles';

function RootRedirect() {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (user && role) {
    return <Navigate to={ROLE_HOME[role]} replace />;
  }
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Student Portal - Protected */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/:tab"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Office Team Dashboard - Protected */}
          <Route
            path="/office"
            element={
              <ProtectedRoute allowedRoles={['office']}>
                <OfficeDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/office/:tab"
            element={
              <ProtectedRoute allowedRoles={['office']}>
                <OfficeDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard - Protected */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/:tab"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
