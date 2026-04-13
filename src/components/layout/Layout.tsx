import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};
