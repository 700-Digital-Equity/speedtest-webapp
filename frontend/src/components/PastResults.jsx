import React from 'react';
import styles from '../styles/pastresults.module.css';

export default function PastResultsModal({ open, onClose }) {
  if (!open) return null;
  const results = JSON.parse(localStorage.getItem('pastSpeedTests') || '[]');
  return (
    <div className={styles.pastResultsModalBackdrop}>
      <div className={styles.pastResultsModalContent}>
        <h2>Past Results (This Device)</h2>
        <button onClick={onClose} title="Close">&times;</button>
        {results.length === 0 ? (
          <p>No past results.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Location</th>
                <th>Ping</th>
                <th>Download</th>
                <th>Upload</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>{new Date(r.timestamp).toLocaleString()}</td>
                  <td>{r.name}</td>
                  <td>{r.location}</td>
                  <td>{r.ping}</td>
                  <td>{r.download}</td>
                  <td>{r.upload}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}