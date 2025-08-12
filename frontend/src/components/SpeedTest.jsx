import React, { useState } from 'react';
import PastResultsModal from './PastResults.jsx';
import { adaptiveDownload, adaptiveUpload, streamedUpload, warmUpDownload } from './AdaptiveTest';
import { getISPInfo, pingTest, getBrowserLocation, getDeviceInfo, getConnectionInfo } from './ExtraTests';
import SpeedTestForm from './SpeedTestForm.jsx';
import TestResultsZone from './TestResultZone.jsx';
export default function SpeedTest() {
  const [results, setResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [name, setName] = useState('Anonymous');
  const [location, setLocation] = useState('Unknown');
  const [progressStep, setProgressStep] = useState('');
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [showPast, setShowPast] = useState(false);

  // New state for device type, connection type, custom connection, and notes
  const [deviceModel, setDeviceModel] = useState('');
  const [connectionType, setConnectionType] = useState('');
  const [customConnectionType, setCustomConnectionType] = useState('');
  const [os, setOs] = useState('');
  const [notes, setNotes] = useState('');
  const [geo, setGeo] = useState('');
  const [isp, setISP] = useState('');
  const [browser, setBrowser] = useState('');

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

  // Update the runTest function to accept formData as parameter
const runTest = async (formData) => {
  setIsRunning(true);
  setResults(null);
  try {
    setProgressStep('Measuring ping...');
    const ping = await measurePing();

    const pingStats = await pingTest(`${SERVER}/ping.json`);
    const jitter = pingStats.jitter !== undefined ? pingStats.jitter : null;
    const packetLoss = pingStats.packetLoss !== undefined ? pingStats.packetLoss : null;

    setProgressStep('Testing Download speed...');
    await warmUpDownload();
    const download = await adaptiveDownload();
    setProgressStep('Testing Upload speed...');
    const upload = await adaptiveUpload();
    setProgressStep('Test complete!');

    setResults({ ping, jitter, packetLoss, download, upload });

    const publicIP = await fetch('https://api.ipify.org?format=json').then(r => r.json());
    const finalConnectionType = formData.connectionType === "Other" ? formData.customConnectionType : formData.connectionType;

    // Use formData directly instead of state variables
    await fetch('https://jubilant-beauty-production.up.railway.app/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ip: publicIP.ip,
        name: formData.name,
        location: formData.location,
        ping,
        jitter,
        packetLoss,
        download,
        upload,
        deviceModel: formData.deviceModel,
        os: formData.os,
        connectionType: finalConnectionType,
        geo: formData.geo,
        isp: formData.isp,
        browser: formData.browser,
        notes: formData.notes
      }),
    });

    // Also update localStorage with formData
    const pastResults = JSON.parse(localStorage.getItem('pastSpeedTests') || '[]');
    pastResults.unshift({
      timestamp: new Date().toISOString(),
      name: formData.name,
      location: formData.location,
      ping,
      jitter,
      packetLoss,
      download,
      upload,
      deviceModel: formData.deviceModel,
      os: formData.os,
      connectionType: finalConnectionType,
      geo: formData.geo,
      isp: formData.isp,
      browser: formData.browser,
      notes: formData.notes
    });
    localStorage.setItem('pastSpeedTests', JSON.stringify(pastResults.slice(0, 10)));

    // Update state for display
    setName(formData.name);
    setLocation(formData.location);
    setDeviceModel(formData.deviceModel);
    setConnectionType(formData.connectionType);
    setOs(formData.os);
    setNotes(formData.notes);
    setGeo(formData.geo);
    setISP(formData.isp);
    setBrowser(formData.browser);

  } catch (e) {
    setResults({ error: e.toString() });
    setProgressStep('Something went wrong.');
  }
  setIsRunning(false);
};

  return (
    <>
    <button className='past-results-button' onClick={() => setShowPast(true)}>
      View Past Results
    </button>
    <SpeedTestForm
      isRunning={isRunning}
      onSubmit={async (formData) => {
        console.log('Form data being submitted:', formData); // Debug log
        runTest(formData);
      }}
    />
  <TestResultsZone
    results={results}
    name={name}
    location={location}
    deviceModel={deviceModel}
    connectionType={connectionType}
    os={os}
    />
    
      <PastResultsModal
        open={showPast}
        onClose={() => setShowPast(false)}
      />

    </>
  );
}