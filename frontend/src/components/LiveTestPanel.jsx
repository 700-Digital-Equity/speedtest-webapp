import React from 'react';
import LiveResults from './LiveResults';
import LiveGraph from '../graphs/LiveGraph';

export default function LiveTestPanel({
  ping, jitter, packetLoss, download, upload, downloadHistory, uploadHistory
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 32,
        marginTop: 40,
        marginBottom: 0,
        padding: 0,
        flexWrap: 'wrap',
        width: '100%',
      }}
    >
      <div style={{ flex: '0 1 400px', minWidth: 260, maxWidth: 420, margin: 0, padding: 0, alignSelf: 'flex-start' }}>
        <LiveResults
          ping={ping}
          jitter={jitter}
          packetLoss={packetLoss}
          download={download}
          upload={upload}
        />
      </div>
      <div style={{ flex: '1 1 700px', minWidth: 320, maxWidth: 740, margin: 0, padding: 0, alignSelf: 'flex-start' }}>
        <LiveGraph
          downloadHistory={downloadHistory}
          uploadHistory={uploadHistory}
        />
      </div>
    </div>
  );
}
