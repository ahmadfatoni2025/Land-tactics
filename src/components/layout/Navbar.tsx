import { NavLink } from 'react-router-dom';
import {
  Search, Bell, LayoutDashboard,
  Map as MapIcon, Scan, Boxes, Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { to: '/', label: 'Dasbor', icon: LayoutDashboard },
  { to: '/map', label: 'Peta', icon: MapIcon },
  { to: '/scanner', label: 'Scan', icon: Scan, primary: true },
  { to: '/assets', label: 'Assets', icon: Boxes },
  { to: '/generate', label: 'Add', icon: Plus },
];

export const Navbar = () => {
  return (
    <>
      {/* --- DESKTOP TOP NAVBAR --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 hidden md:block">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-8">
              <NavLink to="/" className="flex items-center gap-2.5 shrink-0">
                <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                  <span className="text-white font-black text-sm italic">G</span>
                </div>
                <span className="font-bold text-gray-900 tracking-tight">GeoAgri</span>
              </NavLink>

              <div className="flex items-center gap-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) => cn(
                      "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <Search size={20} />
              </button>
              <button className="relative p-2 text-gray-400 hover:text-gray-900 transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
              </button>
              <div className="h-8 w-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-100 transition-all">
                <div className="h-full w-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">AF</div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE TOP STATUS BAR (Logo Only) --- */}
      <div className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-50 px-6 py-4 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-black text-[10px] italic">G</span>
          </div>
          <span className="font-bold text-gray-900 text-sm tracking-tight">GeoAgri</span>
        </NavLink>
        <button className="p-2 bg-gray-50 rounded-full text-gray-400">
          <Bell size={18} />
        </button>
      </div>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="bg-white/95 backdrop-blur-xl border-t border-gray-100 rounded-t-[24px] px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => cn(
                    "relative flex flex-col items-center justify-center gap-1 transition-all duration-300",
                    item.primary ? "px-2" : "flex-1 py-2",
                    isActive && !item.primary ? "text-indigo-600" : "text-gray-400"
                  )}
                >
                  {({ isActive }) => (
                    <>
                      {item.primary ? (
                        <div className={cn(
                          "h-12 w-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 -mt-8 border-4 border-white",
                          isActive ? "bg-indigo-700 shadow-indigo-300" : "bg-indigo-600 shadow-indigo-200"
                        )}>
                          <Icon size={22} strokeWidth={isActive ? 3 : 2.5} />
                        </div>
                      ) : (
                        <>
                          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                          <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
                        </>
                      )}
                      {isActive && !item.primary && (
                        <div className="absolute -bottom-1 h-1 w-1 rounded-full bg-indigo-600"></div>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spacer for bottom navbar content overlap */}
      <div className="md:hidden h-20"></div>
    </>
  );
};

