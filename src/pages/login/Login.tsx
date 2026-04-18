import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Loader2, ArrowRight, Leaf } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      navigate('/');

    } catch (error: any) {
      setErrorMsg(error.message || 'Login gagal. Silakan periksa email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start sm:items-center justify-center p-6 lg:p-10 relative overflow-hidden bg-[#f5f7f6] pt-12 sm:pt-0">

      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-white/80 backdrop-blur-2xl px-8 sm:px-10 py-10 sm:py-12 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-100 relative z-10">

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-green-200/40 mb-6">
            <Leaf className="text-white" size={28} />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Selamat Datang</h2>
          <p className="text-sm font-medium text-gray-400">Masuk untuk mengelola aset GeoAgri Anda</p>
        </div>

        {errorMsg && (
          <div className="mb-6 px-4 py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-medium border border-red-100 flex items-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 pl-4">Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-2xl text-sm font-semibold text-gray-900 border-2 border-gray-100 focus:border-green-500 focus:bg-white focus:ring-0 outline-none transition-all placeholder:text-gray-400 placeholder:font-medium"
                placeholder="nama@email.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400 pl-4">Kata Sandi</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-2xl text-sm font-semibold text-gray-900 border-2 border-gray-100 focus:border-green-500 focus:bg-white focus:ring-0 outline-none transition-all placeholder:text-gray-400 placeholder:font-medium"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-green-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <a href="#" onClick={() => alert("Masih dalam perkembanagan")} className="text-[11px] font-bold uppercase tracking-widest text-gray-400 pl-4">Lupa Kata Sandi?</a>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-green-200/40 active:scale-[0.98] transition-all flex justify-center items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (
              <>
                Masuk
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm font-semibold text-gray-500">
          Belum punya akun?{' '}
          <Link to="/signup" className="text-green-600 hover:text-green-700 hover:underline underline-offset-4 font-bold transition-all">
            Daftar Sekarang
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;