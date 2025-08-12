import React from 'react';
import styles from '../styles/leaderboard.module.css';

export const LeaderboardTable = React.memo(function LeaderboardTable({ results, handleSort, sortKey, sortOrder }) {
  return (
    <table className={styles.leaderboardTable}>
      <thead>
        <tr>
          <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
            Name {sortKey === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
          </th>
          <th onClick={() => handleSort('location')} style={{ cursor: 'pointer' }}>
            Location {sortKey === 'location' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
          </th>
          <th onClick={() => handleSort('ping')} style={{ cursor: 'pointer' }}>
            Ping (ms) {sortKey === 'ping' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
          </th>
          <th onClick={() => handleSort('download')} style={{ cursor: 'pointer' }}>
            Download (Mbps) {sortKey === 'download' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
          </th>
          <th onClick={() => handleSort('upload')} style={{ cursor: 'pointer' }}>
            Upload (Mbps) {sortKey === 'upload' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
          </th>
          <th onClick={() => handleSort('timestamp')} style={{ cursor: 'pointer' }}>
            Time {sortKey === 'timestamp' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
          </th>
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
            <td>{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});