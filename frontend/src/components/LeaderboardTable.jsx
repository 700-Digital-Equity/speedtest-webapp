import styles from '../styles/leaderboard.module.css';
export function LeaderboardTable({ results}) {
  return (
    <table className={styles.leaderboardTable}>
        <thead>
            <tr>
            <th onClick={() => handleSort('name')}>Name</th>
            <th onClick={() => handleSort('location')}>Location</th>
            <th onClick={() => handleSort('ping')}>Ping (ms)</th>
            <th onClick={() => handleSort('download')}>Download (Mbps)</th>
            <th onClick={() => handleSort('upload')}>Upload (Mbps)</th>
            <th onClick={() => handleSort('timestamp')}>Time</th>
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
  )
};