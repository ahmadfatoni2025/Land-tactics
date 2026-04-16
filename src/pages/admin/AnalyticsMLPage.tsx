import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAttendance } from '../../hooks/useAttendance';
import { useLocations } from '../../hooks/useLocations';
import {
  TrendingUp, AlertTriangle, CheckCircle2,
  BarChart3, TreePine, Loader2, ArrowUpRight, ArrowDownRight,
  Sparkles, Target, Sprout, Activity
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { CheckInRecord, Location } from '../../lib/types';

interface TrendData {
  month: string;
  avg_tinggi: number;
  avg_diameter: number;
  count: number;
}

export const AnalyticsMLPage = () => {
  const { fetchCheckIns } = useAttendance();
  const { fetchAllLocations } = useLocations();

  const [checkIns, setCheckIns] = useState<CheckInRecord[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [cis, locs] = await Promise.all([
      fetchCheckIns(),
      fetchAllLocations(),
    ]);
    setCheckIns(cis);
    setLocations(locs);
    setLoading(false);
  }, [fetchCheckIns, fetchAllLocations]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Analytics computations
  const analytics = useMemo(() => {
    const withData = checkIns.filter(ci => ci.tinggi_tanaman || ci.diameter_batang);

    // Group by month for trend
    const monthGroups: Record<string, CheckInRecord[]> = {};
    withData.forEach(ci => {
      const d = new Date(ci.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthGroups[key]) monthGroups[key] = [];
      monthGroups[key].push(ci);
    });

    const trends: TrendData[] = Object.entries(monthGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, items]) => ({
        month,
        avg_tinggi: items.reduce((s, i) => s + (i.tinggi_tanaman || 0), 0) / items.length,
        avg_diameter: items.reduce((s, i) => s + (i.diameter_batang || 0), 0) / items.length,
        count: items.length,
      }));

    // Healthy vs warning locations
    const locationHealth: Record<string, { healthy: number; warning: number }> = {};
    checkIns.forEach(ci => {
      const lid = ci.location_id;
      if (!lid) return;
      if (!locationHealth[lid]) locationHealth[lid] = { healthy: 0, warning: 0 };
      const cond = ci.condition?.toLowerCase();
      if (cond === 'sehat' || cond === 'subur') locationHealth[lid].healthy++;
      else if (cond === 'layu' || cond === 'mati') locationHealth[lid].warning++;
    });

    const healthyLocIds = Object.entries(locationHealth)
      .filter(([_, v]) => v.healthy > v.warning)
      .map(([id]) => id);

    const warningLocIds = Object.entries(locationHealth)
      .filter(([_, v]) => v.warning >= v.healthy && v.warning > 0)
      .map(([id]) => id);

    // Pest warnings
    const pestIssues = checkIns.filter(ci =>
      ci.status_hama && ci.status_hama !== 'nihil'
    );

    // Average metrics
    const avgTinggi = withData.length > 0
      ? withData.reduce((s, ci) => s + (ci.tinggi_tanaman || 0), 0) / withData.length
      : 0;

    const avgDiameter = withData.length > 0
      ? withData.reduce((s, ci) => s + (ci.diameter_batang || 0), 0) / withData.length
      : 0;

    // Growth prediction (simple linear projection)
    const lastTwoMonths = trends.slice(-2);
    let predicted_tinggi = avgTinggi;
    if (lastTwoMonths.length === 2) {
      const growth = lastTwoMonths[1].avg_tinggi - lastTwoMonths[0].avg_tinggi;
      predicted_tinggi = lastTwoMonths[1].avg_tinggi + growth;
    }

    return {
      trends,
      healthyLocIds,
      warningLocIds,
      pestIssues,
      avgTinggi,
      avgDiameter,
      predicted_tinggi,
      totalData: withData.length,
    };
  }, [checkIns]);

  const maxTrend = Math.max(...analytics.trends.map(t => t.avg_tinggi), 1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-emerald-500" />
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Analitik ML</p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Analisis Pertumbuhan</h1>
          <p className="text-sm text-gray-500 mt-1">Wawasan otomatis dari data lapangan dengan tren statistik</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
          <Activity size={14} className="text-emerald-600" />
          <span className="text-xs font-bold text-emerald-700">{analytics.totalData} data points dianalisis</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-emerald-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider">Rata-rata Tinggi</span>
            <TrendingUp size={18} className="text-emerald-200" />
          </div>
          <p className="text-2xl font-black">{analytics.avgTinggi.toFixed(1)} cm</p>
          <p className="text-[10px] text-emerald-100 mt-1">Dari seluruh data yang masuk</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lokasi Sehat</span>
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-gray-900">{analytics.healthyLocIds.length}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowUpRight size={10} /> Pertumbuhan baik
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Perlu Perhatian</span>
            <AlertTriangle size={18} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-gray-900">{analytics.warningLocIds.length}</p>
          <p className="text-[10px] text-amber-600 font-semibold mt-1 flex items-center gap-1">
            <ArrowDownRight size={10} /> Bermasalah / terancam
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Prediksi Tinggi</span>
            <Target size={18} className="text-blue-400" />
          </div>
          <p className="text-2xl font-black text-gray-900">{analytics.predicted_tinggi.toFixed(1)} cm</p>
          <p className="text-[10px] text-blue-600 font-semibold mt-1">Estimasi bulan depan</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Growth Trend Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Tren Pertumbuhan Per Periode</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Rata-rata tinggi tanaman per bulan</p>
            </div>
            <BarChart3 size={18} className="text-gray-300" />
          </div>

          {analytics.trends.length > 0 ? (
            <div className="space-y-3">
              {analytics.trends.map((t, i) => (
                <div key={t.month} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-400 w-16 shrink-0">
                    {new Date(t.month + '-01').toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })}
                  </span>
                  <div className="flex-1 h-8 bg-gray-50 rounded-lg overflow-hidden relative">
                    <div
                      className={cn(
                        "h-full rounded-lg transition-all duration-1000 flex items-center px-3",
                        i === analytics.trends.length - 1
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                          : "bg-emerald-100"
                      )}
                      style={{ width: `${(t.avg_tinggi / maxTrend) * 100}%` }}
                    >
                      <span className={cn(
                        "text-[10px] font-black whitespace-nowrap",
                        i === analytics.trends.length - 1 ? "text-white" : "text-emerald-700"
                      )}>
                        {t.avg_tinggi.toFixed(1)} cm
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 w-12 text-right shrink-0">{t.count} data</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-300">
              <BarChart3 size={40} className="mb-3" />
              <p className="text-sm font-medium">Belum cukup data untuk tren</p>
            </div>
          )}
        </div>

        {/* Pest Issues */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Peringatan Hama & Penyakit</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">{analytics.pestIssues.length} laporan ditemukan</p>
            </div>
            <AlertTriangle size={18} className="text-amber-400" />
          </div>

          {analytics.pestIssues.length > 0 ? (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {analytics.pestIssues.slice(0, 10).map(ci => (
                <div key={ci.id} className="flex items-center gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100/50">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                    {ci.photo_url && <img src={ci.photo_url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-700 truncate">{ci.asset_name || ci.barcode_id}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(ci.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                    </p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded-lg text-[9px] font-black uppercase shrink-0",
                    ci.status_hama === 'berat' ? 'bg-red-100 text-red-700'
                      : ci.status_hama === 'sedang' ? 'bg-amber-100 text-amber-700'
                        : 'bg-yellow-100 text-yellow-700'
                  )}>
                    {ci.status_hama}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-emerald-300">
              <CheckCircle2 size={40} className="mb-3" />
              <p className="text-sm font-medium text-emerald-600">Tidak ada masalah hama terdeteksi</p>
            </div>
          )}
        </div>
      </div>

      {/* Location Health Grid */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Status Kesehatan Per Lokasi</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Prediksi kondisi berdasarkan data historis</p>
          </div>
          <Sprout size={18} className="text-emerald-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {locations.map(loc => {
            const isHealthy = analytics.healthyLocIds.includes(loc.id);
            const isWarning = analytics.warningLocIds.includes(loc.id);
            const locCIs = checkIns.filter(ci => ci.location_id === loc.id);
            const lastCI = locCIs[0];

            return (
              <div
                key={loc.id}
                className={cn(
                  "p-4 rounded-xl border transition-all hover:shadow-md",
                  isWarning ? "border-red-200 bg-red-50/50" :
                  isHealthy ? "border-emerald-200 bg-emerald-50/50" :
                  "border-gray-100 bg-gray-50/50"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{loc.name}</p>
                    <p className="text-[10px] text-gray-400">{loc.tree_count} pohon</p>
                  </div>
                  {isWarning ? (
                    <AlertTriangle size={16} className="text-red-500 shrink-0" />
                  ) : isHealthy ? (
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  ) : (
                    <TreePine size={16} className="text-gray-300 shrink-0" />
                  )}
                </div>
                {lastCI && (
                  <div className="flex gap-2 flex-wrap">
                    {lastCI.tinggi_tanaman && (
                      <span className="text-[9px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded">
                        T: {lastCI.tinggi_tanaman}cm
                      </span>
                    )}
                    {lastCI.condition && (
                      <span className={cn(
                        "text-[9px] font-bold px-2 py-0.5 rounded uppercase",
                        lastCI.condition === 'sehat' || lastCI.condition === 'subur' ? 'text-emerald-700 bg-emerald-100'
                          : lastCI.condition === 'layu' || lastCI.condition === 'mati' ? 'text-red-700 bg-red-100'
                            : 'text-gray-500 bg-gray-100'
                      )}>
                        {lastCI.condition}
                      </span>
                    )}
                  </div>
                )}
                <p className="text-[10px] text-gray-400 mt-2 font-semibold">
                  {isWarning ? '⚠ Perlu intervensi segera' :
                   isHealthy ? '✓ Pertumbuhan optimal' :
                   '● Data belum cukup untuk prediksi'}
                </p>
              </div>
            );
          })}

          {locations.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-400">
              <TreePine size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">Belum ada data lokasi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
