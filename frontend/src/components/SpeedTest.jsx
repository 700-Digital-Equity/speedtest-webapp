import React, { useState } from 'react';

export default function SpeedTest() {
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [name, setName] = useState('Anonymous');
  const [location, setLocation] = useState('Unknown');
  const [progressStep, setProgressStep] = useState('');


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
      setProgressStep('Measuring ping...');
      const ping = await measurePing();
      setProgressStep('Testing Download speed...');
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
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 30,
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                padding: '24px 32px',
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
                minWidth: '280px',
                transition: 'transform 0.3s ease',
                animation: 'fadeIn 0.5s ease-in-out',
              }}>
                <h2 style={{
                  marginBottom: '16px',
                  fontSize: '1.5rem',
                  color: '#333',
                }}>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}