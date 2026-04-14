import { useState, useCallback, useRef } from 'react';
import { Scanner } from '../components/Scanner';
import { useAttendance } from '../hooks/useAttendance';
import { Html5Qrcode } from 'html5-qrcode';
import {
  MapPin,
  ShieldCheck,
  Camera,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Scan,
  Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export const ScannerPage = () => {
  const navigate = useNavigate();
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [assetName, setAssetName] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanned' | 'submitting' | 'success' | 'error'>('idle');

  // Field untuk perkembangan tanaman (Expanded from task.md)
  const [tinggiTanaman, setTinggiTanaman] = useState('');
  const [jumlahDaun, setJumlahDaun] = useState('');
  const [lebarDaun, setLebarDaun] = useState('');
  const [notes, setNotes] = useState('');
  const [deployStatus, setDeployStatus] = useState('sehat');
  const [penyiraman, setPenyiraman] = useState('sudah');
  const [pemberianPupuk, setPemberianPupuk] = useState('tidak');
  const [jenisPupuk, setJenisPupuk] = useState('');
  const [pencahayaan, setPencahayaan] = useState('terang_tidak_langsung');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fileScanError, setFileScanError] = useState<string | null>(null);

  const { saveAsset, loading } = useAttendance();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requestLocation = useCallback(() => {
    setGpsError(null);
    if (!navigator.geolocation) return setGpsError('Geolokasi tidak didukung');
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setGpsError('Gagal akses GPS'),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  const handleScan = useCallback((text: string) => {
    let id = text;
    let name = '';
    try {
      const parsed = JSON.parse(text);
      if (parsed.id) id = parsed.id;
      if (parsed.name) name = parsed.name;
    } catch (e) { }

    setScannedId(id);
    setAssetName(name);
    setScannerActive(false);
    setStatus('scanned');
    setFileScanError(null);
    requestLocation();
  }, [requestLocation]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileScanError(null);
    const html5QrCode = new Html5Qrcode("qr-file-detector");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      handleScan(decodedText);
    } catch (err) {
      setFileScanError("QR Code tidak terbaca. Pastikan gambar jelas.");
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCommit = async () => {
    if (!scannedId || !coords || !photoFile) return alert('Lengkapi data wajib & foto tempat!');
    setStatus('submitting');

    // Construct dynamic description
    const reportData = {
      tinggi: tinggiTanaman,
      daun: jumlahDaun,
      lebar: lebarDaun,
      penyiraman,
      pupuk: pemberianPupuk === 'ya' ? jenisPupuk : 'tidak',
      cahaya: pencahayaan
    };

    const combinedNotes = `Data Fisik: T:${reportData.tinggi} D:${reportData.daun} L:${reportData.lebar} | Rawat: Siram:${reportData.penyiraman} Pupuk:${reportData.pupuk} Cahaya:${reportData.cahaya} | Obs: ${notes}`;

    const result = await saveAsset({
      barcode_id: scannedId,
      asset_name: assetName,
      lat: coords.lat,
      lng: coords.lng,
      photo_file: photoFile,
      condition: deployStatus,
      notes: combinedNotes,
    });

    if (result.success) {
      setStatus('success');
      setTimeout(() => navigate('/assets'), 1500);
    } else {
      setStatus('error');
    }
  };

  const handleReset = () => {
    setScannedId(null); setAssetName(''); setCoords(null); setStatus('idle');
    setNotes(''); setTinggiTanaman(''); setJumlahDaun(''); setLebarDaun('');
    setPenyiraman('sudah'); setPemberianPupuk('tidak'); setJenisPupuk('');
    setPhotoFile(null); setPhotoPreview(null); setScannerActive(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div id="qr-file-detector" className="hidden"></div>

      {/* Main Feature Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Pemindai Aset Lapangan</h1>
          <p className="text-sm text-stone-500 mt-0.5">Pantau dan laporkan perkembangan tanaman secara real-time</p>
        </div>
      </div>

      {/* Main Grid / Card */}
      <div className="w-full bg-white rounded-2xl border border-stone-200/60 shadow-sm flex flex-col lg:flex-row overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">

        {/* LEFT PANEL: Scanner Focus */}
        <div className="flex-1 p-6 md:p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col">
          <div className="mb-6 md:mb-8">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">Pantau Batch Tanaman</h2>
            <p className="text-gray-500 text-xs md:text-sm mt-1">Pindai QR Code di lahan atau unggah foto QR untuk mulai melapor.</p>
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] md:text-xs font-semibold text-gray-700 ml-1">Batch ID Terdeteksi</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  placeholder="Menunggu pemindaian..."
                  value={scannedId || ''}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 md:py-3 text-xs md:text-sm font-medium text-gray-900 focus:outline-none"
                />
                <button
                  onClick={() => scannedId && navigator.clipboard.writeText(scannedId)}
                  className="px-3 md:px-4 py-2.5 md:py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center shrink-0"
                >
                  <RotateCcw size={14} className="md:w-4 md:h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setScannerActive(true)}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold text-xs md:text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
              >
                <Camera size={18} />
                Buka Kamera
              </button>
              <label className="flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-dashed border-gray-200 text-gray-600 rounded-xl font-bold text-xs md:text-sm hover:border-indigo-400 hover:text-indigo-600 transition-all cursor-pointer">
                <ImageIcon size={18} />
                Pilih File QR
                <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              </label>
            </div>
            {fileScanError && (
              <p className="text-[10px] md:text-xs text-red-500 font-medium bg-red-50 p-2 rounded-lg border border-red-100 animate-pulse">
                ⚠️ {fileScanError}
              </p>
            )}
          </div>

          {/* Scanner Area Wrapper */}
          <div className="mt-8 md:mt-12 relative flex-1 min-h-[260px] md:min-h-[300px] flex flex-col items-center justify-center bg-stone-50 rounded-[20px] md:rounded-[28px] border border-dashed border-stone-200 overflow-hidden group">
            <div className="absolute top-6 left-6 md:top-8 md:left-8 w-8 h-8 md:w-10 md:h-10 border-t-4 border-l-4 border-stone-300 rounded-tl-lg md:rounded-tl-xl opacity-30 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute top-6 right-6 md:top-8 md:right-8 w-8 h-8 md:w-10 md:h-10 border-t-4 border-r-4 border-stone-300 rounded-tr-lg md:rounded-tr-xl opacity-30 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 w-8 h-8 md:w-10 md:h-10 border-b-4 border-l-4 border-stone-300 rounded-bl-lg md:rounded-bl-xl opacity-30 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 w-8 h-8 md:w-10 md:h-10 border-b-4 border-r-4 border-stone-300 rounded-br-lg md:rounded-br-xl opacity-30 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10 w-full h-full flex items-center justify-center p-6 md:p-10 text-center">
              {scannerActive ? (
                <div className="w-full max-w-[280px] md:max-w-sm aspect-square bg-black rounded-xl md:rounded-2xl overflow-hidden relative shadow-2xl">
                  <Scanner onResult={handleScan} isActive={scannerActive} />
                  <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                    <div className="w-full h-1 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-scan-laser"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {status === 'success' ? (
                    <div className="animate-bounce"><CheckCircle2 size={48} className="text-emerald-500 mx-auto" /></div>
                  ) : (
                    <div className="p-6 bg-white rounded-full shadow-sm border border-stone-100 inline-block">
                      <Scan size={42} className="text-stone-300" />
                    </div>
                  )}
                  <div>
                    <p className="text-stone-900 text-sm font-bold">Lensa Pemantau</p>
                    <p className="text-stone-400 text-[10px] md:text-xs">Scan QR untuk membuka data batch</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Growth Report Form */}
        <div className="flex-1 p-6 md:p-8 lg:p-12 bg-white flex flex-col relative">
          {!scannedId && (
            <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-[4px] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 text-stone-400 border border-stone-200 shadow-inner">
                <ShieldCheck size={32} className="animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-1">Akses Terkunci</h3>
              <p className="text-stone-500 text-xs md:text-sm max-w-[260px]">
                Silakan pindai kode QR atau unggah file QR batch tanaman untuk membuka formulir pelaporan.
              </p>
            </div>
          )}

          <div className={cn(
            "flex flex-col h-full transition-all duration-700",
            !scannedId ? "opacity-10 grayscale pointer-events-none blur-[1px]" : "opacity-100"
          )}>
            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">Laporan Pertumbuhan</h2>
              <p className="text-gray-500 text-xs md:text-sm mt-1">Perbarui metrik agronomis untuk memantau siklus hidup tanaman.</p>
            </div>

            <div className="space-y-5 md:space-y-6 flex-1">
              <div className="space-y-3 md:space-y-4">
                <label className="text-xs font-semibold text-gray-700 ml-1">Kondisi Umum Tanaman</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { key: 'sehat_luar_biasa', label: 'Sangat Sehat', color: 'emerald' },
                    { key: 'sehat', label: 'Sehat', color: 'indigo' },
                    { key: 'kurang_sehat', label: 'Layu/Kuning', color: 'amber' },
                    { key: 'kritis', label: 'Kritis', color: 'red' }
                  ].map(s => (
                    <button
                      key={s.key}
                      onClick={() => setDeployStatus(s.key)}
                      className={`py-3 px-1 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-tight transition-all border ${deployStatus === s.key
                        ? `bg-stone-900 border-stone-900 text-white shadow-lg`
                        : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                        }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Tinggi (cm)</label>
                  <input
                    type="number"
                    value={tinggiTanaman}
                    onChange={e => setTinggiTanaman(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Daun (qty)</label>
                  <input
                    type="number"
                    value={jumlahDaun}
                    onChange={e => setJumlahDaun(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Lebar (cm)</label>
                  <input
                    type="number"
                    value={lebarDaun}
                    onChange={e => setLebarDaun(e.target.value)}
                    placeholder="0"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-3">
                  <label className="text-[11px] font-bold text-gray-800 uppercase tracking-wider block">Penyiraman</label>
                  <div className="flex gap-2">
                    {['sudah', 'tidak'].map(v => (
                      <button
                        key={v}
                        onClick={() => setPenyiraman(v)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all",
                          penyiraman === v ? "bg-white border-2 border-indigo-600 text-indigo-700 shadow-sm" : "bg-gray-100/50 text-gray-400 border-2 border-transparent"
                        )}
                      >
                        {v === 'tidak' ? 'Belum' : 'Sudah'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-3">
                  <label className="text-[11px] font-bold text-gray-800 uppercase tracking-wider block">Pencahayaan</label>
                  <select
                    value={pencahayaan}
                    onChange={e => setPencahayaan(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="teduh">Teduh</option>
                    <option value="terang_tidak_langsung">Terang Tidak Langsung</option>
                    <option value="matahari_langsung">Matahari Langsung</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-semibold text-gray-700 ml-1">Pemberian Nutrisi/Pupuk</label>
                <div className="flex gap-3 items-center">
                  <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
                    {['ya', 'tidak'].map(v => (
                      <button
                        key={v}
                        onClick={() => setPemberianPupuk(v)}
                        className={cn(
                          "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                          pemberianPupuk === v ? "bg-white text-emerald-700 shadow-sm" : "text-gray-400"
                        )}
                      >
                        {v.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  {pemberianPupuk === 'ya' && (
                    <input
                      type="text"
                      value={jenisPupuk}
                      onChange={e => setJenisPupuk(e.target.value)}
                      placeholder="Sebutkan jenis pupuk/nutrisi..."
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs md:text-sm focus:outline-none focus:border-emerald-500"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2 relative group">
                <label className="text-xs font-semibold text-gray-700 ml-1">Foto Dokumentasi Lapangan *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl md:rounded-2xl p-4 md:p-6 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${photoPreview ? 'border-emerald-500 bg-emerald-50/20' : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                >
                  {photoPreview ? (
                    <div className="flex items-center gap-3 w-full">
                      <img src={photoPreview} className="h-10 w-10 md:h-12 md:w-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] md:text-xs font-bold text-gray-900 truncate">Foto Terlampir</p>
                        <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-tighter">Sinyal GPS: {coords ? 'Ok' : 'Wait..'}</p>
                      </div>
                      <span className="px-2 py-0.5 md:py-1 bg-emerald-100 text-emerald-700 text-[8px] md:text-[10px] font-bold rounded-md">SIAP KIRIM</span>
                    </div>
                  ) : (
                    <>
                      <Camera size={20} className="text-gray-300 md:w-6 md:h-6" />
                      <p className="text-[10px] md:text-xs text-gray-400 font-medium text-center">Klik untuk ambil foto terbaru</p>
                    </>
                  )}
                </div>
                <input type="file" ref={fileInputRef} accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 ml-1">Observasi Tambahan (Optional)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Hama, tunas baru, bintik putih, dll..."
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all h-20 md:h-24 resize-none"
                />
              </div>

              <button
                onClick={handleCommit}
                disabled={!scannedId || !photoFile || loading}
                className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold text-xs md:text-sm shadow-xl shadow-stone-200 hover:bg-black transition-all disabled:opacity-30 disabled:shadow-none flex items-center justify-center gap-2 md:gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Submit Laporan'}
              </button>
            </div>

            {/* Bottom Progress/Status Area */}
            <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] md:text-[11px] font-bold text-gray-900 leading-none">{coords ? 'GPS Terkunci Secara Presisi' : 'GPS Menunggu Sinyal...'}</span>
                <span className="text-[10px] md:text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer leading-none" onClick={requestLocation}>Refresh GPS</span>
              </div>
              <div className="w-full h-1 md:h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full bg-indigo-600 transition-all duration-1000 ${coords ? 'w-full' : 'w-1/3 animate-pulse'}`}></div>
              </div>
              <p className="text-[9px] md:text-[10px] text-gray-400 mt-2">
                {coords ? `Lokasi Aman: ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Visi satelit sedang dalam sinkronisasi lokasi.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
