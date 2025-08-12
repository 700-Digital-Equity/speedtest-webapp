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

export { API_BASE };