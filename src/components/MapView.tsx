import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

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
  id: string;
  barcode_id: string;
  lat: number;
  lng: number;
  photo_url: string;
  asset_name?: string;
  condition?: string;
  notes?: string;
  created_at: string;
}

interface MapViewProps {
  checkIns: CheckIn[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  layerType?: 'standard' | 'satellite' | 'terrain';
  focusLocation?: [number, number] | null;
  fitBoundsTrigger?: number;
  showGreenZone?: boolean;
}

export const MapView = ({ checkIns, center, zoom = 13, className, layerType = 'standard', focusLocation, fitBoundsTrigger, showGreenZone = false }: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const zonesLayer = useRef<L.LayerGroup | null>(null);
  const tileLayer = useRef<L.TileLayer | null>(null);

  // Refs untuk optimasi performa peta (mencegah patah-patah saat zoom)
  const lastIds = useRef<string>('');
  const hasFitBounds = useRef<boolean>(false);
  const prevShowZone = useRef<boolean>(false);

  useEffect(() => {
    if (mapRef.current && !leafletMap.current) {
      const initialCenter = center || [-6.200000, 106.816666];

      leafletMap.current = L.map(mapRef.current).setView(initialCenter, zoom);

      // Inisialisasi TileLayer kosong terlebih dahulu agar nanti bisa di-replace
      tileLayer.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(leafletMap.current);

      zonesLayer.current = L.layerGroup().addTo(leafletMap.current);
      markersLayer.current = L.layerGroup().addTo(leafletMap.current);
    }

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [center, zoom]);

  // Efek terpisah untuk mengganti layer peta
  useEffect(() => {
    if (!leafletMap.current || !tileLayer.current) return;

    let tileUrl = '';

    switch (layerType) {
      case 'satellite':
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
        break;
      case 'terrain':
        tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        break;
      case 'standard':
      default:
        tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        break;
    }

    tileLayer.current.setUrl(tileUrl);
    // Kita tidak bisa langsung update opsi attribution secara native tanpa re-create layer di leaflet,
    // tapi setUrl jauh lebih cepat, ringan, dan membuat transisi smooth tanpa "patah patah".
  }, [layerType]);

  useEffect(() => {
    if (leafletMap.current && markersLayer.current) {
      // Optimasi 1: Jangan render ulang marker jika datanya masih sama (Pencegah patah-patah)
      const currentIds = checkIns.map(c => c.id).sort().join(',');
      if (lastIds.current === currentIds) return;
      lastIds.current = currentIds;

      markersLayer.current.clearLayers();

      checkIns.forEach((checkIn) => {
        // Abaikan kordinat yang korup/NaN agar peta tidak crash
        if (isNaN(Number(checkIn.lat)) || isNaN(Number(checkIn.lng))) return;

        // Render badges based on condition
        let conditionColor = '#14b8a6'; // teal
        if (checkIn.condition === 'subur') conditionColor = '#10b981';
        else if (checkIn.condition === 'layu') conditionColor = '#f59e0b';
        else if (checkIn.condition === 'mati') conditionColor = '#ef4444';

        const conditionBadge = checkIn.condition
          ? `<span style="background-color:${conditionColor};color:white;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:bold;text-transform:uppercase;">${checkIn.condition}</span>`
          : '';

        const marker = L.marker([checkIn.lat, checkIn.lng])
          .bindPopup(`
            <div style="padding:10px;min-width:200px;font-family:sans-serif;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <p style="font-weight:900;font-size:14px;margin:0;color:#1c1917;">${checkIn.asset_name || checkIn.barcode_id}</p>
                ${conditionBadge}
              </div>
              <p style="font-size:10px;color:#78716c;margin:0 0 8px;font-family:monospace;">ID: ${checkIn.barcode_id}</p>
              ${checkIn.photo_url ? `<img src="${checkIn.photo_url}" style="width:100%;height:100px;object-fit:cover;border-radius:12px;margin-bottom:8px;box-shadow:0 4px 6px -1px rgb(0 0 0 / 0.1);" />` : ''}
              ${checkIn.notes ? `<p style="font-size:12px;color:#44403c;margin:0 0 8px;line-height:1.4;background:#fafaf9;padding:6px;border-radius:6px;border:1px solid #f5f5f4;">${checkIn.notes}</p>` : ''}
              <p style="font-size:10px;color:#a8a29e;margin:0;border-top:1px solid #f5f5f4;padding-top:6px;">🕒 ${new Date(checkIn.created_at).toLocaleString('id-ID')}</p>
            </div>
          `);
        markersLayer.current?.addLayer(marker);
      });

      // Optimasi 2: Hanya lakukan fitBounds (geser/zoom otomatis) pada saat pertama kali data masuk
      if (checkIns.length > 0 && !hasFitBounds.current) {
        const validForBounds = checkIns.filter(c => !isNaN(Number(c.lat)) && !isNaN(Number(c.lng)));
        if (validForBounds.length > 0) {
            const group = L.featureGroup(validForBounds.map(c => L.marker([c.lat, c.lng])));
            leafletMap.current.fitBounds(group.getBounds().pad(0.2));
        }
        hasFitBounds.current = true;
      }
    }
  }, [checkIns]);

  // Efek untuk memfokuskan peta ke 1 titik spesifik (saat klik sidebar / hasil pencarian utama)
  useEffect(() => {
    if (leafletMap.current && focusLocation) {
      leafletMap.current.flyTo(focusLocation, 18, { animate: true, duration: 1 });
    }
  }, [focusLocation]);

  // Efek untuk memfokuskan peta ke banyak aset hasil pencarian
  useEffect(() => {
    if (leafletMap.current && checkIns.length > 0 && fitBoundsTrigger) {
      const validForBounds = checkIns.filter(c => !isNaN(Number(c.lat)) && !isNaN(Number(c.lng)));
      if (validForBounds.length > 0) {
        const group = L.featureGroup(validForBounds.map(c => L.marker([c.lat, c.lng])));
        leafletMap.current.flyToBounds(group.getBounds().pad(0.2), { animate: true, duration: 1 });
      }
    }
  }, [fitBoundsTrigger]);

  // Efek untuk menggambar Zona Penghijauan (Forest Greening Area)
  useEffect(() => {
    if (!leafletMap.current || !zonesLayer.current) return;
    
    zonesLayer.current.clearLayers();

    if (showGreenZone && checkIns.length > 0) {
      // Lindungi dari potensi data kordinat database yang rusak atau bertipe String
      const validCheckIns = checkIns.filter(c => !isNaN(Number(c.lat)) && !isNaN(Number(c.lng)));
      
      if (validCheckIns.length === 0) return;

      // Cari titik tengah (centroid) dari seluruh tanaman untuk membuat zona lingkaran
      const avgLat = validCheckIns.reduce((sum, c) => sum + Number(c.lat), 0) / validCheckIns.length;
      const avgLng = validCheckIns.reduce((sum, c) => sum + Number(c.lng), 0) / validCheckIns.length;

      // Buat lingkaran hijau transparan sebagai indikator Zona Penghijauan
      const greenZone = L.circle([avgLat, avgLng], {
        color: '#10b981',      // Emerald Green outline
        fillColor: '#34d399',  // Lighter emerald green fill
        fillOpacity: 0.2,
        weight: 3,
        dashArray: '10, 10', // Garis putus-putus ala militer/taktis
        radius: 800 // Radius 800 meter
      }).bindPopup(`
        <div style="font-family:sans-serif;text-align:center;">
          <h3 style="margin:0;color:#059669;font-size:16px;font-weight:bold;">🌲 Area Penghijauan Aktif</h3>
          <p style="margin:5px 0 0;font-size:12px;color:#4b5563;">Zona Konservasi Radius 800m</p>
          <p style="margin:2px 0 0;font-size:11px;color:#9ca3af;font-weight:bold;">${checkIns.length} Aset Didalamnya</p>
        </div>
      `);

      zonesLayer.current.addLayer(greenZone);
      
      // Animasi kamera HANYA saat fitur baru saja dinyalakan (bukan saat sedang mengetik pencarian)
      if (!prevShowZone.current) {
        leafletMap.current.flyToBounds(greenZone.getBounds().pad(0.1), { animate: true, duration: 1.5 });
      }
    }

    prevShowZone.current = showGreenZone;
  }, [showGreenZone, checkIns]);

  return (
    <div
      ref={mapRef}
      className={className || "w-full h-full rounded-2xl"}
      style={{ minHeight: '300px' }}
    />
  );
};
