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
    if (!isActive) {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
      return;
    }

    const initScanner = async () => {
      // Tunggu sebentar untuk memastikan DOM sudah dirender (React transition)
      await new Promise(r => setTimeout(r, 100));
      
      const element = document.getElementById("qr-reader");
      if (!element) return;

      try {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        const config = {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          formatsToSupport: [ 0 ], // QR_CODE only for efficiency
        };

        await scanner.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            // Berhenti setelah scan berhasil
            scanner.stop().then(() => {
              scannerRef.current = null;
              onResult(decodedText);
            }).catch(e => {
              console.warn("Scanner stop error (safe to ignore):", e);
              onResult(decodedText); // Tetap kembalikan hasil
            });
          },
          () => {} // Ignore scan failure frames
        );
        setError(null);
      } catch (err: any) {
        console.error('Scanner start error:', err);
        setError(`Eror Kamera: ${err.message || 'Cek izin kamera'}`);
      }
    };

    initScanner();

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
