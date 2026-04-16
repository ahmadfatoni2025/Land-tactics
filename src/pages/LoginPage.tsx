import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Loader2, TreePine, Leaf, Mountain } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email dan password wajib diisi');
      return;
    }

    setLoading(true);
    setError('');

    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // AuthContext will update, App.tsx handles redirect
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f0d] flex relative overflow-hidden">

      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-emerald-900/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-teal-900/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-emerald-950/10 blur-3xl" />

        {/* Floating nature icons */}
        <TreePine className="absolute top-20 right-20 text-emerald-800/10 rotate-12" size={120} />
        <Leaf className="absolute bottom-32 left-16 text-emerald-800/8 -rotate-45" size={80} />
        <Mountain className="absolute top-1/3 left-10 text-emerald-900/8" size={100} />
      </div>

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-20">
            <div className="h-11 w-11 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/40">
              <span className="text-white font-black text-lg italic">G</span>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">GeoAgri</span>
          </div>

          <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight max-w-lg">
            Sistem Monitoring
            <br />
            <span className="text-emerald-400">Pohon Terpadu</span>
          </h1>
          <p className="text-emerald-300/50 text-base mt-6 max-w-md leading-relaxed font-medium">
            Platform pencatatan, pelacakan, dan analisis pertumbuhan tanaman berbasis 
            lokasi dengan teknologi GPS dan machine learning.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {['bg-emerald-500', 'bg-teal-500', 'bg-green-500', 'bg-lime-500'].map((bg, i) => (
                <div key={i} className={`w-8 h-8 rounded-full ${bg} border-2 border-[#0a0f0d] flex items-center justify-center text-white text-[9px] font-black`}>
                  {['AF', 'BR', 'CD', 'EF'][i]}
                </div>
              ))}
            </div>
            <p className="text-emerald-300/40 text-xs font-semibold">Tim petugas lapangan aktif</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Titik Lokasi', value: '248+' },
              { label: 'Pohon Terlacak', value: '1.2K+' },
              { label: 'Provinsi', value: '12' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
                <p className="text-xl font-black text-white">{stat.value}</p>
                <p className="text-[10px] font-bold text-emerald-400/50 uppercase tracking-wider mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[520px] flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-sm">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="h-10 w-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-black italic">G</span>
            </div>
            <span className="font-bold text-white text-lg">GeoAgri</span>
          </div>

          <div className="mb-10">
            <h2 className="text-2xl font-black text-white tracking-tight">Masuk ke akun</h2>
            <p className="text-emerald-300/40 text-sm mt-2 font-medium">
              Gunakan akun yang telah dibuat oleh administrator
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-emerald-300/50 uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@perusahaan.com"
                className="w-full px-4 py-3.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-emerald-300/50 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 bg-white/[0.05] border border-white/[0.08] rounded-xl text-sm font-medium text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 focus:bg-white/[0.07] transition-all pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/30 active:scale-[0.98] mt-2"
            >
              Masuk
            </button>
          </form>

          <p className="text-center text-white/20 text-xs mt-8 font-medium">
            Tidak punya akun? <Link to="/register" className="text-emerald-400 font-bold hover:underline">Daftar sekarang</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
