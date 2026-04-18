import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAttendance, type AssetData } from '../hooks/useAttendance';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import {
  MapPin, Camera, Upload, Download, Loader2,
  CheckCircle2, RotateCcw, ChevronRight,
  ChevronDown,
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
  plantingMethod: 'Konvensional',
  targetHarvestDate: '',
};

const commodities = ['Tanaman Pangan', 'Hortikultura', 'Perkebunan', 'Tanaman Hias', 'Tanaman Obat', 'Sarana Produksi (Saprodi)', 'Alat & Mesin (Alsintan)'];

import { Leaf, Sprout } from 'lucide-react';

export const GenerateQRPage = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();
  const { saveAsset, loading } = useAttendance();

  const [form, setForm] = useState<PlantForm>(initialForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Ambil lokasi saat ini
  const refreshLocation = useCallback(() => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setLocLoading(false);
      },
      (err) => {
        console.error('Location error:', err);
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-stone-400 italic animate-pulse">Memuat Otorisasi...</div>;
  if (!isAdmin) return <Navigate to="/" />;

  // Auto-generate Batch ID
  const generateId = () => {
    const prefix = form.commodity ? form.commodity.toUpperCase().slice(0, 3) : 'PLT';
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    setForm(f => ({ ...f, batchId: `${prefix}-${rand}` }));
  };

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
      return alert('Foto Tanaman Wajib Diunggah! Silakan ambil foto sebagai bukti registrasi batch baru.');
    }

    const assetData: AssetData = {
      barcode_id: form.batchId,
      photo_file: photoFile,
      lat: coords?.lat || 0,
      lng: coords?.lng || 0,
      accuracy: coords?.accuracy,
      asset_name: form.plantName,
      category: form.commodity,
      condition: form.growthStatus,
      assigned_to: form.fieldManager,
      notes: form.agronomicNotes,
      metode_tanam: form.plantingMethod,
      target_panen: form.targetHarvestDate || undefined,
      address: form.location,
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
      <div className="w-full min-h-screen bg-[#f8faf9] flex items-center justify-center p-6 md:p-10">
        <div className="max-w-4xl w-full text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-emerald-600 p-8 md:p-12 text-white flex flex-col items-center">
            <div className="h-20 w-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Batch Berhasil Terdaftar!</h1>
            <p className="text-emerald-100 mt-2 text-sm md:text-base max-w-md">
              QR Code di bawah ini sudah aktif dan siap digunakan sebagai label identitas tanaman di lapangan.
            </p>
          </div>

          <div className="p-8 md:p-12 flex flex-col items-center">
            <div ref={qrRef} className="bg-white p-6 rounded-3xl shadow-xl border-4 border-emerald-50 mb-8 transform hover:scale-105 transition-transform duration-300">
              <QRCodeSVG value={qrPayload} size={220} level="H" includeMargin />
            </div>

            <div className="space-y-2 mb-10">
              <h2 className="text-2xl font-black text-stone-900 tracking-tight">{form.batchId}</h2>
              <div className="flex items-center justify-center gap-2">
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {form.commodity || 'Tanaman'}
                </span>
                <span className="text-stone-400">•</span>
                <span className="text-stone-600 font-medium">{form.plantName}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
              <button
                onClick={downloadQR}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-stone-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-lg active:scale-95"
              >
                <Download size={18} /> Cetak Label QR
              </button>
              <button
                onClick={() => navigate('/assets')}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold text-sm hover:bg-emerald-100 transition-all active:scale-95"
              >
                Ke Inventori <ChevronRight size={18} />
              </button>
            </div>

            <button
              onClick={() => {
                setSuccess(false);
                setForm(initialForm);
                setPhotoFile(null);
                setPhotoPreview(null);
              }}
              className="mt-8 text-stone-400 text-xs font-bold hover:text-stone-600 transition-colors flex items-center gap-1"
            >
              <RotateCcw size={12} /> Daftarkan Batch Lainnya
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f5f7f6]">
      <div className="px-6 lg:px-8 py-6">
        
        {/* Header Title Section - Consistent with AssetsPage & ScannerPage */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold tracking-widest text-green-600 uppercase mb-2">
              REGISTRATION MODULE
            </p>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Batch Registration</h1>
            <p className="text-[15px] text-gray-500 max-w-xl leading-relaxed">
              Initialize new agricultural units with precise geotagging and instant QR generation for end-to-end traceability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/assets')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm"
            >
              <RotateCcw size={18} className="text-gray-600" />
              Discard Changes
            </button>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Form Header */}
          <div className="p-10 md:p-14 pb-0 flex items-start gap-7">
            <div className="h-16 w-16 shrink-0 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
              <Sprout size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">Registration Form</h2>
              <p className="text-gray-400 text-xs font-bold mt-3 uppercase tracking-widest">Digitalize agricultural units with precision telemetry</p>
            </div>
          </div>

          <div className="px-8 md:px-12 py-4">
            <div className="space-y-8 md:space-y-10">
              {/* Row 1: Batch ID & Commodity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-3">
                  <label className="text-xs md:text-sm font-black text-[#111827] ml-0.5 uppercase tracking-widest opacity-70">Batch ID / Kode Lot *</label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={form.batchId}
                      onChange={e => updateField('batchId', e.target.value)}
                      placeholder="Contoh: PADI-2024-A1"
                      className="w-full bg-[#FAFAFA] border-2 border-gray-100 rounded-2xl px-5 md:px-6 py-4 md:py-5 text-sm md:text-base font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 transition-all placeholder:font-normal placeholder:opacity-50"
                    />
                    <button
                      onClick={generateId}
                      className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 px-3 md:px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] md:text-xs font-black hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100 active:scale-95"
                    >
                      GENERATE
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs md:text-sm font-black text-[#111827] ml-0.5 uppercase tracking-widest opacity-70">Kategori Komoditas</label>
                  <div className="relative group">
                    <select
                      value={form.commodity}
                      onChange={e => updateField('commodity', e.target.value)}
                      className="w-full bg-[#FAFAFA] border-2 border-gray-100 rounded-2xl px-5 md:px-6 py-4 md:py-5 text-sm md:text-base font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 transition-all appearance-none"
                    >
                      <option value="">Pilih Komoditas</option>
                      {commodities.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Plant Name & Manager */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-3">
                  <label className="text-xs md:text-sm font-black text-[#111827] ml-0.5 uppercase tracking-widest opacity-70">Varietas / Nama Tanaman *</label>
                  <input
                    type="text"
                    value={form.plantName}
                    onChange={e => updateField('plantName', e.target.value)}
                    placeholder="Padi IR64 / Jagung Hybrid"
                    className="w-full bg-[#FAFAFA] border-2 border-gray-100 rounded-2xl px-5 md:px-6 py-4 md:py-5 text-sm md:text-base font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 transition-all placeholder:font-normal"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs md:text-sm font-black text-[#111827] ml-0.5 uppercase tracking-widest opacity-70">Penanggung Jawab</label>
                  <input
                    type="text"
                    value={form.fieldManager}
                    onChange={e => updateField('fieldManager', e.target.value)}
                    placeholder="Nama petani / pengelola"
                    className="w-full bg-[#FAFAFA] border-2 border-gray-100 rounded-2xl px-5 md:px-6 py-4 md:py-5 text-sm md:text-base font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 transition-all placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Row 3: Planting Date & Target Harvest */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-3">
                  <label className="text-xs md:text-sm font-black text-[#111827] ml-0.5 uppercase tracking-widest opacity-70">Tanggal Tanam</label>
                  <input
                    type="date"
                    value={form.plantingDate}
                    onChange={e => updateField('plantingDate', e.target.value)}
                    className="w-full bg-[#FAFAFA] border-2 border-gray-100 rounded-2xl px-5 md:px-6 py-4 md:py-5 text-sm md:text-base font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs md:text-sm font-black text-[#111827] ml-0.5 uppercase tracking-widest opacity-70">Target/Estimasi Panen</label>
                  <input
                    type="date"
                    value={form.targetHarvestDate}
                    onChange={e => updateField('targetHarvestDate', e.target.value)}
                    className="w-full bg-[#FAFAFA] border-2 border-gray-100 rounded-2xl px-5 md:px-6 py-4 md:py-5 text-sm md:text-base font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Row 4: Planting Method & Population */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-3">
                  <label className="text-xs md:text-sm font-black text-[#111827] ml-0.5 uppercase tracking-widest opacity-70">Metode Tanam</label>
                  <div className="relative group">
                    <select
                      value={form.plantingMethod}
                      onChange={e => updateField('plantingMethod', e.target.value)}
                      className="w-full bg-[#FAFAFA] border-2 border-gray-100 rounded-2xl px-5 md:px-6 py-4 md:py-5 text-sm md:text-base font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 transition-all appearance-none"
                    >
                      <option value="Konvensional">Konvensional</option>
                      <option value="Organik">Organik</option>
                      <option value="Hidroponik">Hidroponik</option>
                      <option value="Greenhouse">Greenhouse</option>
                    </select>
                    <div className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs md:text-sm font-black text-[#111827] ml-0.5 uppercase tracking-widest opacity-70">Populasi (Jumlah Batang/Unit)</label>
                  <input
                    type="number"
                    value={form.plantPopulation}
                    onChange={e => updateField('plantPopulation', e.target.value)}
                    placeholder="Contoh: 500"
                    className="w-full bg-[#FAFAFA] border-2 border-gray-100 rounded-2xl px-5 md:px-6 py-4 md:py-5 text-sm md:text-base font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 transition-all placeholder:font-normal"
                  />
                </div>
              </div>


              {/* Row 4: Farm Location */}
              <div className="space-y-3">
                <label className="text-xs md:text-sm font-black text-[#111827] ml-0.5 uppercase tracking-widest opacity-70">Alamat Lahan / Nama Plot</label>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1 group">
                    <input
                      type="text"
                      value={form.location}
                      onChange={e => updateField('location', e.target.value)}
                      placeholder="Contoh: Desa Makmur, Blok B, Sawah Kidul"
                      className="w-full bg-[#FAFAFA] border-2 border-gray-100 rounded-2xl px-5 md:px-6 py-4 md:py-5 text-sm md:text-base font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 transition-all placeholder:font-normal"
                    />
                    <MapPin className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={20} />
                  </div>
            <button
                    onClick={refreshLocation}
                    disabled={locLoading}
                    className="h-[56px] md:h-auto px-6 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-green-700 hover:border-green-200 transition-all shadow-sm active:scale-95"
                  >
                    {locLoading ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                    {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Ambil Koordinat'}
                  </button>
                </div>
              </div>

              {/* Row 5: Growth Phase */}
              <div className="space-y-3">
                <label className="text-xs md:text-sm font-black text-[#111827] ml-0.5 uppercase tracking-widest opacity-70">Fase Pertumbuhan</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { id: 'pesemaian', label: 'Pesemaian' },
                    { id: 'vegetatif', label: 'Vegetatif' },
                    { id: 'generatif', label: 'Generatif' },
                    { id: 'panen', label: 'Panen' },
                    { id: 'pasca_panen', label: 'Pasca' },
                  ].map(phase => (
                    <button
                      key={phase.id}
                      onClick={() => updateField('growthStatus', phase.id)}
                      className={`py-3 px-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-tighter transition-all border-2 ${form.growthStatus === phase.id
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100'
                        : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50 hover:border-emerald-200'
                        }`}
                    >
                      {phase.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Section */}
              <div className="space-y-4">
                <label className="text-xs md:text-sm font-black text-[#111827] uppercase tracking-widest opacity-70 flex items-center gap-2">
                  Foto Dokumentasi Tanaman
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-[9px] font-black rounded-full uppercase tracking-widest">Wajib</span>
                </label>
                <label className="relative block border-2 border-dashed border-emerald-100 rounded-[32px] md:rounded-[40px] p-8 md:p-14 cursor-pointer bg-[#FBFDFB] hover:bg-emerald-50 transition-all group overflow-hidden text-center shadow-inner">
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
                  <div className="flex flex-col items-center justify-center">
                    {photoPreview ? (
                      <div className="relative h-40 w-40 md:h-56 md:w-56 mb-6 group-hover:scale-105 transition-transform duration-500">
                        <img src={photoPreview} className="h-full w-full object-cover rounded-3xl shadow-2xl border-4 border-white" alt="Preview" />
                        <div className="absolute inset-0 bg-emerald-900/40 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                          <RotateCcw className="text-white" size={32} />
                        </div>
                      </div>
                    ) : (
                      <div className="h-16 w-16 md:h-20 md:w-20 bg-white rounded-full flex items-center justify-center shadow-xl border border-emerald-50 mb-6 md:mb-8 text-emerald-500 group-hover:rotate-12 transition-transform">
                        <Camera size={32} className="md:w-10 md:h-10" />
                      </div>
                    )}
                    <h4 className="text-[#111827] font-black text-lg md:text-xl italic">
                      {photoFile ? 'Foto Terpilih!' : 'Ambil Foto Lahan'}
                    </h4>
                    <p className="text-gray-400 text-xs md:text-sm mt-2 max-w-sm mx-auto font-medium">
                      Gunakan kamera untuk dokumentasi awal unit tanaman. Pastikan pencahayaan cukup.
                    </p>
                  </div>
                </label>
              </div>

              {/* Description Section */}
              <div className="space-y-3">
                <label className="text-xs md:text-sm font-black text-[#111827] uppercase tracking-widest opacity-70">Catatan Agronomis</label>
                <textarea
                  value={form.agronomicNotes}
                  onChange={e => updateField('agronomicNotes', e.target.value)}
                  placeholder="Kebutuhan NPK, populasi per hektar, atau kondisi tanah..."
                  className="w-full bg-[#FAFAFA] border-2 border-gray-100 rounded-3xl px-6 md:px-8 py-5 md:py-6 text-sm md:text-base font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white focus:border-emerald-500 transition-all h-32 md:h-40 resize-none placeholder:font-normal"
                />
              </div>

              {/* QR Preview Section */}
              {form.batchId && (
                <div className="p-8 md:p-10 bg-green-800 rounded-[32px] md:rounded-[48px] border border-green-700 flex flex-col md:flex-row items-center gap-8 md:gap-10 shadow-2xl shadow-green-200/30 animate-in fade-in zoom-in-95 duration-500">
                  <div ref={qrRef} className="bg-white p-5 rounded-[24px] shadow-2xl shrink-0 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <QRCodeSVG value={qrPayload} size={140} className="md:w-[160px] md:h-[160px]" level="H" includeMargin />
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <div className="inline-flex px-3 py-1 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest mb-3">Live Preview Label</div>
                    <h4 className="text-2xl md:text-3xl font-black text-white tracking-tighter leading-none">{form.batchId}</h4>
                    <p className="text-emerald-300 font-bold text-sm md:text-base mt-2 flex items-center justify-center md:justify-start gap-2 italic">
                      <Leaf size={16} /> {form.plantName || 'Varietas Belum Diisi'}
                    </p>
                    <p className="text-xs text-emerald-400/80 mt-4 leading-relaxed max-w-sm">Label ini akan terintegrasi dengan sistem pemantauan real-time setelah disimpan.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Footer Buttons */}
          <div className="p-8 md:p-12 mt-8 bg-[#FAFAFA] border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full md:w-auto order-2 md:order-1">
              <button
                onClick={() => navigate('/assets')}
                className="flex-1 md:flex-none px-10 py-5 bg-white border-2 border-gray-200 text-stone-600 font-black text-xs md:text-sm rounded-2xl md:rounded-[24px] hover:bg-gray-50 hover:border-stone-300 transition-all active:scale-95 uppercase tracking-widest"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setForm(initialForm);
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                className="flex-1 md:flex-none px-10 py-5 bg-white border-2 border-gray-200 text-stone-600 font-black text-xs md:text-sm rounded-2xl md:rounded-[24px] hover:bg-gray-50 hover:border-stone-300 transition-all active:scale-95 uppercase tracking-widest"
              >
                Reset
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isComplete || loading}
              className="w-full md:w-auto px-12 py-5 bg-green-600 text-white font-bold text-sm md:text-base rounded-2xl md:rounded-[32px] hover:bg-green-700 transition-all shadow-xl shadow-green-200/40 active:scale-95 disabled:opacity-30 disabled:grayscale disabled:shadow-none flex items-center justify-center gap-3 order-1 md:order-2 uppercase tracking-widest"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <Upload size={20} /> Simpan & Aktifkan QR
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};