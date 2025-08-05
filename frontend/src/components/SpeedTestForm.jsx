import React, { useEffect, useState } from 'react';
import { getISPInfo, getBrowserLocation, getDeviceInfo, getConnectionInfo } from './ExtraTests';
import style from '../styles/speedtestform.module.css';
import platform from 'platform';
export default function SpeedTestForm({ isRunning, onSubmit }) {
  const info = platform;
  console.log("Platform info:", info);
  const [name, setName] = useState('Anonymous');
  const [location, setLocation] = useState('');
  const [deviceType, setDeviceType] = useState('');
  const [connectionType, setConnectionType] = useState('');
  const [customConnectionType, setCustomConnectionType] = useState('');
  const [notes, setNotes] = useState('');
  const [isp, setISP] = useState('');
  const [ip, setIP] = useState('');
  const [geo, setGeo] = useState('');
  const [browser, setBrowser] = useState('');
  const [networkInfo, setNetworkInfo] = useState({});

  // Auto-populate fields on mount
  useEffect(() => {
    getISPInfo().then(data => {
      setISP(data.connection?.org || data.connection?.isp || data.org || data.isp || '');
      setIP(data.ip || '');
      setLocation(
        [data.city, data.region, data.country].filter(Boolean).join(', ')
      );
      setGeo(
        data.latitude && data.longitude
          ? `${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)}`
          : ''
      );
    });

    getBrowserLocation().then(async coords => {
      setGeo(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      const suburb = await getSuburbFromCoords(coords.latitude, coords.longitude);
      setLocation(suburb);
    }).catch(() => {});

    // Use platform.js for device and browser info
    setDeviceType(
      [platform.manufacturer, platform.product, platform.os?.family, platform.os?.version]
        .filter(Boolean)
        .join(' ')
    );
    setBrowser(
      [platform.name, platform.version].filter(Boolean).join(' ')
    );
    setNetworkInfo(getConnectionInfo());
  }, []);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit({
          name,
          location,
          deviceType,
          connectionType: connectionType === "Other" ? customConnectionType : connectionType,
          notes,
          isp,
          ip,
          geo,
          browser,
          networkInfo
        });
      }}
      className={style.formContainer}
    >
      <label className={style.label}>Name <span style={{ color: 'red' }}>*</span></label>
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
      />

      <label className={style.label}>Location</label>
      <input
        type="text"
        placeholder="Auto or enter your school/city"
        value={location}
        onChange={e => setLocation(e.target.value)}
        style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
      />

      <label className={style.label}>Device Model</label>
      <input
        type="text"
        placeholder="Auto or e.g. MacBook Pro, Galaxy S23"
        value={deviceType}
        onChange={e => setDeviceType(e.target.value)}
        className={style.input}
      />

      <label className={style.label}>Connection Type</label>
      <select
        value={connectionType}
        onChange={e => setConnectionType(e.target.value)}
        className={style.input}
      >
        <option value="">Select connection</option>
        <option value="WiFi">WiFi</option>
        <option value="Ethernet">Ethernet</option>
        <option value="Mobile data">Mobile data</option>
        <option value="Other">Other (type below)</option>
      </select>
      {connectionType === "Other" && (
        <input
          type="text"
          value={customConnectionType}
          onChange={e => setCustomConnectionType(e.target.value)}
          placeholder="Describe your connection"
          className={style.input}
        />
      )}

      <label className={style.label}>Notes</label>
      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Any notes about your test or setup?"
        className={style.textarea}
      />

      {/* Extra metrics (read-only, auto-populated) */}
      <label className={style.label}>ISP</label>
      <input type="text" value={isp} readOnly className={style.input} />

      <label className={style.label}>Public IP</label>
      <input type="text" value={ip} readOnly className={style.input} />

      <label className={style.label}>Geo (lat,lon)</label>
      <input type="text" value={geo} readOnly className={style.input} />

      <label className={style.label}>Browser</label>
      <input type="text" value={browser} readOnly className={style.input} />

      <label className={style.label}>Network Info</label>
      <input
        type="text"
        value={
          networkInfo.effectiveType
            ? `${networkInfo.effectiveType}, ${networkInfo.downlink || '?'} Mbps, ${networkInfo.rtt || '?'} ms`
            : 'Unavailable'
        }
        readOnly
        className={style.input}
      />

      <button
        type="submit"
        disabled={isRunning}
        className={style.button}
      >
        {isRunning ? 'Running...' : 'Run Speed Test'}
      </button>
    </form>
  );
}

async function getSuburbFromCoords(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
  const res = await fetch(url);
  const data = await res.json();
  // Compose suburb, city, country (falling back as needed)
  const suburb = data.address.suburb || data.address.neighbourhood || data.address.village || '';
  const city = data.address.city || data.address.town || data.address.village || data.address.hamlet || '';
  const country = data.address.country || '';
  return [suburb, city, country].filter(Boolean).join(', ');
}