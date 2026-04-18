import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Map as MapIcon, Scan, Boxes, Plus, LogIn, LogOut,
  HelpCircle, Settings, BarChart3, ChevronRight, Menu, X, Leaf
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';

export const Sidebar = () => {
  const { isLoggedIn, user, profile, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Dynamic navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      { to: '/', label: 'Home', icon: Leaf },
      { to: '/map', label: 'Peta', icon: MapIcon },
      { to: '/scanner', label: 'Scanner', icon: Scan },
      { to: '/assets', label: 'Aset', icon: Boxes },
    ];

    if (!isLoggedIn) {
      return baseItems;
    }

    if (isAdmin) {
      return [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ...baseItems,
        { to: '/generate', label: 'Tambah Aset', icon: Plus },
        { to: '/reports', label: 'Laporan', icon: BarChart3 },
      ];
    }

    // Role User
    return [
      { to: '/user-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ...baseItems,
    ];
  };

  const navItems = getNavItems();
  const homePath = isAdmin ? '/dashboard' : (isLoggedIn ? '/user-dashboard' : '/');

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 pt-8 pb-6">
        <NavLink to={homePath} className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <div className="h-10 w-10 rounded-2xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-200/50">
            <Leaf className="text-white" size={20} />
          </div>
          <div>
            <span className="font-bold text-[17px] text-gray-900 tracking-tight block leading-none">GeoAgri.</span>
            <span className="text-[10px] text-gray-400 font-medium">Smart Farming</span>
          </div>
        </NavLink>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Menu</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={true}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-green-50 text-green-700 font-semibold shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                    isActive ? "bg-green-500 text-white shadow-md shadow-green-200" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600"
                  )}>
                    <Icon size={16} />
                  </div>
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Settings Section */}
        {isLoggedIn && (
          <>
            <div className="pt-6 pb-2">
              <p className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em]">Pengaturan</p>
            </div>
            <NavLink
              to="/reports"
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-green-50 text-green-700 font-semibold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              )}
            >
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-100 text-gray-400 group-hover:bg-gray-200">
                <Settings size={16} />
              </div>
              <span>Pengaturan</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Help Center Card */}
      <div className="px-4 pb-4">
        <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <HelpCircle size={16} className="text-white" />
            </div>
            <span className="text-sm font-bold text-green-900">Pusat Bantuan</span>
          </div>
          <p className="text-xs text-green-700/70 leading-relaxed mb-3">
            Butuh bantuan? Hubungi kami untuk pertanyaan lebih lanjut.
          </p>
          <button className="w-full py-2.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow-md shadow-green-200/50 active:scale-[0.98]">
            Buka Panduan
          </button>
        </div>
      </div>

      {/* User Profile / Auth */}
      <div className="px-4 pb-6 pt-2 border-t border-gray-100 mt-2">
        {isLoggedIn ? (
          <div className="flex items-center gap-3 px-2 py-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-700 shrink-0">
              {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                {profile?.full_name || user?.email?.split('@')[0]}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-green-600">
                {profile?.role === 'admin' ? 'Administrator' : 'Pengguna'}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Keluar"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl text-sm font-bold transition-all shadow-md shadow-green-200/50"
          >
            <LogIn size={16} />
            Masuk
          </Link>
        )}
      </div>
    </div>
  );

  // Don't show sidebar on login/signup pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  if (isAuthPage) return null;

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-gray-100 z-40 flex-col shadow-[4px_0_24px_rgba(0,0,0,0.03)]">
        <SidebarContent />
      </aside>

      {/* --- MOBILE TOP BAR --- */}
      <div className="lg:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-5 py-3 flex items-center justify-between shadow-sm">
        <NavLink to={homePath} className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-green-500 flex items-center justify-center">
            <Leaf className="text-white" size={16} />
          </div>
          <span className="font-bold text-gray-900 text-sm tracking-tight">GeoAgri.</span>
        </NavLink>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl sidebar-transition overflow-y-auto">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 rounded-t-[20px] px-2 py-1.5">
          <div className="flex items-center justify-around">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/' || item.to === '/user-dashboard'}
                  className={({ isActive }) => cn(
                    "flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl transition-all",
                    isActive ? "text-green-600" : "text-gray-400"
                  )}
                >
                  {({ isActive }) => (
                    <>
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                        isActive ? "bg-green-50 text-green-600" : "text-gray-400"
                      )}>
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      </div>
                      <span className="text-[9px] font-semibold">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
      <div className="lg:hidden h-20" />
    </>
  );
};
