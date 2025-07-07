import React, { useEffect, useState } from 'react';
import './leaderboard.css'; // Assuming you have a CSS file for styling

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
         <div className="leaderboard-container">
            <div className="table-wrapper">
                <table className="leaderboard-table">
                <thead>
                    <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Ping (ms)</th>
                    <th>Download (Mbps)</th>
                    <th>Upload (Mbps)</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((entry, i) => (
                    <tr key={i}>
                        <td>{entry.name}</td>
                        <td>{entry.location}</td>
                        <td>{entry.ping}</td>
                        <td>{entry.download}</td>
                        <td>{entry.upload}</td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
}