import React, { useEffect, useState } from 'react';

export default function Leaderboard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = 'https://jubilant-beauty-production.up.railway.app/results'; // Update if deploying

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(BACKEND_URL);
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error('Failed to fetch leaderboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  return (
    <div style={{ padding: 30, fontFamily: 'sans-serif' }}>
      <h1>Leaderboard</h1>
      {loading ? (
        <p>Loading...</p>
      ) : results.length === 0 ? (
        <p>No results yet.</p>
      ) : (
        <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', marginTop: 20 }}>
          <thead>
            <tr>
              <th>User</th>
              <th>Location</th>
              <th>Ping (ms)</th>
              <th>Download (Mbps)</th>
              <th>Upload (Mbps)</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, index) => (
              <tr key={index}>
                <td>{r.name}</td>
                <td>{r.location}</td>
                <td>{r.ping}</td>
                <td>{r.download}</td>
                <td>{r.upload}</td>
                <td>{new Date(r.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}