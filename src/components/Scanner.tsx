import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';

interface ScannerProps {
  onResult: (decodedText: string) => void;
  isActive: boolean;
}

export const Scanner = ({ onResult, isActive }: ScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const startScanner = async () => {
      try {
        // Minta izin kamera secara eksplisit
        await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });

        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            scanner.stop().then(() => {
              scannerRef.current = null;
              onResult(decodedText);
            }).catch(console.error);
          },
          () => {} // Abaikan error scan frame
        );

        setError(null);
      } catch (err: any) {
        console.error('Gagal memulai kamera:', err);
        if (err.name === 'NotAllowedError') {
          setError('Akses kamera ditolak. Silakan izinkan akses kamera di pengaturan browser Anda.');
        } else if (err.name === 'NotFoundError') {
          setError('Kamera tidak ditemukan. Pastikan perangkat Anda memiliki kamera.');
        } else {
          setError(`Gagal membuka kamera: ${err.message || 'Error tidak dikenal'}`);
        }
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isActive, onResult]);

  return (
    <div className="w-full">
      <div id="qr-reader" className="w-full" />
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-xs font-bold text-red-600 underline"
          >
            Coba lagi
          </button>
        </div>
      )}
    </div>
  );
};
