import styles from '../styles/pastresults.module.css';

export default function LiveResults({ ping, jitter, packetLoss, download, upload }) {
  // Round jitter to 2 decimal places if not null
  const jitterDisplay = jitter !== null && jitter !== undefined ? Number(jitter).toFixed(2) : null;
  return (
    <div
      className={styles.pastResultsModalContent}
      style={{
        background: 'var(--live-bg, #232837ee)',
        color: 'var(--live-fg, #fff)',
        borderRadius: 18,
        boxShadow: '0 6px 32px #0005',
        padding: 24,
        maxWidth: 400,
        minWidth: 0,
        width: '100%',
        boxSizing: 'border-box',
        border: '1.5px solid var(--live-border, #4e79a7)',
        backdropFilter: 'blur(2px)',
        margin: '0 auto',
        position: 'static',
        transition: 'background 0.2s, color 0.2s',
      }}
    >
      <style>{`
        :root {
          --live-bg: #232837ee;
          --live-fg: #fff;
          --live-border: #4e79a7;
        }
        @media (prefers-color-scheme: light) {
          :root {
            --live-bg: #fff;
            --live-fg: #232837;
            --live-border: #4e79a7;
          }
        }
      `}</style>
      <h3 style={{ marginTop: 0, marginBottom: 18, letterSpacing: 0.5, fontWeight: 700, fontSize: 22, textAlign: 'center' }}>Live Results</h3>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: 'none', boxShadow: 'none', fontSize: 17 }}>
        <tbody>
          <tr>
            <th style={{ textAlign: 'left', paddingRight: 16, fontWeight: 500, opacity: 0.85 }}>Ping</th>
            <td style={{ fontWeight: 600 }}>{ping !== null ? `${ping} ms` : '...'}</td>
          </tr>
          <tr>
            <th style={{ textAlign: 'left', paddingRight: 16, fontWeight: 500, opacity: 0.85 }}>Jitter</th>
            <td style={{ fontWeight: 600 }}>{jitterDisplay !== null ? `${jitterDisplay} ms` : '...'}</td>
          </tr>
          <tr>
            <th style={{ textAlign: 'left', paddingRight: 16, fontWeight: 500, opacity: 0.85 }}>Packet Loss</th>
            <td style={{ fontWeight: 600 }}>{packetLoss !== null ? `${packetLoss} %` : '...'}</td>
          </tr>
          <tr>
            <th style={{ textAlign: 'left', paddingRight: 16, fontWeight: 500, opacity: 0.85 }}>Download</th>
            <td style={{ fontWeight: 600 }}>{download !== null ? `${download} Mbps` : '...'}</td>
          </tr>
          <tr>
            <th style={{ textAlign: 'left', paddingRight: 16, fontWeight: 500, opacity: 0.85 }}>Upload</th>
            <td style={{ fontWeight: 600 }}>{upload !== null ? `${upload} Mbps` : '...'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}