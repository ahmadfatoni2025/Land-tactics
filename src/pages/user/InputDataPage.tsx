import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLocations } from '../../hooks/useLocations';
import { useAttendance } from '../../hooks/useAttendance';
import {
  MapPin, Navigation, Plus, Camera, Upload, ChevronDown,
  Loader2, CheckCircle2, Ruler, TreePine, Leaf, Bug, Droplets,
  Scissors, AlertTriangle, X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Location } from '../../lib/types';

type Tab = 'new-point' | 'update';

export const InputDataPage = () => {
  const navigate = useNavigate();
  useAuth(); // ensure authenticated
  const { fetchMyLocations, createLocation, loading: locLoading } = useLocations();
  const { saveAsset, loading: saveLoading } = useAttendance();

  const [tab, setTab] = useState<Tab>('update');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocs, setLoadingLocs] = useState(true);

  // -------- Tab 1: Buat Titik Baru --------
  const [pointName, setPointName] = useState('');
  const [pointDesc, setPointDesc] = useState('');
  const [pointTreeCount, setPointTreeCount] = useState('');
  const [pointLat, setPointLat] = useState('');
  const [pointLng, setPointLng] = useState('');
  const [pointMethod, setPointMethod] = useState<'manual' | 'gps'>('manual');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [pointSuccess, setPointSuccess] = useState(false);

  // -------- Tab 2: Pembaruan Rutin --------
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [tinggi, setTinggi] = useState('');
  const [diameter, setDiameter] = useState('');
  const [jumlahDaun, setJumlahDaun] = useState('');
  const [lebarKanopi, setLebarKanopi] = useState('');
  const [jumlahBungaBuah, setJumlahBungaBuah] = useState('');
  const [fase, setFase] = useState('vegetatif_awal');
  const [warnaDaun, setWarnaDaun] = useState('hijau_tua');
  const [statusHama, setStatusHama] = useState('nihil');
  const [kondisi, setKondisi] = useState('sehat');
  const [kelembapan, setKelembapan] = useState('normal');
  const [kondisiGulma, setKondisiGulma] = useState('terkendali');
  const [phTanah, setPhTanah] = useState('');
  const [tindakan, setTindakan] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoDetailFile, setPhotoDetailFile] = useState<File | null>(null);
  const [photoDetailPreview, setPhotoDetailPreview] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const loadLocations = useCallback(async () => {
    setLoadingLocs(true);
    const data = await fetchMyLocations();
    setLocations(data);
    setLoadingLocs(false);
  }, [fetchMyLocations]);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  // GPS auto-locate
  const requestGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation tidak didukung di browser ini');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPointLat(pos.coords.latitude.toFixed(6));
        setPointLng(pos.coords.longitude.toFixed(6));
        setPointMethod('gps');
        setGpsLoading(false);
      },
      (err) => {
        alert('Gagal mendapatkan lokasi: ' + err.message);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  // Create new point
  const handleCreatePoint = async () => {
    if (!pointName.trim() || !pointLat || !pointLng) {
      alert('Nama titik dan koordinat wajib diisi');
      return;
    }
    const result = await createLocation({
      name: pointName,
      lat: parseFloat(pointLat),
      lng: parseFloat(pointLng),
      method: pointMethod,
      description: pointDesc,
      tree_count: parseInt(pointTreeCount) || 0,
    });
    if (result.success) {
      setPointSuccess(true);
      setPointName(''); setPointDesc(''); setPointTreeCount('');
      setPointLat(''); setPointLng('');
      loadLocations();
      setTimeout(() => setPointSuccess(false), 3000);
    } else {
      alert('Gagal: ' + result.error);
    }
  };

  // Photo capture
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>, type: 'overview' | 'detail') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'overview') {
        setPhotoFile(file);
        setPhotoPreview(reader.result as string);
      } else {
        setPhotoDetailFile(file);
        setPhotoDetailPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit update
  const handleSubmitUpdate = async () => {
    const loc = locations.find(l => l.id === selectedLocationId);
    if (!loc) return alert('Pilih titik lokasi terlebih dahulu');
    if (!photoFile) return alert('Foto overview wajib diambil');

    const result = await saveAsset({
      barcode_id: `LOC-${loc.id.slice(0, 8)}`,
      asset_name: loc.name,
      category: 'Monitoring',
      lat: loc.lat,
      lng: loc.lng,
      accuracy: 0,
      address: loc.description || '',
      photo_file: photoFile,
      photo_detail: photoDetailFile || undefined,
      condition: kondisi,
      notes,
      tinggi_tanaman: parseFloat(tinggi) || 0,
      diameter_batang: parseFloat(diameter) || 0,
      jumlah_daun: parseInt(jumlahDaun) || 0,
      lebar_kanopi: parseFloat(lebarKanopi) || 0,
      jumlah_bunga_buah: parseInt(jumlahBungaBuah) || 0,
      fase_pertumbuhan: fase,
      warna_daun: warnaDaun,
      status_hama: statusHama,
      kelembapan_tanah: kelembapan,
      kondisi_gulma: kondisiGulma,
      ph_tanah: parseFloat(phTanah) || 0,
      tindakan_diambil: tindakan,
    });

    if (result.success) {
      setUpdateSuccess(true);
      // Reset form
      setSelectedLocationId(''); setTinggi(''); setDiameter(''); setJumlahDaun('');
      setLebarKanopi(''); setJumlahBungaBuah(''); setPhTanah(''); setNotes('');
      setPhotoFile(null); setPhotoPreview(null);
      setPhotoDetailFile(null); setPhotoDetailPreview(null);
      setTindakan([]);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } else {
      alert('Gagal menyimpan: ' + result.error);
    }
  };

  const toggleTindakan = (t: string) => {
    setTindakan(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const TINDAKAN_LIST = [
    'Penyiraman', 'Pemupukan', 'Penyemprotan', 'Pemangkasan',
    'Penyulaman', 'Pembersihan Gulma', 'Penjarangan'
  ];

  const FASE_LIST = [
    { value: 'vegetatif_awal', label: 'Vegetatif Awal' },
    { value: 'vegetatif_akhir', label: 'Vegetatif Akhir' },
    { value: 'generatif', label: 'Generatif' },
    { value: 'panen', label: 'Panen' },
    { value: 'pasca_panen', label: 'Pasca Panen' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Input Data</p>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Input Data Lapangan</h1>
        <p className="text-sm text-gray-500 mt-1">Buat titik baru atau lakukan pembaruan rutin</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-fit">
        <button
          onClick={() => setTab('new-point')}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all",
            tab === 'new-point'
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Plus size={16} />
          Buat Titik Baru
        </button>
        <button
          onClick={() => setTab('update')}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all",
            tab === 'update'
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Upload size={16} />
          Pembaruan Rutin
        </button>
      </div>

      {/* =================== TAB 1: BUAT TITIK BARU =================== */}
      {tab === 'new-point' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Buat Titik Lokasi Baru</h2>
            <p className="text-sm text-gray-400">Input koordinat manual dari Google Maps atau tandai lokasi saat ini</p>
          </div>

          {pointSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <p className="text-sm font-semibold text-emerald-700">Titik baru berhasil ditambahkan!</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Titik *</label>
              <input
                type="text"
                value={pointName}
                onChange={(e) => setPointName(e.target.value)}
                placeholder="Contoh: Blok A Jati"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Jumlah Pohon</label>
              <input
                type="number"
                value={pointTreeCount}
                onChange={(e) => setPointTreeCount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deskripsi</label>
            <textarea
              value={pointDesc}
              onChange={(e) => setPointDesc(e.target.value)}
              placeholder="Keterangan tambahan tentang titik ini..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all h-20 resize-none"
            />
          </div>

          {/* Coordinates */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Koordinat *</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={pointLat}
                onChange={(e) => { setPointLat(e.target.value); setPointMethod('manual'); }}
                placeholder="Latitude (contoh: -6.2088)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              <input
                type="text"
                value={pointLng}
                onChange={(e) => { setPointLng(e.target.value); setPointMethod('manual'); }}
                placeholder="Longitude (contoh: 106.8456)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
            <button
              onClick={requestGPS}
              disabled={gpsLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95"
            >
              {gpsLoading ? <Loader2 size={16} className="animate-spin" /> : <Navigation size={16} />}
              {gpsLoading ? 'Mendapatkan lokasi...' : 'Tandai Lokasi Saya Sekarang'}
            </button>
            {pointMethod === 'gps' && pointLat && (
              <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> Lokasi GPS terdeteksi
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button
              onClick={handleCreatePoint}
              disabled={locLoading || !pointName.trim() || !pointLat || !pointLng}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-200 active:scale-95"
            >
              {locLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Simpan Titik Baru
            </button>
          </div>
        </div>
      )}

      {/* =================== TAB 2: PEMBARUAN RUTIN =================== */}
      {tab === 'update' && (
        <div className="space-y-6">
          {updateSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-5 py-4 flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-600" />
              <div>
                <p className="text-sm font-bold text-emerald-700">Data berhasil disimpan!</p>
                <p className="text-xs text-emerald-600/70">Data telah tersinkronisasi ke sistem</p>
              </div>
            </div>
          )}

          {/* Select Location */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-emerald-600" />
              Pilih Titik Lokasi
            </h3>
            <div className="relative">
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="">-- Pilih titik lokasi --</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({loc.tree_count} pohon) — {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {locations.length === 0 && !loadingLocs && (
              <p className="text-xs text-amber-600 font-semibold mt-2 flex items-center gap-1">
                <AlertTriangle size={12} /> Belum ada titik. Buat titik baru terlebih dahulu.
              </p>
            )}
          </div>

          {selectedLocationId && (
            <>
              {/* Section: Foto */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Camera size={16} className="text-emerald-600" />
                  Bukti Visual
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Overview Photo */}
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Foto Overview (Wajib) *
                    </label>
                    {photoPreview ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                        <img src={photoPreview} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                          className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
                        <Camera size={24} className="text-gray-300 mb-2" />
                        <span className="text-xs font-semibold text-gray-400">Tap untuk ambil foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => handlePhoto(e, 'overview')}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  {/* Detail Photo */}
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Foto Close-up (Opsional)
                    </label>
                    {photoDetailPreview ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                        <img src={photoDetailPreview} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => { setPhotoDetailFile(null); setPhotoDetailPreview(null); }}
                          className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
                        <Camera size={24} className="text-gray-300 mb-2" />
                        <span className="text-xs font-semibold text-gray-400">Detail/close-up</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => handlePhoto(e, 'detail')}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Section: Morfologi */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Ruler size={16} className="text-emerald-600" />
                  Data Pertumbuhan Fisik
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Tinggi (cm)', value: tinggi, set: setTinggi, icon: TreePine },
                    { label: 'Diameter (mm)', value: diameter, set: setDiameter, icon: TreePine },
                    { label: 'Jumlah Daun', value: jumlahDaun, set: setJumlahDaun, icon: Leaf },
                    { label: 'Lebar Kanopi (cm)', value: lebarKanopi, set: setLebarKanopi, icon: TreePine },
                    { label: 'Bunga/Buah', value: jumlahBungaBuah, set: setJumlahBungaBuah, icon: TreePine },
                    { label: 'pH Tanah', value: phTanah, set: setPhTanah, icon: Droplets },
                  ].map(field => (
                    <div key={field.label} className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{field.label}</label>
                      <input
                        type="number"
                        value={field.value}
                        onChange={(e) => field.set(e.target.value)}
                        placeholder="0"
                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Status */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Bug size={16} className="text-emerald-600" />
                  Status Kesehatan & Lingkungan
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { label: 'Fase Pertumbuhan', value: fase, set: setFase, opts: FASE_LIST },
                    { label: 'Kondisi Umum', value: kondisi, set: setKondisi, opts: [
                      { value: 'sehat', label: 'Sehat' }, { value: 'subur', label: 'Subur' },
                      { value: 'normal', label: 'Normal' }, { value: 'layu', label: 'Layu' },
                      { value: 'mati', label: 'Mati' },
                    ]},
                    { label: 'Warna Daun', value: warnaDaun, set: setWarnaDaun, opts: [
                      { value: 'hijau_tua', label: 'Hijau Tua' }, { value: 'hijau_muda', label: 'Hijau Muda' },
                      { value: 'kuning', label: 'Kuning' }, { value: 'coklat', label: 'Coklat' },
                    ]},
                    { label: 'Status Hama', value: statusHama, set: setStatusHama, opts: [
                      { value: 'nihil', label: 'Nihil' }, { value: 'ringan', label: 'Ringan' },
                      { value: 'sedang', label: 'Sedang' }, { value: 'berat', label: 'Berat' },
                    ]},
                    { label: 'Kelembapan Tanah', value: kelembapan, set: setKelembapan, opts: [
                      { value: 'kering', label: 'Kering' }, { value: 'normal', label: 'Normal' },
                      { value: 'basah', label: 'Basah' }, { value: 'tergenang', label: 'Tergenang' },
                    ]},
                    { label: 'Kondisi Gulma', value: kondisiGulma, set: setKondisiGulma, opts: [
                      { value: 'terkendali', label: 'Terkendali' }, { value: 'ringan', label: 'Ringan' },
                      { value: 'banyak', label: 'Banyak' },
                    ]},
                  ].map(field => (
                    <div key={field.label} className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{field.label}</label>
                      <div className="relative">
                        <select
                          value={field.value}
                          onChange={(e) => field.set(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        >
                          {field.opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Tindakan */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Scissors size={16} className="text-emerald-600" />
                  Tindakan / Intervensi
                </h3>
                <div className="flex flex-wrap gap-2">
                  {TINDAKAN_LIST.map(t => (
                    <button
                      key={t}
                      onClick={() => toggleTindakan(t)}
                      className={cn(
                        "px-3 py-2 rounded-lg text-xs font-bold transition-all border",
                        tindakan.includes(t)
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Catatan</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Catatan tambahan observasi lapangan..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 h-24 resize-none transition-all"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSubmitUpdate}
                  disabled={saveLoading || !selectedLocationId || !photoFile}
                  className="flex-1 flex items-center justify-center gap-2 py-4 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-200 active:scale-95"
                >
                  {saveLoading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {saveLoading ? 'Menyimpan...' : 'Simpan Pembaruan'}
                </button>
                <button
                  onClick={() => navigate('/user/dashboard')}
                  className="px-6 py-4 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
