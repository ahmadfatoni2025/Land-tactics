import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAttendance, type AssetData } from '../hooks/useAttendance';
import {
  QrCode, MapPin, Camera, Upload, Download, Loader2,
  CheckCircle2, AlertCircle, Navigation, Tag, FileText,
  Hash, Building2, User, ShieldCheck, Printer, RotateCcw, ChevronRight,
} from 'lucide-react';

// Tipe data untuk form internal halaman ini
interface AssetForm {
  assetId: string;
  assetName: string;
  category: string;
  description: string;
  lat: number | null;
  lng: number | null;
  address: string;
  condition: string;
  assignedTo: string;
  notes: string;
}

const initialForm: AssetForm = {
  assetId: '',
  assetName: '',
  category: '',
  description: '',
  lat: null,
  lng: null,
  address: '',
  condition: 'baru',
  assignedTo: '',
  notes: '',
};

const categories = ['Elektronik', 'Kendaraan', 'Kantor', 'Infrastruktur', 'Gudang', 'Medis', 'Lainnya'];

export const GenerateQRPage = () => {
  const navigate = useNavigate();
  const { saveAsset, loading, error: serverError } = useAttendance();
  const [form, setForm] = useState<AssetForm>(initialForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Auto-generate Asset ID
  const generateId = () => {
    const prefix = form.category ? form.category.toUpperCase().slice(0, 3) : 'AST';
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    setForm(f => ({ ...f, assetId: `${prefix}-${rand}` }));
  };

  const updateField = (field: keyof AssetForm, value: any) => setForm(f => ({ ...f, [field]: value }));

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return setGpsError('GPS tidak didukung');
    setGpsLoading(true); setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateField('lat', pos.coords.latitude);
        updateField('lng', pos.coords.longitude);
        setGpsLoading(false);
      },
      () => { setGpsError('Gagal akses GPS'); setGpsLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg || !form.assetId) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 512, 512);
      const link = document.createElement('a');
      link.download = `QR-${form.assetId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleSubmit = async () => {
    if (!form.assetId || !form.assetName || !form.lat || !photoFile) return alert('Lengkapi data wajib!');
    
    const assetData: AssetData = {
      barcode_id: form.assetId,
      lat: form.lat!,
      lng: form.lng!,
      photo_file: photoFile,
      asset_name: form.assetName,
      category: form.category,
      condition: form.condition,
      assigned_to: form.assignedTo,
      notes: form.notes + (form.description ? ` | ${form.description}` : ''),
      address: form.address,
    };

    const result = await saveAsset(assetData);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/assets'), 2000);
    }
  };

  const qrPayload = form.assetId ? JSON.stringify({ id: form.assetId, name: form.assetName, cat: form.category }) : '';
  const isComplete = form.assetId && form.assetName && form.lat && photoFile;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      <div className="flex items-center gap-2 text-xs text-stone-400 mb-6">
        <span onClick={() => navigate('/assets')} className="cursor-pointer hover:text-teal font-medium">Daftar Aset</span>
        <ChevronRight size={12} />
        <span className="text-stone-700 font-bold">Registrasi Kilat Aset Baru</span>
      </div>

      <div className="mb-10">
        <h1 className="text-3xl font-black text-stone-900 tracking-tighter">Registrasi & Labeling Aset</h1>
        <p className="text-sm text-stone-400 mt-1">Satu pintu untuk registrasi, geotagging, dokumentasi, dan labeling QR.</p>
      </div>

      {success && (
        <div className="mb-8 p-6 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-black text-emerald-900">Aset Berhasil Didaftarkan!</p>
            <p className="text-xs text-emerald-600 font-medium tracking-tight">Data sedang diselaraskan dengan database satelit...</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* KIRI: Form Detail */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white rounded-[40px] border border-stone-200/60 p-8 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm shadow-indigo-100">
                <Tag size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900 tracking-tight">Identitas Aset</h3>
                <p className="text-xs text-stone-400 font-medium">Informasi kunci untuk katalog database.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Asset ID / Serial Number *</label>
                <div className="flex gap-3">
                  <input
                    type="text" value={form.assetId} onChange={e => updateField('assetId', e.target.value)}
                    className="flex-1 bg-stone-50 rounded-2xl px-5 py-4 text-sm font-black text-stone-900 border border-stone-100 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  />
                  <button onClick={generateId} className="px-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100">AUTO</button>
                </div>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Nama Aset *</label>
                <input
                  type="text" value={form.assetName} onChange={e => updateField('assetName', e.target.value)}
                  className="w-full bg-stone-50 rounded-2xl px-5 py-4 text-sm font-bold text-stone-800 border border-stone-100 focus:ring-4 focus:ring-teal/5 outline-none transition-all"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Kategori Utama</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat} onClick={() => updateField('category', cat)}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all ${form.category === cat ? 'bg-teal text-white shadow-xl shadow-teal/20' : 'bg-stone-50 text-stone-400 border border-stone-100 hover:bg-stone-100'}`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[40px] border border-stone-200/60 p-8 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-100">
                <Navigation size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-stone-900 tracking-tight">Geotagging & Presisi Keamanan</h3>
                <p className="text-xs text-stone-400 font-medium">Validasi lokasi fisik aset melalui GPS Militer.</p>
              </div>
            </div>

            <div className="space-y-6">
              <button
                onClick={requestLocation} disabled={gpsLoading}
                className="w-full bg-emerald-600 text-white rounded-2xl py-4.5 font-black text-sm shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {gpsLoading ? <><Loader2 className="animate-spin" /> MENCARI SATELIT...</> : form.lat ? <><CheckCircle2 /> GPS LOCKED</> : <><MapPin /> AMBIL LOKASI GPS</>}
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">LATITUDE</p>
                  <p className="text-xl font-black text-indigo-900 tabular-nums">{form.lat ? form.lat.toFixed(6) : '—'}</p>
                </div>
                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">LONGITUDE</p>
                  <p className="text-xl font-black text-indigo-900 tabular-nums">{form.lng ? form.lng.toFixed(6) : '—'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Nama Area / Gedung / Lokasi Spesifik</label>
                <div className="relative">
                   <Building2 size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-300" />
                   <input
                     type="text" value={form.address} onChange={e => updateField('address', e.target.value)}
                     className="w-full bg-stone-50 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold text-stone-800 border border-stone-100 focus:ring-4 focus:ring-teal/5 outline-none transition-all"
                   />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[40px] border border-stone-200/60 p-8 shadow-sm space-y-8 text-center sm:text-left">
             <label className="cursor-pointer bg-stone-950 border-2 border-dashed border-stone-800 rounded-[32px] p-10 flex flex-col sm:flex-row items-center justify-center gap-8 hover:bg-stone-900 transition-all border-teal/20 group">
                {photoPreview ? (
                  <img src={photoPreview} className="h-40 w-40 rounded-3xl object-cover border-4 border-teal shadow-2xl shadow-teal/20 animate-in zoom-in-75 duration-300" />
                ) : (
                  <div className="h-32 w-32 rounded-3xl bg-white/5 flex items-center justify-center text-teal group-hover:scale-110 transition-transform">
                    <Camera size={48} />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="text-white font-black text-lg tracking-tight">Dokumentasi Foto *</h4>
                  <p className="text-stone-500 text-xs font-medium mt-1">Capture kondisi aset langsung di lapangan.</p>
                  <div className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-teal text-white rounded-xl text-[10px] font-black tracking-widest uppercase">
                    <Upload size={14} /> Pilih Berkas / Ambil Foto
                  </div>
                </div>
                <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
             </label>
          </section>
        </div>

        {/* KANAN: Label QR & Commit */}
        <div className="lg:col-span-5">
           <div className="sticky top-24 space-y-6">
              <div className="bg-stone-950 rounded-[48px] p-10 shadow-2xl relative overflow-hidden group">
                 {/* Decorative background circle */}
                 <div className="absolute -top-24 -right-24 h-64 w-64 bg-teal/10 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700"></div>
                 
                 <div className="relative z-10 space-y-10">
                    <div className="flex items-center justify-between">
                       <div className="px-5 py-1.5 rounded-full bg-teal text-white text-[10px] font-black tracking-widest uppercase">PREVIEW LABEL</div>
                       <QrCode size={24} className="text-teal" />
                    </div>

                    <div ref={qrRef} className="aspect-square w-64 mx-auto bg-white rounded-3xl p-8 flex items-center justify-center shadow-2xl ring-8 ring-white/5 transition-transform hover:scale-105 duration-300">
                       {form.assetId ? (
                         <QRCodeSVG value={qrPayload} size={200} level="H" />
                       ) : (
                         <div className="text-center space-y-3 opacity-10">
                           <QrCode size={64} className="mx-auto" />
                           <p className="text-[10px] font-black uppercase tracking-widest">ID ASET KOSONG</p>
                         </div>
                       )}
                    </div>

                    <div className="text-center space-y-1">
                       <p className="text-white font-black text-xl tracking-widest uppercase truncate">{form.assetId || 'TUNGGU ID...'}</p>
                       <p className="text-teal font-medium text-xs tracking-tighter uppercase">{form.assetName || 'NAMA ASET BELUM DIISI'}</p>
                    </div>

                    <div className="pt-2 flex flex-col gap-3">
                       <button onClick={downloadQR} disabled={!form.assetId} className="w-full bg-white text-stone-950 rounded-2xl py-4.5 font-black text-xs hover:bg-stone-100 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-20">
                          <Download size={16} /> DOWNLOAD SVG/PNG
                       </button>
                       <button onClick={() => window.print()} disabled={!form.assetId} className="w-full bg-white/5 text-white border border-white/10 rounded-2xl py-4 font-bold text-xs hover:bg-white/10 transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-2">
                          <Printer size={16} /> PRINT LABEL
                       </button>
                    </div>
                 </div>
              </div>

              <div className="bg-white rounded-[40px] border border-stone-200/60 p-8 shadow-sm space-y-6">
                 <button
                   onClick={handleSubmit} disabled={!isComplete || loading}
                   className="w-full bg-teal text-white rounded-3xl py-6 font-black text-sm shadow-2xl shadow-teal/20 hover:bg-teal-light hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
                 >
                   {loading ? <><Loader2 className="animate-spin" /> SINGKRONISASI DATA...</> : <><CheckCircle2 /> COMMIT & DAFTARKAN ASET</>}
                   {!isComplete && !loading && (
                     <div className="absolute inset-0 bg-stone-900/5 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                       <span className="text-[10px] font-black text-stone-400 tracking-widest uppercase">DATA BELUM LENGKAP</span>
                     </div>
                   )}
                 </button>

                 <button onClick={() => setForm(initialForm)} className="w-full text-stone-400 font-bold text-xs hover:text-red-500 transition-colors flex items-center justify-center gap-2">
                    <RotateCcw size={14} /> RESET SEMUA DATA
                 </button>

                 <div className="p-5 bg-indigo-50/30 rounded-3xl border border-indigo-100/50 flex items-center gap-4">
                    <ShieldCheck size={28} className="text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">KEAMANAN DATA</p>
                      <p className="text-[10px] text-indigo-500 font-medium leading-tight mt-0.5">Semua data dienkripsi asimetris sebelum diproses oleh satelit database.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
