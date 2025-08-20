import styles from '../styles/pastresults.module.css';

export default function LiveResults({ ping, jitter, packetLoss, download, upload }) {
  return (
    <div
      className={styles.pastResultsModalContent}
      style={{
        margin: '16px 0',
        padding: 16,
        maxWidth: 400,
        minWidth: 0,
        width: '100%',
        boxSizing: 'border-box',
        position: 'static',
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 16 }}>Live Results</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: 'none', boxShadow: 'none' }}>
        <tbody>
          <tr>
            <th style={{ textAlign: 'left', paddingRight: 12 }}>Ping</th>
            <td>{ping !== null ? `${ping} ms` : '...'}</td>
          </tr>
          <tr>
            <th style={{ textAlign: 'left', paddingRight: 12 }}>Jitter</th>
            <td>{jitter !== null ? `${jitter} ms` : '...'}</td>
          </tr>
          <tr>
            <th style={{ textAlign: 'left', paddingRight: 12 }}>Packet Loss</th>
            <td>{packetLoss !== null ? `${packetLoss} %` : '...'}</td>
          </tr>
          <tr>
            <th style={{ textAlign: 'left', paddingRight: 12 }}>Download</th>
            <td>{download !== null ? `${download} Mbps` : '...'}</td>
          </tr>
          <tr>
            <th style={{ textAlign: 'left', paddingRight: 12 }}>Upload</th>
            <td>{upload !== null ? `${upload} Mbps` : '...'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}