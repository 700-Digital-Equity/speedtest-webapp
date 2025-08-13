const API_BASE = import.meta.env?.VITE_API_BASE || 'https://jubilant-beauty-production.up.railway.app';

function toUrl(path, params) {
  const url = new URL(`${API_BASE}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
  return url.toString();
}

export async function fetchResults({ page = 1, pageSize = 10, sortKey = 'timestamp', sortOrder = 'desc' }, signal) {
  const res = await fetch(
    toUrl('/results', { page, pageSize, sortKey, sortOrder }),
    { signal }
  );
  if (!res.ok) throw new Error(`Failed to fetch results: ${res.status}`);
  return res.json(); // { results, total }
}

export async function postResult(payload) {
  const res = await fetch(toUrl('/api/results'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to post result: ${res.status}`);
  // backend may or may not return JSON; be tolerant
  try { return await res.json(); } catch { return {}; }
}

export async function signInWithCode(name, code) {
  const res = await fetch(`${API_BASE}/api/auth/code`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, code }),
  });
  if (!res.ok) throw new Error('Invalid code');
  return res.json();
}
export async function continueAsGuest(name) {
  const res = await fetch(`${API_BASE}/api/auth/guest`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Sign-in failed');
  return res.json();
}
export async function fetchMe() {
  const res = await fetch(`${API_BASE}/api/me`, { credentials: 'include' });
  if (!res.ok) throw new Error(`/api/me ${res.status}`);
  return res.json();
}

export async function logout() {
  await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'include' });
}

export { API_BASE };