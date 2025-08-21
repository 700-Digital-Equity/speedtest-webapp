import React from 'react';

export default function AnalysisSidebar({
  metrics,
  selectedMetric,
  onSelectMetric,
  children,
  onClose
}) {
  return (
    <div style={{
      width: 520,
      background: '#181c24',
      color: '#fff',
      boxShadow: '0 0 24px #000a',
      height: '100vh',
      position: 'fixed',
      right: 0,
      top: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      borderLeft: '2px solid #222',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: 16, borderBottom: '1px solid #222' }}>
        <span style={{ fontWeight: 600, fontSize: 18, flex: 1 }}>Analysis</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer' }}>&times;</button>
      </div>
      <div style={{ padding: 16, borderBottom: '1px solid #222' }}>
        <label htmlFor="metric-select" style={{ fontWeight: 500 }}>Metric:</label>
        <select
          id="metric-select"
          value={selectedMetric}
          onChange={e => onSelectMetric(e.target.value)}
          style={{ marginLeft: 8, padding: 4, borderRadius: 4 }}
        >
          {metrics.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {children}
      </div>
    </div>
  );
}
