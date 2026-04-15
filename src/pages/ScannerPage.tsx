import { useState, useCallback, useEffect } from 'react';
import { useAttendance } from '../hooks/useAttendance';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';

// New Components
import { ScanStep } from './scanner/ScanStep';
import { FormStep } from './scanner/FormStep';

export const ScannerPage = () => {
  const navigate = useNavigate();
  const [scannerActive, setScannerActive] = useState(true);
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
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoDetailPreview, setPhotoDetailPreview] = useState<string | null>(null);
  const [photoDetailFile, setPhotoDetailFile] = useState<File | null>(null);

  const [scannedCategory, setScannedCategory] = useState<string>('');
  const [manualAddress, setManualAddress] = useState<string>('');

  const { saveAsset, getAssetByBarcode, loading } = useAttendance();

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
    const html5QrCode = new Html5Qrcode("qr-file-detector-hidden");
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
    setScannerActive(true);
  };

  const toggleTindakan = (t: string) => {
    setTindakanDipilih(prev => 
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#f8faf9]">
      <div id="qr-file-detector-hidden" className="hidden"></div>
      
      {!scannedId && scannerActive ? (
        <ScanStep 
          onResult={handleScan}
          onFileSelect={handleFileSelect}
          onClose={() => navigate('/dashboard')}
          error={fileScanError}
        />
      ) : scannedId ? (
        <div className="max-w-[1200px] mx-auto px-0 lg:px-6 pb-20">
             <FormStep 
              scannedId={scannedId}
              assetName={assetName}
              scannedCategory={scannedCategory}
              manualAddress={manualAddress}
              coords={coords}
              loading={loading}
              onReset={handleReset}
              onCommit={handleCommit}
              fasePertumbuhan={fasePertumbuhan}
              setFasePertumbuhan={setFasePertumbuhan}
              deployStatus={deployStatus}
              setDeployStatus={setDeployStatus}
              tinggiTanaman={tinggiTanaman}
              setTinggiTanaman={setTinggiTanaman}
              diameterBatang={diameterBatang}
              setDiameterBatang={setDiameterBatang}
              jumlahDaun={jumlahDaun}
              setJumlahDaun={setJumlahDaun}
              lebarKanopi={lebarKanopi}
              setLebarKanopi={setLebarKanopi}
              jumlahBungaBuah={jumlahBungaBuah}
              setJumlahBungaBuah={setJumlahBungaBuah}
              phTanah={phTanah}
              setPhTanah={setPhTanah}
              warnaDaun={warnaDaun}
              setWarnaDaun={setWarnaDaun}
              statusHama={statusHama}
              setStatusHama={setStatusHama}
              kelembapanTanah={kelembapanTanah}
              setKelembapanTanah={setKelembapanTanah}
              tindakanDipilih={tindakanDipilih}
              toggleTindakan={toggleTindakan}
              notes={notes}
              setNotes={setNotes}
              photoPreview={photoPreview}
              photoDetailPreview={photoDetailPreview}
              handlePhotoCapture={handlePhotoCapture}
            />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black/5">
            <div className="p-12 bg-white rounded-[40px] shadow-2xl flex flex-col items-center gap-8 max-w-sm text-center">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl rotate-6">
                    <span className="text-4xl font-bold italic">QR</span>
                </div>
                <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Scanner Offline</h3>
                    <p className="text-gray-400 text-sm mt-2 font-medium">Ready to engage field identification system.</p>
                </div>
                <button 
                onClick={() => setScannerActive(true)}
                className="w-full py-5 bg-stone-900 text-white rounded-[25px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-xl"
                >
                Engage Scanner
                </button>
            </div>
        </div>
      )}
    </div>
  );
};
