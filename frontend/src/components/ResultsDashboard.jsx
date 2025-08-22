import FloatingResultsTable from './FloatingResultsTable';
import styles from '../styles/leaderboard.module.css';
import React, { useState, useMemo } from 'react';
import AnalysisSidebar from './AnalysisSidebar';
import MetricBarChart from './MetricBarChart';
import DownloadUploadLineGraph from '../graphs/DownloadUploadLineGraph';
import LatencyJitterLineGraph from '../graphs/LatencyJitterLineGraph';
import AverageSpeedByDayLineGraph from '../graphs/AverageSpeedByDayLineGraph';
import ResultsHeatMap from '../graphs/ResultsHeatMap';
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
  // Get current tester's past results from localStorage
  let userResults = [];
  try {
    userResults = JSON.parse(localStorage.getItem('pastSpeedTests') || '[]');
  } catch (e) {
    userResults = [];
  }
  // Sorting handler for leaderboard table
  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };
  const [visibleBounds, setVisibleBounds] = useState(null);
  const [sortKey, setSortKey] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [mapFullScreen, setMapFullScreen] = useState(false);
  const [showFloatingTable, setShowFloatingTable] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('download');
  const [selectedLineGraph, setSelectedLineGraph] = useState('downloadUploadLine');

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

  // Prepare data for bar chart (simple histogram)
  const analysisData = useMemo(() => {
    const metric = selectedMetric;
    const values = filteredResults.map(r => Number(r[metric])).filter(v => !isNaN(v));
    if (!values.length) return [];
    // Create histogram bins
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = 8;
    const binSize = (max - min) / binCount || 1;
    const bins = Array(binCount).fill(0);
    values.forEach(v => {
      let idx = Math.floor((v - min) / binSize);
      if (idx >= binCount) idx = binCount - 1;
      bins[idx]++;
    });
    return bins.map((count, i) => ({
      label: `${(min + i * binSize).toFixed(1)}-${(min + (i + 1) * binSize).toFixed(1)}`,
      value: count,
    }));
  }, [filteredResults, selectedMetric]);

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

  // Metrics for analysis
  const metrics = [
    { value: 'download', label: 'Download Speed (Mbps)' },
    { value: 'upload', label: 'Upload Speed (Mbps)' },
    { value: 'latency', label: 'Latency (ms)' },
    { value: 'jitter', label: 'Jitter (ms)' },
  ];
  const lineGraphTypes = [
    { value: 'downloadUploadLine', label: 'Download/Upload Over Time' },
    { value: 'latencyJitterLine', label: 'Latency/Jitter Over Time' },
    { value: 'avgSpeedByDay', label: 'Average Speed by Day' },
  ];
  return (
  <div className={styles.dashboardGrid} style={{ position: 'relative', minWidth: 1100, width: '100%', maxWidth: 1600, margin: '0 auto' }}>
      {/* Map Card (normal or fullscreen) */}
      <div
        className={styles.dashboardCard}
        style={
          mapFullScreen
            ? {
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 3000,
                background: '#181c24',
                boxShadow: 'none',
                borderRadius: 0,
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                maxWidth: '100vw',
              }
            : { height: 750, transition: 'height 0.2s', minWidth: 600, width: '100%' }
        }
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: mapFullScreen ? '16px 24px 0 24px' : undefined }}>
          <h2 className={styles.dashboardHeader}>Map</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setMapFullScreen(f => !f)}
              style={{ fontSize: 15, padding: '4px 12px', borderRadius: 4, background: '#4e79a7', color: '#fff', border: 'none', cursor: 'pointer' }}
              title={mapFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            >
              {mapFullScreen ? 'Exit Full Screen' : 'Full Screen'}
            </button>
            <button
              onClick={() => setShowFloatingTable(f => !f)}
              style={{ fontSize: 15, padding: '4px 12px', borderRadius: 4, background: '#e15759', color: '#fff', border: 'none', cursor: 'pointer' }}
              title={showFloatingTable ? 'Hide Results Table' : 'Show Results Table'}
            >
              {showFloatingTable ? 'Hide Table' : 'Show Table'}
            </button>
            <button onClick={() => setShowAnalysis(true)} style={{ fontSize: 15, padding: '4px 12px', borderRadius: 4, background: '#222', color: '#fff', border: 'none', cursor: 'pointer' }}>Analysis</button>
          </div>
        </div>
        <div style={{ flex: 1, minHeight: 320, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, display: 'flex' }}>
            <ResultsHeatMap
              results={results}
              onBoundsChange={setVisibleBounds}
              userResults={userResults}
              style={mapFullScreen
                ? {
                    height: '100vh',
                    width: '100vw',
                    minHeight: '100vh',
                    minWidth: '100vw',
                    maxHeight: '100vh',
                    maxWidth: '100vw',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 3100,
                    margin: 0,
                    padding: 0,
                  }
                : { height: '100%', width: '100%' }
              }
            />
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 15, color: '#4e79a7' }}>
          Showing <b>{filteredResults.length}</b> result{filteredResults.length === 1 ? '' : 's'} in this area
        </div>
        {showFloatingTable && (
          <FloatingResultsTable
            results={sortedFilteredResults}
            onClose={() => setShowFloatingTable(false)}
            handleSort={handleSort}
            sortKey={sortKey}
            sortOrder={sortOrder}
          />
        )}
      </div>
  <div className={styles.dashboardCard} style={{height: 420, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 480, width: '100%' }}>
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
      {showAnalysis && (
        <AnalysisSidebar
          metrics={metrics}
          selectedMetric={selectedMetric}
          onSelectMetric={setSelectedMetric}
          onClose={() => setShowAnalysis(false)}
        >
          <div style={{ marginBottom: 24 }}>
            <MetricBarChart
              data={analysisData}
              label={metrics.find(m => m.value === selectedMetric)?.label || ''}
              color="#4e79a7"
            />
          </div>
          <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
            {lineGraphTypes.map(g => (
              <button
                key={g.value}
                onClick={() => setSelectedLineGraph(g.value)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: selectedLineGraph === g.value ? '#4e79a7' : '#222',
                  color: '#fff',
                  fontWeight: selectedLineGraph === g.value ? 600 : 400,
                  cursor: 'pointer',
                  boxShadow: selectedLineGraph === g.value ? '0 2px 8px #0003' : 'none',
                  outline: 'none',
                  fontSize: 15,
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
          {selectedLineGraph === 'downloadUploadLine' && (
            <DownloadUploadLineGraph results={filteredResults} />
          )}
          {selectedLineGraph === 'latencyJitterLine' && (
            <LatencyJitterLineGraph results={filteredResults} />
          )}
          {selectedLineGraph === 'avgSpeedByDay' && (
            <AverageSpeedByDayLineGraph results={filteredResults} />
          )}
        </AnalysisSidebar>
      )}
    </div>
  );
}
