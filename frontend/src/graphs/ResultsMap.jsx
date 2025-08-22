import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon paths for React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Internal component to handle map events and report bounds (including initial mount)
import { useEffect } from 'react';
function BoundsReporter({ onBoundsChange }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const b = [
        [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
        [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
      ];
      console.log('[Map] moveend bounds:', b);
      if (onBoundsChange) {
        onBoundsChange(b);
      }
    },
    zoomend: () => {
      const bounds = map.getBounds();
      const b = [
        [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
        [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
      ];
      console.log('[Map] zoomend bounds:', b);
      if (onBoundsChange) {
        onBoundsChange(b);
      }
    },
  });
  useEffect(() => {
    if (onBoundsChange && map) {
      const bounds = map.getBounds();
      const b = [
        [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
        [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
      ];
      console.log('[Map] initial bounds:', b);
      onBoundsChange(b);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}
// (removed duplicate export default)
export default function ResultsMap({ results, onBoundsChange }) {
  const points = (results || [])
    .map(r => {
      // Support both GeoJSON and "lat,lon" string
      if (r.geo && r.geo.type === 'Point' && Array.isArray(r.geo.coordinates)) {
        return { ...r, lat: r.geo.coordinates[1], lon: r.geo.coordinates[0] };
      }
      if (typeof r.geo === 'string' && r.geo.includes(',')) {
        const [lat, lon] = r.geo.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lon)) return { ...r, lat, lon };
      }
      return null;
    })
    .filter(Boolean);

  // Center map on first point or a default location
  const center = points.length
    ? [points[0].lat, points[0].lon]
    : [-36.8485, 174.7633]; // Auckland default

  return (
    <MapContainer center={center} zoom={11} style={{ height: 400, width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors & CartoDB'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <BoundsReporter onBoundsChange={onBoundsChange} />
      {points.map((r, i) => (
        <Marker key={i} position={[r.lat, r.lon]}>
          <Popup>
            <div>
              <b>{r.name || 'Anonymous'}</b><br />
              {r.location && <span>{r.location}<br /></span>}
              Download: {r.download} Mbps<br />
              Upload: {r.upload} Mbps<br />
              Ping: {r.ping} ms
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}