import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  ChevronRight, 
  Map as MapIcon, 
  QrCode, 
  ShieldCheck, 
  BarChart3,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  return (
    <div className="w-full min-h-screen bg-[#f5f7f6] overflow-x-hidden">
      {/* HERO SECTION */}
      <section className="relative px-4 sm:px-6 lg:px-12 pt-8 sm:pt-16 pb-12 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-green-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-emerald-500/5 blur-[100px] rounded-full translate-y-1/4 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Text Content */}
            <div className="flex-1 text-center lg:text-left space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest animate-fade-in">
                <Sparkles size={14} />
                Next-Gen AgriTech
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
                Traceability <br className="hidden sm:block" /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                  Meets Integrity
                </span>
              </h1>
              
              <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                GeoAgri adalah platform pemantauan aset pertanian berbasis GIS dan QR. 
                Sistematisasi data lapangan, validasi lokasi secara real-time, dan monitor pertumbuhan tanaman dalam satu genggaman.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button 
                  onClick={() => navigate(isLoggedIn ? '/dashboard' : '/login')}
                  className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-gray-200 hover:bg-black transition-all flex items-center justify-center gap-2 group"
                >
                  {isLoggedIn ? 'Buka Dashboard' : 'Mulai Sekarang'}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById('features');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  Pelajari Fitur
                </button>
              </div>
              
              {/* Quick Stats */}
              <div className="pt-8 flex flex-wrap justify-center lg:justify-start gap-8 sm:gap-12 text-gray-400">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-gray-900 italic">2.4k+</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest">Aset Terdaftar</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-gray-900 italic">100%</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest">Akurasi GIS</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-gray-900 italic">24/7</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest">Monitoring</span>
                </div>
              </div>
            </div>

            {/* Visual Element - Mock Dashboard */}
            <div className="flex-1 w-full max-w-2xl lg:max-w-none animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="relative group">
                <div className="absolute inset-0 bg-green-500/20 blur-[60px] rounded-full group-hover:bg-green-500/30 transition-colors" />
                <div className="relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-[40px] p-4 sm:p-8 shadow-2xl overflow-hidden">
                  <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white">
                          <Leaf size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Batch Status</p>
                          <h4 className="text-sm font-bold text-gray-900">Corn Sector #7A</h4>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">STABIL</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <Activity size={18} className="text-green-500 mb-2" />
                        <p className="text-[10px] font-bold text-gray-400 mb-1">HEALTH INDEX</p>
                        <p className="text-lg font-black text-gray-900">98.2%</p>
                      </div>
                      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <MapIcon size={18} className="text-blue-500 mb-2" />
                        <p className="text-[10px] font-bold text-gray-400 mb-1">GIS PRECISION</p>
                        <p className="text-lg font-black text-gray-900">±1.4m</p>
                      </div>
                    </div>

                    <div className="p-4 bg-stone-900 rounded-2xl flex items-center justify-between text-white">
                       <span className="text-sm font-bold tracking-tight">Sistem Aktif</span>
                       <ShieldCheck className="text-emerald-400" size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" className="px-4 sm:px-6 lg:px-12 py-20 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight mb-4">
               Ekosistem Digital Pertanian
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto font-medium">
               Teknologi terintegrasi untuk menjamin kepastian data dari lahan hingga ke tangan pemangku kepentingan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <FeatureCard 
              icon={<QrCode size={24} className="text-indigo-600" />}
              title="Identity Hub"
              description="Satu aset satu identitas. Gunakan QR Code fisik untuk akses instan log data tanaman."
            />
            <FeatureCard 
              icon={<MapIcon size={24} className="text-blue-600" />}
              title="GIS Tracking"
              description="Geotagging otomatis saat input data menjamin validitas lokasi pengerjaan lapangan."
            />
            <FeatureCard 
              icon={<BarChart3 size={24} className="text-emerald-600" />}
              title="Smart Analysis"
              description="Visualisasi grafik pertumbuhan dan kesehatan aset secara komprehensif."
            />
            <FeatureCard 
              icon={<ShieldCheck size={24} className="text-orange-600" />}
              title="Data Integrity"
              description="Verifikasi bertingkat untuk memastikan akurasi data mandor dan petugas."
            />
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 sm:py-24 bg-[#1a4d3e] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/leaf.png')] opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight mb-8">
            Siap Membangun Masa Depan <br className="hidden sm:block" /> Pertanian yang Terukur?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-10 py-5 bg-white text-[#1a4d3e] rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-2xl active:scale-95"
            >
              Daftar Gratis Sekarang
            </button>
            <button className="w-full sm:w-auto px-10 py-5 bg-emerald-600/20 text-white border border-white/20 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-600/30 transition-all">
              Hubungi Kami
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-4 sm:px-6 lg:px-12 py-12 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white">
                <Leaf size={20} />
             </div>
             <span className="text-xl font-bold text-gray-900 tracking-tight">GeoAgri.</span>
          </div>
          <p className="text-gray-400 text-sm font-medium">
            © 2026 GeoAgri Systems. Built for Future Agriculture.
          </p>
          <div className="flex items-center gap-6 text-sm font-bold text-gray-500 uppercase tracking-widest">
            <a href="#" className="hover:text-green-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-green-600 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-8 bg-[#f5f7f6] rounded-[32px] border border-transparent hover:border-green-100 hover:bg-white transition-all group shadow-hover-xl">
    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight flex items-center gap-2">
      {title}
      <ArrowUpRight size={16} className="text-gray-300 group-hover:text-green-500 transition-colors" />
    </h3>
    <p className="text-gray-500 text-sm leading-relaxed font-medium capitalize">
      {description}
    </p>
  </div>
);

const Sparkles = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" /><path d="M3 5h4" /><path d="M21 17v4" /><path d="M19 19h4" />
  </svg>
);

export default Home;