import React from 'react';

export default function RegionAverages({ results }) {
  if (!results || results.length === 0) return null;
  const avg = (arr, key) => {
    const vals = arr.map(r => Number(r[key])).filter(v => !isNaN(v));
    if (!vals.length) return null;
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
  };
  const avgDownload = avg(results, 'download');
  const avgUpload = avg(results, 'upload');
  const avgPing = avg(results, 'ping');
  return (
    <div style={{
      background: '#232837',
      color: '#fff',
      borderRadius: 8,
      padding: '12px 18px',
      marginBottom: 18,
      fontSize: 16,
      boxShadow: '0 2px 8px #0002',
      display: 'flex',
      gap: 32,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <span><b>Avg Download:</b> {avgDownload ? avgDownload + ' Mbps' : 'N/A'}</span>
      <span><b>Avg Upload:</b> {avgUpload ? avgUpload + ' Mbps' : 'N/A'}</span>
      <span><b>Avg Ping:</b> {avgPing ? avgPing + ' ms' : 'N/A'}</span>
    </div>
  );
}
