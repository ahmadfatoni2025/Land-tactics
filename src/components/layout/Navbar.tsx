import { NavLink } from 'react-router-dom';
import { Search, Bell, HelpCircle, Menu, X, QrCode } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', label: 'Dasbor' },
  { to: '/scanner', label: 'Pemindai' },
  { to: '/map', label: 'Peta' },
  { to: '/assets', label: 'Aset' },
  { to: '/generate', label: 'Generate QR' },
  { to: '/reports', label: 'Laporan' },
];

export const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-stone-200/60">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Kiri: Logo + Navigasi */}
            <div className="flex items-center gap-8">
              <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
                <div className="h-9 w-9 rounded-full bg-teal flex items-center justify-center shadow-lg shadow-teal/20">
                  <span className="text-white font-black text-sm">G</span>
                </div>
              </NavLink>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-teal text-white shadow-md shadow-teal/15"
                        : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                    )}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Kanan: Aksi */}
            <div className="flex items-center gap-3">
              <button className="hidden md:flex items-center gap-2 text-stone-400 hover:text-stone-600 text-sm font-medium transition-colors px-3 py-1.5">
                <HelpCircle size={16} />
                <span>Bantuan</span>
              </button>

              <button className="hidden sm:flex p-2.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all">
                <Search size={18} />
              </button>

              <button className="relative p-2.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all">
                <Bell size={18} />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber border-2 border-white"></span>
              </button>

              <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-teal/20 shadow-sm cursor-pointer hover:border-teal/40 transition-all">
                <div className="h-full w-full bg-gradient-to-br from-amber to-amber-light flex items-center justify-center">
                  <span className="text-white text-xs font-black">AF</span>
                </div>
              </div>

              {/* Menu Mobile */}
              <button
                className="md:hidden p-2 text-stone-500 hover:bg-stone-100 rounded-xl"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu Dropdown Mobile */}
        {mobileOpen && (
          <div className="md:hidden border-t border-stone-100 bg-white pb-4 px-4 pt-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  "block px-4 py-3 rounded-2xl text-sm font-semibold transition-all",
                  isActive
                    ? "bg-teal text-white"
                    : "text-stone-600 hover:bg-stone-50 active:bg-stone-100"
                )}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>
    </>
  );
};
