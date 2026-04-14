import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAttendance, type AssetData } from '../hooks/useAttendance';
import {
  QrCode, MapPin, Camera, Upload, Download, Loader2,
  CheckCircle2, Navigation, Tag,
  Building2, ShieldCheck, Printer, RotateCcw, ChevronRight,
} from 'lucide-react';

// Tipe data untuk form monitoring tanaman
interface PlantForm {
  batchId: string;
  plantName: string;
  commodity: string;
  description: string;
  lat: number | null;
  lng: number | null;
  location: string;
  growthStatus: string;
  fieldManager: string;
  agronomicNotes: string;
}

const initialForm: PlantForm = {
  batchId: '',
  plantName: '',
  commodity: '',
  description: '',
  lat: null,
  lng: null,
  location: '',
  growthStatus: 'pesemaian',
  fieldManager: '',
  agronomicNotes: '',
};

const commodities = ['Tanaman Pangan', 'Hortikultura', 'Perkebunan', 'Tanaman Hias', 'Tanaman Obat', 'Sarana Produksi (Saprodi)', 'Alat & Mesin (Alsintan)'];

import { Leaf, Sprout, Trees, Ship, CloudUpload, Calendar, UserCheck, Search, Map as MapIcon } from 'lucide-react';

export const GenerateQRPage = () => {
  const navigate = useNavigate();
  const { saveAsset, loading } = useAttendance();
  const [form, setForm] = useState<PlantForm>(initialForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  // Auto-generate Batch ID
  const generateId = () => {
    const prefix = form.commodity ? form.commodity.toUpperCase().slice(0, 3) : 'PLT';
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    setForm(f => ({ ...f, batchId: `${prefix}-${rand}` }));
  };

  const updateField = (field: keyof PlantForm, value: any) => setForm(f => ({ ...f, [field]: value }));

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return alert('GPS tidak didukung');
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateField('lat', pos.coords.latitude);
        updateField('lng', pos.coords.longitude);
        setGpsLoading(false);
      },
      () => { alert('Gagal akses GPS'); setGpsLoading(false); },
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
    if (!form.batchId || !form.plantName || !form.lat || !photoFile) return alert('Lengkapi data wajib!');

    const assetData: AssetData = {
      barcode_id: form.batchId,
      lat: form.lat!,
      lng: form.lng!,
      photo_file: photoFile,
      asset_name: form.plantName,
      category: form.commodity,
      condition: form.growthStatus,
      assigned_to: form.fieldManager,
      notes: form.agronomicNotes,
      address: form.location,
    };

    const result = await saveAsset(assetData);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/assets'), 2000);
    }
  };

  const qrPayload = form.batchId ? JSON.stringify({ id: form.batchId, name: form.plantName, commodity: form.commodity }) : '';
  const isComplete = form.batchId && form.plantName && form.lat && photoFile;

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* Header Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] md:text-sm text-stone-400 mb-2 ml-1">
        <span onClick={() => navigate('/assets')} className="cursor-pointer hover:text-teal font-medium transition-colors uppercase tracking-wider">Monitoring</span>
        <ChevronRight size={12} className="opacity-50" />
        <span className="text-stone-900 font-bold uppercase tracking-wider">Pendaftaran Batch Tanaman</span>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-stone-200/60 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Form Header */}
        <div className="p-6 md:p-10 pb-4 md:pb-6 flex items-start gap-4 md:gap-5">
          <div className="h-10 w-10 md:h-14 md:w-14 shrink-0 rounded-xl md:rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Sprout size={22} className="md:w-7 md:h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#111827]">Registrasi Lahan & Tanaman</h1>
            <p className="text-gray-400 text-xs md:text-sm mt-0.5 leading-tight">Pantau perkembangan agrikultur dengan geotagging dan QR batch</p>
          </div>
        </div>

        <div className="px-6 md:px-10 py-4">
          {success && (
            <div className="mb-6 md:mb-8 p-3 md:p-4 bg-emerald-50 border border-emerald-100 rounded-xl md:rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
              <p className="text-xs md:text-sm font-semibold text-emerald-800">Data batch berhasil disimpan!</p>
            </div>
          )}

          <div className="space-y-6 md:space-y-8">
            {/* Row 1: Batch ID & Commodity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-[#111827] ml-0.5">Batch ID / Kode Lot *</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={form.batchId}
                    onChange={e => updateField('batchId', e.target.value)}
                    placeholder="Contoh: PADI-2024-A1"
                    className="w-full bg-[#FAFAFA] border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-5 py-3.5 md:py-4 text-xs md:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all"
                  />
                  <button
                    onClick={generateId}
                    className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 px-2 md:px-3 py-1 md:py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] md:text-[10px] font-bold hover:bg-emerald-100 transition-colors"
                  >
                    AUTO
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-[#111827] ml-0.5">Kategori Komoditas</label>
                <div className="relative group">
                  <select
                    value={form.commodity}
                    onChange={e => updateField('commodity', e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-5 py-3.5 md:py-4 text-xs md:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all appearance-none"
                  >
                    <option value="">Pilih Komoditas</option>
                    {commodities.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronRight size={14} className="rotate-90 md:w-4 md:h-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Plant Name & Manager */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-[#111827] ml-0.5">Varietas / Nama Tanaman *</label>
                <input
                  type="text"
                  value={form.plantName}
                  onChange={e => updateField('plantName', e.target.value)}
                  placeholder="Padi IR64 / Jagung Hybrid"
                  className="w-full bg-[#FAFAFA] border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-5 py-3.5 md:py-4 text-xs md:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-[#111827] ml-0.5">Penanggung Jawab</label>
                <input
                  type="text"
                  value={form.fieldManager}
                  onChange={e => updateField('fieldManager', e.target.value)}
                  placeholder="Nama petani / pengelola"
                  className="w-full bg-[#FAFAFA] border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-5 py-3.5 md:py-4 text-xs md:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            {/* Row 3: GPS Geotagging (Restored) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-[#111827] ml-0.5">Lintang (Lat) *</label>
                <div className="relative">
                  <input
                    readOnly
                    type="text"
                    value={form.lat || ''}
                    placeholder="Koordinat lat..."
                    className="w-full bg-[#FAFAFA] border border-gray-100 rounded-xl md:rounded-2xl px-10 py-3.5 md:py-4 text-xs md:text-sm font-mono text-gray-600 focus:outline-none"
                  />
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none" size={16} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-[#111827] ml-0.5">Bujur (Lng) *</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input
                      readOnly
                      type="text"
                      value={form.lng || ''}
                      placeholder="Koordinat lng..."
                      className="w-full bg-[#FAFAFA] border border-gray-100 rounded-xl md:rounded-2xl px-10 py-3.5 md:py-4 text-xs md:text-sm font-mono text-gray-600 focus:outline-none"
                    />
                    <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none" size={16} />
                  </div>
                  <button
                    onClick={requestLocation}
                    disabled={gpsLoading}
                    className="py-3 px-6 rounded-xl md:rounded-2xl bg-emerald-600 text-white font-bold text-xs md:text-sm shadow-md hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center shrink-0"
                  >
                    {gpsLoading ? <Loader2 size={16} className="animate-spin" /> : 'AMBIL LOKASI'}
                  </button>
                </div>
              </div>
            </div>

            {/* Row 4: Farm Location */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-bold text-[#111827] ml-0.5">Alamat Lahan / Nama Plot</label>
              <div className="relative group">
                <input
                  type="text"
                  value={form.location}
                  onChange={e => updateField('location', e.target.value)}
                  placeholder="Contoh: Desa Makmur, Blok B, Sawah Kidul"
                  className="w-full bg-[#FAFAFA] border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-5 py-3.5 md:py-4 text-xs md:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all"
                />
                <Trees className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={16} />
              </div>
            </div>

            {/* Row 5: Growth Phase */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-bold text-[#111827] ml-0.5">Fase Pertumbuhan</label>
              <div className="relative group">
                <select
                  value={form.growthStatus}
                  onChange={e => updateField('growthStatus', e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-gray-100 rounded-xl md:rounded-2xl px-4 md:px-5 py-3.5 md:py-4 text-xs md:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all appearance-none"
                >
                  <option value="pesemaian">Pesemaian (Seedling)</option>
                  <option value="vegetatif">Vegetatif (Growth)</option>
                  <option value="generatif">Generatif (Flowering)</option>
                  <option value="panen">Masa Panen (Harvest)</option>
                  <option value="pasca_panen">Pasca Panen</option>
                </select>
                <div className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronRight size={14} className="rotate-90 md:w-4 md:h-4" />
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="space-y-3">
              <label className="text-xs md:text-sm font-bold text-[#111827]">Foto Dokumentasi Tanaman *</label>
              <label className="relative block border-2 border-dashed border-emerald-100 rounded-[24px] md:rounded-[32px] p-6 md:p-10 cursor-pointer bg-[#FBFDFB] hover:bg-emerald-50/30 transition-all group overflow-hidden text-center">
                <input type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
                <div className="flex flex-col items-center justify-center">
                  {photoPreview ? (
                    <div className="relative h-32 w-32 md:h-48 md:w-48 mb-4">
                      <img src={photoPreview} className="h-full w-full object-cover rounded-xl md:rounded-2xl shadow-xl border-2 md:border-4 border-white" alt="Preview" />
                      <div className="absolute inset-0 bg-emerald-900/40 rounded-xl md:rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <RotateCcw className="text-white" size={20} />
                      </div>
                    </div>
                  ) : (
                    <div className="h-12 w-12 md:h-16 md:w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 md:mb-6 text-emerald-500">
                      <CloudUpload size={24} className="md:w-7 md:h-7" />
                    </div>
                  )}
                  <h4 className="text-[#111827] font-bold text-base md:text-lg">
                    {photoFile ? 'Foto Terpilih!' : 'Klik untuk Ambil Foto'}
                  </h4>
                  <p className="text-gray-400 text-[10px] md:text-xs mt-1 max-w-xs mx-auto">
                    Format JPEG, PNG - Pastikan detail tanaman terlihat jelas.
                  </p>
                </div>
              </label>
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <label className="text-xs md:text-sm font-bold text-[#111827]">Catatan Agronomis</label>
              <textarea
                value={form.agronomicNotes}
                onChange={e => updateField('agronomicNotes', e.target.value)}
                placeholder="NPK, hama rendah, dsb..."
                className="w-full bg-[#FAFAFA] border border-gray-100 rounded-2xl md:rounded-3xl px-4 md:px-6 py-4 md:py-5 text-xs md:text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all h-28 md:h-32 resize-none"
              />
            </div>

            {/* QR Preview Section */}
            {form.batchId && (
              <div className="p-6 md:p-8 bg-emerald-50/30 rounded-[28px] md:rounded-[32px] border border-emerald-50 flex flex-col items-center md:flex-row gap-6 md:gap-8 animate-in fade-in zoom-in-95">
                <div ref={qrRef} className="bg-white p-4 rounded-xl shadow-sm border border-emerald-50 shrink-0">
                  <QRCodeSVG value={qrPayload} size={100} className="md:w-[120px] md:h-[120px]" level="H" />
                </div>
                <div className="text-center md:text-left">
                  <h4 className="text-[10px] md:text-xs font-bold text-[#111827] uppercase tracking-widest leading-none">{form.batchId}</h4>
                  <p className="text-emerald-700 font-bold text-[10px] md:text-xs mt-1 uppercase leading-tight">{form.plantName || 'Varietas Belum Diisi'}</p>
                  <p className="text-[10px] text-gray-400 mt-2">Digunakan sebagai label identitas dilingkungan lahan.</p>
                  <button
                    onClick={downloadQR}
                    className="mt-4 flex items-center justify-center md:justify-start gap-2 text-emerald-600 font-bold text-[10px] md:text-xs hover:text-emerald-800 transition-colors w-full md:w-auto"
                  >
                    <Download size={12} /> Download Label
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Form Footer Buttons */}
        <div className="p-6 md:p-10 bg-emerald-50/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto order-2 md:order-1">
            <button
              onClick={() => navigate('/assets')}
              className="flex-1 md:flex-none px-6 md:px-8 py-3.5 md:py-4 bg-white border border-gray-200 text-[#111827] font-bold text-xs md:text-sm rounded-xl md:rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
            >
              Batal
            </button>
            <button
              onClick={() => {
                setForm(initialForm);
                setPhotoFile(null);
                setPhotoPreview(null);
              }}
              className="flex-1 md:flex-none px-6 md:px-8 py-3.5 md:py-4 bg-white border border-gray-200 text-[#111827] font-bold text-xs md:text-sm rounded-xl md:rounded-2xl hover:bg-gray-50 transition-all active:scale-95"
            >
              Reset
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isComplete || loading}
            className="w-full md:w-auto px-10 py-3.5 md:py-4 bg-emerald-900 text-white font-bold text-xs md:text-sm rounded-xl md:rounded-2xl hover:bg-emerald-950 transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center gap-2 order-1 md:order-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Simpan Batch & QR'}
          </button>
        </div>
      </div>
    </div>
  );
};