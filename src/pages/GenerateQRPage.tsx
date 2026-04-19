import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAttendance, type AssetData } from '../hooks/useAttendance';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import {
  MapPin, Camera, Upload, Download, Loader2,
  CheckCircle2, RotateCcw, ChevronRight,
  ChevronDown, Leaf, Sprout, Info, AlertCircle
} from 'lucide-react';

// Tipe data untuk form monitoring tanaman
interface PlantForm {
  batchId: string;
  plantName: string;
  commodity: string;
  description: string;
  location: string;
  growthStatus: string;
  fieldManager: string;
  agronomicNotes: string;
  plantingDate: string;
  plantPopulation: string;
  plantUnit?: string;
  plantingMethod: string;
  targetHarvestDate: string;
}

const initialForm: PlantForm = {
  batchId: '',
  plantName: '',
  commodity: '',
  description: '',
  location: '',
  growthStatus: 'pesemaian',
  fieldManager: '',
  agronomicNotes: '',
  plantingDate: new Date().toISOString().split('T')[0],
  plantPopulation: '',
  plantUnit: 'Batang',
  plantingMethod: 'Konvensional',
  targetHarvestDate: '',
};

const commodities = [
  'Tanaman Pangan',
  'Hortikultura',
  'Perkebunan',
  'Tanaman Hias',
  'Tanaman Obat',
  'Sarana Produksi (Saprodi)',
  'Alat & Mesin (Alsintan)'
];

const growthPhases = [
  { id: 'pesemaian', label: 'Pesemaian', color: 'bg-amber-500' },
  { id: 'vegetatif', label: 'Vegetatif', color: 'bg-emerald-500' },
  { id: 'generatif', label: 'Generatif', color: 'bg-blue-500' },
  { id: 'panen', label: 'Panen', color: 'bg-rose-500' },
  { id: 'pasca_panen', label: 'Pasca', color: 'bg-stone-500' },
];

const units = ['Gram', 'Kilogram', 'Ton', 'Batang', 'Pohon', 'Bibit', 'Hektar', 'M2'];

export const GenerateQRPage = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const { saveAsset, loading } = useAttendance();

  const [form, setForm] = useState<PlantForm>(initialForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  if (authLoading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
      <p className="text-stone-400 font-medium animate-pulse">Memverifikasi Otorisasi...</p>
    </div>
  );

  if (!isAdmin) return <Navigate to="/" />;

  const updateField = (field: keyof PlantForm, value: any) => setForm(f => ({ ...f, [field]: value }));

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
    if (!svg || !form.batchId) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 512, 512);
      const link = document.createElement('a');
      link.download = `QR-${form.batchId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleSubmit = async () => {
    if (!form.batchId || !form.plantName || !photoFile) {
      return alert('Mohon lengkapi Nama Tanaman Utama, Varietas, dan Foto Tanaman.');
    }

    const assetData: AssetData = {
      barcode_id: form.batchId,
      photo_file: photoFile,
      lat: 0,
      lng: 0,
      accuracy: 0,
      asset_name: form.plantName,
      category: form.commodity,
      condition: form.growthStatus,
      assigned_to: form.fieldManager,
      notes: form.agronomicNotes + (form.plantPopulation ? `\n[Populasi: ${form.plantPopulation} ${form.plantUnit || 'Batang'}]` : ''),
      metode_tanam: form.plantingMethod,
      target_panen: form.targetHarvestDate || undefined,
      address: '',
    };

    const result = await saveAsset(assetData);
    if (result.success) {
      setSuccess(true);
    } else {
      alert('Gagal Registrasi: ' + (result.error || 'Terjadi kesalahan sistem.'));
    }
  };

  const qrPayload = form.batchId || '';
  const isComplete = form.batchId && form.plantName && photoFile;

  if (success) {
    return (
      <div className="w-full min-h-screen bg-[#f8faf9] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-white rounded-[1rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 border border-emerald-50">
          <div className="bg-emerald-600 p-12 text-white flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

            <div className="h-24 w-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 border border-white/30">
              <CheckCircle2 size={48} className="text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Pendaftaran Berhasil!</h1>
            <p className="text-emerald-50 mt-3 text-center max-w-sm leading-relaxed font-medium">
              ID Batch <span className="text-white font-black">{form.batchId}</span> telah aktif dan data tersinkronisasi.
            </p>
          </div>

          <div className="p-12 flex flex-col items-center">
            <div ref={qrRef} className="bg-white p-8 rounded-[1rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-stone-50 mb-10 transform transition-transform hover:scale-105 duration-500">
              <QRCodeSVG value={qrPayload} size={240} level="H" includeMargin />
            </div>

            <div className="grid grid-cols-1 gap-4 w-full">
              <button
                onClick={downloadQR}
                className="flex items-center justify-center gap-3 px-10 py-5 bg-stone-900 text-white rounded-[1rem] font-black text-sm hover:bg-black transition-all shadow-xl active:scale-95 group"
              >
                <Download size={20} className="group-hover:-translate-y-0.5 transition-transform" />
                Download PNG Label
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/assets')}
                  className="flex items-center justify-center gap-3 px-6 py-5 bg-emerald-50 text-emerald-700 rounded-[1rem] font-black text-xs hover:bg-emerald-100 transition-all active:scale-95"
                >
                  Inventori <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setForm(initialForm);
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                  className="flex items-center justify-center gap-3 px-6 py-5 bg-stone-50 text-stone-600 rounded-[1rem] font-black text-xs hover:bg-stone-100 transition-all active:scale-95"
                >
                  <RotateCcw size={18} /> Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#fbfcfb] text-stone-900 pb-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10">

        {/* Header - Premium Minimalist */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-stone-900">
              Registrasi <span className="text-emerald-600">Batch Tanaman</span>
            </h1>
            <p className="text-stone-400 font-medium text-sm md:text-base max-w-xl">
              Inisialisasi unit agrikultur baru dengan generator QR instan dan manajemen data agronomi terpusat.
            </p>
          </div>

          <button
            onClick={() => navigate('/assets')}
            className="group flex items-center gap-3 px-6 py-3 bg-white border border-stone-200 rounded-[1rem] text-sm font-bold text-stone-600 hover:border-emerald-600 hover:text-emerald-700 transition-all shadow-sm active:scale-95"
          >
            <RotateCcw size={18} className="group-hover:-rotate-45 transition-transform" />
            Batal & Kembali
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Main Form Section */}
          <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">

            {/* Form Section: Core Information */}
            <div className="bg-white rounded-[1rem] border border-stone-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="p-8 md:p-10 border-b border-stone-50 bg-[#fafafa]/50">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-[1rem] bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-700">
                    <Sprout size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Informasi Dasar</h3>
                    <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Identitas Utama Unit Tanaman</p>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-10 space-y-8">
                {/* Field Group 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">
                      Nama Tanaman Utama <AlertCircle size={14} className="text-emerald-500" />
                    </label>
                    <input
                      type="text"
                      value={form.batchId}
                      onChange={e => updateField('batchId', e.target.value)}
                      placeholder="Contoh: Durian Musang King Blok A"
                      className="w-full bg-[#fcfcfc] border-2 border-stone-100 rounded-[1rem] px-6 py-4.5 text-stone-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-stone-200"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">Kategori Komoditas</label>
                    <div className="relative group">
                      <select
                        value={form.commodity}
                        onChange={e => updateField('commodity', e.target.value)}
                        className="w-full bg-[#fcfcfc] border-2 border-stone-100 rounded-[1rem] px-6 py-4.5 text-stone-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all appearance-none"
                      >
                        <option value="">Pilih Komoditas</option>
                        {commodities.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-emerald-500 pointer-events-none transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Field Group 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">Varietas Spesifik</label>
                    <input
                      type="text"
                      value={form.plantName}
                      onChange={e => updateField('plantName', e.target.value)}
                      placeholder="Padi IR64 / Jagung Hybrid"
                      className="w-full bg-[#fcfcfc] border-2 border-stone-100 rounded-[1rem] px-6 py-4.5 text-stone-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-stone-200"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">Petani / Penanggung Jawab</label>
                    <input
                      type="text"
                      value={form.fieldManager}
                      onChange={e => updateField('fieldManager', e.target.value)}
                      placeholder="Nama petani pengelola"
                      className="w-full bg-[#fcfcfc] border-2 border-stone-100 rounded-[1rem] px-6 py-4.5 text-stone-900 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-stone-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section: Cultivation Details */}
            <div className="bg-white rounded-[1rem] border border-stone-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden">
              <div className="p-8 md:p-10 border-b border-stone-50 bg-[#fafafa]/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-[1rem] bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-700">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight">Detail Budidaya</h3>
                    <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Parameter Agroteknologi</p>
                  </div>
                </div>
              </div>

              <div className="p-8 md:p-10 space-y-10">
                {/* Dates & Method */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">Tgl Distribusi</label>
                    <input
                      type="date"
                      value={form.plantingDate}
                      onChange={e => updateField('plantingDate', e.target.value)}
                      className="w-full bg-[#fcfcfc] border-2 border-stone-100 rounded-[1rem] px-5 py-4 text-stone-900 font-bold focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">Target Panen</label>
                    <input
                      type="date"
                      value={form.targetHarvestDate}
                      onChange={e => updateField('targetHarvestDate', e.target.value)}
                      className="w-full bg-[#fcfcfc] border-2 border-stone-100 rounded-[1rem] px-5 py-4 text-stone-900 font-bold focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">Metode Tanam</label>
                    <select
                      value={form.plantingMethod}
                      onChange={e => updateField('plantingMethod', e.target.value)}
                      className="w-full bg-[#fcfcfc] border-2 border-stone-100 rounded-[1rem] px-5 py-4 text-stone-900 font-bold focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Konvensional">Konvensional</option>
                      <option value="Organik">Organik</option>
                      <option value="Hidroponik">Hidroponik</option>
                      <option value="Greenhouse">Greenhouse</option>
                    </select>
                  </div>
                </div>

                {/* Population Unit Selector */}
                <div className="space-y-4 pt-2">
                  <label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">
                    Kuantitas / Populasi Batch
                  </label>
                  <div className="flex gap-4">
                    <div className="relative flex-1 group">
                      <input
                        type="number"
                        value={form.plantPopulation}
                        onChange={e => updateField('plantPopulation', e.target.value)}
                        placeholder="0"
                        className="w-full bg-[#fcfcfc] border-2 border-stone-100 rounded-[1rem] px-8 py-5 text-xl font-black text-stone-900 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-stone-100 shadow-inner"
                      />
                    </div>
                    <div className="relative w-40 shrink-0 group">
                      <select
                        value={form.plantUnit || 'Batang'}
                        onChange={e => updateField('plantUnit', e.target.value)}
                        className="w-full h-full bg-[#fcfcfc] border-2 border-stone-100 rounded-[1rem] px-6 py-5 text-stone-900 font-black focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer text-sm"
                      >
                        {units.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-300 pointer-events-none group-focus-within:text-emerald-500" />
                    </div>
                  </div>
                </div>

                {/* Growth Stage Selector - Premium Horizontal Buttons */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">Status Fase Pertumbuhan</label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {growthPhases.map(phase => (
                      <button
                        key={phase.id}
                        type="button"
                        onClick={() => updateField('growthStatus', phase.id)}
                        className={`group relative overflow-hidden py-4 px-3 rounded-[1rem] border-2 transition-all duration-300 ${form.growthStatus === phase.id
                          ? `${phase.color} border-transparent text-white shadow-lg scale-[1.02]`
                          : 'bg-stone-50 border-stone-100 text-stone-400 hover:border-stone-200 hover:bg-stone-100'
                          }`}
                      >
                        <div className="relative z-10 flex flex-col items-center gap-1">
                          <span className={`text-[10px] font-black uppercase tracking-tighter ${form.growthStatus === phase.id ? 'text-white' : 'text-stone-500'}`}>
                            {phase.label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white rounded-[1rem] border border-stone-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] p-10 space-y-4">
              <label className="text-[11px] font-black text-stone-500 uppercase tracking-widest ml-1">Catatan Agronomis & Teknis</label>
              <textarea
                value={form.agronomicNotes}
                onChange={e => updateField('agronomicNotes', e.target.value)}
                placeholder="Detail pemupukan, kebutuhan NPK, populasi per hektar, atau instruksi khusus lapangan..."
                className="w-full bg-[#fcfcfc] border-2 border-stone-100 rounded-[1rem] px-8 py-6 text-stone-600 font-bold focus:outline-none focus:border-emerald-500 focus:bg-white transition-all h-40 resize-none placeholder:text-stone-200 leading-relaxed shadow-inner shadow-stone-50/50"
              />
            </div>
          </div>

          {/* Sticky Sidebar / Aside Section */}
          <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700 delay-200">

            {/* Visual Identity / Photo Section */}
            <div className="bg-white rounded-[1rem] border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="p-8 text-center bg-stone-50/50 border-b border-stone-50">
                <h3 className="text-base font-black tracking-tight">Identitas Visual</h3>
                <p className="text-stone-400 text-[10px] font-black uppercase tracking-widest mt-1 italic">Thumbnail Utama Scan QR</p>
              </div>

              <div className="p-8 space-y-6">
                <label className="relative block group cursor-pointer aspect-square rounded-[1rem] border-2 border-dashed border-stone-200 bg-[#fbfbfb] hover:bg-emerald-50 hover:border-emerald-200 transition-all overflow-hidden shadow-inner">
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />

                  {photoPreview ? (
                    <div className="relative h-full w-full group-hover:scale-110 transition-transform duration-700">
                      <img src={photoPreview} className="h-full w-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                        <RotateCcw className="text-white" size={32} />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center p-8 gap-4">
                      <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg border border-stone-100 text-emerald-600 animate-bounce transition-all">
                        <Camera size={28} />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black text-stone-900 uppercase tracking-widest">Ambil Foto Utama</p>
                        <p className="text-[10px] text-stone-400 mt-2 font-medium leading-relaxed">Wajib diunggah sebagai tanda pengenal digital di lapangan</p>
                      </div>
                    </div>
                  )}
                </label>

                {photoFile && (
                  <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Media Terunggah</span>
                  </div>
                )}
              </div>
            </div>

            {/* QR Live Preview Section */}
            <div className="bg-stone-900 rounded-[1rem] p-10 text-white shadow-[0_30px_60px_rgba(0,0,0,0.15)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>

              <div className="flex flex-col items-center gap-8 relative z-10">
                <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Preview QR-ID</span>
                </div>

                <div className="p-1 bg-white rounded-[1rem]">
                  <QRCodeSVG
                    value={qrPayload || 'PREVIEW-DATA'}
                    size={260}
                    level="H"
                    includeMargin
                    className={!form.batchId ? 'opacity-10 grayscale' : 'opacity-100'}
                  />
                </div>

                <div className="text-center space-y-3 w-full">
                  <h4 className="text-2xl font-black tracking-tighter truncate px-2">
                    {form.batchId || 'IDENTITAS BATCH'}
                  </h4>

                  <div className="h-px w-12 bg-emerald-500/30 mx-auto"></div>

                  <div className="flex items-center justify-center gap-2 text-stone-400 font-bold text-xs italic">
                    <Leaf size={14} className="text-emerald-500" />
                    <span className="truncate max-w-[200px]">{form.plantName || 'Varietas Belum Diisi'}</span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-[1rem] w-full flex items-start gap-4">
                  <Info size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-stone-400 leading-relaxed font-medium">
                    QR akan mengaktifkan tracking real-time dan geotagging instan saat di-scan oleh unit lapangan.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Action Block */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={!isComplete || loading}
                className="w-full relative group overflow-hidden px-10 py-6 bg-emerald-600 text-white font-black text-sm rounded-[1rem] shadow-2xl shadow-emerald-200 transition-all active:scale-95 disabled:opacity-20 disabled:grayscale disabled:shadow-none uppercase tracking-[0.2em]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="relative z-10 flex items-center justify-center gap-3">
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
                      Aktivasi Unit QR
                    </>
                  )}
                </div>
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};