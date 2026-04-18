import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAttendance } from '../../hooks/useAttendance';
import { Link } from 'react-router-dom';
import { Search, MapPin, Scan, Leaf, Droplets, Thermometer, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const Userdashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { fetchCheckIns } = useAttendance();
  const [plants, setPlants] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchCheckIns();
    
    // Group by barcode_id to get only the latest scans
    const latestOnly: any[] = [];
    const seen = new Set<string>();

    data.forEach((item: any) => {
      if (!seen.has(item.barcode_id)) {
        seen.add(item.barcode_id);
        latestOnly.push(item);
      }
    });

    setPlants(latestOnly);
    setLoading(false);
  }, [fetchCheckIns]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7f6]">
        <Loader2 className="animate-spin text-green-500" size={32} />
      </div>
    );
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Guest';

  const filteredPlants = plants.filter((p) => {
    const matchSearch = p.asset_name?.toLowerCase().includes(search.toLowerCase()) || 
                        p.barcode_id.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#f5f7f6] pb-24 lg:pb-8">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-10 py-3 sm:py-5 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Kebunku</h1>
          <p className="text-[10px] sm:text-sm text-gray-400 sm:text-gray-500 font-medium tracking-tight">Hai {displayName}, pantau tanaman hari ini.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/scanner" className="hidden sm:flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 font-bold text-sm transition-all shadow-sm shadow-green-200">
            <Scan size={18} />
            Scan QR
          </Link>
          <div className="h-11 w-11 rounded-full bg-green-100 flex items-center justify-center text-sm font-bold text-green-700 border-2 border-green-200">
            {displayName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-10 py-8 lg:py-10 max-w-7xl mx-auto space-y-8">

        {/* SEARCH & FILTER BAR */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama tanaman / ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-sm font-medium text-gray-700 placeholder-gray-400 focus:bg-white focus:border-green-200 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* PLANT GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-green-500" size={32} />
            <p className="text-gray-400 font-medium text-sm text-center">Memuat data tanaman...</p>
          </div>
        ) : filteredPlants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <Leaf size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Belum Ada Tanaman</h3>
            <p className="text-sm text-gray-500 mb-6 mt-1 text-center max-w-xs">Scan QR code fisik pada tanaman di lahan untuk menambahkannya ke kebun ini.</p>
            <Link to="/scanner" className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-2.5 font-bold text-sm shadow-sm transition-all flex items-center gap-2">
              <Scan size={18} /> Mulai Scan Aset
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlants.map((plant) => (
              <div key={plant.barcode_id} className="bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-green-100 transition-all group overflow-hidden flex flex-col">
                
                {/* Image Section */}
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                  {plant.photo_url ? (
                    <img src={plant.photo_url} alt={plant.asset_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Leaf size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-lg text-gray-700 shadow-sm uppercase tracking-wider">
                    {plant.barcode_id.substring(0, 8)}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-bold text-white truncate">{plant.asset_name || 'Tanaman Tak Bernama'}</h3>
                    <p className="text-white/80 text-xs font-medium truncate mt-0.5">{plant.category || 'Belum Kategori'}</p>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} className="text-green-500" />
                      <span className="text-xs font-medium truncate">{plant.address || 'Lokasi Tersinkronisasi'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100/50">
                        <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                          <Thermometer size={14} />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Kesehatan</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 capitalize truncate">
                          {plant.condition?.replace('_', ' ') || 'Normal'}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100/50">
                        <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                          <Droplets size={14} className="text-blue-400" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">Penyiraman</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 capitalize truncate">
                          {plant.kelembapan_tanah || 'Normal'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link to={`/assets`} state={{ searchKeyword: plant.barcode_id }} className="w-full py-2.5 bg-gray-50 hover:bg-green-50 text-gray-700 hover:text-green-700 rounded-xl text-xs font-bold transition-all border border-gray-200 hover:border-green-200 flex items-center justify-center gap-2 group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600">
                    Lihat Detail <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MOBILE FLOATING SCAN BUTTON */}
      <div className="sm:hidden fixed bottom-24 right-6 z-40">
        <Link to="/scanner" className="h-14 w-14 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-600/40 transition-all">
          <Scan size={24} />
        </Link>
      </div>
    </div>
  );
};

export default Userdashboard;