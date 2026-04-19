import { useState, useEffect, useMemo } from 'react';
import { MapView, type CheckIn } from '../components/MapView';
import { MapFull } from '../components/MapFull';
import { useAttendance } from '../hooks/useAttendance';
import { Search, Settings, User, HelpCircle, MoreVertical, Maximize2 } from 'lucide-react';
import { cn } from '../lib/utils';

export const MapPage = () => {
  const { fetchCheckIns } = useAttendance();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [layer, setLayer] = useState<'standard' | 'satellite' | 'terrain' | 'satellite'>('satellite');
  const [focusLocation, setFocusLocation] = useState<[number, number] | null>(null);
  const [search, setSearch] = useState('');
  const [isMapFull, setIsMapFull] = useState(false);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  useEffect(() => {
    fetchCheckIns().then(data => {
      console.log('Fetched Assets from DB:', data);
      setCheckIns(data || []);
      setLoading(false);
    });
  }, [fetchCheckIns]);

  const filteredCheckIns = useMemo(() => {
    if (!search) return checkIns;
    const lower = search.toLowerCase();
    return checkIns.filter(ci =>
      ci.barcode_id.toLowerCase().includes(lower) ||
      (ci.asset_name && ci.asset_name.toLowerCase().includes(lower)) ||
      (ci.category && ci.category.toLowerCase().includes(lower))
    );
  }, [checkIns, search]);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredCheckIns.length === 1) {
      setFocusLocation([filteredCheckIns[0].lat, filteredCheckIns[0].lng]);
    }
  };

  // Status computation for the Stats Strip
  const totalAssets = filteredCheckIns.length;
  const suburCount = filteredCheckIns.filter(c => c.condition === 'sehat_luar_biasa' || c.condition === 'sehat').length;
  const layuCount = filteredCheckIns.filter(c => c.condition === 'kurang_sehat').length;
  const matiCount = filteredCheckIns.filter(c => c.condition === 'kritis').length;
  const withImagesCount = filteredCheckIns.filter(c => c.photo_url).length;

  const getPercentage = (count: number) => {
    if (totalAssets === 0) return '0%';
    return Math.round((count / totalAssets) * 100) + '%';
  };

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-white text-slate-800 font-sans overflow-hidden">

      {/* MAIN CONTENT DIVIDER */}
      <div className="flex flex-1 min-h-0">

        {/* THIS IS THE DETAILED DASHBOARD AREA */}
        <main className="flex-1 flex flex-col bg-white overflow-hidden">

          {/* MAP SECTION: occupies top half */}
          <div className="flex-[8] relative border-b border-gray-200 bg-gray-100 min-h-[400px]">
            <MapView
              checkIns={filteredCheckIns}
              layerType={layer}
              focusLocation={focusLocation}
              className="w-full h-full"
              onFullscreen={() => setIsMapFull(true)}
            />
            
            {/* Overlay Shortcut Button */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button 
                onClick={() => setIsMapFull(true)}
                className="bg-white/95 backdrop-blur-md border border-gray-100 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 hover:bg-emerald-50 hover:text-emerald-600 transition-all font-bold text-xs"
              >
                <Maximize2 size={14} /> Full View
              </button>
            </div>
          </div>

          {/* MapFull Integration */}
          <MapFull 
            isOpen={isMapFull}
            onClose={() => setIsMapFull(false)}
            checkIns={filteredCheckIns}
            center={focusLocation || undefined}
            zoom={18}
            focusLocation={focusLocation}
          />

          {/* STATS STRIP: Middle horizontal row */}
          <div className="flex-none grid grid-cols-6 border-b border-gray-200 bg-white">
            {/* Stat 1 */}
            <div className="flex flex-col items-center justify-center p-4 border-r border-gray-100">
              <span className="text-xs text-gray-500 font-medium">Total Assets</span>
              <span className="text-2xl font-bold text-gray-900 mt-1">{totalAssets.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">100% OF {totalAssets}</span>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center justify-center p-4 border-r border-gray-100">
              <span className="text-xs text-gray-500 font-medium">Subur (Healthy)</span>
              <span className="text-2xl font-bold text-emerald-600 mt-1">{suburCount.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{getPercentage(suburCount)} OF {totalAssets}</span>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center justify-center p-4 border-r border-gray-100">
              <span className="text-xs text-gray-500 font-medium">Tertekan (Stressed)</span>
              <span className="text-2xl font-bold text-amber-500 mt-1">{layuCount.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{getPercentage(layuCount)} OF {totalAssets}</span>
            </div>

            {/* Stat 4 */}
            <div className="flex flex-col items-center justify-center p-4 border-r border-gray-100">
              <span className="text-xs text-gray-500 font-medium">Kritis (Critical)</span>
              <span className="text-2xl font-bold text-rose-600 mt-1">{matiCount.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{getPercentage(matiCount)} OF {totalAssets}</span>
            </div>

            {/* Stat 5 */}
            <div className="flex flex-col items-center justify-center p-4 border-r border-gray-100">
              <span className="text-xs text-gray-500 font-medium">Media Uploaded</span>
              <span className="text-2xl font-bold text-gray-900 mt-1">{withImagesCount.toLocaleString()}</span>
              <span className="text-[10px] text-gray-400 mt-0.5">{getPercentage(withImagesCount)} OF {totalAssets}</span>
            </div>

            {/* Stat 6 */}
            <div className="flex flex-col items-center justify-center p-4">
              <span className="text-xs text-gray-500 font-medium">Growth Phase</span>
              <span className="text-2xl font-bold text-blue-600 mt-1">Vegetatif</span>
              <span className="text-[10px] text-gray-400 mt-0.5">MOST COMMON</span>
            </div>
          </div>

          {/* DATA TABLE SECTION: Bottom half (scrollable) */}
          <div className="flex-[4] overflow-auto bg-white relative">
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr>
                  <th className="py-3 px-6 text-xs font-bold text-gray-700 border-b border-gray-200">Asset</th>
                  <th className="py-3 px-6 text-xs font-bold text-gray-700 border-b border-gray-200">Condition</th>
                  <th className="py-3 px-6 text-xs font-bold text-gray-700 border-b border-gray-200">Phase</th>
                  <th className="py-3 px-6 text-xs font-bold text-gray-700 border-b border-gray-200">Location</th>
                  <th className="py-3 px-6 text-xs font-bold text-gray-700 border-b border-gray-200">Status</th>
                  <th className="py-3 px-6 text-xs font-bold text-gray-700 border-b border-gray-200">Type/Category</th>
                  <th className="py-3 px-4 text-xs font-bold text-gray-700 border-b border-gray-200 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filteredCheckIns.length > 0 ? filteredCheckIns.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-6 flex items-center gap-3">
                      {/* Thumbnail or Avatar avatar */}
                      {item.photo_url ? (
                        <img src={item.photo_url} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">
                          {item.asset_name ? item.asset_name.substring(0, 2).toUpperCase() : 'NA'}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-emerald-700 cursor-pointer hover:underline">
                          {item.asset_name || item.barcode_id}
                        </span>
                        <span className="text-[10px] text-gray-500">{item.barcode_id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className="text-sm text-gray-700 capitalize">{item.condition || '-'}</span>
                    </td>
                    <td className="py-3 px-6">
                      <span className="text-sm text-gray-700 capitalize">{item.fase_pertumbuhan?.replace('_', ' ') || '-'}</span>
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-700">
                      {item.lat.toFixed(5)}, {item.lng.toFixed(5)}
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-800">Active</span>
                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium truncate max-w-[100px]">
                          {formatDate(item.created_at)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-6">
                      <span className="text-sm text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                        {item.category || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button className="text-gray-400 hover:text-gray-700 p-1 rounded hover:bg-gray-200 transition-colors">
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                      No data found for this query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </main>
      </div>

    </div>
  );
};
