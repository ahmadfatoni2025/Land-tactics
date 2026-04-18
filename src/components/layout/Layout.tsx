import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="min-h-screen bg-[#f5f7f6]">
      <Sidebar />
      <main className={isAuthPage ? '' : 'lg:ml-[260px]'}>
        <Outlet />
      </main>
    </div>
  );
};
