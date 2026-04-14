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
  const [assetName, setAssetName] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Field untuk perkembangan tanaman (Expanded from task.md)
  const [tinggiTanaman, setTinggiTanaman] = useState('');
  const [jumlahDaun, setJumlahDaun] = useState('');
  const [lebarDaun, setLebarDaun] = useState('');
  const [notes, setNotes] = useState('');
  const [deployStatus, setDeployStatus] = useState('sehat');
  const [penyiraman, setPenyiraman] = useState('sudah');
  const [pemberianPupuk, setPemberianPupuk] = useState('tidak');
  const [jenisPupuk, setJenisPupuk] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [scannedCategory, setScannedCategory] = useState<string>('');
  const [manualAddress, setManualAddress] = useState<string>('');

  const { saveAsset, getAssetByBarcode, loading } = useAttendance();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
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
      alert("QR Code tidak terbaca. Pastikan gambar jelas.");
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
    if (!scannedId || !coords || !photoFile) {
      return alert('Foto Bukti Perkembangan Wajib! Ambil foto tanaman untuk memvalidasi laporan ini.');
    }

    // Construct dynamic description
    const reportData = {
      tinggi: tinggiTanaman,
      daun: jumlahDaun,
      lebar: lebarDaun,
      penyiraman,
      pupuk: pemberianPupuk === 'ya' ? jenisPupuk : 'tidak',
      cahaya: 'terang_tidak_langsung'
    };

    const combinedNotes = `Data Fisik: T:${reportData.tinggi} D:${reportData.daun} L:${reportData.lebar} | Rawat: Siram:${reportData.penyiraman} Pupuk:${reportData.pupuk} Cahaya:${reportData.cahaya} | Obs: ${notes}`;

    const result = await saveAsset({
      barcode_id: scannedId,
      asset_name: assetName,
      category: scannedCategory,
      lat: coords.lat,
      lng: coords.lng,
      address: manualAddress,
      photo_file: photoFile,
      condition: deployStatus,
      notes: combinedNotes,
    });

    if (result.success) {
      setTimeout(() => navigate('/assets'), 1500);
    }
  };

  const handleReset = () => {
    setScannedId(null); setAssetName(''); setCoords(null);
    setNotes(''); setTinggiTanaman(''); setJumlahDaun(''); setLebarDaun('');
    setPenyiraman('sudah'); setPemberianPupuk('tidak'); setJenisPupuk('');
    setPhotoFile(null); setPhotoPreview(null); setScannerActive(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div id="qr-file-detector" className="hidden"></div>

      {/* Main Feature Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Pemindai Aset Lapangan</h1>
          <p className="text-sm text-stone-500 mt-0.5">Pantau dan laporkan perkembangan tanaman secara real-time</p>
        </div>
      </div>

      {/* Main Grid / Card */}
      <div className={cn(
        "w-full bg-white rounded-[48px] border border-stone-100 shadow-[0_22px_70px_4px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000",
        !scannedId ? "max-w-2xl mx-auto" : "max-w-6xl mx-auto"
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
              </div>
            </div>
          ) : (
            /* STEP 2: PROFESSIONAL GROWTH REPORT */
            <div className="flex flex-col lg:flex-row min-h-[800px] animate-in slide-in-from-right duration-700">

              {/* ASSET IDENTITY STRIP (Premium Identity Card Style) */}
              <div className="w-full lg:w-[440px] p-10 md:p-14 bg-[#FAFAFA] border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col">
                <div className="mb-12">
                  <h2 className="text-3xl font-black text-gray-900 tracking-tighter leading-none italic mb-2 uppercase">Batch Info</h2>
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">Metadata verified from core database</p>
                </div>

                <div className="flex-1 space-y-8">
                  {/* Virtual Identity Card */}
                  <div className="p-8 bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-900 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-10">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                          <ShieldCheck size={20} />
                        </div>
                        <span className="text-[10px] font-black bg-emerald-400 text-emerald-900 px-2 py-0.5 rounded uppercase tracking-widest">Live System</span>
                      </div>
                      <p className="text-[10px] font-black text-indigo-200 uppercase tracking-[0.2em] mb-1">Batch Identifier</p>
                      <h3 className="text-3xl font-black italic tracking-tighter mb-8">{scannedId}</h3>

                      <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                        <div>
                          <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">Variation</p>
                          <p className="text-sm font-bold truncate">{assetName || 'Pending Sync'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1">Category</p>
                          <p className="text-sm font-bold">{scannedCategory || 'Agricultural'}</p>
                        </div>
                      </div>
                    </div>
                    <Scan size={140} className="absolute -bottom-10 -right-10 opacity-5 -rotate-12 transition-transform duration-700 group-hover:rotate-0" />
                  </div>

                  {/* Geotag Card */}
                  <div className="p-8 bg-white border border-gray-100 rounded-[35px] shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-indigo-600" />
                        <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Deployment Zone</span>
                      </div>
                      <div className={cn("w-2 h-2 rounded-full", coords ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-red-400")}></div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[13px] font-bold text-gray-700 leading-relaxed italic">
                        "{manualAddress || 'Geographic triangulation in progress via satellite uplink'}"
                      </p>
                      {coords && (
                        <div className="flex gap-4 p-3 bg-gray-50 rounded-2xl font-mono text-[10px] font-black text-indigo-600 border border-gray-100/50">
                          <span>LAT: {coords.lat.toFixed(6)}</span>
                          <span>LNG: {coords.lng.toFixed(6)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-gray-100 mt-10">
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-white border border-gray-200 text-stone-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all group"
                  >
                    <RotateCcw size={16} className="group-hover:rotate-[-120deg] transition-transform duration-500" />
                    Cancel & Scan Ulang
                  </button>
                </div>
              </div>

              {/* REPORTING ENGINE (Form Side) */}
              <div className="flex-1 p-10 md:p-14 lg:p-20 bg-white space-y-12 overflow-y-auto custom-scrollbar">
                <div className="flex items-end justify-between border-b border-gray-50 pb-8">
                  <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">Field Report</h2>
                    <p className="text-gray-400 text-xs font-bold mt-3 uppercase tracking-widest">Growth metrics & health synchronization</p>
                  </div>
                  <CheckCircle2 size={32} className="text-gray-100" />
                </div>

                <section className="space-y-12">
                  {/* Health Status Selector */}
                  <div className="space-y-5">
                    <label className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Current Health Status</label>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { key: 'sehat_luar_biasa', label: 'Prima', icon: <Sparkles size={22} className="text-emerald-400" /> },
                        { key: 'sehat', label: 'Sehat', icon: <Leaf size={22} className="text-indigo-400" /> },
                        { key: 'kurang_sehat', label: 'Layu', icon: <AlertTriangle size={22} className="text-amber-400" /> },
                        { key: 'kritis', label: 'Kritis', icon: <Zap size={22} className="text-red-400" /> }
                      ].map(s => (
                        <button
                          key={s.key}
                          onClick={() => setDeployStatus(s.key)}
                          className={cn(
                            "relative py-5 px-2 rounded-3xl text-[11px] font-black uppercase tracking-tight transition-all border-2 flex flex-col items-center gap-3",
                            deployStatus === s.key ? "bg-stone-900 border-stone-900 text-white shadow-2xl scale-[1.02]" : "bg-white border-gray-100 text-gray-400 hover:border-stone-200"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                            deployStatus === s.key ? "bg-white/10" : "bg-gray-50"
                          )}>
                            {s.icon}
                          </div>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Numeric Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {[
                      { label: 'Growth Height (cm)', val: tinggiTanaman, setter: setTinggiTanaman },
                      { label: 'Leaf Count (qty)', val: jumlahDaun, setter: setJumlahDaun },
                      { label: 'Max Width (cm)', val: lebarDaun, setter: setLebarDaun }
                    ].map((item, i) => (
                      <div key={i} className="space-y-3">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{item.label}</label>
                        <div className="relative group">
                          <input
                            type="number"
                            value={item.val}
                            onChange={e => item.setter(e.target.value)}
                            placeholder="00.0"
                            className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl px-6 py-4.5 text-base font-black text-stone-900 focus:bg-white focus:border-indigo-500 focus:shadow-xl transition-all outline-none"
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1 h-6 bg-stone-200 rounded-full group-focus-within:bg-indigo-500 transition-colors"></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Evidence Capture */}
                  <div className="space-y-5">
                    <label className="text-[11px] font-black text-gray-900 uppercase tracking-widest ml-1 flex items-center gap-2">
                      Visual Evidence <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] rounded-lg uppercase tracking-widest">Mandatory</span>
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "w-full aspect-[21/9] border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center cursor-pointer transition-all duration-500 overflow-hidden relative group",
                        photoPreview ? "border-emerald-500 shadow-2xl shadow-emerald-50" : "border-stone-200 hover:border-indigo-400 hover:bg-indigo-50/20"
                      )}
                    >
                      {photoPreview ? (
                        <>
                          <img src={photoPreview} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPhotoPreview(null);
                              setPhotoFile(null);
                            }}
                            className="absolute top-6 right-6 p-2 bg-white/90 backdrop-blur-md text-red-500 rounded-full shadow-lg hover:bg-white transition-all scale-75 group-hover:scale-100"
                          >
                            <RotateCcw size={20} />
                          </button>
                          <div className="absolute bottom-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md text-stone-900 text-[10px] font-black rounded-xl border border-white uppercase shadow-lg">Evidence Captured</div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-stone-50/50">
                          <div className="flex gap-6">
                            {/* Camera Action */}
                            <div
                              onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                              className="flex flex-col items-center gap-3 group/btn"
                            >
                              <div className="w-20 h-20 bg-white shadow-xl rounded-3xl flex items-center justify-center border border-stone-100 group-hover/btn:border-indigo-500 group-hover/btn:scale-110 transition-all duration-300">
                                <Camera size={32} className="text-stone-300 group-hover/btn:text-indigo-600 transition-colors" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 group-hover/btn:text-indigo-600 transition-colors">Take Photo</span>
                            </div>

                            {/* Gallery Action */}
                            <div
                              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                              className="flex flex-col items-center gap-3 group/btn"
                            >
                              <div className="w-20 h-20 bg-white shadow-xl rounded-3xl flex items-center justify-center border border-stone-100 group-hover/btn:border-emerald-500 group-hover/btn:scale-110 transition-all duration-300">
                                <ImageIcon size={32} className="text-stone-300 group-hover/btn:text-emerald-500 transition-colors" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 group-hover/btn:text-emerald-600 transition-colors">From Gallery</span>
                            </div>
                          </div>
                          <p className="mt-8 text-[9px] font-bold text-gray-300 uppercase tracking-[0.3em]">Select acquisition method</p>
                        </div>
                      )}
                    </div>
                    {/* Hidden Inputs */}
                    <input type="file" ref={cameraInputRef} accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handlePhotoCapture} className="hidden" />
                  </div>

                  {/* Observations */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Agronomic Observations</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Describe any anomalies, pests, or rapid growth signals..."
                      className="w-full bg-stone-50 border-2 border-transparent rounded-[35px] px-8 py-8 text-sm font-bold text-stone-700 focus:bg-white focus:border-indigo-500 focus:shadow-2xl transition-all outline-none h-40 resize-none"
                    />
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={handleCommit}
                      disabled={loading || !photoFile}
                      className="w-full py-7 bg-[#EE7D40] text-white rounded-[35px] font-black text-sm shadow-[0_25px_60px_-15px_rgba(238,125,64,0.4)] hover:bg-[#d96c32] hover:shadow-[0_30px_70px_-15px_rgba(238,125,64,0.5)] transition-all active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-4 uppercase tracking-[0.3em]"
                    >
                      {loading ? <Loader2 className="animate-spin" /> : <>Submit Final Report <CheckCircle2 size={24} /></>}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-8">
                      Authorized Field Report • Data Integrity Protected
                    </p>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function setFileScanError(_arg0: null) {
  throw new Error('Function not implemented.');
}

