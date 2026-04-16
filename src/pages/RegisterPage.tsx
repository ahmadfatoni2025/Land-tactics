import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, TreePine, User, Mail, Lock, CheckCircle2 } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('Semua field wajib diisi');
      return;
    }
    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center p-6 text-center">
        <div className="max-w-sm w-full space-y-6">
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/40 animate-bounce">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-white italic capitalize">Pendaftaran Berhasil!</h2>
          <p className="text-emerald-300/40 font-medium">Akun Anda sedang disiapkan. Mengalihkan ke halaman login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f0d] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/30 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-900/20 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-6 shadow-xl shadow-emerald-900/40">
            <TreePine size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic underline decoration-emerald-500/50 decoration-4 underline-offset-8">Bergabunglah</h1>
          <p className="text-emerald-300/40 text-sm mt-6 font-medium">Daftarkan akun petugas lapangan baru Anda</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-[32px] p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-red-400 text-xs font-bold flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama sesuai identitas"
                  className="w-full pl-12 pr-4 py-4 bg-white/[0.05] border border-white/[0.08] rounded-2xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest ml-1">Email Aktif</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="petugas@agri.com"
                  className="w-full pl-12 pr-4 py-4 bg-white/[0.05] border border-white/[0.08] rounded-2xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest ml-1">Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-white/[0.05] border border-white/[0.08] rounded-2xl text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-sm transition-all disabled:opacity-50 shadow-xl shadow-emerald-900/40 active:scale-[0.98] mt-4 uppercase tracking-widest"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <Loader2 size={18} className="animate-spin" />
                  Mendaftarkan...
                </div>
              ) : (
                'Buat Akun Sekarang'
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/[0.06] text-center">
            <p className="text-emerald-300/40 text-xs font-medium">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-emerald-400 font-black hover:underline underline-offset-4">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[10px] text-white/10 mt-10 font-bold uppercase tracking-[0.4em]">
          GeoAgri Technical Division • Authorized Personnel Only
        </p>
      </div>
    </div>
  );
};
