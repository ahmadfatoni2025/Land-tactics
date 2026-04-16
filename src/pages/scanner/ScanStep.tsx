import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Link } from 'react-router-dom';

import { X, Upload, Camera, ChevronLeft, Loader2 } from 'lucide-react';

interface ScanStepProps {
  onResult: (text: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  error?: string | null;
}

export const ScanStep = ({ onResult, onFileSelect, onClose, error }: ScanStepProps) => {
  const [isActive, setIsActive] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const lastScanRef = useRef<string | null>(null);
  const scanTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initScanner = async () => {
      await new Promise(r => setTimeout(r, 400));
      if (!isMounted) return;

      const element = document.getElementById("qr-reader");
      if (!element) {
        if (isMounted) setInitError("Scanner tidak tersedia");
        return;
      }

      try {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        // Responsive QR box size based on screen
        const isDesktop = window.innerWidth >= 1024;
        const qrBoxSize = isDesktop ? 300 : 250;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: qrBoxSize, height: qrBoxSize },
            aspectRatio: 1,
            disableFlip: false,
          },
          (decodedText) => {
            // Prevent double scan
            if (!isMounted || isScanning || scanSuccess) return;

            // Check if same QR code scanned within 3 seconds
            if (lastScanRef.current === decodedText) return;

            lastScanRef.current = decodedText;
            setIsScanning(true);
            setScanSuccess(true);

            // Clear any existing timeout
            if (scanTimeoutRef.current) {
              clearTimeout(scanTimeoutRef.current);
            }

            // Stop scanner after successful scan
            scanner.stop()
              .then(() => {
                // Small delay before calling onResult for better UX
                setTimeout(() => {
                  if (isMounted) {
                    onResult(decodedText);
                  }
                }, 300);
              })
              .catch(() => {
                setTimeout(() => {
                  if (isMounted) {
                    onResult(decodedText);
                  }
                }, 300);
              });
          },
          (errorMessage) => {
            // Silent error handling - ignore scan errors
            if (import.meta.env.DEV) {
              console.debug('Scan error:', errorMessage);
            }
          }
        );

        if (isMounted) {
          setIsActive(true);
          setInitError(null);
        }
      } catch (err: any) {
        console.error("Scanner failed", err);
        if (isMounted) {
          setInitError("Tidak dapat mengakses kamera. Pastikan izin kamera diberikan.");
        }
      }
    };

    initScanner();

    return () => {
      isMounted = false;
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => { });
      }
    };
  }, [onResult, isScanning, scanSuccess]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Camera View */}
      <div id="qr-reader" className="absolute inset-0 w-full h-full object-cover" />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />

      {/* Header - Responsive */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-black/50 backdrop-blur-md rounded-xl text-white text-sm font-medium hover:bg-black/70 transition-all active:scale-95"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Kembali</span>
          </Link>

          <div className="px-3 py-2 md:px-4 md:py-2.5 bg-black/50 backdrop-blur-md rounded-xl">
            <Camera size={18} className="text-white/70" />
          </div>
        </div>
      </div>

      {/* Scanning Frame - Responsive Size */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
        <div className="relative">
          {/* Frame Size Responsive */}
          <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 relative">
            {/* Corner Borders */}
            <div className="absolute top-0 left-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-t-3 border-l-3 border-white rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-t-3 border-r-3 border-white rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-b-3 border-l-3 border-white rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border-b-3 border-r-3 border-white rounded-br-xl" />

            {/* Scanning Line Animation - Improved */}
            {isActive && !scanSuccess && (
              <>
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400/50 animate-scan-line" />
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg shadow-emerald-400/50 animate-scan-line-delayed" />
              </>
            )}

            {/* Scan Success Animation */}
            {scanSuccess && (
              <div className="absolute inset-0 border-2 border-emerald-400 rounded-2xl animate-scan-success">
                <div className="absolute inset-0 bg-emerald-400/20 animate-pulse rounded-2xl" />
              </div>
            )}

            {/* Inner Glow Effect */}
            <div className="absolute inset-0 border-2 border-white/10 rounded-2xl" />

            {/* Corner Glow */}
            <div className="absolute -inset-0.5 bg-white/5 rounded-2xl blur-sm -z-10" />
          </div>
        </div>

        {/* Instruction Text - Responsive with Scan Status */}
        <div className="mt-6 md:mt-8 lg:mt-10 text-center px-4">
          {scanSuccess ? (
            <>
              <h3 className="text-white text-base md:text-lg lg:text-xl font-semibold mb-2 animate-pulse">
                ✓ Berhasil!
              </h3>
              <p className="text-emerald-400 text-xs md:text-sm">
                Memproses data...
              </p>
            </>
          ) : (
            <>
              <h3 className="text-white text-base md:text-lg lg:text-xl font-semibold mb-2">
                Scan QR Code
              </h3>
              <p className="text-white/60 text-xs md:text-sm max-w-[280px] md:max-w-[320px] lg:max-w-[360px]">
                Tempatkan QR code di dalam bingkai untuk memindai
              </p>
            </>
          )}
        </div>
      </div>

      {/* Bottom Actions - Responsive */}
      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
        <div className="max-w-md mx-auto">
          {/* Upload Button - Disabled while scanning */}
          <label className={`w-full flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-white rounded-xl md:rounded-2xl text-gray-900 font-medium cursor-pointer transition-all shadow-lg ${isScanning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 active:scale-98'
            }`}>
            <Upload size={18} className="md:w-5 md:h-5" />
            <span className="text-sm md:text-base">Pilih dari Galeri</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileSelect}
              disabled={isScanning}
            />
          </label>

          {/* Hint Text */}
          <p className="text-white/40 text-xs text-center mt-4">
            Pastikan QR code terlihat jelas dan dalam kondisi baik
          </p>
        </div>
      </div>

      {/* Error Dialog - Responsive */}
      {(initError || error) && (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center p-4 md:p-6 z-10">
          <div className="bg-white rounded-2xl max-w-sm md:max-w-md w-full p-6 md:p-8 text-center">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
              <X size={24} className="md:w-7 md:h-7 text-red-500" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              Gagal Memindai
            </h3>
            <p className="text-gray-500 text-sm md:text-base mb-6 md:mb-8">
              {initError || error || "Terjadi kesalahan saat mengakses kamera"}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 md:py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
              >
                Tutup
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2.5 md:py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!isActive && !initError && !error && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 size={40} className="text-white animate-spin mx-auto mb-4" />
            <p className="text-white/60 text-sm">Mengaktifkan kamera...</p>
          </div>
        </div>
      )}
    </div>
  );
};