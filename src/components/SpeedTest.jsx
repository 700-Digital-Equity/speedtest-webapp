import React, { useState } from 'react';

export default function SpeedTest() {
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const measurePing = async (url = '/ping.json') => {
    const times = [];
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      await fetch(`${url}?t=${Date.now()}`);
      const end = performance.now();
      times.push(end - start);
    }
    return (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2);
  };

  const measureDownload = async (url = '/10MB.test') => {
    const start = performance.now();
    const res = await fetch(`${url}?t=${Date.now()}`);
    const blob = await res.blob();
    const end = performance.now();
    const duration = (end - start) / 1000;
    return ((blob.size * 8) / duration / 1_000_000).toFixed(2); // Mbps
  };

  const measureUpload = async () => {
    const blob = new Blob([new Uint8Array(10 * 1024 * 1024)]);
    const start = performance.now();
    await fetch('https://httpbin.org/post', {
      method: 'POST',
      body: blob,
    });
    const end = performance.now();
    const duration = (end - start) / 1000;
    return ((blob.size * 8) / duration / 1_000_000).toFixed(2); // Mbps
  };

  const runTest = async () => {
    setIsRunning(true);
    setResults(null);
    try {
      const ping = await measurePing();
      const download = await measureDownload();
      const upload = await measureUpload();
      setResults({ ping, download, upload });
    } catch (e) {
      setResults({ error: e.toString() });
    }
    setIsRunning(false);
  };

  return (
    <div style={{ padding: 30, fontFamily: 'sans-serif' }}>
      <h1>Internet Speed Test</h1>
      <button onClick={runTest} disabled={isRunning}>
        {isRunning ? 'Running...' : 'Run Test'}
      </button>
      {results && (
        <div style={{ marginTop: 20 }}>
          {results.error ? (
            <p style={{ color: 'red' }}>Error: {results.error}</p>
          ) : (
            <ul>
              <li><strong>Ping:</strong> {results.ping} ms</li>
              <li><strong>Download:</strong> {results.download} Mbps</li>
              <li><strong>Upload:</strong> {results.upload} Mbps</li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
