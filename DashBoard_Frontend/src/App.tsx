import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGauge, faChartLine, faBell, faMap } from '@fortawesome/free-solid-svg-icons';
import Alerts from './components/Alerts/Alerts';
import Dashboard from './pages/Dashboard';
import Trends from './pages/Trends';
import MapPage from './pages/Map';
import './App.css';

const App: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
      <div className="app">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="brand">
            <div className="logo">
              <i className="fa-solid fa-shield-heart"></i>
            </div>
            <h3>ArogyaJal</h3>
          </div>
          <nav className="side-nav">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              <FontAwesomeIcon icon={faGauge} className="nav-icon" />
              <span>Dashboard</span>
            </Link>
            <Link to="/trends" className={`nav-link ${isActive('/trends') ? 'active' : ''}`}>
              <FontAwesomeIcon icon={faChartLine} className="nav-icon" />
              <span>Trends</span>
            </Link>
            <Link to="/alerts" className={`nav-link ${isActive('/alerts') ? 'active' : ''}`}>
              <FontAwesomeIcon icon={faBell} className="nav-icon" />
              <span>Alerts</span>
            </Link>
            <Link to="/map" className={`nav-link ${isActive('/map') ? 'active' : ''}`}>
              <FontAwesomeIcon icon={faMap} className="nav-icon" />
              <span>Map</span>
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/map" element={<MapPage />} />
          </Routes>
        </main>
      </div>
  );
};

export default App;
