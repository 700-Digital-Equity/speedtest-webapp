import React, { useEffect, useState } from 'react';
import styles from '../styles/leaderboard.module.css';
import PracticeGraph from '../graphs/PracticeGraph';
import { LeaderboardTable } from './LeaderboardTable';
import Graph2 from '../graphs/Graph2';
import { fetchResults } from '../utils/api';
import ResultsMap from '../graphs/ResultsMap.jsx';

export default function Leaderboard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortKey, setSortKey] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  const pageSize = 10;
  
  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    fetchResults({ page, pageSize, sortKey, sortOrder }, ac.signal)
      .then(data => {
        setResults(Array.isArray(data.results) ? data.results : []);
        setTotal(data.total || 0);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error('Failed to fetch leaderboard data', err);
          setResults([]);
          setTotal(0);
        }
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [page, sortKey, sortOrder]);

  const sortedResults = React.useMemo(() => {
    if (!Array.isArray(results) || results.length === 0) return results;
    const arr = results.slice();
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
  }, [results, sortKey, sortOrder]);

  const handleSort = React.useCallback((key) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  }, [sortKey]);
  console.log('sortedResults for map:', sortedResults);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className={styles.leaderboardContainer}>
      <h1>Leaderboard</h1>
      {loading ? (
        <p>Loading...</p>
      ) : sortedResults.length === 0 ? (
        <p>No results yet.</p>
      ) : (
        <div className={styles.tableWrapper}>
          <LeaderboardTable 
            results={sortedResults}
            handleSort={handleSort}
            sortKey={sortKey}
            sortOrder={sortOrder}
          />

          <div className={styles.pagination}>
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>

          <div className={styles.graphBar}>
            <PracticeGraph results={sortedResults} />
            <Graph2 results={sortedResults} />
            <ResultsMap results={sortedResults} />

          </div>
        </div>
      )}
    </div>
  );
}