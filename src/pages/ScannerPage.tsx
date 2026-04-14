import { useState, useCallback, useRef, useEffect } from 'react';
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
  Image as ImageIcon,
  Sparkles,
  Leaf,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export const ScannerPage = () => {
  const navigate = useNavigate();
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [fileScanError, setFileScanError] = useState<string | null>(null);
  const [assetName, setAssetName] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);

  // 1. Morfologi / Pertumbuhan Fisik
  const [tinggiTanaman, setTinggiTanaman] = useState('');
  const [diameterBatang, setDiameterBatang] = useState('');
  const [jumlahDaun, setJumlahDaun] = useState('');
  const [lebarKanopi, setLebarKanopi] = useState('');
  const [jumlahBungaBuah, setJumlahBungaBuah] = useState('');

  // 2. Status Kesehatan & Nutrisi
  const [fasePertumbuhan, setFasePertumbuhan] = useState('vegetatif_awal');
  const [warnaDaun, setWarnaDaun] = useState('hijau_tua');
  const [statusHama, setStatusHama] = useState('nihil');
  const [deployStatus, setDeployStatus] = useState('sehat'); // Health overall

  // 3. Kondisi Media & Lingkungan
  const [kelembapanTanah, setKelembapanTanah] = useState('normal');
  const [kondisiGulma, setKondisiGulma] = useState('terkendali');
  const [phTanah, setPhTanah] = useState('');

  // 4. Intervensi & Tindakan
  const [tindakanDipilih, setTindakanDipilih] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // 5. Bukti Visual
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoDetailFile, setPhotoDetailFile] = useState<File | null>(null);
  const [photoDetailPreview, setPhotoDetailPreview] = useState<string | null>(null);

  const [scannedCategory, setScannedCategory] = useState<string>('');
  const [manualAddress, setManualAddress] = useState<string>('');

  const { saveAsset, getAssetByBarcode, loading } = useAttendance();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const detailInputRef = useRef<HTMLInputElement>(null);
  const detailCameraRef = useRef<HTMLInputElement>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ 
        lat: pos.coords.latitude, 
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy 
      }),
      () => { },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  const handleScan = useCallback((text: string) => {
    let finalId = text;
    try {
      const parsed = JSON.parse(text);
      if (parsed.id) finalId = parsed.id;
    } catch (e) {
      // Not JSON, use as is
    }

    setScannedId(finalId);
    setScannerActive(false);
    setFileScanError(null);
    requestLocation();
  }, [requestLocation]);

  // Fetch asset metadata from DB when ID changes
  useEffect(() => {
    const fetchData = async () => {
      if (!scannedId) return;
      const asset = await getAssetByBarcode(scannedId);
      if (asset) {
        setAssetName(asset.asset_name || '');
        setScannedCategory(asset.category || '');
        if (asset.address) setManualAddress(asset.address);
      }
    };
    fetchData();
  }, [scannedId, getAssetByBarcode]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const html5QrCode = new Html5Qrcode("qr-file-detector");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      handleScan(decodedText);
    } catch (err) {
      setFileScanError("QR Code tidak terbaca. Pastikan gambar jelas.");
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>, type: 'overview' | 'detail' = 'overview') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'overview') {
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPhotoDetailFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPhotoDetailPreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCommit = async () => {
    if (!scannedId || !coords || !photoFile) {
      return alert('Foto Overview Wajib! Ambil foto seluruh badan tanaman.');
    }

    const result = await saveAsset({
      barcode_id: scannedId,
      asset_name: assetName,
      category: scannedCategory,
      lat: coords.lat,
      lng: coords.lng,
      accuracy: coords.accuracy,
      address: manualAddress,
      photo_file: photoFile,
      photo_detail: photoDetailFile || undefined,
      condition: deployStatus,
      notes: notes,
      tinggi_tanaman: parseFloat(tinggiTanaman) || 0,
      diameter_batang: parseFloat(diameterBatang) || 0,
      jumlah_daun: parseInt(jumlahDaun) || 0,
      lebar_kanopi: parseFloat(lebarKanopi) || 0,
      jumlah_bunga_buah: parseInt(jumlahBungaBuah) || 0,
      fase_pertumbuhan: fasePertumbuhan,
      warna_daun: warnaDaun,
      status_hama: statusHama,
      kelembapan_tanah: kelembapanTanah,
      kondisi_gulma: kondisiGulma,
      ph_tanah: parseFloat(phTanah) || 0,
      tindakan_diambil: tindakanDipilih
    });

    if (result.success) {
      alert('Data Berhasil Disinkronisasi!');
      setTimeout(() => navigate('/assets'), 500);
    } else {
      alert('Gagal Sinkronisasi: ' + (result.error || 'Terjadi kesalahan pada database atau koneksi.'));
    }
  };

  const handleReset = () => {
    setScannedId(null); setAssetName(''); setCoords(null);
    setTinggiTanaman(''); setDiameterBatang(''); setJumlahDaun(''); setLebarKanopi(''); setJumlahBungaBuah('');
    setFasePertumbuhan('vegetatif_awal'); setWarnaDaun('hijau_tua'); setStatusHama('nihil');
    setKelembapanTanah('normal'); setKondisiGulma('terkendali'); setPhTanah('');
    setTindakanDipilih([]); setNotes('');
    setPhotoFile(null); setPhotoPreview(null);
    setPhotoDetailFile(null); setPhotoDetailPreview(null);
    setScannerActive(false);
  };

  const toggleTindakan = (t: string) => {
    setTindakanDipilih(prev => 
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#f8faf9]">
      <div className="max-w-[1600px] mx-auto px-6 py-10">
        <div id="qr-file-detector" className="hidden"></div>

        {/* Header Title Section - Consistent with AssetsPage */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold tracking-widest text-indigo-700 uppercase mb-2">
              FIELD OPERATIONS
            </p>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Unit Identifier</h1>
            <p className="text-[15px] text-gray-500 max-w-xl leading-relaxed">
              Scan unit barcodes to access growth history, update field monitoring records, and synchronize geographic telemetry.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-800 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm"
          >
            <RotateCcw size={18} className="text-gray-600" />
            Reset Scanner
          </button>
        </div>

        {/* Main Grid / Card */}
        <div className={cn(
          "w-full bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700",
          !scannedId && "max-w-3xl mx-auto"
        )}>
          <div className="flex flex-col">
            {/* STEP 1: SCANNER (Pro-Focus Mode) */}
            {!scannedId ? (
              <div className="flex-1 p-10 md:p-16 lg:p-20 flex flex-col items-center text-center bg-[#fdfdfd]">
                <div className="mb-12 max-w-md">
                  <div className="w-24 h-24 bg-indigo-600 rounded-[35%] flex items-center justify-center text-white mb-8 mx-auto shadow-2xl shadow-indigo-200 rotate-3 hover:rotate-0 transition-transform duration-500">
                    <Scan size={40} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">Identify Agricultural Unit</h2>
                  <p className="text-gray-400 text-sm md:text-base mt-4 font-medium leading-relaxed">
                    Position the plant's unique QR code within the frame to access real-time growth records and field analytics.
                  </p>
                </div>

                <div className="w-full max-w-md space-y-8">
                  <div className="relative aspect-square bg-black rounded-[40px] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] border-[12px] border-white ring-1 ring-gray-100">
                    <div className="absolute inset-0 z-10 pointer-events-none border-[30px] border-black/10"></div>
                    {scannerActive ? (
                      <Scanner onResult={handleScan} isActive={scannerActive} />
                    ) : (
                      <div
                        onClick={() => setScannerActive(true)}
                        className="absolute inset-0 flex flex-col items-center justify-center p-12 text-white/50 cursor-pointer hover:bg-white/5 transition-colors group"
                      >
                        <Camera size={64} className="mb-6 opacity-30 group-hover:scale-110 transition-transform duration-500" />
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Tap to engage camera</p>
                      </div>
                    )}
                    {scannerActive && (
                      <div className="absolute inset-x-0 top-0 z-20 pointer-events-none">
                        <div className="w-full h-1 bg-emerald-400 shadow-[0_0_30px_rgba(52,211,153,1)] animate-scan-laser"></div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setScannerActive(!scannerActive)}
                      className={cn(
                        "flex items-center justify-center gap-3 py-4.5 rounded-[22px] font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95",
                        scannerActive ? "bg-red-50 text-red-600 border border-red-100" : "bg-stone-900 text-white hover:bg-black"
                      )}
                    >
                      <Camera size={18} />
                      {scannerActive ? "Stop Camera" : "Launch Camera"}
                    </button>
                    <label className="flex items-center justify-center gap-3 py-4.5 bg-white border-2 border-dashed border-gray-200 text-gray-400 rounded-[22px] font-black text-xs uppercase tracking-widest hover:border-indigo-400 hover:text-indigo-600 transition-all cursor-pointer active:scale-95">
                      <ImageIcon size={18} />
                      Import QR
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                    </label>
                  </div>
                  {fileScanError && (
                    <p className="mt-4 text-xs font-bold text-red-500 bg-red-50 px-4 py-2 rounded-lg animate-bounce">
                      {fileScanError}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              /* STEP 2: PROFESSIONAL GROWTH REPORT - DIRECT FORM FOCUS */
              <div className="flex flex-col min-h-[800px] animate-in slide-in-from-right duration-700">
                {/* Compact Identity Header */}
                <div className="px-10 py-6 bg-indigo-50/50 border-b border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900 tracking-tighter uppercase italic">{scannedId}</h3>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                        {scannedCategory || 'Agricultural'} • {assetName || 'Verified Unit'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-indigo-100 shadow-sm">
                      <MapPin size={14} className="text-indigo-600" />
                      <span className="text-[11px] font-bold text-gray-700 truncate max-w-[200px] md:max-w-xs">{manualAddress || 'Location Synchronized'}</span>
                    </div>
                    <button
                      onClick={handleReset}
                      className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                      title="Reset & Scan Ulang"
                    >
                      <RotateCcw size={20} />
                    </button>
                  </div>
                </div>


                {/* REPORTING ENGINE (Form Side) */}
                <div className="flex-1 p-6 md:p-12 bg-white overflow-y-auto custom-scrollbar">
                  <div className="flex items-end justify-between border-b border-gray-50 pb-6 mb-10">
                    <div>
                      <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">Field Report</h2>
                      <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-widest italic">Growth metrics & Health Intel</p>
                    </div>
                    <CheckCircle2 size={28} className="text-emerald-500/20" />
                  </div>

                  <div className="space-y-16">
                    {/* CATEGORY 1: HEALTH & PHASE */}
                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                          <CheckCircle2 size={18} />
                        </div>
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Growth Phase & Health</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Fase Pertumbuhan</label>
                          <div className="grid grid-cols-2 gap-2">
                            {['vegetatif_awal', 'vegetatif_aktif', 'generatif', 'ripening'].map(v => (
                              <button
                                key={v}
                                onClick={() => setFasePertumbuhan(v)}
                                className={cn(
                                  "py-3 px-2 rounded-xl text-[10px] font-bold uppercase transition-all border",
                                  fasePertumbuhan === v ? "bg-stone-900 border-stone-900 text-white shadow-lg" : "bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-300"
                                )}
                              >
                                {v.replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Status Kesehatan Umum</label>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                            {[
                              { k: 'sehat_luar_biasa', l: 'Prima', i: <Sparkles size={16} /> },
                              { k: 'sehat', l: 'Sehat', i: <Leaf size={16} /> },
                              { k: 'kurang_sehat', l: 'Layu', i: <AlertTriangle size={16} /> },
                              { k: 'kritis', l: 'Kritis', i: <Zap size={16} /> }
                            ].map(s => (
                              <button
                                key={s.k}
                                onClick={() => setDeployStatus(s.k)}
                                className={cn(
                                  "py-4 px-1 rounded-xl text-[9px] font-black uppercase transition-all border flex flex-col items-center gap-2",
                                  deployStatus === s.k ? "bg-emerald-600 border-emerald-600 text-white shadow-xl scale-[1.05]" : "bg-gray-50 border-gray-100 text-gray-400"
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
                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                          <Leaf size={18} />
                        </div>
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Morfologi & Fisik</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                          { l: 'Tinggi (cm)', v: tinggiTanaman, s: setTinggiTanaman },
                          { l: 'Batang (mm)', v: diameterBatang, s: setDiameterBatang },
                          { l: 'Jumlah Daun', v: jumlahDaun, s: setJumlahDaun },
                          { l: 'Kanopi (cm)', v: lebarKanopi, s: setLebarKanopi },
                          { l: 'Bunga/Buah', v: jumlahBungaBuah, s: setJumlahBungaBuah },
                          { l: 'pH Tanah', v: phTanah, s: setPhTanah }
                        ].map((item, i) => (
                          <div key={i} className="space-y-3">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{item.l}</label>
                            <input
                              type="number"
                              value={item.v}
                              onChange={e => item.s(e.target.value)}
                              placeholder="0"
                              className="w-full bg-gray-50 border-2 border-transparent rounded-xl px-5 py-4 text-sm font-black text-stone-900 focus:bg-white focus:border-indigo-500 transition-all outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CATEGORY 3: KUALITAS & LINGKUNGAN */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Warna Daun</label>
                        <div className="flex flex-col gap-2">
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
                                "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-[11px] font-bold",
                                warnaDaun === x.k ? "bg-white border-indigo-500 shadow-md translate-x-1" : "bg-gray-50 border-transparent text-gray-400"
                              )}
                            >
                              <div className={cn("w-3 h-3 rounded-full", x.c)}></div>
                              {x.l}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status Hama</label>
                        <div className="flex flex-col gap-2">
                          {['nihil', 'ringan', 'sedang', 'berat'].map(x => (
                            <button
                              key={x}
                              onClick={() => setStatusHama(x)}
                              className={cn(
                                "text-left px-4 py-3 rounded-xl border transition-all text-[11px] font-bold uppercase",
                                statusHama === x ? "bg-red-50 border-red-200 text-red-600 shadow-sm" : "bg-gray-50 border-transparent text-gray-400"
                              )}
                            >
                              {x}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kelembapan Tanah</label>
                        <div className="flex flex-col gap-2">
                          {['kering', 'normal', 'basah'].map(x => (
                            <button
                              key={x}
                              onClick={() => setKelembapanTanah(x)}
                              className={cn(
                                "text-left px-4 py-3 rounded-xl border transition-all text-[11px] font-bold uppercase",
                                kelembapanTanah === x ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm" : "bg-gray-50 border-transparent text-gray-400"
                              )}
                            >
                              {x}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* CATEGORY 4: INTERVENSI & TINDAKAN */}
                    <div className="space-y-8 p-8 bg-gray-50 rounded-[40px] border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                          <RotateCcw size={18} />
                        </div>
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Tindakan Lapangan</h4>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {['Penyiraman', 'Pemupukan', 'Penyiangan', 'Pemangkasan', 'Pestisida'].map(t => (
                          <button
                            key={t}
                            onClick={() => toggleTindakan(t)}
                            className={cn(
                              "py-4 px-2 rounded-2xl text-[9px] font-black uppercase transition-all border-2",
                              tindakanDipilih.includes(t) ? "bg-amber-500 border-amber-500 text-white shadow-lg" : "bg-white border-transparent text-gray-400 hover:border-amber-200"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Agronomic Observations</label>
                        <textarea
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          placeholder="Anomalies, pests, or rapid growth signals..."
                          className="w-full bg-white border-2 border-transparent rounded-[30px] px-8 py-6 text-sm font-bold text-stone-700 shadow-inner focus:border-indigo-500 transition-all outline-none h-32 resize-none"
                        />
                      </div>
                    </div>

                    {/* CATEGORY 5: DOKUMENTASI VISUAL (DOUBLE) */}
                    <div className="space-y-8">
                       <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                          <Camera size={18} />
                        </div>
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Bukti Visual (Wajib Foto Overview)</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* OVERVIEW PHOTO */}
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Foto Overview (Utama)</label>
                          <div
                            onClick={() => cameraInputRef.current?.click()}
                            className={cn(
                              "aspect-video rounded-[30px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group",
                              photoPreview ? "border-indigo-500 shadow-xl" : "border-gray-200 hover:bg-gray-50"
                            )}
                          >
                            {photoPreview ? (
                              <>
                                <img src={photoPreview} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Camera className="text-white" />
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center gap-3">
                                <Camera size={32} className="text-gray-200" />
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Ambil Foto Overview</span>
                              </div>
                            )}
                          </div>
                   
                        </div>

                        {/* DETAIL PHOTO */}
                        <div className="space-y-4">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Foto Detail (Close-up)</label>
                          <div
                            onClick={() => detailCameraRef.current?.click()}
                            className={cn(
                              "aspect-video rounded-[30px] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group",
                              photoDetailPreview ? "border-emerald-500 shadow-xl" : "border-gray-200 hover:bg-gray-50"
                            )}
                          >
                            {photoDetailPreview ? (
                              <>
                                <img src={photoDetailPreview} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Camera className="text-white" />
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center gap-3">
                                <ImageIcon size={32} className="text-gray-200" />
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Ambil Foto Detail</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Hidden Inputs */}
                      <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={(e) => handlePhotoCapture(e, 'overview')} className="hidden" />
                      <input type="file" ref={detailCameraRef} accept="image/*" capture="environment" onChange={(e) => handlePhotoCapture(e, 'detail')} className="hidden" />
                    </div>

                    <div className="pt-10">
                      <button
                        onClick={handleCommit}
                        disabled={loading || !photoFile}
                        className="w-full py-7 bg-stone-900 text-white rounded-[35px] font-black text-base shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4 uppercase tracking-[0.3em]"
                      >
                        {loading ? <Loader2 className="animate-spin" /> : <>Sinkronisasi Data <CheckCircle2 size={24} /></>}
                      </button>
                      <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-8 italic">
                        Authorized Field Report • GPS Verified • Integrity Secured
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
