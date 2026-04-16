import { 
  ShieldCheck, 
  MapPin, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Leaf, 
  AlertTriangle, 
  Zap, 
  Camera, 
  Image as ImageIcon, 
  Loader2 
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useRef } from 'react';

interface FormStepProps {
  scannedId: string;
  assetName: string;
  scannedCategory: string;
  manualAddress: string;
  coords: { lat: number; lng: number; accuracy: number } | null;
  loading: boolean;
  onReset: () => void;
  onCommit: () => void;
  
  // States
  fasePertumbuhan: string;
  setFasePertumbuhan: (v: string) => void;
  deployStatus: string;
  setDeployStatus: (v: string) => void;
  
  tinggiTanaman: string;
  setTinggiTanaman: (v: string) => void;
  diameterBatang: string;
  setDiameterBatang: (v: string) => void;
  jumlahDaun: string;
  setJumlahDaun: (v: string) => void;
  lebarKanopi: string;
  setLebarKanopi: (v: string) => void;
  jumlahBungaBuah: string;
  setJumlahBungaBuah: (v: string) => void;
  phTanah: string;
  setPhTanah: (v: string) => void;
  
  warnaDaun: string;
  setWarnaDaun: (v: string) => void;
  statusHama: string;
  setStatusHama: (v: string) => void;
  kelembapanTanah: string;
  setKelembapanTanah: (v: string) => void;
  
  tindakanDipilih: string[];
  toggleTindakan: (t: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  
  photoPreview: string | null;
  photoDetailPreview: string | null;
  handlePhotoCapture: (e: React.ChangeEvent<HTMLInputElement>, type: 'overview' | 'detail') => void;
}

export const FormStep = ({
  scannedId,
  assetName,
  scannedCategory,
  manualAddress,
  coords: _coords,
  loading,
  onReset,
  onCommit,
  fasePertumbuhan,
  setFasePertumbuhan,
  deployStatus,
  setDeployStatus,
  tinggiTanaman,
  setTinggiTanaman,
  diameterBatang,
  setDiameterBatang,
  jumlahDaun,
  setJumlahDaun,
  lebarKanopi,
  setLebarKanopi,
  jumlahBungaBuah,
  setJumlahBungaBuah,
  phTanah,
  setPhTanah,
  warnaDaun,
  setWarnaDaun,
  statusHama,
  setStatusHama,
  kelembapanTanah,
  setKelembapanTanah,
  tindakanDipilih,
  toggleTindakan,
  notes,
  setNotes,
  photoPreview,
  photoDetailPreview,
  handlePhotoCapture
}: FormStepProps) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const detailCameraRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col min-h-[800px] animate-in slide-in-from-right duration-700 bg-white shadow-2xl rounded-t-[40px] mt-4 lg:mt-0">
      {/* Compact Identity Header */}
      <div className="px-10 py-8 bg-gradient-to-r from-indigo-50/80 to-emerald-50/50 border-b border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-t-[40px]">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">{scannedId}</h3>
            <p className="text-indigo-600 text-[11px] font-bold uppercase tracking-widest mt-1">
              {scannedCategory || 'Agricultural'} • {assetName || 'Verified Unit'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-xl border border-indigo-100 shadow-sm">
            <MapPin size={16} className="text-indigo-600" />
            <span className="text-[12px] font-bold text-gray-700 truncate max-w-[200px] md:max-w-xs">{manualAddress || 'Location Synchronized'}</span>
          </div>
          <button
            onClick={onReset}
            className="p-3 bg-white hover:bg-red-50 text-stone-400 hover:text-red-500 transition-all rounded-xl border border-gray-100 shadow-sm"
            title="Reset & Scan Ulang"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* REPORTING ENGINE (Form Side) */}
      <div className="flex-1 p-8 md:p-14 bg-white overflow-y-auto">
        <div className="flex items-end justify-between border-b border-gray-100 pb-8 mb-12">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">Field Report</h2>
            <p className="text-gray-400 text-[11px] font-bold mt-3 uppercase tracking-[0.2em] italic">Growth metrics & Health Intel</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 size={24} className="text-emerald-500" />
          </div>
        </div>

        <div className="space-y-20">
          {/* CATEGORY 1: HEALTH & PHASE */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                <CheckCircle2 size={20} />
              </div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Growth Phase & Health</h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Fase Pertumbuhan</label>
                <div className="grid grid-cols-2 gap-3">
                  {['vegetatif_awal', 'vegetatif_aktif', 'generatif', 'ripening'].map(v => (
                    <button
                      key={v}
                      onClick={() => setFasePertumbuhan(v)}
                      className={cn(
                        "py-4 px-3 rounded-2xl text-[11px] font-bold uppercase transition-all border-2",
                        fasePertumbuhan === v ? "bg-stone-900 border-stone-900 text-white shadow-xl" : "bg-gray-50 border-transparent text-gray-400 hover:border-gray-200"
                      )}
                    >
                      {v.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Status Kesehatan Umum</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { k: 'sehat_luar_biasa', l: 'Prima', i: <Sparkles size={18} /> },
                    { k: 'sehat', l: 'Sehat', i: <Leaf size={18} /> },
                    { k: 'kurang_sehat', l: 'Layu', i: <AlertTriangle size={18} /> },
                    { k: 'kritis', l: 'Kritis', i: <Zap size={18} /> }
                  ].map(s => (
                    <button
                      key={s.k}
                      onClick={() => setDeployStatus(s.k)}
                      className={cn(
                        "py-5 px-1 rounded-2xl text-[10px] font-black uppercase transition-all border-2 flex flex-col items-center gap-3",
                        deployStatus === s.k ? "bg-emerald-600 border-emerald-600 text-white shadow-2xl scale-[1.05]" : "bg-gray-50 border-transparent text-gray-400 hover:border-gray-200"
                      )}
                    >
                      {s.i}
                      {s.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CATEGORY 2: MORFOLOGI (Numeric) */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                <Leaf size={20} />
              </div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Morfologi & Fisik</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { l: 'Tinggi (cm)', v: tinggiTanaman, s: setTinggiTanaman },
                { l: 'Batang (mm)', v: diameterBatang, s: setDiameterBatang },
                { l: 'Jumlah Daun', v: jumlahDaun, s: setJumlahDaun },
                { l: 'Kanopi (cm)', v: lebarKanopi, s: setLebarKanopi },
                { l: 'Bunga/Buah', v: jumlahBungaBuah, s: setJumlahBungaBuah },
                { l: 'pH Tanah', v: phTanah, s: setPhTanah }
              ].map((item, i) => (
                <div key={i} className="space-y-4">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{item.l}</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={item.v}
                      onChange={e => item.s(e.target.value)}
                      placeholder="0.0"
                      className="w-full bg-gray-50 border-2 border-transparent rounded-[20px] px-6 py-5 text-base font-black text-stone-900 focus:bg-white focus:border-indigo-500 transition-all outline-none shadow-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CATEGORY 3: KUALITAS & LINGKUNGAN */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="space-y-6">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Warna Daun</label>
              <div className="flex flex-col gap-3">
                {[
                  { k: 'hijau_tua', l: 'Hijau Tua', c: 'bg-emerald-800' },
                  { k: 'hijau_kuning', l: 'Kekuningan', c: 'bg-yellow-400' },
                  { k: 'bercak', l: 'Bercak', c: 'bg-amber-900' },
                  { k: 'kuning', l: 'Kuning Mati', c: 'bg-yellow-600' }
                ].map(x => (
                  <button
                    key={x.k}
                    onClick={() => setWarnaDaun(x.k)}
                    className={cn(
                      "flex items-center gap-4 px-6 py-4 rounded-2xl border-2 transition-all text-[12px] font-bold",
                      warnaDaun === x.k ? "bg-white border-indigo-500 shadow-lg translate-x-2" : "bg-gray-50 border-transparent text-gray-400 hover:border-gray-200"
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded-full shadow-inner", x.c)}></div>
                    {x.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Hama</label>
              <div className="flex flex-col gap-3">
                {['nihil', 'ringan', 'sedang', 'berat'].map(x => (
                  <button
                    key={x}
                    onClick={() => setStatusHama(x)}
                    className={cn(
                      "text-left px-6 py-4 rounded-2xl border-2 transition-all text-[12px] font-bold uppercase",
                      statusHama === x ? "bg-red-50 border-red-200 text-red-600 shadow-md translate-x-2" : "bg-gray-50 border-transparent text-gray-400 hover:border-gray-200"
                    )}
                  >
                    {x} {x !== 'nihil' && 'Terdeteksi'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kelembapan Tanah</label>
              <div className="flex flex-col gap-3">
                {['kering', 'normal', 'basah'].map(x => (
                  <button
                    key={x}
                    onClick={() => setKelembapanTanah(x)}
                    className={cn(
                      "text-left px-6 py-4 rounded-2xl border-2 transition-all text-[12px] font-bold uppercase",
                      kelembapanTanah === x ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-md translate-x-2" : "bg-gray-50 border-transparent text-gray-400 hover:border-gray-200"
                    )}
                  >
                    {x}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CATEGORY 4: INTERVENSI & TINDAKAN */}
          <div className="space-y-10 p-10 bg-gray-50 rounded-[50px] border border-gray-100 shadow-inner">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
                <RotateCcw size={20} />
              </div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Tindakan Lapangan</h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {['Penyiraman', 'Pemupukan', 'Penyiangan', 'Pemangkasan', 'Pestisida'].map(t => (
                <button
                  key={t}
                  onClick={() => toggleTindakan(t)}
                  className={cn(
                    "py-5 px-3 rounded-2xl text-[10px] font-black uppercase transition-all border-2",
                    tindakanDipilih.includes(t) ? "bg-amber-500 border-amber-500 text-white shadow-xl scale-[1.02]" : "bg-white border-transparent text-gray-400 hover:border-amber-200"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Agronomic Observations</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Anomalies, pests, or rapid growth signals..."
                className="w-full bg-white border-2 border-transparent rounded-[40px] px-10 py-8 text-sm font-bold text-stone-700 shadow-lg focus:border-indigo-500 transition-all outline-none h-40 resize-none"
              />
            </div>
          </div>

          {/* CATEGORY 5: DOKUMENTASI VISUAL (DOUBLE) */}
          <div className="space-y-10">
             <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                <Camera size={20} />
              </div>
              <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Bukti Visual (Wajib Foto Overview)</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* OVERVIEW PHOTO */}
              <div className="space-y-6">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Foto Overview (Utama)</label>
                <div
                  onClick={() => cameraInputRef.current?.click()}
                  className={cn(
                    "aspect-video rounded-[40px] border-4 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group",
                    photoPreview ? "border-indigo-500 shadow-2xl" : "border-gray-100 hover:bg-gray-50 hover:border-indigo-200"
                  )}
                >
                  {photoPreview ? (
                    <>
                      <img src={photoPreview} className="w-full h-full object-cover" alt="Overview" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <Camera className="text-white" size={40} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-5">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 group-hover:text-indigo-300 transition-colors">
                        <Camera size={32} />
                      </div>
                      <span className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] italic">Ambil Foto Utama</span>
                    </div>
                  )}
                </div>
              </div>

              {/* DETAIL PHOTO */}
              <div className="space-y-6">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Foto Detail (Close-up)</label>
                <div
                  onClick={() => detailCameraRef.current?.click()}
                  className={cn(
                    "aspect-video rounded-[40px] border-4 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group",
                    photoDetailPreview ? "border-emerald-500 shadow-2xl" : "border-gray-100 hover:bg-gray-50 hover:border-emerald-200"
                  )}
                >
                  {photoDetailPreview ? (
                    <>
                      <img src={photoDetailPreview} className="w-full h-full object-cover" alt="Detail" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <Camera className="text-white" size={40} />
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-5">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 group-hover:text-emerald-300 transition-colors">
                        <ImageIcon size={32} />
                      </div>
                      <span className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] italic">Ambil Foto Close-up</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hidden Inputs */}
            <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={(e) => handlePhotoCapture(e, 'overview')} className="hidden" />
            <input type="file" ref={detailCameraRef} accept="image/*" capture="environment" onChange={(e) => handlePhotoCapture(e, 'detail')} className="hidden" />
          </div>

          <div className="pt-16 pb-12">
            <button
              onClick={onCommit}
              disabled={loading || !photoPreview}
              className="w-full py-8 bg-stone-900 text-white rounded-[45px] font-black text-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:bg-black hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)] transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-5 uppercase tracking-[0.4em]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={28} />
              ) : (
                <>
                  Sync Report <CheckCircle2 size={28} />
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-[0.3em] mt-10 italic">
              Authorized Field Report • GPS Verified • Identity Secured
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
