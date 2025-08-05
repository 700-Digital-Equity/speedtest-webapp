import React, { useState } from 'react';
import PastResultsModal from './PastResults.jsx';
import { adaptiveDownload, adaptiveUpload, streamedUpload, warmUpDownload } from './AdaptiveTest';
import { getISPInfo, pingTest, getBrowserLocation, getDeviceInfo, getConnectionInfo } from './ExtraTests';
import SpeedTestForm from './SpeedTestForm.jsx';
export default function SpeedTest() {
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [name, setName] = useState('Anonymous');
  const [location, setLocation] = useState('Unknown');
  const [progressStep, setProgressStep] = useState('');
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [showPast, setShowPast] = useState(false);

  // New state for device type, connection type, custom connection, and notes
  const [deviceType, setDeviceType] = useState('');
  const [connectionType, setConnectionType] = useState('');
  const [customConnectionType, setCustomConnectionType] = useState('');
  const [notes, setNotes] = useState('');

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

  const runTest = async () => {
    setIsRunning(true);
    setResults(null);
    try {
      setProgressStep('Measuring ping...');
      const ping = await measurePing();
      setProgressStep('Testing Download speed...');
      await warmUpDownload();
      const download = await adaptiveDownload();
      setProgressStep('Testing Upload speed...');
      const upload = await adaptiveUpload();
      setProgressStep('Test complete!');
      setResults({ ping, download, upload });

      const publicIP = await fetch('https://api.ipify.org?format=json').then(r => r.json());
      // Use custom connection type if "Other" is selected
      const finalConnectionType = connectionType === "Other" ? customConnectionType : connectionType;
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
          deviceType,
          connectionType: finalConnectionType,
          notes
        }),
      });
      const pastResults = JSON.parse(localStorage.getItem('pastSpeedTests') || '[]');
      pastResults.unshift({
        timestamp: new Date().toISOString(),
        name,
        location,
        ping,
        download,
        upload,
        deviceType,
        connectionType: finalConnectionType,
        notes
      });
      localStorage.setItem('pastSpeedTests', JSON.stringify(pastResults.slice(0, 10)));
      // ISP info
      getISPInfo().then(console.log);

      // Jitter & packet loss
      pingTest('https://700-digital-equity.digital/ping.json').then(console.log);

      // Location
      getBrowserLocation().then(console.log).catch(console.error);

      // Device info
      console.log(getDeviceInfo());

      // Connection info
      console.log(getConnectionInfo());
    } catch (e) {
      setResults({ error: e.toString() });
      setProgressStep('Something went wrong.');
    }
    setIsRunning(false);
  };

  return (
    <SpeedTestForm
  isRunning={isRunning}
  onSubmit={async (formData) => {
    // formData contains all fields, including auto-populated ones
    // You can use these in your runTest logic
    // Example:
    setName(formData.name);
    setLocation(formData.location);
    setDeviceType(formData.deviceType);
    setConnectionType(formData.connectionType);
    setNotes(formData.notes);
    // ...and so on
    runTest(); // or pass formData to runTest if you refactor it
  }}
/>
  );
}