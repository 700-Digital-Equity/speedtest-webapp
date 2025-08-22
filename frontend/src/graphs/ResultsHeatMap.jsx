import React, { useEffect, useRef } from 'react';
import { useMapEvents } from 'react-leaflet';
// Internal component to handle map events and report bounds (including initial mount)
function BoundsReporter({ onBoundsChange }) {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const b = [
        [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
        [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
      ];
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
      onBoundsChange(b);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);
  return null;
}
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat/dist/leaflet-heat.js';

function HeatmapLayer({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !points.length) return;
    // Remove any existing heat layer
    if (map._heatLayer) {
      map.removeLayer(map._heatLayer);
      map._heatLayer = null;
    }
    // Only show heatmap if zoom is not too high
    const zoom = map.getZoom();
    const maxHeatZoom = 14; // Hide heatmap above this zoom
    if (zoom > maxHeatZoom) return;
    // Create heat layer with larger radius
    const heat = L.heatLayer(points, {
      radius: 60, // Larger radius for more privacy
      blur: 32,
      maxZoom: 17,
      minOpacity: 0.3,
      gradient: { 0.2: '#4e79a7', 0.4: '#f28e2b', 0.7: '#e15759', 1.0: '#d7263d' },
    }).addTo(map);
    map._heatLayer = heat;
    // Listen for zoom changes to hide/show heatmap
    const onZoom = () => {
      const z = map.getZoom();
      if (z > maxHeatZoom && map._heatLayer) {
        map.removeLayer(map._heatLayer);
      } else if (z <= maxHeatZoom && !map._heatLayer) {
        const h = L.heatLayer(points, {
          radius: 60,
          blur: 32,
          maxZoom: 17,
          minOpacity: 0.3,
          gradient: { 0.2: '#4e79a7', 0.4: '#f28e2b', 0.7: '#e15759', 1.0: '#d7263d' },
        }).addTo(map);
        map._heatLayer = h;
      }
    };
    map.on('zoomend', onZoom);
    return () => {
      map.off('zoomend', onZoom);
      if (map._heatLayer) {
        map.removeLayer(map._heatLayer);
        map._heatLayer = null;
      }
    };
  }, [map, points]);
  return null;
}

let leafletFullScreenCSSInjected = false;

export default function ResultsHeatMap({ results, onBoundsChange, userResults = [], style }) {
  // Use raw points for the heatmap (no grid aggregation)
  const points = (results || [])
    .map(r => {
      if (r.geo && r.geo.type === 'Point' && Array.isArray(r.geo.coordinates)) {
        return [r.geo.coordinates[1], r.geo.coordinates[0], 1];
      }
      if (typeof r.geo === 'string' && r.geo.includes(',')) {
        const [lat, lon] = r.geo.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lon)) return [lat, lon, 1];
      }
      return null;
    })
    .filter(Boolean);

  const userPins = (userResults || [])
    .map(r => {
      if (r.geo && r.geo.type === 'Point' && Array.isArray(r.geo.coordinates)) {
        return { lat: r.geo.coordinates[1], lon: r.geo.coordinates[0], r };
      }
      if (typeof r.geo === 'string' && r.geo.includes(',')) {
        const [lat, lon] = r.geo.split(',').map(Number);
        if (!isNaN(lat) && !isNaN(lon)) return { lat, lon, r };
      }
      return null;
    })
    .filter(Boolean);

  const center = points.length
    ? [points[0][0], points[0][1]]
    : [-36.8485, 174.7633]; // Auckland default

  // Ensure the map fills its parent, especially in full screen
  const mergedStyle = {
    height: '100%',
    width: '100%',
    ...style,
  };

  // Invalidate map size on mount and when style changes (e.g., full screen)
  const mapRef = useRef();
  useEffect(() => {
    if (mapRef.current && mapRef.current._leaflet_id) {
      mapRef.current.invalidateSize();
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 300);
    }
    // Listen for window resize in all modes
    const resizeHandler = () => {
      if (mapRef.current && mapRef.current._leaflet_id) {
        mapRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [style]);

  // Inject global CSS for .leaflet-container to always fill parent
  if (typeof document !== 'undefined' && !leafletFullScreenCSSInjected) {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      .leaflet-container {
        height: 100% !important;
        width: 100% !important;
        min-height: 100% !important;
        min-width: 100% !important;
        max-height: 100% !important;
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #181c24 !important;
      }
    `;
    document.head.appendChild(styleTag);
    leafletFullScreenCSSInjected = true;
  }
  return (
    <MapContainer
      center={center}
      zoom={11}
      style={mergedStyle}
      className="full-viewport-map"
      whenCreated={mapInstance => { mapRef.current = mapInstance; }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors & CartoDB'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <BoundsReporter onBoundsChange={onBoundsChange} />
      <HeatmapLayer points={points} />
      {userPins.map((pin, idx) => (
        <Marker key={idx} position={[pin.lat, pin.lon]}>
          <Popup>
            <div>
              <strong>Past Result</strong><br />
              {pin.r.date && <div>Date: {pin.r.date}</div>}
              {pin.r.download && <div>Download: {pin.r.download} Mbps</div>}
              {pin.r.upload && <div>Upload: {pin.r.upload} Mbps</div>}
              {pin.r.ping && <div>Ping: {pin.r.ping} ms</div>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
