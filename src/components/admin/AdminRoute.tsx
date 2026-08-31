import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F6F2]">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#E5E1D8] border-t-[#C9A646]" />
    </div>
  );
}

export function AdminRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AdminLoading />;
  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export function AdminLoginRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/admin';

  if (loading) return <AdminLoading />;
  if (user) return <Navigate to={from} replace />;

  return <Outlet />;
}
