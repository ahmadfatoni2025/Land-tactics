import { useState, useEffect, useCallback } from 'react';
import { useUserManagement } from '../../hooks/useUserManagement';
import {
  UserPlus, Edit2, Trash2, Search, Loader2, X,
  CheckCircle2, Shield, User,
  AlertTriangle, Eye, EyeOff
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Profile } from '../../lib/types';

export const UserManagementPage = () => {
  const { fetchAllUsers, createUser, updateUser, deactivateUser, loading } = useUserManagement();

  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);

  // Create form
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin'>('user');
  const [showPassword, setShowPassword] = useState(false);
  const [createError, setCreateError] = useState('');

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchAllUsers();
    setUsers(data);
    setIsLoading(false);
  }, [fetchAllUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreate = async () => {
    if (!newEmail || !newPassword || !newName) {
      setCreateError('Semua field wajib diisi');
      return;
    }
    if (newPassword.length < 6) {
      setCreateError('Password minimal 6 karakter');
      return;
    }

    setCreateError('');
    const result = await createUser(newEmail, newPassword, newName, newRole);
    if (result.success) {
      setShowCreateModal(false);
      setNewEmail(''); setNewPassword(''); setNewName(''); setNewRole('user');
      loadUsers();
    } else {
      setCreateError(result.error || 'Gagal membuat akun');
    }
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    const result = await updateUser(editingUser.id, {
      full_name: editingUser.full_name,
      role: editingUser.role,
    });
    if (result.success) {
      setEditingUser(null);
      loadUsers();
    }
  };

  const handleDeactivate = async (userId: string, name: string) => {
    if (!confirm(`Nonaktifkan akun "${name}"?\n\nData dan titik milik user akan tetap tersimpan di sistem.`)) return;
    const result = await deactivateUser(userId);
    if (result.success) loadUsers();
  };

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Admin</p>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Manajemen Akun</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola akun petugas lapangan</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
        >
          <UserPlus size={16} />
          Tambah Akun Baru
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Cari nama user..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Dibuat</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <Loader2 className="w-8 h-8 text-gray-300 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400 font-medium">
                    Tidak ada user ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0",
                          user.role === 'admin' ? "bg-purple-50 text-purple-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {user.full_name?.slice(0, 2).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{user.full_name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{user.id.slice(0, 12)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                        user.role === 'admin'
                          ? "bg-purple-50 text-purple-700"
                          : "bg-blue-50 text-blue-700"
                      )}>
                        {user.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                        user.is_active
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      )}>
                        {user.is_active ? (
                          <><CheckCircle2 size={10} /> Aktif</>
                        ) : (
                          <><AlertTriangle size={10} /> Nonaktif</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingUser({ ...user })}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeactivate(user.id, user.full_name)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Nonaktifkan"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!isLoading && filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Menampilkan <span className="font-bold text-gray-900">{filtered.length}</span> user
            </p>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="bg-amber-50 rounded-xl p-4 flex gap-3 border border-amber-100">
        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <strong>Catatan:</strong> Menonaktifkan akun user tidak menghapus data apapun. Semua titik lokasi dan data monitoring milik
          user yang dinonaktifkan tetap tersimpan di sistem dan dapat diakses oleh admin.
        </p>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Tambah Akun Baru</h3>
                <p className="text-xs text-gray-400 mt-0.5">User tidak bisa mendaftar sendiri</p>
              </div>
              <button onClick={() => { setShowCreateModal(false); setCreateError(''); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {createError && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-500" />
                  <p className="text-sm text-red-700 font-medium">{createError}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nama petugas"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['user', 'admin'] as const).map(role => (
                    <button
                      key={role}
                      onClick={() => setNewRole(role)}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border transition-all capitalize",
                        newRole === role
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                      {role === 'admin' ? 'Admin' : 'Petugas'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                  Buat Akun
                </button>
                <button
                  onClick={() => { setShowCreateModal(false); setCreateError(''); }}
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Ubah Data Akun</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
                <input
                  type="text"
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['user', 'admin'] as const).map(role => (
                    <button
                      key={role}
                      onClick={() => setEditingUser({ ...editingUser, role })}
                      className={cn(
                        "flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold border transition-all",
                        editingUser.role === role
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      {role === 'admin' ? <Shield size={14} /> : <User size={14} />}
                      {role === 'admin' ? 'Admin' : 'Petugas'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Perubahan'}
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
