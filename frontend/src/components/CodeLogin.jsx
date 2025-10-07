import React, { useState } from 'react';
import { signInWithCode, continueAsGuest, fetchMe } from '../utils/api';
import styles from '../styles/speedtestform.module.css';

export default function CodeLogin({ onSignedIn }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function submit(withCode) {
    try {
      setLoading(true); setErr('');
      if (withCode) await signInWithCode(undefined, code.trim());
      else await continueAsGuest();
      const { user } = await fetchMe();
      onSignedIn(user);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.formContainer}>
      {/* Add the kind message */}
      <div style={{
        background: '#fffbe6',
        color: '#856404',
        border: '1px solid #ffeeba',
        borderRadius: 8,
        padding: '12px 16px',
        marginBottom: 16,
        textAlign: 'center',
        fontSize: 14,
      }}>
        Our servers are currently experiencing high traffic. If you encounter any issues, please try again later. Thank you for your patience!
      </div>

      <h2 style={{ textAlign: 'center', marginBottom: 16 }}>Sign in</h2>
      {err && <div style={{ color: 'red', marginBottom: 8 }}>{err}</div>}

      <label className={styles.label}>School Code (optional)</label>
      <input
        value={code}
        onChange={e => setCode(e.target.value)}
        className={styles.input}
        placeholder="School code"
        disabled={loading}
      />
      <div className={styles.buttonRow}>
        <button
          className={styles.button}
          disabled={loading}
          onClick={() => submit(true)}
        >
          Use Code
        </button>
        <button
          className={styles.button}
          disabled={loading}
          onClick={() => submit(false)}
        >
          Continue without code
        </button>
      </div>
    </div>
  );
}