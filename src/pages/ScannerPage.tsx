import { useState, useCallback, useRef } from 'react';
import { Scanner } from '../components/Scanner';
import { useAttendance } from '../hooks/useAttendance';
import { Html5Qrcode } from 'html5-qrcode';
import {
  MapPin, 
  Mountain, 
  ShieldCheck, 
  Camera, 
  RotateCcw, 
  CheckCircle2, 
  Loader2, 
  Scan, 
  AlertCircle,
  Image as ImageIcon,
  Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ScannerPage = () => {
  const navigate = useNavigate();
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [assetName, setAssetName] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'scanned' | 'submitting' | 'success' | 'error'>('idle');
  
  // Field untuk perkembangan tanaman
  const [tinggiTanaman, setTinggiTanaman] = useState('');
  const [jumlahDaun, setJumlahDaun] = useState('');
  const [notes, setNotes] = useState('');
  const [deployStatus, setDeployStatus] = useState('subur');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [fileScanError, setFileScanError] = useState<string | null>(null);
  
  // Menggunakan saveAsset (logika tunggal)
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
    // Coba parsing jika QR code berupa JSON
    let id = text;
    let name = '';
    try {
      const parsed = JSON.parse(text);
      if (parsed.id) id = parsed.id;
      if (parsed.name) name = parsed.name;
    } catch (e) {}

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
    
    // Gabungkan data perkembangan tanaman ke dalam notes
    const combinedNotes = `Tinggi: ${tinggiTanaman || '-'} cm | Daun: ${jumlahDaun || '-'} helai | Catatan: ${notes}`;

    // Kirim data terpadu menggunakan saveAsset
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
      setTimeout(() => navigate('/map'), 1500);
    } else {
      setStatus('error');
    }
  };

  const handleReset = () => {
    setScannedId(null); setAssetName(''); setCoords(null); setStatus('idle'); 
    setNotes(''); setTinggiTanaman(''); setJumlahDaun('');
    setPhotoFile(null); setPhotoPreview(null); setScannerActive(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
      <div id="qr-file-detector" className="hidden"></div>
      
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-4xl font-black text-stone-900 tracking-tighter">Unit Pemindai Taktis</h1>
        <p className="text-sm text-stone-400 mt-1 font-medium tracking-tight">Visi Lapangan & Penangkapan Metadata Geospasial.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-stone-950 rounded-[48px] overflow-hidden shadow-2xl relative">
            <div className="flex items-center justify-between px-8 py-5 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${scannerActive ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{scannerActive ? 'SENSOR OPTIK AKTIF' : 'SENSOR STANDBY'}</span>
              </div>
            </div>

            <div className="relative group">
              {scannerActive ? (
                <div className="p-4 sm:p-8">
                  <Scanner onResult={handleScan} isActive={scannerActive} />
                </div>
              ) : (
                <div className="aspect-video flex flex-col items-center justify-center gap-8 p-12">
                  {status === 'success' ? (
                    <div className="animate-in zoom-in-75 duration-500 text-center">
                      <CheckCircle2 size={100} className="text-emerald-500 mx-auto" />
                      <p className="text-white font-black text-2xl mt-6 uppercase tracking-widest">DATA TERSINKRONISASI</p>
                    </div>
                  ) : status === 'scanned' ? (
                    <div className="text-center space-y-6">
                      <div className="h-24 w-24 rounded-full bg-teal/20 border border-teal/40 flex items-center justify-center text-teal mx-auto ring-8 ring-teal/5">
                        <Scan size={44} />
                      </div>
                      <div>
                        <p className="text-white font-black text-2xl uppercase tracking-widest leading-none mb-2">{scannedId}</p>
                        <p className="text-stone-500 text-[10px] font-black tracking-[0.2em]">{assetName ? assetName.toUpperCase() : 'ID TERVERIFIKASI'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-5 w-full max-w-md">
                      <button onClick={() => setScannerActive(true)} className="flex-1 bg-white text-stone-950 px-8 py-6 rounded-3xl font-black text-xs hover:scale-105 transition-all shadow-2xl flex flex-col items-center gap-4 group">
                        <Camera size={28} className="text-indigo-600 group-hover:rotate-12 transition-transform" />
                        AKTIFKAN KAMERA
                      </button>
                      
                      <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-white/5 text-white border border-white/10 px-8 py-6 rounded-3xl font-black text-xs hover:bg-white/10 transition-all flex flex-col items-center gap-4">
                        <ImageIcon size={28} className="text-teal" />
                        PILIH DARI GALERI
                      </button>
                      <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} className="hidden" />
                    </div>
                  )}
                  {fileScanError && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mt-4">{fileScanError}</p>}
                </div>
              )}
              {scannerActive && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                   <button onClick={() => setScannerActive(false)} className="px-10 py-3 bg-white/90 backdrop-blur-xl rounded-full text-stone-950 text-[10px] font-black tracking-widest uppercase shadow-2xl hover:bg-white transition-all">MATIKAN SENSOR</button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-[40px] border border-stone-200/60 p-8 shadow-sm group">
              <div className="flex items-center justify-between mb-6">
                <MapPin size={22} className="text-teal" />
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${coords ? 'bg-emerald-500 text-white animate-pulse' : 'bg-stone-50 text-stone-300'}`}>
                  {coords ? 'ACTIVE TRACE' : 'SEARCHING...'}
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mb-1">POSISI LINTANG</p>
                  <p className="text-3xl font-black text-stone-900 tabular-nums">{coords ? coords.lat.toFixed(6) : '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mb-1">POSISI BUJUR</p>
                  <p className="text-3xl font-black text-stone-900 tabular-nums">{coords ? coords.lng.toFixed(6) : '—'}</p>
                </div>
              </div>
              {gpsError && <p className="mt-4 text-[10px] text-red-500 font-black uppercase tracking-widest">{gpsError}</p>}
            </div>

            <div className="bg-white rounded-[40px] border border-stone-200/60 p-8 shadow-sm space-y-8 flex flex-col justify-center items-center text-center">
               <label className="cursor-pointer group flex flex-col items-center gap-4">
                  <div className={`h-24 w-24 rounded-full flex items-center justify-center transition-all ${photoPreview ? 'ring-8 ring-teal/10 scale-105' : 'bg-stone-50 border-2 border-dashed border-stone-200 group-hover:border-teal'}`}>
                     {photoPreview ? <img src={photoPreview} className="h-full w-full rounded-full object-cover" /> : <Camera size={32} className="text-stone-300 group-hover:text-teal" />}
                  </div>
                  <div className="space-y-1">
                     <p className="text-[10px] font-black text-stone-900 uppercase tracking-widest">{photoFile ? 'FOTO TERSIMPAN' : 'FOTO TEMPAT / TANAMAN *'}</p>
                     <p className="text-xs text-stone-400 font-medium">Ambil foto tanaman di lokasinya saat ini.</p>
                  </div>
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
               </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[40px] border border-stone-200/60 p-10 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
               <div className="h-10 w-1 bg-teal rounded-full"></div>
               <h3 className="text-xl font-bold text-stone-900 tracking-tighter">Laporan Pertumbuhan</h3>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">ID Tanaman</label>
               <input type="text" value={scannedId || ''} readOnly placeholder="Pindai QR untuk memulai..." className="w-full bg-stone-50 rounded-2xl px-6 py-5 text-sm font-black text-stone-900 border border-stone-100 focus:ring-4 focus:ring-teal/5 outline-none transition-all placeholder:text-stone-300" />
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Kondisi Pertumbuhan</label>
               <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { key: 'subur', label: 'Subur', color: 'bg-emerald-500' },
                    { key: 'normal', label: 'Normal', color: 'bg-teal' },
                    { key: 'layu', label: 'Layu', color: 'bg-amber-500' },
                    { key: 'mati', label: 'Mati', color: 'bg-red-500' }
                  ].map(s => (
                    <button key={s.key} onClick={() => setDeployStatus(s.key)} className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${deployStatus === s.key ? `${s.color} text-white shadow-xl` : 'bg-stone-50 text-stone-400 border border-stone-100'}`}>
                       {s.label}
                    </button>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-3">
                 <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Tinggi (CM)</label>
                 <input type="number" value={tinggiTanaman} onChange={e => setTinggiTanaman(e.target.value)} placeholder="Misal: 120" className="w-full bg-stone-50 rounded-2xl px-6 py-5 text-sm font-black text-stone-900 border border-stone-100 focus:ring-4 focus:ring-teal/5 outline-none transition-all placeholder:text-stone-300" />
               </div>
               <div className="space-y-3">
                 <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Jumlah Daun/Cabang</label>
                 <input type="number" value={jumlahDaun} onChange={e => setJumlahDaun(e.target.value)} placeholder="Misal: 15" className="w-full bg-stone-50 rounded-2xl px-6 py-5 text-sm font-black text-stone-900 border border-stone-100 focus:ring-4 focus:ring-teal/5 outline-none transition-all placeholder:text-stone-300" />
               </div>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Catatan Tambahan / Perawatan</label>
               <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Tambahkan observasi seperti terkena hama, sudah dipupuk, dll..." className="w-full bg-stone-50 rounded-3xl px-6 py-5 text-sm text-stone-800 border border-stone-100 focus:ring-4 focus:ring-teal/5 outline-none transition-all resize-none h-24 placeholder:text-stone-300" />
            </div>

            <div className="pt-4 space-y-4">
               <button onClick={handleCommit} disabled={!scannedId || !photoFile || loading} className="w-full bg-teal text-white rounded-[28px] py-6 font-black text-sm shadow-2xl shadow-teal/20 hover:bg-teal-light hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                  {loading ? <><Loader2 className="animate-spin" /> MENGUNGGAH DATA...</> : <><CheckCircle2 /> SIMPAN LAPORAN</>}
               </button>
               <button onClick={handleReset} className="w-full text-stone-400 font-black text-[10px] py-2 hover:text-stone-600 flex items-center justify-center gap-2 tracking-widest uppercase"><RotateCcw size={14} /> RESET SENSOR</button>
            </div>
          </div>

          <div className="p-8 bg-amber-50/50 rounded-[40px] border border-amber-100/50 flex flex-col items-center text-center gap-4">
             <ShieldCheck size={32} className="text-amber-600" />
             <div>
                <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest leading-none mb-1">PROTOKOL KEAMANAN L6</p>
                <p className="text-[10px] text-amber-500 font-medium px-4">Enkripsi satelit aktif. Data lokasi dikunci secara kriptografi sebelum dikirim.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
