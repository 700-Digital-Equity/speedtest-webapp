import React, { useState } from 'react';
import PastResultsModal from './PastResults.jsx';
import { adaptiveDownload, adaptiveUpload, streamedUpload, warmUpDownload } from './AdaptiveTest';
import { getISPInfo, pingTest, getBrowserLocation, getDeviceInfo, getConnectionInfo } from './ExtraTests';
import SpeedTestForm from './SpeedTestForm.jsx';
import TestResultsZone from './TestResultZone.jsx';
import { postResult } from '../utils/api';

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
  try {
    setIsRunning(true);
    setResults(null);
    setProgressStep('Measuring ping...');
    const ping = await measurePing();

    const pingStats = await pingTest(`${SERVER}/ping.json`);
    const jitter = pingStats?.jitter ?? null;
    const packetLoss = pingStats?.packetLoss ?? null;

    setProgressStep('Testing Download speed...');
    await warmUpDownload();
    const download = await adaptiveDownload();

    setProgressStep('Testing Upload speed...');
    const upload = await adaptiveUpload();

    setProgressStep('Test complete!');
    setResults({ ping, jitter, packetLoss, download, upload });

    const publicIP = await fetch('https://api.ipify.org?format=json').then(r => r.json());
    const finalConnectionType =
      formData.connectionType === 'Other'
        ? (formData.customConnectionType || 'Other')
        : formData.connectionType;

    // Optional: convert "lat, lon" string to GeoJSON Point for backend
    let geoPoint = null;
    if (formData.geo) {
      const [latStr, lonStr] = formData.geo.split(',').map(s => s.trim());
      const lat = Number(latStr), lon = Number(lonStr);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        geoPoint = { type: 'Point', coordinates: [lon, lat] };
      }
    }

    await postResult({
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
      geo: geoPoint ?? formData.geo ?? null,
      isp: formData.isp,
      browser: formData.browser,
      notes: formData.notes,
      timestamp: new Date().toISOString(),
    });

    // Reflect the submitted info in UI (from the same formData)
    setName(formData.name);
    setLocation(formData.location);
    setDeviceModel(formData.deviceModel);
    setConnectionType(finalConnectionType);
    setOs(formData.os);
    setNotes(formData.notes);
    setGeo(formData.geo);
    setISP(formData.isp);
    setBrowser(formData.browser);

    // Persist locally
    const past = JSON.parse(localStorage.getItem('pastSpeedTests') || '[]');
    past.unshift({
      timestamp: new Date().toISOString(),
      name: formData.name,
      location: formData.location,
      ping, jitter, packetLoss, download, upload,
      deviceModel: formData.deviceModel,
      os: formData.os,
      connectionType: finalConnectionType,
      geo: formData.geo,
      isp: formData.isp,
      browser: formData.browser,
      notes: formData.notes
    });
    localStorage.setItem('pastSpeedTests', JSON.stringify(past.slice(0, 50)));
  } catch (e) {
    setResults({ error: String(e) });
    setProgressStep('Something went wrong.');
  } finally {
    setIsRunning(false);
  }
};

  // Map step -> percent for a simple progress bar
  const progressPercent = React.useMemo(() => {
    switch (progressStep) {
      case 'Measuring ping...': return 20;
      case 'Testing Download speed...': return 60;
      case 'Testing Upload speed...': return 85;
      case 'Test complete!': return 100;
      case 'Something went wrong.': return 100;
      default: return isRunning ? 10 : 0;
    }
  }, [progressStep, isRunning]);

  return (
    <>
      <button className='past-results-button' onClick={() => setShowPast(true)}>
        View Past Results
      </button>

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
            aria-valuenow={progressPercent}
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
                width: `${progressPercent}%`,
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