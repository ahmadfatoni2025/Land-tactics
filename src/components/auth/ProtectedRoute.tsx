import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  if (!user && !loading) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    // If profile is missing but user exists, default to user role to avoid loop
    const userRole = profile?.role || 'user';
    if (userRole !== requiredRole) {
      const redirectPath = userRole === 'admin' ? '/admin/map' : '/user/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};
