import React, { useState } from 'react';

export default function SpeedTest() {
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const SERVER = 'https://700-digital-equity.digital';

  // Measure ping
  const measurePing = async () => {
    const times = [];
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      await fetch(`${SERVER}/ping.json?t=${Date.now()}`);
      const end = performance.now();
      times.push(end - start);
    }
    return (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2);
  };

  // Improved Download Test: multiple parallel requests over a fixed duration
  const measureDownload = async () => {
    const url = `${SERVER}/100MB.bin`;
    const concurrency = 4;
    const testDuration = 10 * 1000; // 10 seconds

    let totalBytes = 0;
    let isStopped = false;

    const download = async () => {
      while (!isStopped) {
        const res = await fetch(`${url}?cacheBust=${Math.random()}`);
        const reader = res.body.getReader();
        while (!isStopped) {
          const { done, value } = await reader.read();
          if (done) break;
          totalBytes += value.length;
        }
      }
    };

    const downloads = new Array(concurrency).fill(0).map(download);

    const start = performance.now();
    await Promise.race([
      new Promise((resolve) => setTimeout(resolve, testDuration)),
      Promise.all(downloads),
    ]);
    isStopped = true;
    const duration = (performance.now() - start) / 1000;
    return ((totalBytes * 8) / duration / 1_000_000).toFixed(2); // Mbps
  };

  const measureUpload = async () => {
    const blob = new Blob([new Uint8Array(20 * 1024 * 1024)]); // 20MB
    const start = performance.now();

    await fetch(`${SERVER}/upload`, {
        method: 'POST',
        body: blob,
    });

    const end = performance.now();
    const duration = (end - start) / 1000;
    return ((blob.size * 8) / duration / 1_000_000).toFixed(2); // Mbps
    };

    const measureParallelUpload = async (url = `${SERVER}/upload`, concurrency = 4) => {
  const blob = new Blob([new Uint8Array(10 * 1024 * 1024)]); // 10MB blob
  const start = performance.now();

  // Start multiple uploads in parallel
  const uploads = new Array(concurrency).fill(null).map(() =>
    fetch(url, {
      method: 'POST',
      body: blob,
    })
  );

  // Wait for all uploads to complete
  await Promise.all(uploads);

  const end = performance.now();
  const duration = (end - start) / 1000; // seconds

  // Total bytes uploaded = concurrency * blob.size
  return (((blob.size * concurrency) * 8) / duration / 1_000_000).toFixed(2); // Mbps
};

  const runTest = async () => {
    setIsRunning(true);
    setResults(null);
    try {
      const ping = await measurePing();
      const download = await measureDownload();
      const upload = await measureParallelUpload();
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