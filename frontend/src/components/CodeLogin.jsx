import React, { useState } from 'react';
import { signInWithCode, continueAsGuest, fetchMe } from '../utils/api';

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
    <div style={{ maxWidth: 420, margin: '24px auto' }}>
      <h2>Sign in</h2>
      {err && <div style={{ color: 'red' }}>{err}</div>}
      <label>Name</label>
      <input value={name} onChange={e => setName(e.target.value)} className="input" />
      <label>School Code (optional)</label>
      <input value={code} onChange={e => setCode(e.target.value)} className="input" />
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button disabled={loading || !name} onClick={() => submit(true)}>Use Code</button>
        <button disabled={loading || !name} onClick={() => submit(false)}>Continue as Individual</button>
      </div>
    </div>
  );
}