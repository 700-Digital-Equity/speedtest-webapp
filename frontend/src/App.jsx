import './App.css'
import SpeedTest from './components/SpeedTest';
import Leaderboard from './components/Leaderboard';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function App() {
    return (
        <Router>
            <nav style={{ padding: 20 }}>
                <Link to="/" style={{ marginRight: 20 }}>Speed Test</Link>
                <Link to="/leaderboard">Comparison</Link>
            </nav>
            <Routes>
                <Route path="/" element={<SpeedTest />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
        </Router>
    )

}

export default App
