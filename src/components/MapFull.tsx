import { X } from 'lucide-react';
import { MapView, type CheckIn } from './MapView';

interface MapFullProps {
    isOpen: boolean;
    onClose: () => void;
    checkIns: CheckIn[];
    center?: [number, number];
    zoom?: number;
    focusLocation?: [number, number] | null;
}

export const MapFull = ({ isOpen, onClose, checkIns, center, zoom, focusLocation }: MapFullProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col animate-in fade-in zoom-in duration-300">

            {/* Map Content */}
            <div className="flex-1 relative">
                <MapView
                    checkIns={checkIns}
                    center={center}
                    zoom={zoom || 14}
                    focusLocation={focusLocation}
                    className="w-full h-full"
                />
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-3 bg-stone-50 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                >
                    <X size={24} />
                </button>

                {/* Floating Legend Overlay */}
                <div className="absolute top-6 left-6 z-[1001] bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white shadow-2xl max-w-[240px]">
                    <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-3">Zonasi Akurasi</h4>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></div>
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-none mt-0.5">Optimal (&lt;10m)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></div>
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-none mt-0.5">Moderat (10-30m)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-200"></div>
                            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-none mt-0.5">Lemah (&gt;30m)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};