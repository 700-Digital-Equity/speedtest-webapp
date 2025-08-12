import React from 'react';

export default function TestResultsZone({ results, name, location, deviceModel, connectionType, os }) {
  if (!results) return null;

  if (results.error) {
    return (
      <div style={{ color: 'red', margin: '2em 0', textAlign: 'center' }}>
        <strong>Error:</strong> {results.error}
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--card-bg)',   // was '#232837'
      color: 'var(--text)',           // was '#e0e6f0'
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '420px',
      margin: '32px auto',
      boxShadow: '0 2px 16px #000a'
    }}>
      <h2 style={{ marginTop: 0 }}>Speed Test Results</h2>
      <div><strong>Name:</strong> {name}</div>
      <div><strong>Location:</strong> {location}</div>
      <div><strong>Device:</strong> {deviceModel}</div>
      <div><strong>Connection:</strong> {connectionType}</div>
      <div><strong>OS:</strong> {os}</div>
      <hr style={{ margin: '16px 0', borderColor: 'var(--border)' }} /> {/* was '#444' */}
      <div><strong>Ping:</strong> {results.ping} ms</div>
      <div><strong>Jitter:</strong> {results.jitter !== undefined ? results.jitter.toFixed(2) + ' ms' : 'N/A'}</div>
      <div><strong>Packet Loss:</strong> {results.packetLoss !== undefined ? results.packetLoss.toFixed(1) + ' %' : 'N/A'}</div>
      <div><strong>Download:</strong> {results.download} Mbps</div>
      <div><strong>Upload:</strong> {results.upload} Mbps</div>
    </div>
  );
}