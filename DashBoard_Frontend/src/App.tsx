import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGauge, faChartLine, faBell, faMap, faBrain, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { GlobalFilterProvider } from './contexts/GlobalFilterContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/common/Layout';
import AlertsPage from './features/alerts/AlertsPage';
import Dashboard from './features/dashboard/Dashboard';
import Trends from './features/trends/Trends';
import MapPage from './features/map/MapPage';
import MLDashboard from './features/ml/MLDashboard';
import EmergencyDashboard from './pages/EmergencyDashboard';
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
          <Link to="/emergency" className={`nav-link ${isActive('/emergency') ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faExclamationTriangle} className="nav-icon" />
            <span>Emergency</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <Layout>
          {/* Page Routes */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/ml-dashboard" element={<MLDashboard />} />
            <Route path="/emergency" element={<div style={{ width: '100%', height: '100%' }}><EmergencyDashboard /></div>} />
          </Routes>
        </Layout>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <GlobalFilterProvider>
        <AppContent />
      </GlobalFilterProvider>
    </ToastProvider>
  );
};

export default App;
