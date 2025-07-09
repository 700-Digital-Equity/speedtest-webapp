import React, { useState } from 'react';

export default function SpeedTest() {
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [name, setName] = useState('Anonymous');
  const [location, setLocation] = useState('Unknown');
  const [progressStep, setProgressStep] = useState('');
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;



  const SERVER = 'https://700-digital-equity.digital';

  // Measure ping
  const median = arr => {
  const mid = Math.floor(arr.length / 2);
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
};

const measurePing = async () => {
  const times = [];

  for (let i = 0; i < 7; i++) {
    const start = performance.now();
    try {
      await fetch(`${SERVER}/ping.json?t=${Date.now()}`);
      const end = performance.now();
      times.push(end - start);
    } catch {
      times.push(999);
    }
  }

  return median(times).toFixed(2);
};

  const warmUpDownload = async () => {
  const res = await fetch(`${SERVER}/100MB.bin?warmup=${Math.random()}`);
  const reader = res.body.getReader();
  const start = performance.now();
  while (performance.now() - start < 2000) {
    const { done } = await reader.read();
    if (done) break;
  }
  reader.cancel();
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

  const warmUpUpload = async () => {
    const warmupBlob = new Blob([new Uint8Array(1 * 1024 * 1024)]); // 1MB
    await fetch(`${SERVER}/upload`, {
      method: 'POST',
      body: warmupBlob,
    });
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

  const measureParallelUpload = async (url = `${SERVER}/upload`, concurrency = 2, maxDuration = 15000) => {
  const blobSizeMB = 50;
  const blob = new Blob([new Uint8Array(blobSizeMB * 1024 * 1024)]); // 50MB blob
  const warmupBlob = new Blob([new Uint8Array(10 * 1024 * 1024)]); // 1MB warmup

  const fetchWithTimeout = (url, options, timeout = 10000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout))
    ]);
  };

  // Warm-up: small upload to stabilize connection
  try {
    await fetchWithTimeout(url, { method: 'POST', body: warmupBlob }, 3000);
  } catch (_) {
    // ignore warmup failure
  }

  const uploadTimes = [];
  const abortController = new AbortController();

  // Create an overall timeout promise to abort all uploads after maxDuration
  const overallTimeout = new Promise((resolve) => {
    setTimeout(() => {
      abortController.abort(); // abort ongoing fetches
      resolve();
    }, maxDuration);
  });

  // Start all uploads but listen to abort signal
  const uploads = new Array(concurrency).fill(null).map(async () => {
    const start = performance.now();
    try {
      const res = await fetch(url, {
        method: 'POST',
        body: blob,
        signal: abortController.signal,
      });
      if (res.ok) {
        const end = performance.now();
        uploadTimes.push((end - start) / 1000); // seconds
      }
    } catch (err) {
      // ignore timeout, abort, or fetch errors
    }
  });

  // Wait for either all uploads finish or overall timeout triggers
  await Promise.race([
    Promise.all(uploads),
    overallTimeout,
  ]);

  if (uploadTimes.length === 0) return "0";

  // Remove min/max outliers
  const trimmedTimes = removeOutliers(uploadTimes);
  const averageTime = trimmedTimes.reduce((a, b) => a + b, 0) / trimmedTimes.length;

  // total bits uploaded = blob size * successful uploads * 8 bits/byte
  const totalBitsUploaded = blob.size * trimmedTimes.length * 8;

  return (totalBitsUploaded / averageTime / 1_000_000).toFixed(2); // Mbps
};

const removeOutliers = (arr) => {
  if (arr.length <= 2) return arr;
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted.slice(1, -1); // remove min and max
};

  const runTest = async () => {
    setIsRunning(true);
    setResults(null);
    try {
      setProgressStep('Measuring ping...');
      const ping = await measurePing();
      setProgressStep('Testing Download speed...');
      await warmUpDownload(); // Warm up to avoid cache effects
      const download = await measureDownload();
      setProgressStep('Testing Upload speed...');
      const upload = await measureParallelUpload();
      setProgressStep('Test complete!');
      setResults({ ping, download, upload });

      const publicIP = await fetch('https://api.ipify.org?format=json').then(r => r.json());
      await fetch('https://jubilant-beauty-production.up.railway.app/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ip: publicIP.ip,
          name,
          location,
          ping,
          download,
          upload,
        }),
      });
    } catch (e) {
      setResults({ error: e.toString() });
      setProgressStep('Something went wrong.');
    }
    
    setIsRunning(false);
  };

  return (
    <div style={{ padding: 30, fontFamily: 'sans-serif' }}>
      <h1>Internet Speed Test</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runTest();
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '400px',
          margin: '20px auto',
        }}
      >
        <label style={{ fontWeight: 'bold' }}>Name <span style={{ color: 'red' }}>*</span></label>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{
            padding: '10px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />

        <label style={{ fontWeight: 'bold' }}>Location</label>
        <input
          type="text"
          placeholder="Enter your school/city (optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        />

        <button
          type="submit"
          disabled={isRunning}
          style={{
            marginTop: '10px',
            padding: '10px',
            fontSize: '16px',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: isRunning ? 'not-allowed' : 'pointer',
          }}
        >
          {isRunning ? 'Running...' : 'Run Speed Test'}
        </button>
      </form>
      {isRunning && (
        <p style={{ fontStyle: 'italic', marginTop: 10 }}>{progressStep}</p>
      )}

      
      {results && (
        <div style={{ marginTop: 20 }}>
          {results.error ? (
            <p style={{ color: 'red' }}>Error: {results.error}</p>
          ) : (


            <div
              style={{
                backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                color: isDarkMode ? '#f0f0f0' : '#333',
                padding: '24px 32px',
                borderRadius: '16px',
                boxShadow: isDarkMode
                  ? '0 4px 12px rgba(255, 255, 255, 0.05)'
                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
                minWidth: '280px',
                transition: 'transform 0.3s ease',
                animation: 'fadeIn 0.5s ease-in-out',
              }}
            >
              <h2 style={{ marginBottom: '16px', fontSize: '1.5rem' }}>
                Test Results
              </h2>
              <div style={{ fontSize: '1.2rem', margin: '8px 0' }}>
                <strong>Ping:</strong> {results.ping} ms
              </div>
              <div style={{ fontSize: '1.2rem', margin: '8px 0' }}>
                <strong>Download:</strong> {results.download} Mbps
              </div>
              <div style={{ fontSize: '1.2rem', margin: '8px 0' }}>
                <strong>Upload:</strong> {results.upload} Mbps
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}