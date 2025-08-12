import React, { useEffect, useState } from 'react';
import styles from '../styles/leaderboard.module.css';
import PracticeGraph from '../graphs/PracticeGraph';
import { LeaderboardTable } from './LeaderboardTable';

export default function Leaderboard() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortKey, setSortKey] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  const pageSize = 10;
  const LOCAL_BACKEND_URL = 'http://localhost:3000/results';
  const BACKEND_URL = 'https://jubilant-beauty-production.up.railway.app/results'; // Update if deploying
  
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${BACKEND_URL}?page=${page}&pageSize=${pageSize}&sortKey=${sortKey}&sortOrder=${sortOrder}`
        );
        const data = await response.json();
        setResults(Array.isArray(data.results) ? data.results : []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error('Failed to fetch leaderboard data', err);
        setResults([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [page, sortKey, sortOrder]);

  // Sorting logic
  const sortedResults = [...results].sort((a, b) => {
    if (a[sortKey] === undefined || b[sortKey] === undefined) return 0;
    if (sortOrder === 'asc') return a[sortKey] > b[sortKey] ? 1 : -1;
    return a[sortKey] < b[sortKey] ? 1 : -1;
  });

  const handleSort = key => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

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
          </div>
        </div>
      )}
    </div>
  );
}