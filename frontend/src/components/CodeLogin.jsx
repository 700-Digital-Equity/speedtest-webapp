import React, { useState } from 'react';
import { signInWithCode, continueAsGuest, fetchMe } from '../utils/api';
import styles from '../styles/speedtestform.module.css';

export default function CodeLogin({ onSignedIn }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function submit(withCode) {
    try {
      setLoading(true); setErr('');
      if (withCode) await signInWithCode(name.trim(), code.trim());
      else await continueAsGuest(name.trim());
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
      <label className={styles.label}>Name</label>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        className={styles.input}
        placeholder="Your name"
        disabled={loading}
      />
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
          disabled={loading || !name}
          onClick={() => submit(true)}
        >
          Use Code
        </button>
        <button
          className={styles.button}
          disabled={loading || !name}
          onClick={() => submit(false)}
        >
          Continue as Individual
        </button>
      </div>
    </div>
  );
}