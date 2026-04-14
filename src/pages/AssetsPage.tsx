import { useState, useEffect, useCallback } from 'react';
import { useAttendance } from '../hooks/useAttendance';
import {
  Search, Download, Calendar, MapPin, AlertTriangle, BarChart2,
  Loader2, MoreHorizontal, Edit2, Trash2, X, ChevronLeft, ChevronRight, ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';

interface AssetRecord {
  id: string;
  barcode_id: string;
  asset_name?: string;
  category?: string;
  notes?: string;
  address?: string;
  lat: number;
  lng: number;
  photo_url: string;
  condition?: string;
  created_at: string;
}

export const AssetsPage = () => {
  const { fetchCheckIns, deleteAsset, updateAsset, loading: actionLoading } = useAttendance();
  const [checkIns, setCheckIns] = useState<AssetRecord[]>([]);
  const [search, setSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');
  const [editingAsset, setEditingAsset] = useState<AssetRecord | null>(null);
  const [viewingAsset, setViewingAsset] = useState<AssetRecord | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [allRawRecords, setAllRawRecords] = useState<AssetRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states mock limit (e.g. 10 items)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchCheckIns();
    setAllRawRecords(data);

    // Group by barcode_id and keep only the latest
    const latestOnly: AssetRecord[] = [];
    const seen = new Set<string>();

    data.forEach((item: AssetRecord) => {
      if (!seen.has(item.barcode_id)) {
        seen.add(item.barcode_id);
        latestOnly.push(item);
      }
    });

    setCheckIns(latestOnly);
    setIsLoading(false);
  }, [fetchCheckIns]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus data aset ini?')) return;
    const res = await deleteAsset(id);
    if (res.success) loadData();
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    const res = await updateAsset(editingAsset.id, {
      asset_name: editingAsset.asset_name,
      condition: editingAsset.condition,
      category: editingAsset.category,
      notes: editingAsset.notes,
      address: editingAsset.address
    });
    if (res.success) {
      setShowEditModal(false);
      loadData();
    }
  };

  const getStatusDisplay = (condition?: string) => {
    const c = condition?.toLowerCase() || 'normal';
    if (['subur', 'sehat'].includes(c)) return { label: 'COMPLETED', color: 'bg-[#daf1e6] text-[#2e7d56]' };
    if (['layu', 'mati'].includes(c)) return { label: 'FLAGGED', color: 'bg-[#fcdab9] text-[#c04b31]' };
    return { label: 'PENDING', color: 'bg-[#f9e0c8] text-[#c25916]' };
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).replace('AM', 'AM').replace('PM', 'PM');
    return { dateStr, timeStr };
  };

  const getGrowthAge = (dateString: string) => {
    const start = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} Hr`;
    const months = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    return `${months} Bln ${remainingDays > 0 ? remainingDays + ' Hr' : ''}`;
  };

  const filtered = checkIns.filter((c) => {
    const matchesSearch = c.barcode_id.toLowerCase().includes(search.toLowerCase()) ||
      (c.asset_name && c.asset_name.toLowerCase().includes(search.toLowerCase()));

    let matchesStatus = true;
    if (activeStatus !== 'all') {
      const statusLabel = getStatusDisplay(c.condition).label.toLowerCase();
      matchesStatus = statusLabel === activeStatus.toLowerCase();
    }

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedData = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: checkIns.length,
    active: checkIns.filter(c => ['subur', 'sehat', 'normal'].includes(c.condition?.toLowerCase() || '')).length,
    critical: checkIns.filter(c => ['layu', 'mati'].includes(c.condition?.toLowerCase() || '')).length,
  };

  return (
    <div className="min-h-screen bg-[#f8faf9]">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold tracking-widest text-green-800 uppercase mb-2 text-[#2d5a27]">
              SYSTEM RECORDS
            </p>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Logs Data</h1>
            <p className="text-[15px] text-gray-500 max-w-xl leading-relaxed">
              Central repository for all scanned agricultural assets, historical data tracking, and geographical verification.
            </p>
          </div>

          <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm">
            <Download size={18} className="text-gray-600" />
            Export Data
          </button>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search Barcode, Commodity, or Location"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:ring-0 transition-all shadow-sm"
            />
          </div>

          <div className="relative w-full md:w-56">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 appearance-none focus:outline-none shadow-sm cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>All Time</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <div className="relative w-full md:w-48">
            <select
              value={activeStatus}
              onChange={(e) => setActiveStatus(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 appearance-none focus:outline-none shadow-sm cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          <button className="px-6 py-3 bg-[#2f5c35] text-white rounded-xl text-sm font-semibold hover:bg-[#234528] transition-all shadow-sm min-w-fit">
            Apply Filters
          </button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-10">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">BARCODE ID</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">STATUS</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">UMUR TANAMAN</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">LOCATION</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider">ACTIVITY LOG</th>
                  <th className="px-6 py-5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-gray-500 font-medium">
                      No scan records found.
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((asset) => {
                    const status = getStatusDisplay(asset.condition);
                    const { dateStr, timeStr } = formatDate(asset.created_at);
                    return (
                      <tr
                        key={asset.id}
                        onClick={() => setViewingAsset(asset)}
                        className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-[#2d5a27]">
                              #{asset.barcode_id}
                            </span>
                            <span className="text-[9px] font-black text-white bg-indigo-500 px-1.5 py-0.5 rounded-md w-fit uppercase tracking-tighter">
                              {allRawRecords.filter(r => r.barcode_id === asset.barcode_id).length} Entries
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                src={asset.photo_url || 'https://placehold.co/40x40?text=NA'}
                                alt={asset.asset_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900 leading-tight">
                                {asset.asset_name || 'Unnamed Batch'}
                              </span>
                              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                                {asset.category || 'General'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 text-[11px] font-bold rounded-full tracking-wide ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
                              <span className="text-[10px] font-black uppercase tracking-tighter">Progress:</span>
                              <span className="text-[11px] font-black">{getGrowthAge(asset.created_at)}</span>
                            </div>
                            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                                style={{ width: `${Math.min(100, (Math.abs(new Date().getTime() - new Date(asset.created_at).getTime()) / (1000 * 60 * 60 * 24 * 90)) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-800">
                              Sector {asset.barcode_id.substring(0, 3)}
                            </span>
                            <span className="text-[13px] text-gray-500 mt-0.5 italic">
                              {asset.address || `${asset.lat.toFixed(4)}, ${asset.lng.toFixed(4)}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span className="text-sm font-bold text-gray-900 leading-none">{dateStr}</span>
                            </div>
                            <span className="text-[11px] font-black text-gray-400 mt-1.5 uppercase tracking-widest pl-4">
                              {timeStr} • Updated
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingAsset(asset);
                                setShowEditModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-[#2d5a27] hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(asset.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!isLoading && filtered.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500 font-medium">
                Showing <span className="text-gray-900 font-bold">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="text-gray-900 font-bold">{filtered.length}</span> scan records
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${currentPage === i + 1
                      ? 'bg-[#2f5c35] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {showEditModal && editingAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Edit Asset</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    ID: {editingAsset.barcode_id}
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={18} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-5 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                    Plant Name
                  </label>
                  <input
                    type="text"
                    value={editingAsset.asset_name || ''}
                    onChange={e => setEditingAsset({ ...editingAsset, asset_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-green-600 transition-all"
                    placeholder="Enter plant name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                    Condition
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['subur', 'normal', 'layu', 'mati'].map((condition) => (
                      <button
                        key={condition}
                        type="button"
                        onClick={() => setEditingAsset({ ...editingAsset, condition })}
                        className={`px-3 py-2.5 rounded-xl text-sm font-bold capitalize transition-all border ${editingAsset.condition === condition
                          ? 'bg-[#2f5c35] text-white border-[#2f5c35]'
                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                        {condition}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                    Category / Commodity
                  </label>
                  <input
                    type="text"
                    value={editingAsset.category || ''}
                    onChange={e => setEditingAsset({ ...editingAsset, category: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-green-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                    Location Address
                  </label>
                  <input
                    type="text"
                    value={editingAsset.address || ''}
                    onChange={e => setEditingAsset({ ...editingAsset, address: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-green-600 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
                    Notes
                  </label>
                  <textarea
                    value={editingAsset.notes || ''}
                    onChange={e => setEditingAsset({ ...editingAsset, notes: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-green-600 transition-all h-24 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-[#2f5c35] text-white rounded-xl text-sm font-bold hover:bg-[#234528] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {viewingAsset && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-gray-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white">
                <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">Plant Data Details</h2>
                <button
                  onClick={() => setViewingAsset(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body (Split Layout) */}
              <div className="flex flex-col md:flex-row overflow-hidden flex-1">
                {/* Left Side: Details & Metrics */}
                <div className="flex-1 p-8 overflow-y-auto space-y-10 custom-scrollbar">

                  {/* Section: Asset Identity */}
                  <section className="space-y-6">
                    <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2">Batch Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase">Barcode ID</label>
                        <p className="text-sm font-bold text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          {viewingAsset.barcode_id}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase">Varietas / Plant Name</label>
                        <p className="text-sm font-bold text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                          {viewingAsset.asset_name || 'Generic Agricultural Unit'}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Section: Growth Metrics */}
                  <section className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest">Growth Metrics</h3>
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded tracking-widest uppercase">Latest Reading</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {viewingAsset.notes?.split(',').map((metric, i) => {
                        const [label, val] = metric.includes(':') ? metric.split(':') : [metric, 'Measured'];
                        return (
                          <div key={i} className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-emerald-200 transition-colors">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-1">{label.trim()}</p>
                            <p className="text-sm font-black text-gray-900 italic tracking-tight">{val?.trim() || '-'}</p>
                          </div>
                        );
                      }) || (
                          <p className="text-xs text-gray-400 col-span-full italic py-4">No specific metrics recorded for this batch.</p>
                        )}
                    </div>
                  </section>

                  {/* Section: Image Evidence */}
                  <section className="space-y-4">
                    <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest border-b border-gray-100 pb-2">Field Documentation</h3>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 relative group">
                      <img src={viewingAsset.photo_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Evidence" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                  </section>
                </div>

                {/* Right Side: Sidebar History Timeline */}
                <div className="w-full md:w-[360px] bg-[#FAFAFA] border-l border-gray-100 p-8 space-y-8 overflow-y-auto custom-scrollbar">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <h3 className="text-[13px] font-bold text-gray-900 uppercase tracking-widest">Growth Timeline</h3>
                      <BarChart2 size={16} className="text-gray-400" />
                    </div>

                    <div className="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                      {allRawRecords
                        .filter(r => r.barcode_id === viewingAsset.barcode_id)
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((entry, idx) => {
                          const { dateStr, timeStr } = formatDate(entry.created_at);
                          const status = getStatusDisplay(entry.condition);

                          // Extract physical data from notes
                          // Structure: Data Fisik: T:... D:... L:... | Rawat: ...
                          const physicsMatch = entry.notes?.match(/T:([^ ]+) D:([^ ]+) L:([^ ]+)/);
                          const physics = physicsMatch ? {
                            t: physicsMatch[1],
                            d: physicsMatch[2],
                            l: physicsMatch[3]
                          } : null;

                          return (
                            <div key={entry.id} className="relative pl-10 group/item">
                              {/* Dot */}
                              <div className={cn(
                                "absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-[#FAFAFA] shadow-sm z-10 transition-transform group-hover/item:scale-125",
                                idx === 0 ? "bg-emerald-500 ring-4 ring-emerald-50" : "bg-gray-300"
                              )}></div>

                              <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-[11px] font-black text-gray-900 leading-none">{dateStr}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase mt-1 tracking-widest">{timeStr}</p>
                                  </div>
                                  <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter", status.color)}>
                                    {status.label}
                                  </span>
                                </div>

                                {physics && (
                                  <div className="flex gap-2">
                                    <div className="bg-white border border-gray-100 rounded-lg px-2 py-1 text-[9px] font-black">
                                      <span className="text-gray-400">T:</span> {physics.t}cm
                                    </div>
                                    <div className="bg-white border border-gray-100 rounded-lg px-2 py-1 text-[9px] font-black">
                                      <span className="text-gray-400">D:</span> {physics.d}qty
                                    </div>
                                  </div>
                                )}

                                {/* Mini Photo Progress */}
                                <div
                                  onClick={() => setViewingAsset(entry)}
                                  className="w-full aspect-video rounded-xl overflow-hidden bg-gray-200 border border-gray-100 cursor-pointer hover:border-emerald-500 transition-colors"
                                >
                                  <img src={entry.photo_url} className="w-full h-full object-cover" alt="Progress" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 mt-auto">
                    <p className="text-[10px] text-gray-400 leading-relaxed font-medium italic">
                      * Timeline shows all periodic growth updates recorded via the Scanner Module for this specific unit ID.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer (Reference Styles) */}
              <div className="px-8 py-5 border-t border-gray-100 bg-white flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 font-medium italic">Learn more about <span className="text-blue-600 underline cursor-pointer">Updating Plant Records</span></p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => setViewingAsset(null)}
                    className="flex-1 md:flex-none px-6 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setEditingAsset(viewingAsset);
                      setShowEditModal(true);
                      setViewingAsset(null);
                    }}
                    className="flex-1 md:flex-none px-8 py-3 bg-[#EE7D40] text-white rounded-xl text-sm font-bold hover:bg-[#d96c32] shadow-lg shadow-orange-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Update Plant Metadata
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
