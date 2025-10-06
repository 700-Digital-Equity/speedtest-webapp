import React, { useEffect, useState } from 'react';
import { getISPInfo, getBrowserLocation, getDeviceInfo, getConnectionInfo } from './ExtraTests';
import style from '../styles/speedtestform.module.css';
import platform from 'platform';


export default function SpeedTestForm({ isRunning, onSubmit }) {
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
      setGeo([data.latitude, data.longitude].filter(Boolean).join(', '));
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

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        onSubmit({
          isp,
          ip,
          geo,
          browser,
          os,
          networkInfo
        });
      }}
      className={style.formContainer}
    >
      <h2 style={{marginTop: 32, marginBottom: 8}}>Auto-Detected Information</h2>
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
