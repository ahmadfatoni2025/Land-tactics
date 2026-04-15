import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Upload, Camera, ChevronLeft, Zap, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

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
          <button
            onClick={onClose}
            className="flex items-center gap-3 px-6 py-3 bg-black/40 backdrop-blur-2xl rounded-2xl text-white border border-white/10 hover:bg-black/60 transition-all font-bold text-xs uppercase tracking-widest"
          >
            <ChevronLeft size={18} />
            / Pemindai
          </button>

          <div className="flex gap-2">
            <div className="p-3 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/10 text-emerald-400">
              <Zap size={20} />
            </div>
            <div className="p-3 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/10 text-white/50">
              <Camera size={20} />
            </div>
          </div>
        </div>

        {/* Center Target Area */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {/* Viewport Brackets */}
          <div className="relative w-[70vw] h-[70vw] max-w-[320px] max-h-[320px]">
            {/* 4 Corner Accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-[6px] border-l-[6px] border-emerald-400 rounded-tl-[40px] shadow-[0_0_20px_rgba(52,211,153,0.5)]"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-[6px] border-r-[6px] border-emerald-400 rounded-tr-[40px] shadow-[0_0_20px_rgba(52,211,153,0.5)]"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[6px] border-l-[6px] border-emerald-400 rounded-bl-[40px] shadow-[0_0_20px_rgba(52,211,153,0.5)]"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-[6px] border-r-[6px] border-emerald-400 rounded-br-[40px] shadow-[0_0_20px_rgba(52,211,153,0.5)]"></div>

            {/* Animated Inner Scanner Line */}
            {isActive && (
              <div className="absolute inset-x-0 h-[2px] bg-emerald-400 shadow-[0_0_30px_rgba(52,211,153,1)] animate-scan-slow"></div>
            )}
          </div>

          <div className="mt-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Sparkles className="text-emerald-400" size={16} />
              <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Unit Identification</h2>
            </div>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] max-w-[240px] leading-relaxed">
              Align the QR code within the perimeter for automated bio-data retrieval
            </p>
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

          {/* Mock Camera Trigger */}
          <div className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full border border-white/20"></div>
          </div>
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

      {/* Aesthetic Metadata */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-full z-20 opacity-30">
        <span className="text-[8px] font-black text-white uppercase tracking-[0.5em] italic">System v4.2.0 • GeoAgri Ops</span>
      </div>
    </div>
  );
};
