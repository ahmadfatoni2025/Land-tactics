import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapView, type CheckIn } from '../../components/MapView';
import { useLocations } from '../../hooks/useLocations';
import { useAttendance } from '../../hooks/useAttendance';
import { useUserManagement } from '../../hooks/useUserManagement';
import {
  Search, MapPin, Clock, TreePine, User, ChevronRight,
  X, Camera, AlertTriangle, Filter, Loader2,
  Navigation, Plus, Minus
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Location, CheckInRecord, Profile } from '../../lib/types';

export const AdminMapDashboard = () => {
  const { fetchAllLocations } = useLocations();
  const { fetchCheckIns } = useAttendance();
  const { fetchAllUsers } = useUserManagement();

  const [locations, setLocations] = useState<Location[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [layer, setLayer] = useState<'standard' | 'satellite' | 'terrain'>('satellite');

  const loadData = useCallback(async () => {
    setLoading(true);
    const [locs, cis, usrs] = await Promise.all([
      fetchAllLocations(),
      fetchCheckIns(),
      fetchAllUsers(),
    ]);
    setLocations(locs);
    setCheckIns(cis);
    setUsers(usrs);
    setLoading(false);
  }, [fetchAllLocations, fetchCheckIns, fetchAllUsers]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Build map markers from check-ins
  const mapCheckIns = useMemo(() => {
    return checkIns
      .filter(ci => ci.lat && ci.lng)
      .filter(ci => {
        if (!search) return true;
        const q = search.toLowerCase();
        return ci.barcode_id?.toLowerCase().includes(q)
          || ci.asset_name?.toLowerCase().includes(q)
          || ci.address?.toLowerCase().includes(q);
      })
      .filter(ci => {
        if (!filterUser) return true;
        return ci.user_id === filterUser;
      });
  }, [checkIns, search, filterUser]);

  const getLocationCheckIns = (locId: string) =>
    checkIns.filter(ci => ci.location_id === locId);

  const getOwner = (userId?: string) =>
    users.find(u => u.id === userId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F4F8] font-sans">
      <main className="flex-1 relative flex flex-col overflow-hidden">

        {/* Map Background */}
        <div className="absolute inset-0 z-0">
          <MapView
            checkIns={mapCheckIns as CheckIn[]}
            layerType={layer}
            className="w-full h-full"
          />
        </div>

        {/* Top Controls */}
        <div className="relative z-10 p-4 sm:p-6 flex flex-col sm:flex-row items-start justify-between gap-4 pointer-events-none">
          <div className="flex flex-col gap-3 pointer-events-auto w-full max-w-xl">
            {/* Search Bar */}
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-xl p-2 pl-5 rounded-2xl shadow-2xl border border-white/50">
              <Search className="text-slate-400 shrink-0" size={18} />
              <input
                type="text"
                placeholder="Cari titik, lokasi, atau varietas..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-slate-700 placeholder:text-slate-400"
              />
              <div className="h-7 w-px bg-slate-100 mx-1" />
              <div className="flex bg-slate-50 p-0.5 rounded-xl">
                {(['satellite', 'standard', 'terrain'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLayer(l)}
                    className={cn(
                      "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                      layer === l ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {l.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="px-3 py-1.5 bg-white/80 backdrop-blur-md rounded-full text-[10px] font-bold text-slate-600 border border-white/50 shadow-sm appearance-none cursor-pointer pr-6 focus:outline-none"
              >
                <option value="">Semua user</option>
                {users.filter(u => u.role === 'user').map(u => (
                  <option key={u.id} value={u.id}>{u.full_name}</option>
                ))}
              </select>
              <div className="px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-full text-[10px] font-bold text-slate-600 border border-white/50 shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {locations.length} Titik
              </div>
              <div className="px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-full text-[10px] font-bold text-slate-600 border border-white/50 shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                {checkIns.length} Check-ins
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex flex-col gap-2 pointer-events-auto">
            <div className="flex flex-col bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 overflow-hidden">
              <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <Plus size={18} />
              </button>
              <div className="h-px bg-slate-100 mx-2" />
              <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <Minus size={18} />
              </button>
              <div className="h-px bg-slate-100 mx-2" />
              <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <Navigation size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Location Cards */}
        <div className="mt-auto relative z-10 p-4 sm:p-6 pt-0">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3 px-1 drop-shadow-sm">
            Semua Titik Lokasi ({locations.length})
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x">
            {locations.map((loc) => {
              const owner = getOwner(loc.user_id);
              const locCIs = getLocationCheckIns(loc.id);
              const lastUpdate = locCIs[0]?.created_at;
              return (
                <div
                  key={loc.id}
                  onClick={() => setSelectedLocation(loc)}
                  className="snap-start flex-none w-[300px] bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl p-4 cursor-pointer hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate group-hover:text-emerald-600 transition-colors">
                        {loc.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <User size={10} />
                        {owner?.full_name || 'Unknown'}
                      </p>
                    </div>
                    <div className={cn(
                      "px-2 py-0.5 rounded-md text-[8px] font-black uppercase",
                      loc.method === 'gps' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'
                    )}>
                      {loc.method}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                      <p className="text-xs font-black text-slate-800">{loc.tree_count}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">Pohon</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                      <p className="text-xs font-black text-slate-800">{locCIs.length}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">Update</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                      <p className="text-xs font-black text-slate-800">
                        {lastUpdate ? new Date(lastUpdate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) : '-'}
                      </p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase">Terakhir</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-mono text-slate-400 italic">
                      {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                    </span>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>
              );
            })}

            {locations.length === 0 && (
              <div className="w-full h-28 flex items-center justify-center bg-white/70 backdrop-blur-md rounded-2xl border border-dashed border-slate-200 text-slate-400 italic text-sm">
                <Filter size={20} className="mr-2 opacity-30" />
                Tidak ada data titik lokasi
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Location Detail Drawer */}
      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedLocation(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedLocation.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                  <User size={12} /> {getOwner(selectedLocation.user_id)?.full_name || 'Unknown'}
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <MapPin size={12} /> {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}
                </p>
              </div>
              <button onClick={() => setSelectedLocation(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-emerald-50 rounded-xl p-4 text-center">
                  <TreePine size={18} className="text-emerald-600 mx-auto mb-1" />
                  <p className="text-xl font-black text-emerald-800">{selectedLocation.tree_count}</p>
                  <p className="text-[10px] font-bold text-emerald-600/60 uppercase">Pohon</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <Camera size={18} className="text-blue-600 mx-auto mb-1" />
                  <p className="text-xl font-black text-blue-800">{getLocationCheckIns(selectedLocation.id).length}</p>
                  <p className="text-[10px] font-bold text-blue-600/60 uppercase">Update</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-4 text-center">
                  <Clock size={18} className="text-amber-600 mx-auto mb-1" />
                  <p className="text-sm font-black text-amber-800">
                    {(() => {
                      const last = getLocationCheckIns(selectedLocation.id)[0]?.created_at;
                      if (!last) return '-';
                      return new Date(last).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                    })()}
                  </p>
                  <p className="text-[10px] font-bold text-amber-600/60 uppercase">Terakhir</p>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">
                  Riwayat Pembaruan Per Periode
                </h4>
                <div className="space-y-4">
                  {getLocationCheckIns(selectedLocation.id).map((ci) => (
                    <div key={ci.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 shrink-0">
                        {ci.photo_url && <img src={ci.photo_url} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-gray-700">
                            {new Date(ci.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                          </p>
                          <span className={cn(
                            "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase",
                            ci.condition === 'sehat' || ci.condition === 'subur'
                              ? 'bg-emerald-100 text-emerald-700'
                              : ci.condition === 'layu' || ci.condition === 'mati'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-500'
                          )}>
                            {ci.condition || 'Normal'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {ci.tinggi_tanaman ? <span className="text-[9px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded">T: {ci.tinggi_tanaman}cm</span> : null}
                          {ci.diameter_batang ? <span className="text-[9px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded">D: {ci.diameter_batang}mm</span> : null}
                          {ci.jumlah_daun ? <span className="text-[9px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded">{ci.jumlah_daun} Daun</span> : null}
                          {ci.status_hama && ci.status_hama !== 'nihil' ? (
                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-0.5">
                              <AlertTriangle size={8} /> Hama: {ci.status_hama}
                            </span>
                          ) : null}
                        </div>
                        {ci.notes && <p className="text-[11px] text-gray-400 italic truncate">"{ci.notes}"</p>}
                      </div>
                    </div>
                  ))}
                  {getLocationCheckIns(selectedLocation.id).length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-8">Belum ada data pembaruan</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
