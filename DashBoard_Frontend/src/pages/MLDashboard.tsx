import React, { useState, useEffect } from 'react';
import OutbreakPredictionPanel from '../components/ML/OutbreakPredictionPanel';
import ClusterMap from '../components/ML/ClusterMap';
import DeviceHealthCard from '../components/ML/DeviceHealthCard';
import './MLDashboard.css';

interface SensorReading {
  id: string;
  sensorId: string;
  location: string;
  batteryLevel?: number;
  batteryVoltage?: number;
  signalStrength?: number;
  uptime?: number;
  wqi?: number;
  qualityStatus?: string;
  timestamp?: string;
}

interface DashboardStats {
  totalSensors: number;
  activeSensors: number;
  totalReports: number;
  activeClusters: number;
  activeAlerts: number;
}

const MLDashboard: React.FC = () => {
  const [sensors, setSensors] = useState<SensorReading[]>([]);
  const [mlServiceOnline, setMlServiceOnline] = useState<boolean>(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalSensors: 0,
    activeSensors: 0,
    totalReports: 0,
    activeClusters: 0,
    activeAlerts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Check ML Service status
      const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const ML_API_BASE = process.env.REACT_APP_ML_API_URL || 'http://localhost:5000';
      
      try {
        const mlResponse = await fetch(`${ML_API_BASE}/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        setMlServiceOnline(mlResponse.ok);
      } catch (err) {
        setMlServiceOnline(false);
      }

      // Fetch sensors
      try {
        const sensorsResponse = await fetch(`${API_BASE}/api/sensors/readings`);
        if (sensorsResponse.ok) {
          const sensorsData = await sensorsResponse.json();
          setSensors(Array.isArray(sensorsData) ? sensorsData : []);
        }
      } catch (err) {
        console.log('Sensors not available:', err);
      }

      // Fetch stats
      try {
        const statsResponse = await fetch(`${API_BASE}/api/dashboard/stats`);
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
        }
      } catch (err) {
        console.log('Stats not available:', err);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ml-dashboard loading">
        <div className="loading-spinner">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="ml-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>ArogyaJal ML Dashboard - North East India</h1>
        <p>Real-time Water Quality & Outbreak Monitoring for NER States</p>
        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '5px' }}>
          🗺️ Covering: Assam • Meghalaya • Arunachal Pradesh • Nagaland • Manipur • Mizoram • Tripura • Sikkim
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔬</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalSensors}</div>
            <div className="stat-label">Total Sensors</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeSensors}</div>
            <div className="stat-label">Active Sensors</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalReports}</div>
            <div className="stat-label">Symptom Reports</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeClusters}</div>
            <div className="stat-label">Active Clusters</div>
          </div>
        </div>

        <div className="stat-card alert">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeAlerts}</div>
            <div className="stat-label">Active Alerts</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-column">
          {/* Outbreak Prediction */}
          <OutbreakPredictionPanel />

          {/* Device Health Cards */}
          <div className="devices-section">
            <h2>Device Health Status</h2>
            <div className="devices-grid">
              {sensors.length > 0 ? (
                sensors.slice(0, 4).map((sensor) => (
                  <DeviceHealthCard
                    key={sensor.id}
                    sensorId={sensor.sensorId}
                    location={sensor.location}
                    batteryLevel={sensor.batteryLevel}
                    batteryVoltage={sensor.batteryVoltage}
                    signalStrength={sensor.signalStrength}
                    uptime={sensor.uptime}
                    wqi={sensor.wqi}
                    qualityStatus={sensor.qualityStatus}
                    lastUpdated={sensor.timestamp}
                  />
                ))
              ) : (
                <div className="no-data">No sensor data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-column">
          {/* Cluster Map */}
          <ClusterMap />

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <button className="action-btn primary">
                <span>🔄</span>
                Run ML Clustering
              </button>
              <button className="action-btn">
                <span>📊</span>
                Generate Report
              </button>
              <button className="action-btn">
                <span>🔔</span>
                View All Alerts
              </button>
              <button className="action-btn">
                <span>⚙️</span>
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <p>Last updated: {new Date().toLocaleString()}</p>
        <p>ML Service: <span className={`status-dot ${mlServiceOnline ? 'online' : 'offline'}`}></span> {mlServiceOnline ? 'Online' : 'Offline'}</p>
      </div>
    </div>
  );
};

export default MLDashboard;
