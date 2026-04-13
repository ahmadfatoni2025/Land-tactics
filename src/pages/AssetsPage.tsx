import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAttendance } from '../hooks/useAttendance';
import {
  Search, Filter, MapPin, Clock, MoreHorizontal, Box,
  ChevronLeft, ChevronRight, Plus, Leaf
} from 'lucide-react';

// Karena CheckIn interface di MapView sudah diupdate, kita butuh definisi yang sama:
interface AssetRecord {
  id: string;
  barcode_id: string;
  asset_name?: string;
  lat: number;
  lng: number;
  photo_url: string;
  condition?: string;
  created_at: string;
}

export const AssetsPage = () => {
  const { fetchCheckIns } = useAttendance();
  const [checkIns, setCheckIns] = useState<AssetRecord[]>([]);
  const [search, setSearch] = useState('');

  const loadData = useCallback(async () => {
    const data = await fetchCheckIns();
    setCheckIns(data);
  }, [fetchCheckIns]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = checkIns.filter((c) =>
    c.barcode_id.toLowerCase().includes(search.toLowerCase()) || 
    (c.asset_name && c.asset_name.toLowerCase().includes(search.toLowerCase()))
  );

  // Helper pewarnaan kondisi
  const getConditionColor = (cond?: string) => {
    switch (cond?.toLowerCase()) {
      case 'subur': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'normal': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'layu': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'mati': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">Daftar Aset</h1>
          <p className="text-sm text-stone-400 mt-1">Kelola dan lacak semua aset yang telah didaftarkan</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/generate"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 shrink-0"
          >
            <Plus size={18} />
            <span>Daftarkan Aset Baru</span>
          </Link>

          <div className="relative flex-1 sm:flex-none">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari aset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 bg-white rounded-xl pl-9 pr-4 py-2.5 text-sm border border-stone-200/60 focus:border-teal focus:ring-1 focus:ring-teal/20 outline-none transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-stone-200/60 text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors shrink-0">
            <Filter size={14} />
            <span className="hidden sm:inline">Saring</span>
          </button>
        </div>
      </div>

      {/* Kartu Grid (Mobile) */}
      <div className="sm:hidden space-y-3">
        {filtered.map((ci) => (
          <div key={ci.id} className="bg-white rounded-2xl border border-stone-200/60 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100">
                  <Leaf size={18} className="text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-800 truncate max-w-[150px]">{ci.asset_name || ci.barcode_id}</p>
                  <p className="text-[10px] text-stone-400 font-medium">
                    ID: {ci.barcode_id}
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase border ${getConditionColor(ci.condition)}`}>
                {ci.condition || 'Aktif'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-stone-400 pt-3 border-t border-stone-50">
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span>{ci.lat.toFixed(3)}°, {ci.lng.toFixed(3)}°</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{new Date(ci.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Box size={32} className="text-stone-200 mx-auto mb-3" />
            <p className="text-sm text-stone-400">Belum ada aset. Mulai dengan mendaftarkan aset baru.</p>
            <Link to="/generate" className="text-xs text-indigo-600 font-bold mt-2 inline-block hover:underline">
              + Daftarkan Aset Baru
            </Link>
          </div>
        )}
      </div>

      {/* Tabel (Tablet+) */}
      <div className="hidden sm:block bg-white rounded-[32px] border border-stone-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/50">
                <th className="text-left text-[10px] font-black text-stone-400 uppercase tracking-widest px-8 py-5">Nama Tanaman & ID</th>
                <th className="text-left text-[10px] font-black text-stone-400 uppercase tracking-widest px-8 py-5">Koordinat GPS</th>
                <th className="text-left text-[10px] font-black text-stone-400 uppercase tracking-widest px-8 py-5">Kondisi</th>
                <th className="text-left text-[10px] font-black text-stone-400 uppercase tracking-widest px-8 py-5">Scan Terakhir</th>
                <th className="text-left text-[10px] font-black text-stone-400 uppercase tracking-widest px-8 py-5">Foto Live</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map((ci) => (
                <tr key={ci.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center shrink-0 border border-teal-100">
                        <Leaf size={16} className="text-teal-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-stone-800">{ci.asset_name || 'Tanpa Nama'}</p>
                        <p className="text-[10px] font-mono text-stone-400 mt-0.5">{ci.barcode_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-1 text-xs text-stone-500">
                      <MapPin size={12} className="text-stone-300" />
                      <span className="font-mono">{ci.lat.toFixed(4)}°, {ci.lng.toFixed(4)}°</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-widest border ${getConditionColor(ci.condition)}`}>
                      {ci.condition || 'Aktif'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-stone-600">{new Date(ci.created_at).toLocaleDateString('id-ID')}</p>
                    <p className="text-[10px] font-medium text-stone-400 mt-0.5">{new Date(ci.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-8 py-5">
                    {ci.photo_url ? (
                      <img src={ci.photo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
                    ) : (
                      <span className="text-xs text-stone-300">—</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <button className="p-1.5 text-stone-300 hover:text-stone-600 opacity-0 group-hover:opacity-100 transition-all">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Box size={32} className="text-stone-200 mx-auto mb-3" />
            <p className="text-sm text-stone-400">Belum ada aset terdaftar</p>
            <Link to="/generate" className="text-xs text-indigo-600 font-bold mt-2 inline-block hover:underline">
              + Daftarkan Aset Baru
            </Link>
          </div>
        )}

        {/* Paginasi */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-8 py-5 border-t border-stone-100">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              Menampilkan {filtered.length} dari {checkIns.length} aset
            </p>
            <div className="flex gap-1">
              <button className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 transition-colors"><ChevronLeft size={16} /></button>
              <button className="h-8 w-8 rounded-lg bg-teal text-white text-xs font-bold flex items-center justify-center shadow-md shadow-teal/10">1</button>
              <button className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 transition-colors"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
