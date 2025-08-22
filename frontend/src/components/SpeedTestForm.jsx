import React, { useEffect, useState } from 'react';
import { getISPInfo, getBrowserLocation, getDeviceInfo, getConnectionInfo } from './ExtraTests';
import style from '../styles/speedtestform.module.css';
import platform from 'platform';


export default function SpeedTestForm({ isRunning, onSubmit }) {
  const [name, setName] = useState('Anonymous');
  const [location, setLocation] = useState('');
  const [userEditedLocation, setUserEditedLocation] = useState(false);
  const [deviceModel, setDeviceModel] = useState('');
  const [connectionType, setConnectionType] = useState('');
  const [customConnectionType, setCustomConnectionType] = useState('');
  const [notes, setNotes] = useState('');
  const [isp, setISP] = useState('');
  const [ip, setIP] = useState('');
  const [os, setOS] = useState('');
  const [geo, setGeo] = useState('');
  const [browser, setBrowser] = useState('');
  const [networkInfo, setNetworkInfo] = useState({});

  useEffect(() => {
    getISPInfo().then(data => {
      setISP(data.connection?.org || data.connection?.isp || data.org || data.isp || '');
      setIP(data.ip || '');
      setLocation([data.city, data.region, data.country].filter(Boolean).join(', '));
    });
    setOS([platform.os?.family, platform.os?.version].filter(Boolean).join(' '));
    setBrowser([platform.name, platform.version].filter(Boolean).join(' '));
    getBrowserLocation().then(coords => {
      if (coords && coords.latitude && coords.longitude) {
        setGeo(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
      }
    }).catch(() => {
      setGeo('');
    });
    setNetworkInfo(getConnectionInfo());
  }, []);

  // If you use useLocationFromGeo, re-import and use it here
  // import { useLocationFromGeo } from '../hooks/useLocationFromGeo';
  // const { location: autoLocation } = useLocationFromGeo(geo);
  // useEffect(() => {
  //   if (autoLocation && !userEditedLocation) setLocation(autoLocation);
  // }, [autoLocation, userEditedLocation]);

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit({
          name,
          location,
          deviceModel,
          os,
          connectionType,
          customConnectionType,
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
      <div className={style.inputEditRow} style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className={style.input}
          // always editable
        />
        <button
          type="button"
          className={style.editBtn}
          aria-label="Edit Name"
          tabIndex={-1}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{verticalAlign:'middle'}}><path d="M15.6 2.6a2.121 2.121 0 0 1 3 3l-1.3 1.3-3-3 1.3-1.3zm-2 2 3 3-9.6 9.6H4v-3.6l9.6-9.6z" fill="currentColor"/></svg>
        </button>
      </div>

      <label className={style.label}>Location</label>
      <div className={style.inputEditRow} style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Auto or enter your school/city"
          value={location}
          onChange={e => { setLocation(e.target.value); setUserEditedLocation(true); }}
          className={style.input}
          // always editable
        />
        <button
          type="button"
          className={style.editBtn}
          aria-label="Edit Location"
          tabIndex={-1}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{verticalAlign:'middle'}}><path d="M15.6 2.6a2.121 2.121 0 0 1 3 3l-1.3 1.3-3-3 1.3-1.3zm-2 2 3 3-9.6 9.6H4v-3.6l9.6-9.6z" fill="currentColor"/></svg>
        </button>
      </div>

      <label className={style.label}>Device Model</label>
      <div className={style.inputEditRow} style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="e.g. MacBook Pro, Galaxy S23"
          value={deviceModel}
          onChange={e => setDeviceModel(e.target.value)}
          className={style.input}
          // always editable
        />
        <button
          type="button"
          className={style.editBtn}
          aria-label="Edit Device Model"
          tabIndex={-1}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{verticalAlign:'middle'}}><path d="M15.6 2.6a2.121 2.121 0 0 1 3 3l-1.3 1.3-3-3 1.3-1.3zm-2 2 3 3-9.6 9.6H4v-3.6l9.6-9.6z" fill="currentColor"/></svg>
        </button>
      </div>

      <label className={style.label}>Connection Type</label>
      <div className={style.inputEditRow} style={{ position: 'relative' }}>
        <select
          value={connectionType}
          onChange={e => setConnectionType(e.target.value)}
          className={style.select}
          style={{ width: '100%' }}
          // always enabled
        >
          <option value="">Select connection</option>
          <option value="WiFi">WiFi</option>
          <option value="Ethernet">Ethernet</option>
          <option value="Mobile data">Mobile data</option>
          <option value="Other">Other (type below)</option>
        </select>
        <button
          type="button"
          className={style.editBtn}
          aria-label="Edit Connection Type"
          tabIndex={-1}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{verticalAlign:'middle'}}><path d="M15.6 2.6a2.121 2.121 0 0 1 3 3l-1.3 1.3-3-3 1.3-1.3zm-2 2 3 3-9.6 9.6H4v-3.6l9.6-9.6z" fill="currentColor"/></svg>
        </button>
      </div>
      {connectionType === "Other" && (
        <div className={style.inputEditRow} style={{ position: 'relative' }}>
          <input
            type="text"
            value={customConnectionType}
            onChange={e => setCustomConnectionType(e.target.value)}
            placeholder="Describe your connection"
            className={style.input}
            // always editable
          />
          <button
            type="button"
            className={style.editBtn}
            aria-label="Edit Custom Connection Type"
            tabIndex={-1}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{verticalAlign:'middle'}}><path d="M15.6 2.6a2.121 2.121 0 0 1 3 3l-1.3 1.3-3-3 1.3-1.3zm-2 2 3 3-9.6 9.6H4v-3.6l9.6-9.6z" fill="currentColor"/></svg>
          </button>
        </div>
      )}

      <label className={style.label}>Notes</label>
      <div className={style.inputEditRow} style={{ position: 'relative' }}>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any notes about your test or setup?"
          className={style.textarea}
          // always editable
        />
        <button
          type="button"
          className={style.editBtn}
          aria-label="Edit Notes"
          tabIndex={-1}
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{verticalAlign:'middle'}}><path d="M15.6 2.6a2.121 2.121 0 0 1 3 3l-1.3 1.3-3-3 1.3-1.3zm-2 2 3 3-9.6 9.6H4v-3.6l9.6-9.6z" fill="currentColor"/></svg>
        </button>
      </div>

      {/* Extra metrics (read-only, auto-populated) */}
      <label className={style.label}>ISP</label>
      <input type="text" value={isp} readOnly className={style.input} />

      <label className={style.label}>Public IP</label>
      <input type="text" value={ip} readOnly className={style.input} />

      <label className={style.label}>Geo (lat,lon)</label>
      <input type="text" value={geo} readOnly className={style.input} />

      <label className={style.label}>Browser</label>
      <input type="text" value={browser} readOnly className={style.input} />

      <label className={style.label}>Operating System</label>
      <input type="text" value={os} readOnly className={style.input} />

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
