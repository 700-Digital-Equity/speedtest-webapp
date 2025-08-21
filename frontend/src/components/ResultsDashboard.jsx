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


export default function ResultsDashboard({ results }) {
  const [visibleBounds, setVisibleBounds] = useState(null);
  const [sortKey, setSortKey] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter results to those within the current map bounds
  const filteredResults = useMemo(() => {
    console.log('[Dashboard] useMemo running. visibleBounds:', visibleBounds, 'results:', results);
    if (!visibleBounds) return results;
    console.log('[Dashboard] visibleBounds:', visibleBounds);
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
        const inBounds = isInBounds(lat, lon, visibleBounds);
        console.log(`[Dashboard] Checking result lat: ${lat}, lon: ${lon}, inBounds: ${inBounds}`);
        return inBounds;
      } else {
        console.log('[Dashboard] Skipping result with invalid lat/lon:', r);
      }
      return false;
    });
    console.log('[Dashboard] filteredResults:', filtered);
    return filtered;
  }, [results, visibleBounds]);

  // Sorting logic for filtered results
  const sortedFilteredResults = useMemo(() => {
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
    return arr;
  }, [filteredResults, sortKey, sortOrder]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start', justifyContent: 'center' }}>
      <div style={{ flex: '1 1 400px', minWidth: 350, maxWidth: 700 }}>
        <ResultsMap results={results} onBoundsChange={setVisibleBounds} />
      </div>
      <div style={{ flex: '1 1 400px', minWidth: 350, maxWidth: 700 }}>
        <LeaderboardTable 
          results={sortedFilteredResults}
          handleSort={handleSort}
          sortKey={sortKey}
          sortOrder={sortOrder}
        />
      </div>
    </div>
  );
}
