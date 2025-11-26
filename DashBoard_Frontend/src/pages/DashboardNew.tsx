import React, { useState, useEffect } from 'react';
import '../App.css';
import {
  getSensorDataByDeviceId,
  getDeviceIds,
  getLatestSensorData,
  type SensorData,
} from '../services/api.service';

interface DashboardData {
  deviceId: string;
  sensorData: SensorData | null;
  overallStatus: 'LOADING' | 'LOADED' | 'ERROR';
  lastUpdated: Date;
}

const DashboardNew: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    deviceId: '',
    sensorData: null,
    overallStatus: 'LOADING',
    lastUpdated: new Date(),
  });
  const [availableDevices, setAvailableDevices] = useState<string[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch available devices on mount
  useEffect(() => {
    fetchDevices();
  }, []);

  // Auto-refresh every 5 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (selectedDeviceId) {
        fetchSensorData(selectedDeviceId);
      } else {
        fetchLatestData();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, selectedDeviceId]);

  // Fetch initial data when device is selected
  useEffect(() => {
    if (selectedDeviceId) {
      fetchSensorData(selectedDeviceId);
    } else if (availableDevices.length > 0) {
      fetchLatestData();
    }
  }, [selectedDeviceId, availableDevices]);

  const fetchDevices = async () => {
    try {
      const devices = await getDeviceIds();
      setAvailableDevices(devices);
      if (devices.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(devices[0]);
      }
    } catch (err) {
      console.error('Error fetching devices:', err);
      setError('Failed to load devices');
    }
  };

  const fetchLatestData = async () => {
    try {
      setDashboardData((prev) => ({ ...prev, overallStatus: 'LOADING' }));
      const data = await getLatestSensorData();
      setDashboardData({
        deviceId: data.deviceId,
        sensorData: data,
        overallStatus: 'LOADED',
        lastUpdated: new Date(),
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching latest data:', err);
      setError('Failed to load sensor data');
      setDashboardData((prev) => ({ ...prev, overallStatus: 'ERROR' }));
    }
  };

  const fetchSensorData = async (deviceId: string) => {
    try {
      setDashboardData((prev) => ({ ...prev, overallStatus: 'LOADING' }));
      const data = await getSensorDataByDeviceId(deviceId);
      setDashboardData({
        deviceId: data.deviceId,
        sensorData: data,
        overallStatus: 'LOADED',
        lastUpdated: new Date(),
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError(`Failed to load data for device: ${deviceId}`);
      setDashboardData((prev) => ({ ...prev, overallStatus: 'ERROR' }));
    }
  };

  const handleRefresh = () => {
    if (selectedDeviceId) {
      fetchSensorData(selectedDeviceId);
    } else {
      fetchLatestData();
    }
  };

  const getQualityStatusColor = (status?: string): string => {
    if (!status) return '#999';
    const statusUpper = status.toUpperCase();
    if (statusUpper.includes('EXCELLENT')) return '#4CAF50';
    if (statusUpper.includes('GOOD')) return '#8BC34A';
    if (statusUpper.includes('MEDIUM') || statusUpper.includes('MODERATE')) return '#FFC107';
    if (statusUpper.includes('POOR')) return '#FF9800';
    if (statusUpper.includes('VERY POOR') || statusUpper.includes('CRITICAL')) return '#F44336';
    return '#999';
  };

  const formatTimestamp = (timestamp?: string): string => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const { sensorData } = dashboardData;

  return (
    <div className="page-content">
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ marginBottom: '20px' }}>Water Quality Dashboard</h1>

        {/* Controls */}
        <div
          style={{
            display: 'flex',
            gap: '15px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          {/* Device Selector */}
          <div>
            <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Device:</label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="">Latest from any device</option>
              {availableDevices.map((device) => (
                <option key={device} value={device}>
                  {device}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={dashboardData.overallStatus === 'LOADING'}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#2196F3',
              color: 'white',
              cursor: dashboardData.overallStatus === 'LOADING' ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            {dashboardData.overallStatus === 'LOADING' ? 'Loading...' : 'Refresh'}
          </button>

          {/* Auto-refresh Toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <span>Auto-refresh (5s)</span>
          </label>

          {/* Last Updated */}
          <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#666' }}>
            Last updated: {dashboardData.lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              padding: '15px',
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: '4px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        {/* Device Info */}
        {sensorData && (
          <div
            style={{
              padding: '20px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 10px 0' }}>Device: {sensorData.deviceId}</h3>
                <p style={{ margin: '5px 0', color: '#666' }}>
                  Timestamp: {formatTimestamp(sensorData.timestamp)}
                </p>
                {sensorData.location && (
                  <p style={{ margin: '5px 0', color: '#666' }}>
                    Location: {sensorData.location.lat}°N, {sensorData.location.lon}°E
                  </p>
                )}
              </div>
              {sensorData.battery && (
                <div
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#666' }}>Battery</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                    {sensorData.battery.voltage?.toFixed(1)}V
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sensor Readings */}
        {sensorData?.sensors && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}
          >
            {/* pH */}
            <div
              style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>pH Level</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196F3' }}>
                {sensorData.sensors.pH?.toFixed(2) || 'N/A'}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                Normal: 6.5 - 8.5
              </div>
            </div>

            {/* Temperature */}
            <div
              style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                Temperature
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF9800' }}>
                {sensorData.sensors.temperature_C?.toFixed(1) || 'N/A'}°C
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                Normal: 20 - 30°C
              </div>
            </div>

            {/* Turbidity */}
            <div
              style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>Turbidity</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9C27B0' }}>
                {sensorData.sensors.turbidity_NTU || 'N/A'} NTU
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                Normal: {'<'} 5 NTU
              </div>
            </div>

            {/* DO sensor not available - removed */}

            {/* TDS */}
            <div
              style={{
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>TDS</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>
                {sensorData.sensors.TDS_ppm || 'N/A'} ppm
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                Normal: {'<'} 500 ppm
              </div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!sensorData && dashboardData.overallStatus === 'LOADED' && (
          <div
            style={{
              textAlign: 'center',
              padding: '50px',
              fontSize: '18px',
              color: '#666',
            }}
          >
            No sensor data available. Please ensure devices are sending data.
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardNew;
