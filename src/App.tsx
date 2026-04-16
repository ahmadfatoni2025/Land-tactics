import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UserDashboard } from './pages/user/UserDashboard';
import { InputDataPage } from './pages/user/InputDataPage';
import { AdminMapDashboard } from './pages/admin/AdminMapDashboard';
import { MonitoringUserPage } from './pages/admin/MonitoringUserPage';
import { AnalyticsMLPage } from './pages/admin/AnalyticsMLPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AssetsPage } from './pages/AssetsPage';
import { GenerateQRPage } from './pages/GenerateQRPage';
import { Loader2 } from 'lucide-react';

// Root redirect based on role
const RoleRedirect = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf9]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (profile?.role === 'admin') {
    return <Navigate to="/admin/map" replace />;
  }
  return <Navigate to="/user/dashboard" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Root redirect */}
          <Route path="/" element={
            <ProtectedRoute>
              <RoleRedirect />
            </ProtectedRoute>
          } />

          {/* Protected Layout */}
          <Route element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            {/* User Routes */}
            <Route path="/user/dashboard" element={
              <ProtectedRoute requiredRole="user">
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/user/input" element={
              <ProtectedRoute requiredRole="user">
                <InputDataPage />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/map" element={
              <ProtectedRoute requiredRole="admin">
                <AdminMapDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/monitoring" element={
              <ProtectedRoute requiredRole="admin">
                <MonitoringUserPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/analytics" element={
              <ProtectedRoute requiredRole="admin">
                <AnalyticsMLPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="admin">
                <UserManagementPage />
              </ProtectedRoute>
            } />

            {/* Shared Routes (accessible by both roles) */}
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/generate" element={<GenerateQRPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}