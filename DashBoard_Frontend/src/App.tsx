import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGauge, faChartLine, faBell, faMap, faBrain } from '@fortawesome/free-solid-svg-icons';
import { GlobalFilterProvider } from './contexts/GlobalFilterContext';
import GlobalFilterBar from './components/GlobalFilterBar';
import AlertsPage from './pages/AlertsPage';
import DashboardUpdated from './pages/DashboardUpdated';
import Trends from './pages/Trends';
import MapPage from './pages/Map';
import MLDashboard from './pages/MLDashboard';
import './App.css';
import './layout-fix.css';

const AppContent: React.FC = () => {
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
            <img src="/logo/dashboard.jpg" alt="ArogyaJal Logo" className="brand-logo" />
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
          <Link to="/ml-dashboard" className={`nav-link ${isActive('/ml-dashboard') ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faBrain} className="nav-icon" />
            <span>ML Dashboard</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Global Filter Bar */}
        <GlobalFilterBar />

        {/* Page Routes */}
        <Routes>
          <Route path="/" element={<DashboardUpdated />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/ml-dashboard" element={<MLDashboard />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <GlobalFilterProvider>
      <AppContent />
    </GlobalFilterProvider>
  );
};

export default App;
