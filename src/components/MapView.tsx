import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { ChevronLeft, Navigation, Search, Plus, Minus, Maximize2 } from 'lucide-react';
import { cn } from '../lib/utils';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface CheckIn {
  category: string;
  id: string;
  barcode_id: string;
  lat: number;
  lng: number;
  photo_url: string;
  asset_name?: string;
  condition?: string;
  notes?: string;
  created_at: string;
  tinggi_tanaman?: number;
  lebar_kanopi?: number;
  diameter_batang?: number;
  fase_pertumbuhan?: string;
}

interface MapViewProps {
  checkIns: CheckIn[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  layerType?: 'standard' | 'satellite' | 'terrain' | 'satellite';
  focusLocation?: [number, number] | null;
  fitBoundsTrigger?: number;
  showGreenZone?: boolean;
  onFullscreen?: () => void;
}

export const MapView = ({ checkIns, center, zoom = 13, className, layerType: initialLayer = 'satellite', focusLocation, fitBoundsTrigger, showGreenZone = false, onFullscreen }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const tileLayer = useRef<L.TileLayer | null>(null);

  const [currentLayer, setCurrentLayer] = useState(initialLayer);
  const [activeTab, setActiveTab] = useState('Tinggi');
  const hasFitBounds = useRef<boolean>(false);

  // Compute stats from active check_ins
  const avgPlantStats = useMemo(() => {
    let tinggi = 0, kanopi = 0, diameter = 0;
    let countTinggi = 0, countKanopi = 0, countDiameter = 0;

    checkIns.forEach(c => {
      if (c.tinggi_tanaman) { tinggi += c.tinggi_tanaman; countTinggi++; }
      if (c.lebar_kanopi) { kanopi += c.lebar_kanopi; countKanopi++; }
      if (c.diameter_batang) { diameter += c.diameter_batang; countDiameter++; }
    });

    return {
      tinggi: countTinggi ? (tinggi / countTinggi).toFixed(1) : '0',
      kanopi: countKanopi ? (kanopi / countKanopi).toFixed(1) : '0',
      diameter: countDiameter ? (diameter / countDiameter).toFixed(1) : '0'
    };
  }, [checkIns]);

  // Initialize Map
  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      // Determine initial center: Prop -> First Plant -> Default (Jakarta)
      let initialCenter: [number, number] = center || [-6.200000, 106.816666];

      if (!center && checkIns.length > 0) {
        const first = checkIns[0];
        if (first.lat && first.lng) {
          initialCenter = [Number(first.lat), Number(first.lng)];
        }
      }

      leafletMap.current = L.map(mapRef.current, {
        zoomControl: false,
      }).setView(initialCenter, zoom);

      tileLayer.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }).addTo(leafletMap.current);

      markersLayer.current = L.layerGroup().addTo(leafletMap.current);
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Handle Layer Switching
  useEffect(() => {
    if (!leafletMap.current || !tileLayer.current) return;
    let tileUrl = '';
    switch (currentLayer) {
      case 'satellite':
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        break;
      case 'terrain':
        tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        break;
      default:
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
    tileLayer.current.setUrl(tileUrl);
  }, [currentLayer]);

  // Sync Markers
  useEffect(() => {
    if (leafletMap.current && markersLayer.current) {
      console.log('Rendering Markers:', checkIns.length);
      markersLayer.current.clearLayers();
      const markers: L.Marker[] = [];

      checkIns.forEach((checkIn) => {
        const lat = Number(checkIn.lat);
        const lng = Number(checkIn.lng);
        if (isNaN(lat) || isNaN(lng)) return;

        const conditionColor = checkIn.condition === 'subur' ? '#10b981' : checkIn.condition === 'layu' ? '#f59e0b' : '#ef4444';

        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="relative group">
              <div class="w-10 h-10 rounded-full border-2 border-white shadow-xl overflow-hidden bg-slate-200 transition-transform group-hover:scale-110">
                <img src="${checkIn.photo_url || `https://ui-avatars.com/api/?name=${checkIn.asset_name || 'A'}&background=random`}" class="w-full h-full object-cover" onerror="this.src='https://ui-avatars.com/api/?name=?'" />
              </div>
              <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm" style="background: ${conditionColor}"></div>
              <div class="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-slate-900 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[2000] pointer-events-none">
                ${checkIn.asset_name || checkIn.barcode_id}
              </div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(`
          <div class="p-3 w-64 font-sans">
            <h4 class="text-sm font-black text-slate-900 mb-2">${checkIn.asset_name || checkIn.barcode_id}</h4>
            ${checkIn.photo_url ? `<img src="${checkIn.photo_url}" class="w-full h-32 object-cover rounded-xl shadow-lg mb-3" />` : ''}
            
            <div class="grid grid-cols-3 gap-1 text-center mb-3">
               <div class="bg-emerald-50 rounded p-1 pt-1.5 border border-emerald-100 shadow-inner">
                  <span class="block text-[8px] font-black uppercase tracking-widest text-emerald-800">Tinggi</span>
                  <span class="text-sm font-black text-emerald-950">${checkIn.tinggi_tanaman || 0}<span class="text-[8px] text-emerald-600">cm</span></span>
               </div>
               <div class="bg-emerald-50 rounded p-1 pt-1.5 border border-emerald-100 shadow-inner">
                  <span class="block text-[8px] font-black uppercase tracking-widest text-emerald-800">Kanopi</span>
                  <span class="text-sm font-black text-emerald-950">${checkIn.lebar_kanopi || 0}<span class="text-[8px] text-emerald-600">cm</span></span>
               </div>
               <div class="bg-emerald-50 rounded p-1 pt-1.5 border border-emerald-100 shadow-inner">
                  <span class="block text-[8px] font-black uppercase tracking-widest text-emerald-800">Diameter</span>
                  <span class="text-sm font-black text-emerald-950">${checkIn.diameter_batang || 0}<span class="text-[8px] text-emerald-600">cm</span></span>
               </div>
            </div>

            <div class="grid grid-cols-2 gap-2 text-[9px] text-slate-500">
               <div class="bg-gray-50 p-2 rounded">BARCODE: <b>${checkIn.barcode_id}</b></div>
               <div class="bg-gray-50 p-2 rounded">STATUS: <b style="color:${conditionColor}">${checkIn.condition || 'OK'}</b></div>
            </div>
          </div>
        `, { maxWidth: 300 }).bindTooltip(`
          <div class="p-1 px-2 pointer-events-none">
            <div class="flex items-center gap-2 mb-1">
               <div class="w-2 h-2 rounded-full" style="background: ${conditionColor}"></div>
               <span class="text-[10px] font-black text-slate-900 uppercase tracking-tighter">${checkIn.asset_name || checkIn.barcode_id}</span>
            </div>
            <div class="flex gap-3">
              <div class="flex flex-col">
                <span class="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Growth Phase</span>
                <span class="text-[9px] font-black text-emerald-700 uppercase">${checkIn.fase_pertumbuhan?.replace('_', ' ') || 'Normal'}</span>
              </div>
              <div className="w-px h-4 bg-gray-100"></div>
              <div class="flex flex-col">
                <span class="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Height</span>
                <span class="text-[9px] font-black text-slate-900">${checkIn.tinggi_tanaman || 0}cm</span>
              </div>
            </div>
          </div>
        `, {
          permanent: false,
          direction: 'top',
          offset: [0, -20],
          className: 'custom-tooltip-base'
        });

        markers.push(marker);
        markersLayer.current?.addLayer(marker);
      });

      if (markers.length > 0 && !hasFitBounds.current) {
        const group = L.featureGroup(markers);
        leafletMap.current.fitBounds(group.getBounds().pad(0.3));
        hasFitBounds.current = true;
      }
    }
  }, [checkIns]);

  useEffect(() => {
    if (leafletMap.current && focusLocation) {
      leafletMap.current.flyTo(focusLocation, 18, { animate: true, duration: 1.2 });
    }
  }, [focusLocation]);

  const handleZoom = (type: 'in' | 'out') => {
    if (leafletMap.current) {
      if (type === 'in') leafletMap.current.zoomIn();
      else leafletMap.current.zoomOut();
    }
  };

  const handleFitBounds = () => {
    if (leafletMap.current && markersLayer.current) {
      const bounds = markersLayer.current.getLayers().map(l => (l as L.Marker).getLatLng());
      if (bounds.length > 0) {
        leafletMap.current.fitBounds(L.latLngBounds(bounds).pad(0.2));
      }
    }
  };

  return (
    <div className={cn("relative overflow-hidden group border border-slate-200", className)}>
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* TIMELINE & CONTROLS (Bottom) */}
      <div className="absolute bottom-6 left-6 right-6 z-[1000] glass-card p-2 rounded-none flex items-center gap-2">

        <div className="flex items-center gap-1 bg-white p-1 shadow-sm border border-slate-100">
          <button onClick={() => setCurrentLayer('standard')} className={cn("px-4 py-1.5 text-[10px] font-bold uppercase transition-colors", currentLayer === 'standard' ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-900")}>Terrain</button>
          <button onClick={() => setCurrentLayer('satellite')} className={cn("px-4 py-1.5 text-[10px] font-bold uppercase transition-colors", currentLayer === 'satellite' ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-900")}>Satellite</button>
        </div>
        <div className="flex items-center gap-4 px-2">
          <div onClick={handleFitBounds} className="cursor-pointer text-slate-400 hover:text-emerald-600"><Navigation size={18} /></div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex flex-col">
            <button onClick={() => handleZoom('in')} className="text-slate-400 hover:text-emerald-700"><Plus size={12} /></button>
            <button onClick={() => handleZoom('out')} className="text-slate-400 hover:text-rose-600"><Minus size={12} /></button>
          </div>
        </div>
      </div>


    </div>
  );
};

