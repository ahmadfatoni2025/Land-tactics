import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Download,
  ChevronRight,
  ChevronDown,
  Leaf,
  Sprout,
  Hash,
  Tag,
  Info,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface LabelForm {
  batchId: string;
  plantName: string;
  commodity: string;
}

const initialForm: LabelForm = {
  batchId: '',
  plantName: '',
  commodity: '',
};

const COMMODITIES = [
  'Tanaman Pangan',
  'Hortikultura',
  'Perkebunan',
  'Tanaman Hias',
  'Tanaman Obat',
  'Sarana Produksi (Saprodi)',
  'Alat & Mesin (Alsintan)'
] as const;

export const GenerateQRPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LabelForm>(initialForm);
  const [success, setSuccess] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);



  const updateField = (field: keyof LabelForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const downloadQR = async () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg || !form.batchId || isDownloading) return;

    setIsDownloading(true);

    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      const img = new Image();

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
      });

      ctx.drawImage(img, 0, 0, 512, 512);

      const link = document.createElement('a');
      link.download = `QR-${form.batchId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setSuccess(true);
    } catch (error) {
      console.error('Failed to generate QR:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setSuccess(false);
  };

  const isFormValid = form.batchId.trim() && form.plantName.trim();
  const qrPayload = {
    id: form.batchId,
    name: form.plantName,
    category: form.commodity,
    timestamp: new Date().toISOString()
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Form Section */}
          <div className="flex-1 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wide mb-3">
                <Sparkles size={12} />
                <span>Label Generator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Generate QR Label
              </h1>
              <p className="text-gray-500 text-sm sm:text-base">
                Buat identitas unik untuk tanaman di lokasi Anda
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
              {/* Batch ID */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <Hash size={12} />
                  Nama Taman
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.batchId}
                    onChange={(e) => updateField('batchId', e.target.value)}
                    placeholder="Contoh: Cabai Merah"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <Tag size={12} />
                  Kategori
                </label>
                <div className="relative">
                  <select
                    value={form.commodity}
                    onChange={(e) => updateField('commodity', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="">Pilih kategori</option>
                    {COMMODITIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Plant Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <Sprout size={12} />
                  Jenis Tanaman
                </label>
                <div className="relative">
                  <select
                    value={form.plantName}
                    onChange={(e) => updateField('plantName', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="">Pilih jenis tanaman</option>
                    <option value="Kering">Kering</option>
                    <option value="Basah">Basah</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={downloadQR}
                  disabled={!isFormValid || isDownloading}
                  className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  {isDownloading ? 'Memproses...' : 'Unduh Label'}
                </button>

                <button
                  onClick={() => navigate('/assets')}
                  className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Inventori
                </button>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="w-full lg:w-[400px]">
            <div className="sticky top-6 lg:top-8">
              {/* QR Preview Card */}
              <div className="bg-gray-900 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wide">
                    Live Preview
                  </span>
                  <Leaf size={18} className="text-emerald-400" />
                </div>

                {/* QR Code */}
                <div className="bg-white rounded-xl p-4 mb-4">
                  <div ref={qrRef} className="flex justify-center">
                    <QRCodeSVG
                      value={JSON.stringify(qrPayload)}
                      size={300}
                      level="H"
                    />
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div className="mt-4 bg-amber-50 rounded-xl p-4 flex gap-3 border border-amber-100">
                <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-amber-800 font-semibold text-sm">Penting</h5>
                  <p className="text-amber-700/80 text-xs leading-relaxed">
                    Data akan aktif setelah scan pertama menggunakan fitur Scanner di lapangan.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Success Modal Overlay */}
      {success && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Success Header */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 px-8 py-10 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[24px] flex items-center justify-center mx-auto mb-6 relative z-10">
                <CheckCircle2 size={40} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2 relative z-10">
                Label Berhasil Dibuat
              </h1>
              <p className="text-emerald-50/80 text-sm font-medium relative z-10">
                Nama Taman: <span className="text-white font-mono">{form.batchId}</span>
              </p>
            </div>

            {/* Success Body */}
            <div className="p-8">
              <div className="bg-emerald-50 rounded-2xl p-5 mb-8 border border-emerald-100/50">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Sparkles size={12} /> Langkah Selanjutnya
                </p>
                <p className="text-gray-600 text-[13px] leading-relaxed">
                  Tempelkan label ini pada tanaman, lalu scan menggunakan fitur <span className="font-bold text-emerald-600">Scanner</span> untuk melakukan aktivasi data lapangan.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => navigate('/scanner')}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 active:scale-95"
                >
                  Buka Scanner
                  <ChevronRight size={18} />
                </button>

                <button
                  onClick={resetForm}
                  className="w-full py-4 bg-white border-2 border-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95"
                >
                  Buat Label Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};