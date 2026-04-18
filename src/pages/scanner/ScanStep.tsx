import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Upload, Camera, ChevronLeft, Zap, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

interface ScanStepProps {
  onResult: (text: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  error?: string | null;
}

export const ScanStep = ({ onResult, onFileSelect, onClose, error }: ScanStepProps) => {
  const [isActive, setIsActive] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initScanner = async () => {
      // Tunggu DOM benar-benar siap dan transisi selesai
      await new Promise(r => setTimeout(r, 400));
      if (!isMounted) return;

      const element = document.getElementById("immersive-qr-reader");
      if (!element) {
        if (isMounted) setInitError("Sistem pemindai tidak ditemukan di DOM.");
        return;
      }

      try {
        const scanner = new Html5Qrcode("immersive-qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 25,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const size = Math.floor(minEdge * 0.7);
              return { width: size, height: size };
            },
            aspectRatio: window.innerWidth / window.innerHeight,
          },
          (decodedText) => {
            if (isMounted) {
              scanner.stop().then(() => {
                onResult(decodedText);
              }).catch(() => onResult(decodedText));
            }
          },
          () => { }
        );

        if (isMounted) {
          setIsActive(true);
          setInitError(null);
        }
      } catch (err: any) {
        console.error("Scanner failed", err);
        if (isMounted) {
          setInitError(`Sistem Gagal: ${err.message || 'Cek izin kamera'}`);
        }
      }
    };

    initScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => { });
      }
    };
  }, [onResult]);

  return (
    <div className="fixed inset-0 z-[100] bg-black animate-in fade-in duration-500 overflow-hidden">
      {/* Background Camera Layer */}
      <div id="immersive-qr-reader" className="absolute inset-0 w-full h-full object-cover"></div>

      {/* Modern UI Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 md:p-10 pointer-events-none">

        {/* Top Navigation */}
        <div className="flex justify-between items-start pointer-events-auto">
          <Link to="/"
            onClick={onClose}
            className="flex items-center gap-3 px-6 py-3 bg-black/40 backdrop-blur-2xl rounded-2xl text-white border border-white/10 hover:bg-black/60 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <ChevronLeft size={18} />
            Kembali
          </Link>

        </div>

        {/* Center Target Area */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Viewport Brackets */}
          <div className="relative w-[70vw] h-[70vw] max-w-[320px] max-h-[320px]">

            {/* Animated Inner Scanner Line */}
            {isActive && (
              <div className="absolute inset-x-0 h-[2px] bg-white shadow-[0_0_70px_rgba(52,211,153,1)] animate-scan-slow"></div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="w-full flex flex-col items-center gap-10 pointer-events-auto">
          {/* Gallery Picker */}
          <label className="group flex items-center gap-4 px-10 py-5 bg-white rounded-[30px] text-stone-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-105 transition-all active:scale-95">
            <Upload size={20} className="text-indigo-600" />
            <span className="font-black text-[11px] uppercase tracking-widest">Pilih Gambar Galeri</span>
            <input type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
          </label>

        </div>
      </div>

      {/* Error State Overlay */}
      {(initError || error) && (
        <div className="absolute inset-0 z-[110] bg-stone-950 flex flex-col items-center justify-center p-10 text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-[35px] flex items-center justify-center text-red-500 mb-8 border border-red-500/20 shadow-2xl shadow-red-500/10">
            <X size={40} />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight uppercase italic leading-none">Diagnostic Failure</h3>
          <p className="text-gray-400 text-sm mt-4 max-w-[280px] leading-relaxed font-medium">
            {initError || error || "Failed to initialize the optical payload system."}
          </p>
          <div className="flex gap-4 mt-12 w-full max-w-sm">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-white/5 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/10"
            >
              Batal
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
