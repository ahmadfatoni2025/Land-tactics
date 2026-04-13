import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapView, type CheckIn } from '../components/MapView';
import { useAttendance } from '../hooks/useAttendance';
import { Search, Filter, Scan, MapPin, ShieldCheck, Clock, Map, Mountain, Globe, TreePine } from 'lucide-react';

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
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
      {/* Peta */}
      {/* PENTING: Class z-0 ini sangat krusial agar z-[1000] di dalam div ini TIDAK merusak Navbar web. */}
      <div className="relative flex-1 min-h-[300px] z-0">
        <MapView
          checkIns={filtered}
          layerType={layer}
          focusLocation={focusLocation}
          fitBoundsTrigger={fitBoundsTrigger}
          showGreenZone={showZone}
          className="w-full h-full rounded-none"
        />

        {/* Pencarian */}
        <div className="absolute top-4 left-4 right-4 sm:right-auto sm:w-80 z-[1000]">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari aset & Tekan Enter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="w-full bg-white shadow-2xl rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold text-stone-800 border-2 border-transparent focus:border-indigo-500/30 outline-none transition-all placeholder:font-medium placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* Layer Peta (Dikonversi Menjadi Ikon Ala Google Maps) */}
        <div className="absolute top-20 left-4 z-[1000] flex flex-col gap-2">
          <button
            title="Peta Standar"
            onClick={() => setLayer('standard')}
            className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all shadow-xl backdrop-blur-md ${layer === 'standard' ? 'bg-indigo-600 text-white border border-indigo-500' : 'bg-white/90 text-stone-600 border border-white hover:bg-white hover:-translate-y-0.5'}`}
          >
            <Map size={20} />
          </button>
          <button
            title="Citra Satelit"
            onClick={() => setLayer('satellite')}
            className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all shadow-xl backdrop-blur-md ${layer === 'satellite' ? 'bg-indigo-600 text-white border border-indigo-500' : 'bg-white/90 text-stone-600 border border-white hover:bg-white hover:-translate-y-0.5'}`}
          >
            <Globe size={20} />
          </button>
          <button
            title="Medan / Topografi"
            onClick={() => setLayer('terrain')}
            className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all shadow-xl backdrop-blur-md ${layer === 'terrain' ? 'bg-indigo-600 text-white border border-indigo-500' : 'bg-white/90 text-stone-600 border border-white hover:bg-white hover:-translate-y-0.5'}`}
          >
            <Mountain size={20} />
          </button>

          {/* Separator */}
          <div className="w-11 h-px bg-stone-300/50 my-1"></div>

          {/* Toggle Zona Khusus */}
          <button 
            title="Zona Penghijauan / Konservasi"
            onClick={() => setShowZone(!showZone)}
            className={`h-11 w-11 flex items-center justify-center rounded-xl transition-all shadow-xl backdrop-blur-md ${showZone ? 'bg-emerald-500 text-white border border-emerald-400' : 'bg-white/90 text-emerald-600 border border-white hover:bg-emerald-50 hover:-translate-y-0.5'}`}
          >
            <TreePine size={20} />
          </button>
        </div>
      </div>

      {/* Sidebar Kanan */}
      <div className="w-full lg:w-96 bg-white border-t lg:border-t-0 lg:border-l border-stone-200/60 flex flex-col max-h-[50vh] lg:max-h-none">
        <div className="px-6 py-5 border-b border-stone-100">
          <h2 className="text-lg font-bold text-stone-800">Aktivitas Terbaru</h2>
          <p className="text-xs text-stone-400 mt-0.5">Log pemindaian real-time di seluruh sektor</p>
        </div>

        <div className="flex gap-2 px-6 py-3 border-b border-stone-50">
          <button className="flex-1 flex items-center justify-center gap-1.5 bg-stone-50 py-2 rounded-lg text-xs font-semibold text-stone-500 hover:bg-stone-100 transition-colors">
            <Filter size={12} /> Saring
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 bg-stone-50 py-2 rounded-lg text-xs font-semibold text-stone-500 hover:bg-stone-100 transition-colors">
            <Clock size={12} /> Terbaru
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {filtered.map((ci) => (
            <div key={ci.id} className="group">
              {/* Tambahkan event klik untuk otomatis terbang ke kordinat */}
              <div
                onClick={() => setFocusLocation([ci.lat, ci.lng])}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer border border-transparent hover:border-stone-100"
              >
                <div className="h-10 w-10 rounded-xl bg-teal/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Scan size={16} className="text-teal" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-stone-800 truncate">{ci.asset_name || ci.barcode_id}</p>
                    <span className="text-[10px] text-stone-400 shrink-0 ml-2 font-medium">
                      {new Date(ci.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-stone-400 mt-0.5 truncate">
                    ID: {ci.barcode_id}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <ShieldCheck size={10} className="text-teal" />
                    <span className="text-[9px] font-bold text-teal uppercase tracking-widest">Aman</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <MapPin size={24} className="text-stone-300 mx-auto mb-2" />
              <p className="text-sm text-stone-400">Tidak ada aktivitas ditemukan</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Unit Aktif</span>
            <span className="text-xs font-bold text-teal">{filtered.length} / {checkIns.length || '—'}</span>
          </div>
          <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal rounded-full transition-all duration-500"
              style={{ width: checkIns.length > 0 ? `${(filtered.length / checkIns.length) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
