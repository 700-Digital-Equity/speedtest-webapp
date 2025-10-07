import React, { useState, useEffect } from 'react';
import SpeedTestForm from './SpeedTestForm';
import TestResultsZone from './TestResultZone';
import PastResultsModal from './PastResults';
import LiveTestPanel from './LiveTestPanel';

export default function SpeedTest() {
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progressStep, setProgressStep] = useState('');
  const [showPast, setShowPast] = useState(false);

  // Live results state
  const [livePing, setLivePing] = useState(null);
  const [liveJitter, setLiveJitter] = useState(null);
  const [livePacketLoss, setLivePacketLoss] = useState(null);
  const [liveDownload, setLiveDownload] = useState(null);
  const [liveUpload, setLiveUpload] = useState(null);

  const runTest = async (formData) => {
    // Test logic here...
  };

  return (
    <>
      {/* Add the kind message */}
      <div style={{
        background: '#fffbe6',
        color: '#856404',
        border: '1px solid #ffeeba',
        borderRadius: 8,
        padding: '12px 16px',
        marginBottom: 16,
        textAlign: 'center',
        fontSize: 14,
      }}>
        Our servers are currently experiencing high traffic. If you encounter any issues, please try again later. Thank you for your patience!
      </div>

      {/* Progress UI */}
      {(isRunning || progressStep) && (
        <div style={{ maxWidth: 420, margin: '12px auto' }}>
          <div
            aria-live="polite"
            style={{ textAlign: 'center', marginBottom: 8 }}
          >
            {progressStep || (isRunning ? 'Working...' : '')}
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={isRunning ? 10 : 0}
            style={{
              height: 8,
              background: '#333',
              borderRadius: 9999,
              overflow: 'hidden',
              boxShadow: 'inset 0 0 0 1px #222'
            }}
          >
            <div
              style={{
                width: `${isRunning ? 10 : 0}%`,
                height: '100%',
                background: '#4f8cff',
                transition: 'width .3s ease'
              }}
            />
          </div>
        </div>
      )}

      <SpeedTestForm
        isRunning={isRunning}
        onSubmit={runTest}
      />
      <TestResultsZone results={results} />
      <PastResultsModal
        open={showPast}
        onClose={() => setShowPast(false)}
      />

      {isRunning && (
        <LiveTestPanel
          ping={livePing}
          jitter={liveJitter}
          packetLoss={livePacketLoss}
          download={liveDownload}
          upload={liveUpload}
        />
      )}
    </>
  );
}