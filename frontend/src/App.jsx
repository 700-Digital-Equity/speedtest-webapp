import React from 'react';
import './App.css';
import SpeedTest from './components/SpeedTest';
import Leaderboard from './components/Leaderboard';
import CodeLogin from './components/CodeLogin';
import { fetchMe, logout } from './utils/api';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

function RequireAuth({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    fetchMe()
      .then(({ user }) => { if (mounted) setUser(user); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <Router>
      <nav style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20 }}>
        <div style={{ display: 'flex', gap: 20 }}>
          <Link to="/">Speed Test</Link>
          <Link to="/leaderboard">Comparison</Link>
          <Link to="/about">About Us</Link>
        </div>
        <div>
          {!user ? (
            <Link to="/login">Sign in</Link>
          ) : (
            <>
              <span style={{ marginRight: 8 }}>Hi, {user.name || 'User'}</span>
              <button onClick={async () => { await logout(); setUser(null); }}>Log out</button>
            </>
          )}
        </div>
      </nav>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: 40 }}>Loading…</div>
      ) : (
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <CodeLogin onSignedIn={setUser} />}
          />
          <Route
            path="/"
            element={
              <RequireAuth user={user}>
                <SpeedTest />
              </RequireAuth>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <RequireAuth user={user}>
                <Leaderboard />
              </RequireAuth>
            }
          />
          {/* Optional placeholder */}
          <Route path="/about" element={<div style={{ padding: 20 }}>About</div>} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
