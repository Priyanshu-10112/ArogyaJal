import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { GlobalFilterProvider } from './contexts/GlobalFilterContext';
import { ToastProvider } from './contexts/ToastContext';
import GovHeader from './components/common/GovHeader';
import GovSidebar from './components/common/GovSidebar';
import GovFooter from './components/common/GovFooter';
import UniversalFilterBar from './components/common/UniversalFilterBar';
import GovDashboard from './features/dashboard/GovDashboard';
import WaterQualityA1 from './features/water-quality/WaterQualityA1';
import WaterQualityA2 from './features/water-quality/WaterQualityA2';
import WaterQualityA3 from './features/water-quality/WaterQualityA3';
import DiseaseSurveillance from './features/disease/DiseaseSurveillance';
import SymptomReportsPage from './features/symptomReports/SymptomReportsPage';
import MLDashboard from './features/ml/MLDashboard';
import AlertsPage from './features/alerts/AlertsPage';
import MapPage from './features/map/MapPage';
import ReportsPage from './features/reports/ReportsPage';
import Trends from './features/trends/Trends';
import HelpPage from './features/help/HelpPage';
import './styles/gov-design-tokens.css';
import './gov-layout.css';
import './App.css';
import './layout-fix.css';

const AppContent: React.FC = () => {
  return (
    <div className="app">
      {/* Government Header */}
      <GovHeader />

      {/* Government Sidebar */}
      <GovSidebar />

      {/* Main Content */}
      <div className="main-content">
        {/* Universal Filter Bar */}
        <UniversalFilterBar />

        {/* Page Content */}
        <div className="page-content">
          <Routes>
            <Route path="/" element={<GovDashboard />} />
            <Route path="/water-quality/a1" element={<WaterQualityA1 />} />
            <Route path="/water-quality/a2" element={<WaterQualityA2 />} />
            <Route path="/water-quality/a3" element={<WaterQualityA3 />} />
            <Route path="/disease-surveillance" element={<DiseaseSurveillance />} />
            <Route path="/symptom-reports" element={<SymptomReportsPage />} />
            <Route path="/ml-dashboard" element={<MLDashboard />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/gis-map" element={<MapPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/help" element={<HelpPage />} />
          </Routes>
          
          {/* Government Footer */}
          <GovFooter />
        </div>
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
