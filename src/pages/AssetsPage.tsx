import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAttendance } from '../hooks/useAttendance';
import {
  Search, MapPin, Clock, Plus, Leaf,
  Trash2, Edit2, X, CheckCircle,
  AlertCircle, ChevronLeft, Loader2,
  Package, Calendar, TrendingUp
} from 'lucide-react';

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

const statusConfig = {
  subur: { label: 'Subur', color: 'emerald', icon: CheckCircle },
  sehat: { label: 'Sehat', color: 'blue', icon: CheckCircle },
  normal: { label: 'Normal', color: 'gray', icon: Package },
  layu: { label: 'Layu', color: 'amber', icon: AlertCircle },
  mati: { label: 'Mati', color: 'rose', icon: AlertCircle },
};

export const AssetsPage = () => {
  const { fetchCheckIns, deleteAsset, updateAsset, loading: actionLoading } = useAttendance();
  const [checkIns, setCheckIns] = useState<AssetRecord[]>([]);
  const [search, setSearch] = useState('');
  const [editingAsset, setEditingAsset] = useState<AssetRecord | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchCheckIns();
    setCheckIns(data);
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
      condition: editingAsset.condition
    });
    if (res.success) {
      setShowEditModal(false);
      loadData();
    }
  };

  const getStatusBadge = (condition?: string) => {
    const status = condition?.toLowerCase() || 'normal';
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.normal;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${config.color}-50 text-${config.color}-700`}>
        <config.icon size={12} />
        {config.label}
      </span>
    );
  };

  const filtered = checkIns.filter((c) => {
    const matchesSearch = c.barcode_id.toLowerCase().includes(search.toLowerCase()) ||
      (c.asset_name && c.asset_name.toLowerCase().includes(search.toLowerCase()));
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && c.condition?.toLowerCase() === activeTab;
  });

  const stats = {
    total: checkIns.length,
    healthy: checkIns.filter(c => ['subur', 'sehat', 'normal'].includes(c.condition?.toLowerCase() || '')).length,
    critical: checkIns.filter(c => ['layu', 'mati'].includes(c.condition?.toLowerCase() || '')).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
            <Link to="/" className="hover:text-gray-600 transition-colors flex items-center gap-1">
              <ChevronLeft size={16} />
              <span>Dashboard</span>
            </Link>
            <span>/</span>
            <span className="text-gray-600">Assets</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Plant Assets</h1>
              <p className="text-sm text-gray-500 mt-1">Monitor and manage all plant batches</p>
            </div>

            <Link
              to="/generate"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-sm"
            >
              <Plus size={18} />
              New Registration
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Package size={18} className="text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Total Assets</p>
                <p className="text-xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <TrendingUp size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Healthy</p>
                <p className="text-xl font-semibold text-emerald-600">{stats.healthy}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <AlertCircle size={18} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Critical</p>
                <p className="text-xl font-semibold text-amber-600">{stats.critical}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              {['all', 'subur', 'normal', 'layu', 'mati'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${activeTab === tab
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'all' && (
                    <span className="ml-1.5 text-xs opacity-70">({filtered.length})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Assets Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((asset) => (
              <div
                key={asset.id}
                className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Image Section */}
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={asset.photo_url || 'https://placehold.co/400x300?text=No+Image'}
                    alt={asset.asset_name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(asset.condition)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {asset.asset_name || 'Unnamed Plant'}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono">
                      ID: {asset.barcode_id}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="text-xs">
                        {asset.lat.toFixed(4)}, {asset.lng.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-xs">
                        {new Date(asset.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setEditingAsset(asset);
                        setShowEditModal(true);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Edit2 size={12} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-rose-50 text-gray-600 hover:text-rose-600 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
              <Leaf size={24} className="text-gray-300" />
            </div>
            <h3 className="text-base font-medium text-gray-700 mb-1">No assets found</h3>
            <p className="text-sm text-gray-400 mb-4">
              {search ? 'Try adjusting your search' : 'Start by registering your first plant batch'}
            </p>
            {!search && (
              <Link
                to="/generate"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} />
                Register New
              </Link>
            )}
          </div>
        )}

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
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Plant Name
                  </label>
                  <input
                    type="text"
                    value={editingAsset.asset_name || ''}
                    onChange={e => setEditingAsset({ ...editingAsset, asset_name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                    placeholder="Enter plant name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Condition
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['subur', 'normal', 'layu', 'mati'].map((condition) => (
                      <button
                        key={condition}
                        type="button"
                        onClick={() => setEditingAsset({ ...editingAsset, condition })}
                        className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${editingAsset.condition === condition
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {condition}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};