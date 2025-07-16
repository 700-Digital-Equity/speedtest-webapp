import React from 'react';

export default function PastResultsModal({ open, onClose }) {
  if (!open) return null;
  const results = JSON.parse(localStorage.getItem('pastSpeedTests') || '[]');
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: 24, minWidth: 320, maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto'
      }}>
        <h2>Past Results (This Device)</h2>
        <button onClick={onClose} style={{ float: 'right', marginTop: -32, marginRight: -16, fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
        {results.length === 0 ? (
          <p>No past results.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Location</th>
                <th>Ping</th>
                <th>Download</th>
                <th>Upload</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>{new Date(r.timestamp).toLocaleString()}</td>
                  <td>{r.name}</td>
                  <td>{r.location}</td>
                  <td>{r.ping}</td>
                  <td>{r.download}</td>
                  <td>{r.upload}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}