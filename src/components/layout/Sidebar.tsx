import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, MapPin, Users, BarChart3, UserCog,
  PenLine, LogOut, ChevronLeft, ChevronRight, Menu, X,
  TreePine
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState } from 'react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const userNavItems: NavItem[] = [
  { to: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/user/input', label: 'Input Data', icon: PenLine },
];

const adminNavItems: NavItem[] = [
  { to: '/admin/map', label: 'Dashboard Peta', icon: MapPin },
  { to: '/admin/monitoring', label: 'Monitoring User', icon: Users },
  { to: '/admin/analytics', label: 'Analitik', icon: BarChart3 },
  { to: '/admin/users', label: 'Manajemen Akun', icon: UserCog },
];

export const Sidebar = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';
  const navItems = isAdmin ? adminNavItems : userNavItems;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-6 py-6 border-b border-white/[0.06]",
        collapsed && "justify-center px-4"
      )}>
        <div className="h-10 w-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/40 shrink-0">
          <TreePine size={20} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="font-bold text-white text-[15px] tracking-tight block">GeoAgri</span>
            <span className="text-[9px] font-bold text-emerald-400/60 uppercase tracking-widest">
              {isAdmin ? 'Admin Panel' : 'Field Officer'}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 mb-3 text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">
            {isAdmin ? 'Administrasi' : 'Menu Utama'}
          </p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group relative",
                collapsed && "justify-center px-2",
                isActive
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-emerald-500 rounded-r-full" />
              )}
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {item.badge && !collapsed && (
                <span className="ml-auto px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full">
                  {item.badge}
                </span>
              )}
              {/* Tooltip for collapsed mode */}
              {collapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-xl z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden md:block px-3 py-2 border-t border-white/[0.06]">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all text-xs font-semibold"
        >
          {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Ciutkan</span></>}
        </button>
      </div>

      {/* User Profile + Logout */}
      <div className={cn(
        "px-4 py-4 border-t border-white/[0.06]",
        collapsed && "px-2"
      )}>
        <div className={cn(
          "flex items-center gap-3 mb-3",
          collapsed && "justify-center"
        )}>
          <div className="h-9 w-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-black shrink-0">
            {profile?.full_name?.slice(0, 2).toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{profile?.full_name || 'User'}</p>
              <p className="text-[10px] font-semibold text-emerald-400/60 uppercase tracking-wider">
                {isAdmin ? 'Administrator' : 'Petugas Lapangan'}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={signOut}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all",
            collapsed && "justify-center"
          )}
        >
          <LogOut size={14} />
          {!collapsed && <span>Keluar</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#0f1512] border border-white/10 rounded-xl text-white/60 hover:text-white shadow-xl"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div
            className="w-[280px] h-full bg-[#0f1512] border-r border-white/[0.06] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white/80 transition-colors"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={cn(
        "hidden md:flex flex-col h-screen sticky top-0 bg-[#0f1512] border-r border-white/[0.06] transition-all duration-300 shrink-0",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}>
        <SidebarContent />
      </aside>
    </>
  );
};
