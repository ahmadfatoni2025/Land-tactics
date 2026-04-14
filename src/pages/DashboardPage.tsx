import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapView, type CheckIn } from '../components/MapView';
import { useAttendance } from '../hooks/useAttendance';
import {
  MapPin, Scan, AlertTriangle, Clock, ChevronRight, Eye, TrendingUp, Box
} from 'lucide-react';

export const DashboardPage = () => {
  const { fetchCheckIns } = useAttendance();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);

  const loadData = useCallback(async () => {
    const data = await fetchCheckIns();
    setCheckIns(data);
  }, [fetchCheckIns]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Banner Peringatan */}
      <div className="bg-amber-light/10 border border-amber/20 rounded-2xl px-5 py-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-stone-700">
            Terdapat <strong className="text-stone-900">{checkIns.length} aset</strong> yang saat ini dilacak dalam sistem.
            <Link to="/assets" className="text-teal font-semibold ml-2 hover:underline">Lihat aset</Link>
          </p>
        </div>
      </div>

      {/* Grid Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Kiri: Peta + Statistik */}
        <div className="lg:col-span-8 space-y-6">

          {/* Kartu Peta */}
          <div className="bg-white rounded-2xl border border-stone-200/60 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-stone-400" />
                <span className="text-sm font-semibold text-stone-700">Lihat peta langsung</span>
              </div>
              <Link
                to="/map"
                className="text-xs font-semibold text-teal hover:text-teal-light transition-colors flex items-center gap-1"
              >
                Layar penuh <ChevronRight size={14} />
              </Link>
            </div>
            <div className="h-[350px] sm:h-[400px]">
              <MapView checkIns={checkIns} />
            </div>
          </div>

          {/* Baris Statistik */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-stone-200/60 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Total Aset</span>
                <Box size={16} className="text-stone-300" />
              </div>
              <p className="text-3xl font-black text-stone-900 tabular-nums">{checkIns.length || 0}</p>
              <Link to="/assets" className="text-xs font-medium text-teal mt-2 inline-block hover:underline">
                Lihat semua aset
              </Link>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200/60 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Tertunda</span>
                <Clock size={16} className="text-stone-300" />
              </div>
              <p className="text-3xl font-black text-amber tabular-nums">0</p>
              <p className="text-xs font-medium text-stone-400 mt-2">Menunggu verifikasi</p>
            </div>
            <div className="bg-white rounded-2xl border border-stone-200/60 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-stone-400 uppercase tracking-wider">Aktif</span>
                <TrendingUp size={16} className="text-stone-300" />
              </div>
              <p className="text-3xl font-black text-teal tabular-nums">{checkIns.length}</p>
              <p className="text-xs font-medium text-stone-400 mt-2">Online sekarang</p>
            </div>
          </div>

          {/* Peringatan Terbaru */}
          <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-700">Peringatan terbaru</h3>
              <span className="text-xs font-medium text-teal cursor-pointer hover:underline">Lihat semua</span>
            </div>
            <div className="divide-y divide-stone-50">
              {checkIns.slice(0, 3).map((ci) => (
                <div key={ci.id} className="flex items-center gap-4 px-5 py-4 hover:bg-stone-50/50 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-teal/10 flex items-center justify-center shrink-0">
                    <Scan size={16} className="text-teal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 truncate">{ci.barcode_id}</p>
                    <p className="text-xs text-stone-400">{new Date(ci.created_at).toLocaleString('id-ID')}</p>
                  </div>
                  <MapPin size={16} className="text-stone-300 shrink-0" />
                </div>
              ))}
              {checkIns.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-stone-400">Belum ada aktivitas pemindaian</p>
                  <Link to="/scanner" className="text-xs text-teal font-semibold mt-2 inline-block hover:underline">Mulai memindai</Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kanan: Perjalanan Terbaru */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-700">Perjalanan terbaru</h3>
              <Link to="/assets" className="text-xs font-medium text-teal hover:underline">Lihat semua</Link>
            </div>
            <div className="px-5 py-4 space-y-6 max-h-[700px] overflow-y-auto">
              {checkIns.map((ci, index) => (
                <div key={ci.id} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500">
                      {ci.barcode_id.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-stone-800 truncate">{ci.barcode_id}</p>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400">{ci.barcode_id.slice(-6)}</span>
                  </div>

                  <div className="ml-4 pl-4 border-l-2 border-stone-100 space-y-4">
                    <div className="relative">
                      <div className="absolute -left-[22px] top-0.5 h-3 w-3 rounded-full bg-teal border-2 border-white"></div>
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-stone-700">Dipindai</p>
                          <span className="text-[10px] text-stone-400">
                            {new Date(ci.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          {ci.lat.toFixed(4)}°, {ci.lng.toFixed(4)}°
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-[22px] top-0.5 h-3 w-3 rounded-full bg-amber border-2 border-white"></div>
                      <div className="text-xs text-stone-500 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-stone-400">Jarak</span>
                          <span className="font-semibold text-stone-700">—</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {index < checkIns.length - 1 && <div className="border-b border-stone-100"></div>}
                </div>
              ))}

              {checkIns.length === 0 && (
                <div className="text-center py-10">
                  <MapPin size={24} className="text-stone-300 mx-auto mb-3" />
                  <p className="text-sm text-stone-400">Belum ada perjalanan</p>
                  <Link to="/scanner" className="text-xs text-teal font-semibold mt-2 inline-block hover:underline">Mulai memindai</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
