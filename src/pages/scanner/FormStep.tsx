import {
  ShieldCheck,
  MapPin,
  RotateCcw,
  CheckCircle2,
  Leaf,
  AlertTriangle,
  Camera,
  Image as ImageIcon,
  Loader2,
  Thermometer,
  Droplets,
  Ruler,
  Sprout,
  Flower2,
  Bug,
  Droplet,
  Wind,
  Activity,
  Check,
  Scissors
} from 'lucide-react';
import { useRef, useState } from 'react';
import { MapView } from '../../components/MapView';
import { MapFull } from '../../components/MapFull';

interface FormStepProps {
  isLoggedIn: boolean;
  scannedId: string;
  assetName: string;
  scannedCategory: string;
  manualAddress: string;
  coords: { lat: number; lng: number; accuracy: number } | null;
  loading: boolean;
  onReset: () => void;
  onCommit: () => void;

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
  suhuUdara: string;
  setSuhuUdara: (v: string) => void;
  kelembapanTanah: string;
  setKelembapanTanah: (v: string) => void;
  intensitasCahaya: string;
  setIntensitasCahaya: (v: string) => void;

  warnaDaun: string;
  setWarnaDaun: (v: string) => void;
  statusHama: string;
  setStatusHama: (v: string) => void;

  tindakanDipilih: string[];
  toggleTindakan: (t: string) => void;
  notes: string;
  setNotes: (v: string) => void;

  photoPreview: string | null;
  photoDetailPreview: string | null;
  handlePhotoCapture: (e: React.ChangeEvent<HTMLInputElement>, type: 'overview' | 'detail') => void;
}

const GROWTH_PHASES = [
  { value: 'vegetatif_awal', label: 'Vegetatif Awal', icon: Sprout },
  { value: 'vegetatif_aktif', label: 'Vegetatif Aktif', icon: Leaf },
  { value: 'generatif', label: 'Generatif', icon: Flower2 },
  { value: 'ripening', label: 'Pematangan', icon: CheckCircle2 }
];

const HEALTH_STATUS = [
  { value: 'sehat_luar_biasa', label: 'Prima', icon: Activity, color: 'emerald' },
  { value: 'sehat', label: 'Sehat', icon: Leaf, color: 'green' },
  { value: 'kurang_sehat', label: 'Tertekan', icon: AlertTriangle, color: 'yellow' },
  { value: 'kritis', label: 'Kritis', icon: AlertTriangle, color: 'red' }
];

const LEAF_COLORS = [
  { value: 'hijau_tua', label: 'Hijau Tua', color: 'bg-green-700' },
  { value: 'hijau_kuning', label: 'Hijau Kuning', color: 'bg-yellow-500' },
  { value: 'bercak', label: 'Bercak', color: 'bg-amber-700' },
  { value: 'kuning', label: 'Kuning', color: 'bg-yellow-600' }
];

const PEST_STATUS = [
  { value: 'nihil', label: 'Tidak Ada', icon: Check },
  { value: 'ringan', label: 'Ringan', icon: Bug },
  { value: 'sedang', label: 'Sedang', icon: Bug },
  { value: 'berat', label: 'Berat', icon: Bug }
];

const SOIL_MOISTURE = [
  { value: 'kering', label: 'Kering', icon: Wind },
  { value: 'normal', label: 'Normal', icon: Droplet },
  { value: 'basah', label: 'Basah', icon: Droplets }
];

const ACTIONS = [
  { label: 'Penyiraman', icon: Droplets },
  { label: 'Pemupukan', icon: Leaf },
  { label: 'Penyiangan', icon: Sprout },
  { label: 'Pemangkasan', icon: Scissors },
  { label: 'Pestisida', icon: Bug }
];

export const FormStep = ({
  isLoggedIn,
  scannedId,
  assetName,
  scannedCategory,
  manualAddress,
  coords,
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
  suhuUdara,
  setSuhuUdara,
  kelembapanTanah,
  setKelembapanTanah,
  intensitasCahaya,
  setIntensitasCahaya,
  warnaDaun,
  setWarnaDaun,
  statusHama,
  setStatusHama,
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
  const [isMapFull, setIsMapFull] = useState(false);

  return (
    <div className="bg-white min-h-screen max-w-8xl mx-auto">
      {/* Header - Full Width */}
      <div className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
                <ShieldCheck size={18} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-gray-900">
                    {scannedId || 'BATCH-ID'}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {scannedCategory || 'Komoditas'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{assetName || 'Nama Tanaman'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 rounded-lg">
                <MapPin size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500 max-w-[180px] truncate">
                  {manualAddress || 'Lokasi'}
                </span>
              </div>
              <button
                onClick={onReset}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Scan Ulang"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content - Full Width */}
      <div className={`w-full px-4 sm:px-6 py-6 ${!isLoggedIn ? 'opacity-60 pointer-events-none' : ''}`}>
        <div className="space-y-8">
          {/* Fase Pertumbuhan */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sprout size={16} className="text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-900">Fase Pertumbuhan</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GROWTH_PHASES.map((phase) => {
                const Icon = phase.icon;
                const isActive = fasePertumbuhan === phase.value;
                return (
                  <button
                    key={phase.value}
                    onClick={() => setFasePertumbuhan(phase.value)}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    <Icon size={14} />
                    {phase.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Status Kesehatan */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-900">Status Kesehatan</h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {HEALTH_STATUS.map((status) => {
                const Icon = status.icon;
                const isActive = deployStatus === status.value;
                return (
                  <button
                    key={status.value}
                    onClick={() => setDeployStatus(status.value)}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    <Icon size={14} />
                    {status.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Parameter Morfologi */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Ruler size={16} className="text-blue-600" />
              <h4 className="text-sm font-semibold text-gray-900">Parameter Morfologi</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Tinggi Tanaman</label>
                <div className="relative">
                  <input
                    type="number"
                    value={tinggiTanaman}
                    onChange={(e) => setTinggiTanaman(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">cm</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Diameter Batang</label>
                <div className="relative">
                  <input
                    type="number"
                    value={diameterBatang}
                    onChange={(e) => setDiameterBatang(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">mm</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Jumlah Daun</label>
                <input
                  type="number"
                  value={jumlahDaun}
                  onChange={(e) => setJumlahDaun(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Lebar Kanopi</label>
                <div className="relative">
                  <input
                    type="number"
                    value={lebarKanopi}
                    onChange={(e) => setLebarKanopi(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">cm</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Jumlah Bunga/Buah</label>
                <input
                  type="number"
                  value={jumlahBungaBuah}
                  onChange={(e) => setJumlahBungaBuah(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>
          </section>

          {/* Kondisi Lingkungan */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Thermometer size={16} className="text-teal-600" />
              <h4 className="text-sm font-semibold text-gray-900">Kondisi Lingkungan</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Suhu Udara</label>
                <div className="relative">
                  <input
                    type="number"
                    value={suhuUdara}
                    onChange={(e) => setSuhuUdara(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">°C</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Intensitas Cahaya</label>
                <div className="relative">
                  <input
                    type="number"
                    value={intensitasCahaya}
                    onChange={(e) => setIntensitasCahaya(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Lux</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">pH Tanah</label>
                <input
                  type="number"
                  step="0.1"
                  value={phTanah}
                  onChange={(e) => setPhTanah(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-gray-500">Kelembapan Tanah</label>
                <div className="flex gap-2">
                  {SOIL_MOISTURE.map((m) => {
                    const Icon = m.icon;
                    const isActive = kelembapanTanah === m.value;
                    return (
                      <button
                        key={m.value}
                        onClick={() => setKelembapanTanah(m.value)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        <Icon size={14} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Kualitas Tanaman */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Leaf size={16} className="text-amber-600" />
              <h4 className="text-sm font-semibold text-gray-900">Kualitas Tanaman</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Warna Daun</label>
                <div className="flex flex-wrap gap-2">
                  {LEAF_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setWarnaDaun(color.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${warnaDaun === color.value
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      <div className={`w-2.5 h-2.5 rounded-full ${color.color}`} />
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-500">Status Hama</label>
                <div className="flex flex-wrap gap-2">
                  {PEST_STATUS.map((pest) => {
                    const Icon = pest.icon;
                    const isActive = statusHama === pest.value;
                    return (
                      <button
                        key={pest.value}
                        onClick={() => setStatusHama(pest.value)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        <Icon size={14} />
                        {pest.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Tindakan Lapangan */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Activity size={16} className="text-purple-600" />
              <h4 className="text-sm font-semibold text-gray-900">Tindakan Lapangan</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {ACTIONS.map((action) => {
                const Icon = action.icon;
                const isActive = tindakanDipilih.includes(action.label);
                return (
                  <button
                    key={action.label}
                    onClick={() => toggleTindakan(action.label)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    <Icon size={14} />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Catatan */}
          <section>
            <label className="text-xs text-gray-500 mb-1.5 block">Catatan Observasi</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan kondisi tanaman, hama, atau observasi lainnya..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none h-24"
            />
          </section>

          {/* Lokasi Realtime */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-900">Lokasi Koordinat Lapangan</h4>
            </div>
            {coords ? (
              <div className="rounded-[1rem] overflow-hidden shadow-lg h-[400px] w-full relative group transition-all duration-300">
                <MapView
                  checkIns={[{
                    id: 'current_scan',
                    barcode_id: scannedId,
                    lat: coords.lat,
                    lng: coords.lng,
                    category: scannedCategory,
                    condition: deployStatus,
                    photo_url: photoPreview || '',
                    created_at: new Date().toISOString(),
                    asset_name: assetName,
                    tinggi_tanaman: Number(tinggiTanaman) || 0,
                    lebar_kanopi: Number(lebarKanopi) || 0,
                    diameter_batang: Number(diameterBatang) || 0
                  }]}
                  center={[coords.lat, coords.lng]}
                  zoom={17}
                  focusLocation={[coords.lat, coords.lng]}
                  className="w-full h-full"
                  onFullscreen={() => setIsMapFull(true)}
                />
                <div className="absolute top-4 right-16 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm z-[2000] flex flex-col items-end">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Akurasi GPS</span>
                  <span className={`text-xs font-black ${coords.accuracy <= 10 ? 'text-emerald-600' : coords.accuracy <= 30 ? 'text-amber-500' : 'text-red-500'}`}>
                    {coords.accuracy.toFixed(1)} Meter
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-[400px] w-full rounded-[1rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50 transition-all">
                <Loader2 size={24} className="mb-2 animate-spin text-emerald-500" />
                <span className="text-sm font-medium">Melacak koordinat satelit GPS...</span>
                <span className="text-xs mt-1">Pastikan izin lokasi diaktifkan</span>
              </div>
            )}
          </section>

          {/* Dokumentasi */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Camera size={16} className="text-emerald-600" />
              <h4 className="text-sm font-semibold text-gray-900">Dokumentasi</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Foto Overview *</label>
                <div
                  onClick={() => cameraInputRef.current?.click()}
                  className={`aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${photoPreview
                    ? 'border-emerald-500 bg-gray-50'
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                    }`}
                >
                  {photoPreview ? (
                    <img src={photoPreview} className="w-full h-full object-cover" alt="Overview" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Camera size={28} className="text-gray-300" />
                      <span className="text-xs text-gray-400">Ambil Foto</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Foto Detail</label>
                <div
                  onClick={() => detailCameraRef.current?.click()}
                  className={`aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${photoDetailPreview
                    ? 'border-emerald-500 bg-gray-50'
                    : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                    }`}
                >
                  {photoDetailPreview ? (
                    <img src={photoDetailPreview} className="w-full h-full object-cover" alt="Detail" />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImageIcon size={28} className="text-gray-300" />
                      <span className="text-xs text-gray-400">Foto Close-up</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Hidden Inputs */}
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            onChange={(e) => handlePhotoCapture(e, 'overview')}
            className="hidden"
          />
          <input
            type="file"
            ref={detailCameraRef}
            accept="image/*"
            capture="environment"
            onChange={(e) => handlePhotoCapture(e, 'detail')}
            className="hidden"
          />

          {/* Submit Button */}
          <div className="pt-4">
            {!isLoggedIn ? (
              <div className="flex items-center justify-center gap-2 p-3 bg-gray-100 rounded-lg text-gray-500">
                <AlertTriangle size={16} />
                <span className="text-sm">Mode Baca Saja - Harus Login untuk mengisi laporan lapangan</span>
              </div>
            ) : (
              <button
                onClick={onCommit}
                disabled={loading || !photoPreview}
                className="w-full py-3 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Simpan Laporan Lapangan
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* MapFull Integration */}
      {coords && (
        <MapFull 
          isOpen={isMapFull}
          onClose={() => setIsMapFull(false)}
          checkIns={[{
            id: 'current_scan',
            barcode_id: scannedId,
            lat: coords.lat,
            lng: coords.lng,
            category: scannedCategory,
            condition: deployStatus,
            photo_url: photoPreview || '',
            created_at: new Date().toISOString(),
            asset_name: assetName,
            tinggi_tanaman: Number(tinggiTanaman) || 0,
            lebar_kanopi: Number(lebarKanopi) || 0,
            diameter_batang: Number(diameterBatang) || 0
          }]}
          center={[coords.lat, coords.lng]}
          zoom={18}
          focusLocation={[coords.lat, coords.lng]}
        />
      )}
    </div>
  );
};