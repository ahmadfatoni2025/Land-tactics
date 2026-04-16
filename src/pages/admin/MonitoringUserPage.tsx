import { useState, useEffect, useCallback } from 'react';
import { useUserManagement } from '../../hooks/useUserManagement';
import {
  Users, Clock, MapPin, AlertTriangle, CheckCircle2,
  ChevronRight, Search, Loader2, X, Camera
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { UserUploadStatus } from '../../lib/types';

const PERIOD_MONTHS = 3;

export const MonitoringUserPage = () => {
  const { getUserUploadStatus, getUserCheckIns } = useUserManagement();
  const [statuses, setStatuses] = useState<UserUploadStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'overdue' | 'ok'>('all');
  const [selectedUser, setSelectedUser] = useState<UserUploadStatus | null>(null);
  const [userCheckIns, setUserCheckIns] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getUserUploadStatus(PERIOD_MONTHS);
    setStatuses(data);
    setLoading(false);
  }, [getUserUploadStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSelectUser = async (status: UserUploadStatus) => {
    setSelectedUser(status);
    const cis = await getUserCheckIns(status.user.id);
    setUserCheckIns(cis);
  };

  const filtered = statuses.filter(s => {
    const matchSearch = s.user.full_name.toLowerCase().includes(search.toLowerCase());
    if (filter === 'overdue') return matchSearch && s.is_overdue;
    if (filter === 'ok') return matchSearch && !s.is_overdue;
    return matchSearch;
  });

  const overdueCount = statuses.filter(s => s.is_overdue).length;
  const activeCount = statuses.filter(s => !s.is_overdue).length;
  const totalLocations = statuses.reduce((sum, s) => sum + s.total_locations, 0);

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
      <div>
        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Admin</p>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Monitoring User</h1>
        <p className="text-sm text-gray-500 mt-1">
          Pantau status upload petugas lapangan per periode {PERIOD_MONTHS} bulan
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Petugas', value: statuses.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Upload Aktif', value: activeCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Belum Upload', value: overdueCount, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Total Titik', value: totalLocations, icon: MapPin, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari nama petugas..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
          />
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {[
            { key: 'all', label: 'Semua' },
            { key: 'overdue', label: `Terlambat (${overdueCount})` },
            { key: 'ok', label: `Aktif (${activeCount})` },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                filter === f.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {filtered.map(status => (
            <div
              key={status.user.id}
              onClick={() => handleSelectUser(status)}
              className="flex items-center gap-4 px-6 py-5 hover:bg-gray-50/50 cursor-pointer transition-colors group"
            >
              {/* Avatar */}
              <div className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black shrink-0",
                status.is_overdue
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-600"
              )}>
                {status.user.full_name?.slice(0, 2).toUpperCase() || 'U'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900 truncate">{status.user.full_name}</p>
                  {status.is_overdue && (
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-black rounded uppercase tracking-wider shrink-0">
                      Terlambat
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <MapPin size={10} /> {status.total_locations} titik
                  </span>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Camera size={10} /> {status.total_check_ins} upload
                  </span>
                  <span className="text-[11px] text-gray-400 flex items-center gap-1">
                    <Clock size={10} />
                    {status.last_upload_at
                      ? new Date(status.last_upload_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })
                      : 'Belum pernah upload'
                    }
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="hidden sm:block w-32 shrink-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Progress</span>
                  <span className={cn(
                    "text-[9px] font-black",
                    status.is_overdue ? "text-red-500" : "text-emerald-500"
                  )}>
                    {status.total_locations > 0
                      ? Math.round((status.total_check_ins / Math.max(status.total_locations, 1)) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      status.is_overdue ? "bg-red-400" : "bg-emerald-400"
                    )}
                    style={{
                      width: `${Math.min(100, status.total_locations > 0
                        ? (status.total_check_ins / Math.max(status.total_locations, 1)) * 100
                        : 0
                      )}%`
                    }}
                  />
                </div>
              </div>

              <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-6 py-16 text-center">
              <Users size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">Tidak ada petugas ditemukan</p>
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedUser.user.full_name}</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {selectedUser.total_locations} titik lokasi • {selectedUser.total_check_ins} total upload
                </p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Upload Status Banner */}
              <div className={cn(
                "rounded-xl px-4 py-3 flex items-center gap-3",
                selectedUser.is_overdue ? "bg-red-50 border border-red-100" : "bg-emerald-50 border border-emerald-100"
              )}>
                {selectedUser.is_overdue
                  ? <AlertTriangle size={18} className="text-red-600" />
                  : <CheckCircle2 size={18} className="text-emerald-600" />
                }
                <p className={cn("text-sm font-semibold", selectedUser.is_overdue ? "text-red-700" : "text-emerald-700")}>
                  {selectedUser.is_overdue
                    ? `Belum upload dalam ${PERIOD_MONTHS} bulan terakhir`
                    : `Upload terakhir: ${selectedUser.last_upload_at ? new Date(selectedUser.last_upload_at).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}`
                  }
                </p>
              </div>

              {/* Locations */}
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Daftar Titik</h4>
              {selectedUser.locations.map(loc => (
                <div key={loc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <MapPin size={16} className="text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{loc.name}</p>
                    <p className="text-[10px] text-gray-400">{loc.tree_count} pohon • {loc.method}</p>
                  </div>
                </div>
              ))}
              {selectedUser.locations.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">User belum membuat titik lokasi</p>
              )}

              {/* Recent Check-ins */}
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4">Upload Terbaru</h4>
              <div className="space-y-2">
                {userCheckIns.slice(0, 5).map((ci: any) => (
                  <div key={ci.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 shrink-0">
                      {ci.photo_url && <img src={ci.photo_url} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-700 truncate">{ci.asset_name || ci.barcode_id}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(ci.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </p>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0",
                      ci.condition === 'sehat' || ci.condition === 'subur' ? 'bg-emerald-100 text-emerald-700'
                        : ci.condition === 'layu' || ci.condition === 'mati' ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-500'
                    )}>
                      {ci.condition || 'N/A'}
                    </span>
                  </div>
                ))}
                {userCheckIns.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">Belum ada upload</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
