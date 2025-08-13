import { useEffect, useState } from 'react';

export function parseGeoString(geo) {
  if (!geo) return null;
  const [latStr, lonStr] = geo.split(',').map(s => s.trim());
  const lat = Number(latStr);
  const lon = Number(lonStr);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}

export async function reverseGeocode(lat, lon, signal) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
  const res = await fetch(url, { signal, headers: { 'Accept-Language': 'en' } });
  if (!res.ok) return '';
  const data = await res.json();
  const suburb = data.address?.suburb || data.address?.neighbourhood || data.address?.village || '';
  const city =
    data.address?.city || data.address?.town || data.address?.village || data.address?.hamlet || '';
  const country = data.address?.country || '';
  return [suburb, city, country].filter(Boolean).join(', ');
}

export function useLocationFromGeo(geo) {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const parsed = parseGeoString(geo);
    if (!parsed) { setLocation(''); setError(''); return; }

    const ac = new AbortController();
    setLoading(true);
    setError('');
    reverseGeocode(parsed.lat, parsed.lon, ac.signal)
      .then(loc => setLocation(loc || ''))
      .catch(() => setError('reverse_geocode_failed'))
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [geo]);

  return { location, loading, error };
}