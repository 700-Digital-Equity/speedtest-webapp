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