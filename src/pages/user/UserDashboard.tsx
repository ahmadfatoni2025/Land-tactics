import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocations } from '../../hooks/useLocations';
import { useAttendance } from '../../hooks/useAttendance';
import { MapView } from '../../components/MapView';
import {
  MapPin, TreePine, CheckCircle2, AlertTriangle,
  ChevronRight, Camera, Plus, Eye, TrendingUp, Loader2, X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Location, CheckInRecord } from '../../lib/types';

export const UserDashboard = () => {
  console.log('UserDashboard: Rendering...');
  const { profile, loading: authLoading } = useAuth();
  const { fetchMyLocations } = useLocations();
  const { fetchCheckIns } = useAttendance();

  const [locations, setLocations] = useState<Location[]>([]);
  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const PERIOD_MONTHS = 3;

  const loadData = useCallback(async () => {
    // Safety timeout for data loading
    const loadTimeout = setTimeout(() => {
      if (loading) {
        console.error('Data loading timed out after 10s');
        setError('Koneksi lambat atau terputus. Silakan segarkan halaman.');
        setLoading(false);
      }
    }, 10000);

    try {
      console.log('UserDashboard: Loading data...');
      setLoading(true);
      setError(null);
      const [locs, cis] = await Promise.all([
        fetchMyLocations(),
        fetchCheckIns(),
      ]);
      console.log('UserDashboard: Data loaded', { locsCount: locs?.length, cisCount: cis?.length });
      setLocations(locs || []);
      setCheckIns(cis || []);
    } catch (err: any) {
      console.error('UserDashboard: Load error', err);
      setError(err.message || 'Gagal memuat data');
    } finally {
      clearTimeout(loadTimeout);
      setLoading(false);
    }
  }, [fetchMyLocations, fetchCheckIns]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Removed loading spinner to allow instant rendering
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold">Terjadi Kesalahan</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <button onClick={loadData} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg">Coba Lagi</button>
      </div>
    );
  }

  // Derived state with safe checks
  const periodStart = new Date();
  periodStart.setMonth(periodStart.getMonth() - PERIOD_MONTHS);

  const getLocationCheckIns = (locId: string) =>
    (checkIns || []).filter(ci => ci.location_id === locId);

  const isUploadedThisPeriod = (locId: string) => {
    const locCheckIns = getLocationCheckIns(locId);
    return locCheckIns.some(ci => ci.created_at && new Date(ci.created_at) >= periodStart);
  };

  const totalTrees = (locations || []).reduce((sum, l) => sum + (l.tree_count || 0), 0);
  const updatedCount = (locations || []).filter(l => isUploadedThisPeriod(l.id)).length;

  // Map data for preview
  const mapCheckIns = (checkIns || []).filter(ci => ci.lat && ci.lng);

  console.log('UserDashboard: Rendering content with', { totalTrees, updatedCount });


  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Dashboard</p>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Selamat datang, {profile?.full_name?.split(' ')[0] || 'Petugas'} 👋
          </h1>
          <p className="text-sm text-gray-500 mt-1">Ringkasan semua aktivitas lapangan Anda</p>
        </div>
        <a
          href="/user/input"
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
        >
          <Plus size={16} />
          Input Data Baru
        </a>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Titik', value: locations.length, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Pohon', value: totalTrees, icon: TreePine, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Terupdate', value: `${updatedCount}/${locations.length}`, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Belum Upload', value: locations.length - updatedCount, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</span>
                <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", card.bg)}>
                  <Icon size={16} className={card.color} />
                </div>
              </div>
              <p className="text-2xl font-black text-gray-900 tabular-nums">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Map Preview */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-gray-400" />
              <span className="text-sm font-bold text-gray-700">Peta titik lokasi saya</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              {locations.length} titik
            </span>
          </div>
          <div className="h-[350px]">
            <MapView checkIns={mapCheckIns} />
          </div>
        </div>

        {/* Locations List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h3 className="text-sm font-bold text-gray-700">Daftar Titik Lokasi</h3>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Periode {PERIOD_MONTHS} bulan
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-gray-50 max-h-[400px]">
            {locations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <MapPin size={32} className="text-gray-200 mb-3" />
                <p className="text-sm text-gray-400 font-medium">Belum ada titik lokasi</p>
                <a href="/user/input" className="text-xs text-emerald-600 font-bold mt-2 hover:underline">
                  Buat titik pertama →
                </a>
              </div>
            ) : (
              locations.map((loc) => {
                const uploaded = isUploadedThisPeriod(loc.id);
                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc)}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors group"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      uploaded ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    )}>
                      <MapPin size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{loc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold text-gray-400">
                          {loc.tree_count} pohon
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-200" />
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          uploaded ? "text-emerald-600" : "text-amber-600"
                        )}>
                          {uploaded ? '✓ Sudah upload' : '⚠ Belum upload'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-gray-400" />
            <h3 className="text-sm font-bold text-gray-700">Aktivitas Terbaru</h3>
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {checkIns.slice(0, 5).map((ci) => (
            <div key={ci.id} className="flex items-center gap-4 px-5 py-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {ci.photo_url ? (
                  <img src={ci.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera size={16} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">
                  {ci.asset_name || ci.barcode_id}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(ci.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <div className={cn(
                "px-2 py-1 rounded-lg text-[10px] font-bold uppercase",
                ci.condition === 'sehat' || ci.condition === 'subur'
                  ? 'bg-emerald-50 text-emerald-600'
                  : ci.condition === 'layu' || ci.condition === 'mati'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-gray-50 text-gray-500'
              )}>
                {ci.condition || 'Normal'}
              </div>
            </div>
          ))}
          {checkIns.length === 0 && (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-gray-400">Belum ada aktivitas</p>
            </div>
          )}
        </div>
      </div>

      {/* Location Detail Modal */}
      {selectedLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedLocation.name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedLocation.lat.toFixed(5)}°, {selectedLocation.lng.toFixed(5)}° • {selectedLocation.method === 'gps' ? 'GPS Auto' : 'Manual'}
                </p>
              </div>
              <button onClick={() => setSelectedLocation(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Jumlah Pohon</p>
                  <p className="text-xl font-black text-gray-900 mt-1">{selectedLocation.tree_count}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Total Update</p>
                  <p className="text-xl font-black text-gray-900 mt-1">{getLocationCheckIns(selectedLocation.id).length}</p>
                </div>
              </div>

              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4">Riwayat Foto & Data</h4>
              <div className="space-y-3">
                {getLocationCheckIns(selectedLocation.id).map((ci) => (
                  <div key={ci.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                      {ci.photo_url && <img src={ci.photo_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-700">
                        {new Date(ci.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                      </p>
                      <div className="flex gap-2 mt-1">
                        {ci.tinggi_tanaman && <span className="text-[9px] font-bold text-gray-400">T: {ci.tinggi_tanaman}cm</span>}
                        {ci.diameter_batang && <span className="text-[9px] font-bold text-gray-400">D: {ci.diameter_batang}mm</span>}
                        {ci.condition && <span className="text-[9px] font-bold text-emerald-600 uppercase">{ci.condition}</span>}
                      </div>
                    </div>
                  </div>
                ))}
                {getLocationCheckIns(selectedLocation.id).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">Belum ada data untuk titik ini</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
