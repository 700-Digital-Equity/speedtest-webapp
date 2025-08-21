import React, { useState, useMemo } from 'react';
import ResultsMap from '../graphs/ResultsMap';
import { LeaderboardTable } from './LeaderboardTable';

// Helper to check if a point is within bounds (handles any order)
function isInBounds(lat, lon, bounds) {
  if (!bounds) return true;
  let [[lat1, lon1], [lat2, lon2]] = bounds;
  // Ensure south < north, west < east
  const south = Math.min(lat1, lat2);
  const north = Math.max(lat1, lat2);
  const west = Math.min(lon1, lon2);
  const east = Math.max(lon1, lon2);
  return lat >= south && lat <= north && lon >= west && lon <= east;
}



import styles from '../styles/leaderboard.module.css';

export default function ResultsDashboard({ results }) {
  const [visibleBounds, setVisibleBounds] = useState(null);
  const [sortKey, setSortKey] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter results to those within the current map bounds
  const filteredResults = useMemo(() => {
    if (!visibleBounds) return results;
    const filtered = results.filter(r => {
      let lat, lon;
      if (r.geo && r.geo.type === 'Point' && Array.isArray(r.geo.coordinates)) {
        lat = r.geo.coordinates[1];
        lon = r.geo.coordinates[0];
      } else if (typeof r.geo === 'string' && r.geo.includes(',')) {
        const [latStr, lonStr] = r.geo.split(',').map(Number);
        lat = latStr; lon = lonStr;
      }
      if (typeof lat === 'number' && typeof lon === 'number') {
        return isInBounds(lat, lon, visibleBounds);
      }
      return false;
    });
    return filtered;
  }, [results, visibleBounds]);

  // Sorting logic for filtered results
  const sortedFilteredResults = useMemo(() => {
    console.log('Initial filteredResults length:', filteredResults.length);
    if (!Array.isArray(filteredResults) || filteredResults.length === 0) return filteredResults;
    const arr = filteredResults.slice();
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (sortKey === 'timestamp') {
        const ad = av ? new Date(av).getTime() : 0;
        const bd = bv ? new Date(bv).getTime() : 0;
        return sortOrder === 'asc' ? ad - bd : bd - ad;
      }
      if (av == null || bv == null) return 0;
      return sortOrder === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    console.log('sortedFilteredResults length:', arr.length);
    return arr;
  }, [filteredResults, sortKey, sortOrder]);

  // Pagination state and logic
  const pageSize = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(sortedFilteredResults.length / pageSize) || 1;
  // Reset to page 1 if filtered results change
  React.useEffect(() => { setPage(1); }, [filteredResults]);
  const pagedResults = useMemo(() => {
    const pageSlice = sortedFilteredResults.slice((page - 1) * pageSize, page * pageSize);
    return pageSlice;
  }, [sortedFilteredResults, page, pageSize]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  return (
    <div className={styles.dashboardGrid}>
      <div className={styles.dashboardCard} style={{height: 420}}>
        <h2 className={styles.dashboardHeader}>Map</h2>
        <ResultsMap results={results} onBoundsChange={setVisibleBounds} />
      </div>
      <div className={styles.dashboardCard} style={{height: 420, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
        <h2 className={styles.dashboardHeader}>Leaderboard</h2>
        <div style={{flex: 1, overflow: 'auto'}}>
          <LeaderboardTable 
            results={pagedResults}
            handleSort={handleSort}
            sortKey={sortKey}
            sortOrder={sortOrder}
            compact
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, padding: '8px 0' }}>
          <button onClick={() => setPage(page - 1)} disabled={page === 1} style={{ minWidth: 60 }}>Prev</button>
          <span style={{ fontSize: 15 }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(page + 1)} disabled={page === totalPages} style={{ minWidth: 60 }}>Next</button>
        </div>
      </div>
    </div>
  );
}
