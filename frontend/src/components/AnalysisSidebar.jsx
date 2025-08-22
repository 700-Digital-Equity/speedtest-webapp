import React from 'react';

export default function AnalysisSidebar({
  metrics,
  selectedMetric,
  onSelectMetric,
  children,
  onClose
}) {
  // Light/dark adaptive styles
  const sidebarStyle = {
    width: 520,
    background: 'var(--analysis-bg, #181c24)',
    color: 'var(--analysis-fg, #fff)',
    boxShadow: '0 0 24px #000a',
    height: '100vh',
    position: 'fixed',
    right: 0,
    top: 0,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    borderLeft: '2px solid var(--analysis-border, #222)',
    transition: 'background 0.2s, color 0.2s',
  };
  const headerStyle = {
    display: 'flex', alignItems: 'center', padding: 16, borderBottom: '1px solid var(--analysis-border, #222)'
  };
  const selectStyle = {
    marginLeft: 8, padding: 4, borderRadius: 4, background: 'var(--analysis-bg, #181c24)', color: 'var(--analysis-fg, #fff)', border: '1px solid var(--analysis-border, #222)'
  };
  const sectionStyle = { padding: 16, borderBottom: '1px solid var(--analysis-border, #222)' };
  const contentStyle = { flex: 1, overflow: 'auto', padding: 16 };
  return (
    <>
      <style>{`
        :root {
          --analysis-bg: #181c24;
          --analysis-fg: #fff;
          --analysis-border: #222;
        }
        @media (prefers-color-scheme: light) {
          :root {
            --analysis-bg: #f7f8fa;
            --analysis-fg: #222;
            --analysis-border: #b0b0b0;
          }
        }
      `}</style>
      <div style={sidebarStyle}>
        <div style={headerStyle}>
          <span style={{ fontWeight: 600, fontSize: 18, flex: 1 }}>Analysis</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--analysis-fg, #fff)', fontSize: 20, cursor: 'pointer' }}>&times;</button>
        </div>
        <div style={sectionStyle}>
          <label htmlFor="metric-select" style={{ fontWeight: 500 }}>Metric:</label>
          <select
            id="metric-select"
            value={selectedMetric}
            onChange={e => onSelectMetric(e.target.value)}
            style={selectStyle}
          >
            {metrics.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div style={contentStyle}>
          {children}
        </div>
      </div>
    </>
  );
}
