import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapView, type CheckIn } from '../components/MapView';
import { useAttendance } from '../hooks/useAttendance';
import {
  Search, Filter, Scan, MapPin, ShieldCheck, Clock, Map, Mountain,
  Globe, TreePine, Plus, Minus, ChevronLeft, ChevronRight,
  Navigation, Sprout, Leaf, Trees
} from 'lucide-react';
import { cn } from '../lib/utils';

export const MapPage = () => {
  const { fetchCheckIns } = useAttendance();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [search, setSearch] = useState('');
  const [layer, setLayer] = useState<'standard' | 'satellite' | 'terrain'>('satellite');

  // State untuk pergerakan peta interaktif
  const [focusLocation, setFocusLocation] = useState<[number, number] | null>(null);
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState(0);
  const [showZone, setShowZone] = useState(false);

  const loadData = useCallback(async () => {
    const data = await fetchCheckIns();
    setCheckIns(data);
  }, [fetchCheckIns]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    return checkIns.filter((c) =>
      c.barcode_id.toLowerCase().includes(search.toLowerCase()) ||
      (c.asset_name && c.asset_name.toLowerCase().includes(search.toLowerCase()))
    );
  }, [checkIns, search]);

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (filtered.length === 1) {
        setFocusLocation([filtered[0].lat, filtered[0].lng]);
      } else if (filtered.length > 1) {
        setFitBoundsTrigger(prev => prev + 1);
      }
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#F0F4F8] font-sans">
      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 relative flex flex-col overflow-hidden">

        {/* MAP COMPONENT (Full Background) */}
        <div className="absolute inset-0 z-0">
          <MapView
            checkIns={filtered}
            layerType={layer}
            focusLocation={focusLocation}
            fitBoundsTrigger={fitBoundsTrigger}
            showGreenZone={showZone}
            className="w-full h-full"
          />
        </div>

        {/* TOP OVERLAY CONTROLS */}
        <div className="relative z-10 p-6 flex items-start justify-between pointer-events-none">
          {/* Search & Breadcrumb Wrap */}
          <div className="flex flex-col gap-4 pointer-events-auto w-full max-w-xl">
            {/* Dynamic Search Bar */}
            <div className="flex items-center gap-4 bg-white/90 backdrop-blur-xl p-2 pl-6 rounded-[24px] shadow-2xl border border-white/50">
              <Search className="text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Cari Batch ID, Lokasi, atau Varietas..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearchSubmit}
                className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-400"
              />
              <div className="h-8 w-px bg-slate-100 mx-2"></div>
              <div className="flex bg-slate-50 p-1 rounded-[16px]">
                {['satellite', 'standard', 'terrain'].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLayer(l as any)}
                    className={cn(
                      "px-4 py-1.5 rounded-[12px] text-[10px] font-black uppercase tracking-wider transition-all",
                      layer === l ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {l.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Slogan / Chips */}
            <div className="flex gap-2">
              {['Active Batches', 'Pest Warnings', 'High Humidity Zone'].map(chip => (
                <div key={chip} className="px-4 py-2 bg-white/70 backdrop-blur-md rounded-full text-[10px] font-bold text-slate-600 border border-white/50 shadow-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  {chip}
                </div>
              ))}
            </div>
          </div>

          {/* Right Floating Actions */}
          <div className="flex flex-col gap-3 pointer-events-auto">
            <button
              onClick={() => setShowZone(!showZone)}
              className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all active:scale-95 backdrop-blur-xl border border-white/50",
                showZone ? "bg-emerald-600 text-white" : "bg-white/90 text-emerald-600 hover:bg-emerald-50"
              )}
              title="Toggle Zona Hijau"
            >
              <TreePine size={24} />
            </button>
            <div className="flex flex-col bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden mt-2">
              <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"><Plus size={20} /></button>
              <div className="h-px bg-slate-100 mx-3"></div>
              <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"><Minus size={20} /></button>
              <div className="h-px bg-slate-100 mx-3"></div>
              <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"><Navigation size={20} /></button>
            </div>
          </div>
        </div>

        {/* BOTTOM CAROUSEL (Horizontal List) */}
        <div className="mt-auto relative z-10 p-6 pt-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest px-2 drop-shadow-sm">Aset Terdekat di Sekitar Anda</h3>
            <div className="flex gap-2">
              <button className="p-2 bg-white/80 backdrop-blur-md rounded-xl text-slate-400 hover:text-slate-900 shadow-sm"><ChevronLeft size={16} /></button>
              <button className="p-2 bg-white/80 backdrop-blur-md rounded-xl text-slate-400 hover:text-slate-900 shadow-sm"><ChevronRight size={16} /></button>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
            {filtered.map((ci) => (
              <div
                key={ci.id}
                onClick={() => setFocusLocation([ci.lat, ci.lng])}
                className="snap-start flex-none w-[340px] bg-white/90 backdrop-blur-xl rounded-[28px] border border-white/50 shadow-2xl p-3 flex gap-4 cursor-pointer hover:-translate-y-1 transition-all group"
              >
                <div className="relative w-32 h-32 shrink-0 rounded-[20px] overflow-hidden shadow-inner">
                  <img src={ci.photo_url} alt={ci.asset_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className={cn(
                    "absolute top-2 left-2 px-2 py-1 rounded-lg text-[8px] font-black uppercase text-white shadow-lg",
                    ci.condition === 'subur' ? 'bg-emerald-500' : ci.condition === 'layu' ? 'bg-amber-500' : 'bg-indigo-500'
                  )}>
                    {ci.condition || 'Normal'}
                  </div>
                </div>

                <div className="flex-1 py-1 flex flex-col justify-between pr-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{ci.asset_name || ci.barcode_id}</h4>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 tracking-tight italic">ID: {ci.barcode_id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 mt-2">
                    <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                      <Clock size={12} className="text-indigo-500" />
                      <span className="text-[9px] font-bold text-slate-500">{new Date(ci.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                      <MapPin size={12} className="text-rose-500" />
                      <span className="text-[9px] font-bold text-slate-500 px-1 truncate">Sektor {ci.barcode_id.slice(0, 3)}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-600 tracking-tighter italic">Batch Verified</span>
                    <button className="h-7 w-7 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                      <Navigation size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="w-full h-32 flex flex-col items-center justify-center bg-white/70 backdrop-blur-md rounded-[28px] border border-dashed border-slate-200 text-slate-400 italic">
                <Filter size={24} className="mb-2 opacity-30" />
                Tidak ada data yang sesuai filter
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
