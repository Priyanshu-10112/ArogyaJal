import React, { useState, useEffect, useCallback } from 'react';
import StyledJsxStyle from '../components/StyledJsxStyle';
import '../App.css';
import { 
  testFirebaseConnection,
  subscribeToDeviceUpdates,
  type SensorReadingDocument
} from '../services/firebase.service';
import { initializeApp } from 'firebase/app';
import { collection, query, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig, COLLECTIONS } from '../config/firebase.config';

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

interface DashboardData {
  deviceId?: string;
  deviceData?: {
    deviceId: string;
    sensorId: string;
    timestamp: string;
    location: string;  // "lat,lng" format
    ph: number;
    turbidity: number;
    totalDissolvedSolids: number;
    dissolvedOxygen: number;
    temperature: number;
    batteryVoltage: number;
    chlorine?: number;
    conductivity?: number;
    flowRate?: number;
    hardness?: number;
    waterLevel?: number;
    qualityStatus?: string;
    notes?: string;
  };
  overallStatus: 'LOADING' | 'LOADED' | 'ERROR';
  latestReadings?: {
    [key: string]: number | string | undefined;
  };
  lastUpdated?: Date;
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    overallStatus: 'LOADING',
    latestReadings: {},
    deviceId: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Available devices state (commented out as it's not currently used)
  // const [availableDevices, setAvailableDevices] = useState<string[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<string>('');

  // Transform Firestore document to DashboardData format
  const transformToDashboardData = useCallback((doc: SensorReadingDocument | null): DashboardData => {
    const now = new Date();
    if (!doc) {
      setLastUpdated(now);
      return {
        overallStatus: 'ERROR',
        latestReadings: {},
        lastUpdated: now
      };
    }
    
    console.log('Transforming document data:', JSON.stringify({
      id: doc.id,
      batteryVoltage: doc.batteryVoltage,
      notes: doc.notes,
      timestamp: doc.timestamp?.toDate ? doc.timestamp.toDate() : doc.timestamp
    }, null, 2));
    
    // Helper function to safely convert Firestore timestamp to Date
    const toDate = (timestamp: any) => {
      console.log('Raw timestamp:', timestamp);
      let result: Date;
      
      if (!timestamp) {
        console.log('No timestamp, using current time');
        result = now;
      } else if (typeof timestamp.toDate === 'function') {
        console.log('Converting Firestore Timestamp to Date');
        result = timestamp.toDate();
      } else if (timestamp.seconds) {
        console.log('Converting timestamp with seconds to Date');
        result = new Date(timestamp.seconds * 1000);
      } else {
        console.log('Creating Date from string or number');
        result = new Date(timestamp);
      }
      
      console.log('Converted timestamp:', result);
      return result;
    };
    
    const docTimestamp = toDate(doc.timestamp);
    console.log('Final docTimestamp:', docTimestamp, 'Local time:', docTimestamp.toString());

    // Parse location string
    const location = doc.location || '0,0';
    // Extract lat/lng but don't assign to variables since they're not used
    location.split(',').map(Number);

    // Extract battery voltage from notes if not available directly
    let batteryVoltage = doc.batteryVoltage || 0;
    if (batteryVoltage <= 0 && doc.notes) {
      const voltageMatch = doc.notes.match(/Battery Voltage:?\s*(\d+(?:\.\d+)?)\s*V?/i);
      if (voltageMatch && voltageMatch[1]) {
        batteryVoltage = parseFloat(voltageMatch[1]);
        console.log('Extracted battery voltage from notes:', batteryVoltage);
      }
    }

    // Format the date in local time
    const formatLocalDate = (date: Date) => {
      console.log('Formatting date:', date, 'ISO:', date.toISOString());
      const options = {
        timeZone: 'Asia/Kolkata',
        year: 'numeric' as const,
        month: '2-digit' as const,
        day: '2-digit' as const,
        hour: '2-digit' as const,
        minute: '2-digit' as const,
        second: '2-digit' as const,
        hour12: false
      };
      const formatted = date.toLocaleString('en-IN', options);
      console.log('Formatted date:', formatted);
      return formatted;
    };

    const transformedData: DashboardData = {
      deviceData: {
        deviceId: doc.sensorId || 'unknown',
        sensorId: doc.sensorId || 'unknown',
        timestamp: formatLocalDate(docTimestamp),
        location: location,
        ph: doc.ph || 0,
        turbidity: doc.turbidity || 0,
        totalDissolvedSolids: doc.totalDissolvedSolids || 0,
        dissolvedOxygen: doc.dissolvedOxygen || 0,
        temperature: doc.temperature || 0,
        batteryVoltage: batteryVoltage,
        chlorine: doc.chlorine || 0,
        conductivity: doc.conductivity || 0,
        flowRate: doc.flowRate || 0,
        hardness: doc.hardness || 0,
        waterLevel: doc.waterLevel || 0,
        qualityStatus: doc.qualityStatus || 'UNKNOWN',
        notes: doc.notes || ''
      },
      overallStatus: 'LOADED',
      latestReadings: {
        pH: doc.ph || 0,
        turbidity: doc.turbidity || 0,
        tds: doc.totalDissolvedSolids || 0,
        dissolvedOxygen: doc.dissolvedOxygen || 0,
        temperature: doc.temperature || 0,
        batteryVoltage: doc.batteryVoltage || 0,
        location: location,
        qualityStatus: doc.qualityStatus || 'UNKNOWN'
      },
      lastUpdated: now
    };

    setLastUpdated(now);
    return transformedData;
  }, []);

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    
    // Initial call
    updateTime();
    
    // Set up interval
    const intervalId = setInterval(updateTime, 1000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Initial data fetch and real-time subscription
  // Test Firebase connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      const isConnected = await testFirebaseConnection();
      if (isConnected) {
        console.log('Firebase connection test passed!');
      } else {
        console.error('Firebase connection test failed!');
      }
    };
    
    testConnection();
  }, []);

  // Fetch the latest reading to get the most recent device
  useEffect(() => {
    let isMounted = true;

    const fetchLatestReading = async () => {
      try {
        setIsLoading(true);
        
        // Get the most recent reading from any device
        const q = query(
          collection(db, COLLECTIONS.SENSOR_READINGS),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (isMounted && !querySnapshot.empty) {
          const latestDoc = querySnapshot.docs[0].data() as SensorReadingDocument;
          if (latestDoc.sensorId) {
            setSelectedDeviceId(latestDoc.sensorId);
            setDashboardData(transformToDashboardData(latestDoc));
          }
        }
      } catch (err) {
        console.error('Error fetching latest reading:', err);
        setError('Failed to load latest device data');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchLatestReading();

    return () => {
      isMounted = false;
    };
  }, [transformToDashboardData]);

  // Set up real-time updates for the latest device
  useEffect(() => {
    let isMounted = true;
    let unsubscribeDeviceData: (() => void) | null = null;
    let unsubscribeLatestDevice: (() => void) | null = null;

    const setupRealtimeUpdates = async () => {
      try {
        setIsLoading(true);
        
        // First, set up a listener for the latest device ID
        const latestDeviceQuery = query(
          collection(db, COLLECTIONS.SENSOR_READINGS),
          orderBy('timestamp', 'desc'),
          limit(1)
        );

        // Get the latest device ID and set up a real-time listener
        const querySnapshot = await getDocs(latestDeviceQuery);
        if (!querySnapshot.empty) {
          const latestDoc = querySnapshot.docs[0].data() as SensorReadingDocument;
          if (isMounted && latestDoc.sensorId) {
            setSelectedDeviceId(latestDoc.sensorId);
            
            // Set up real-time subscription for this device's data
            unsubscribeDeviceData = subscribeToDeviceUpdates(latestDoc.sensorId, (doc) => {
              if (isMounted && doc) {
                const newData = transformToDashboardData(doc);
                setDashboardData({
                  ...newData,
                  deviceId: latestDoc.sensorId
                });
                setIsLoading(false);
                setError(null);
              }
            });
          }
        }
        
        // Set up a real-time listener for any new device data
        unsubscribeLatestDevice = onSnapshot(
          query(
            collection(db, COLLECTIONS.SENSOR_READINGS),
            orderBy('timestamp', 'desc'),
            limit(1)
          ),
          (snapshot) => {
            if (!snapshot.empty && isMounted) {
              const latestDoc = snapshot.docs[0].data() as SensorReadingDocument;
              if (latestDoc.sensorId !== selectedDeviceId) {
                // If we get a new device ID, update the selected device
                setSelectedDeviceId(latestDoc.sensorId);
                
                // Unsubscribe from the previous device's updates
                if (unsubscribeDeviceData) {
                  unsubscribeDeviceData();
                }
                
                // Subscribe to the new device's updates
                unsubscribeDeviceData = subscribeToDeviceUpdates(latestDoc.sensorId, (doc) => {
                  if (isMounted && doc) {
                    const newData = transformToDashboardData(doc);
                    setDashboardData({
                      ...newData,
                      deviceId: latestDoc.sensorId
                    });
                    setIsLoading(false);
                    setError(null);
                  }
                });
              }
            }
          },
          (error) => {
            console.error('Error in latest device listener:', error);
            if (isMounted) {
              setError('Error receiving real-time updates');
              setIsLoading(false);
            }
          }
        );
        
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
          console.error('Error setting up real-time updates:', err);
          setIsLoading(false);
        }
      }
    };
    
    setupRealtimeUpdates();
    
    // Clean up subscriptions on unmount
    return () => {
      isMounted = false;
      if (unsubscribeDeviceData) unsubscribeDeviceData();
      if (unsubscribeLatestDevice) unsubscribeLatestDevice();
    };
  }, [transformToDashboardData, selectedDeviceId]);

  // Removed unused timer effect and state


  if (isLoading) {
    return (
      <div className="page-content">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading real-time sensor data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content error-container">
        <div className="error-message">
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="page-content">
        <div className="no-data">
          <h2>No Data Available</h2>
          <p>No sensor data has been received yet.</p>
          {lastUpdated && (
            <p className="last-updated">
              Last checked: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Check if we have any sensor data
  const hasSensorData = dashboardData.deviceData && (
    (dashboardData.deviceData.ph !== null && dashboardData.deviceData.ph !== undefined) ||
    (dashboardData.deviceData.turbidity !== null && dashboardData.deviceData.turbidity !== undefined) ||
    (dashboardData.deviceData.totalDissolvedSolids !== null && dashboardData.deviceData.totalDissolvedSolids !== undefined) ||
    (dashboardData.deviceData.dissolvedOxygen !== null && dashboardData.deviceData.dissolvedOxygen !== undefined) ||
    (dashboardData.deviceData.temperature !== null && dashboardData.deviceData.temperature !== undefined)
  );

  if (!hasSensorData) {
    return (
      <div className="page-content">
        <div className="no-data-message">
          <h2>Device {dashboardData.deviceId || ''} is registered but has no sensor data yet</h2>
          <p>Please check back later or verify the device is sending data.</p>
        </div>
      </div>
    );
  }

  // Calculate water quality score based on latest readings
  const getWaterQualityScore = (deviceData: DashboardData['deviceData']): number => {
    if (!deviceData) return 0;
    
    let score = 0;
    let count = 0;
    
    // PH (6.5-8.5 is good)
    if (deviceData.ph !== undefined && deviceData.ph !== null) {
      const phScore = Math.max(0, 100 - Math.abs(deviceData.ph - 7.5) * 20);
      score += phScore;
      count++;
    }
    
    // Turbidity (lower is better, 0-5 NTU is good)
    if (deviceData.turbidity !== undefined && deviceData.turbidity !== null) {
      const turbidityScore = Math.max(0, 100 - (deviceData.turbidity * 2));
      score += turbidityScore;
      count++;
    }
    
    // TDS (0-300 ppm is good)
    if (deviceData.totalDissolvedSolids !== undefined && deviceData.totalDissolvedSolids !== null) {
      const tdsScore = Math.max(0, 100 - (deviceData.totalDissolvedSolids / 10));
      score += tdsScore;
      count++;
    }
    
    // Dissolved Oxygen (>5 mg/L is good)
    if (deviceData.dissolvedOxygen !== undefined && deviceData.dissolvedOxygen !== null) {
      const doScore = Math.min(100, deviceData.dissolvedOxygen * 10);
      score += doScore;
      count++;
    }
    
    return count > 0 ? Math.round(score / count) : 0;
  };
  
  const waterQualityScore = dashboardData.deviceData ? getWaterQualityScore(dashboardData.deviceData) : 0;
  
  // Water quality score is calculated but not currently displayed

  // Get quality status color and icon
  const getQualityStatusInfo = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'EXCELLENT':
        return { color: '#4caf50', icon: '🌟', bgColor: '#e8f5e8' };
      case 'GOOD':
        return { color: '#8bc34a', icon: '✅', bgColor: '#f1f8e9' };
      case 'MEDIUM':
        return { color: '#ff9800', icon: '⚠️', bgColor: '#fff3e0' };
      case 'POOR':
        return { color: '#f44336', icon: '❌', bgColor: '#ffebee' };
      case 'VERY POOR':
        return { color: '#d32f2f', icon: '🚫', bgColor: '#ffcdd2' };
      default:
        return { color: '#9e9e9e', icon: '❓', bgColor: '#f5f5f5' };
    }
  };

  const qualityInfo = getQualityStatusInfo(dashboardData.deviceData?.qualityStatus || 'UNKNOWN');

  return (
    <div className="page-content">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>🌊 ArogyaJal Water Quality Monitor</h1>
          <div className="realtime-indicator">
            <div className="pulse"></div>
            <span>Live Monitoring</span>
          </div>
        </div>
        <div className="header-right">
          <div className="current-time">
            <span className="time-label">Current Time</span>
            <span className="time-value">{currentTime}</span>
          </div>
        </div>
      </div>

      {/* Water Quality Status Banner */}
      {dashboardData.deviceData && (
        <div className="quality-status-banner" style={{ backgroundColor: qualityInfo.bgColor, borderLeft: `5px solid ${qualityInfo.color}` }}>
          <div className="quality-status-content">
            <div className="quality-icon">{qualityInfo.icon}</div>
            <div className="quality-info">
              <h2 style={{ color: qualityInfo.color }}>
                Water Quality: {dashboardData.deviceData.qualityStatus || 'UNKNOWN'}
              </h2>
              <p>Device: <strong>{dashboardData.deviceData.deviceId}</strong> | 
                 Location: <strong>{dashboardData.deviceData.location}</strong> | 
                 Last Updated: <strong>{dashboardData.deviceData.timestamp}</strong>
              </p>
            </div>
            <div className="quality-score">
              <div className="score-circle" style={{ borderColor: qualityInfo.color }}>
                <span className="score-value" style={{ color: qualityInfo.color }}>{waterQualityScore}</span>
                <span className="score-label">Score</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sensor Data Grid */}
      {dashboardData.deviceData && (
        <div className="dashboard-container">
          <div className="sensor-grid">
            {/* pH Level Card */}
            <div className="sensor-card">
              <div className="sensor-header">
                <span className="sensor-icon">🧪</span>
                <span className="sensor-title">pH Level</span>
                <div className={`status-dot ${getStatusClass(dashboardData.deviceData.ph, 6.5, 8.5)}`}></div>
              </div>
              <div className="sensor-value">{dashboardData.deviceData.ph.toFixed(2)}</div>
              <div className="sensor-range">Optimal: 6.5 - 8.5</div>
              <div className="sensor-description">
                {dashboardData.deviceData.ph < 6.5 ? 'Acidic' : 
                 dashboardData.deviceData.ph > 8.5 ? 'Alkaline' : 'Normal'}
              </div>
            </div>

            {/* Turbidity Card */}
            <div className="sensor-card">
              <div className="sensor-header">
                <span className="sensor-icon">🌫️</span>
                <span className="sensor-title">Turbidity</span>
                <div className={`status-dot ${getStatusClass(dashboardData.deviceData.turbidity, 0, 5, true)}`}></div>
              </div>
              <div className="sensor-value">{dashboardData.deviceData.turbidity.toFixed(2)} <span className="unit">NTU</span></div>
              <div className="sensor-range">Optimal: 0 - 5 NTU</div>
              <div className="sensor-description">
                {dashboardData.deviceData.turbidity <= 5 ? 'Clear' : 
                 dashboardData.deviceData.turbidity <= 15 ? 'Slightly Cloudy' : 'Very Cloudy'}
              </div>
            </div>

            {/* TDS Card */}
            <div className="sensor-card">
              <div className="sensor-header">
                <span className="sensor-icon">💧</span>
                <span className="sensor-title">Total Dissolved Solids</span>
                <div className={`status-dot ${getStatusClass(dashboardData.deviceData.totalDissolvedSolids, 0, 300, true)}`}></div>
              </div>
              <div className="sensor-value">{dashboardData.deviceData.totalDissolvedSolids.toFixed(0)} <span className="unit">ppm</span></div>
              <div className="sensor-range">Optimal: 0 - 300 ppm</div>
              <div className="sensor-description">
                {dashboardData.deviceData.totalDissolvedSolids <= 300 ? 'Good' : 
                 dashboardData.deviceData.totalDissolvedSolids <= 600 ? 'Fair' : 'Poor'}
              </div>
            </div>

            {/* Dissolved Oxygen Card */}
            <div className="sensor-card">
              <div className="sensor-header">
                <span className="sensor-icon">🫧</span>
                <span className="sensor-title">Dissolved Oxygen</span>
                <div className={`status-dot ${getStatusClass(dashboardData.deviceData.dissolvedOxygen, 5, 15)}`}></div>
              </div>
              <div className="sensor-value">{dashboardData.deviceData.dissolvedOxygen.toFixed(2)} <span className="unit">mg/L</span></div>
              <div className="sensor-range">Optimal: &gt; 5 mg/L</div>
              <div className="sensor-description">
                {dashboardData.deviceData.dissolvedOxygen >= 7 ? 'Excellent' : 
                 dashboardData.deviceData.dissolvedOxygen >= 5 ? 'Good' : 'Low'}
              </div>
            </div>

            {/* Temperature Card */}
            <div className="sensor-card">
              <div className="sensor-header">
                <span className="sensor-icon">🌡️</span>
                <span className="sensor-title">Temperature</span>
                <div className={`status-dot ${getStatusClass(dashboardData.deviceData.temperature, 15, 30)}`}></div>
              </div>
              <div className="sensor-value">{dashboardData.deviceData.temperature.toFixed(1)} <span className="unit">°C</span></div>
              <div className="sensor-range">Optimal: 15 - 30°C</div>
              <div className="sensor-description">
                {dashboardData.deviceData.temperature < 15 ? 'Cold' : 
                 dashboardData.deviceData.temperature > 30 ? 'Warm' : 'Normal'}
              </div>
            </div>

            {/* Battery Status Card */}
            <div className="sensor-card">
              <div className="sensor-header">
                <span className="sensor-icon">🔋</span>
                <span className="sensor-title">Battery Status</span>
                <div className={`status-dot ${getStatusClass(dashboardData.deviceData.batteryVoltage, 3.6, 4.2)}`}></div>
              </div>
              <div className="sensor-value">{dashboardData.deviceData.batteryVoltage.toFixed(2)} <span className="unit">V</span></div>
              <div className="sensor-range">Normal: 3.6 - 4.2V</div>
              <div className="sensor-description">
                {dashboardData.deviceData.batteryVoltage >= 4.0 ? 'Full' : 
                 dashboardData.deviceData.batteryVoltage >= 3.7 ? 'Good' : 'Low'}
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="info-section">
            <div className="info-card">
              <h3>📍 Location Information</h3>
              <p><strong>Coordinates:</strong> {dashboardData.deviceData.location}</p>
              <p><strong>Device ID:</strong> {dashboardData.deviceData.deviceId}</p>
              <p><strong>Last Reading:</strong> {dashboardData.deviceData.timestamp}</p>
            </div>
            
            <div className="info-card">
              <h3>📊 Quality Assessment</h3>
              <p><strong>ML Prediction:</strong> {dashboardData.deviceData.qualityStatus}</p>
              <p><strong>Overall Score:</strong> {waterQualityScore}/100</p>
              <p><strong>Status:</strong> 
                {waterQualityScore >= 90 ? ' Excellent water quality' :
                 waterQualityScore >= 70 ? ' Good water quality' :
                 waterQualityScore >= 50 ? ' Fair water quality' : ' Poor water quality'}
              </p>
            </div>
          </div>
        </div>
      )}

      <StyledJsxStyle jsx>{`
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          color: white;
        }

        .header-left h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          font-weight: 600;
        }

        .realtime-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .pulse {
          width: 8px;
          height: 8px;
          background-color: #4caf50;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.7; }
        }

        .header-right {
          text-align: right;
        }

        .time-label {
          display: block;
          font-size: 0.8rem;
          opacity: 0.8;
          margin-bottom: 0.25rem;
        }

        .time-value {
          font-size: 1.1rem;
          font-weight: 500;
        }

        .quality-status-banner {
          margin-bottom: 2rem;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .quality-status-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .quality-icon {
          font-size: 3rem;
        }

        .quality-info {
          flex: 1;
        }

        .quality-info h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.8rem;
          font-weight: 600;
        }

        .quality-info p {
          margin: 0;
          color: #666;
          font-size: 0.95rem;
        }

        .quality-score {
          display: flex;
          align-items: center;
        }

        .score-circle {
          width: 80px;
          height: 80px;
          border: 3px solid;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: white;
        }

        .score-value {
          font-size: 1.5rem;
          font-weight: bold;
          line-height: 1;
        }

        .score-label {
          font-size: 0.7rem;
          color: #666;
        }

        .sensor-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .sensor-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          border: 1px solid #e0e0e0;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .sensor-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.15);
        }

        .sensor-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .sensor-icon {
          font-size: 1.5rem;
        }

        .sensor-title {
          font-weight: 600;
          color: #333;
          flex: 1;
        }

        .status-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .status-good { background-color: #4caf50; }
        .status-warning { background-color: #ff9800; }
        .status-critical { background-color: #f44336; }

        .sensor-value {
          font-size: 2.5rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 0.5rem;
          line-height: 1;
        }

        .unit {
          font-size: 1rem;
          color: #666;
          font-weight: normal;
        }

        .sensor-range {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 0.5rem;
        }

        .sensor-description {
          font-size: 0.9rem;
          color: #4caf50;
          font-weight: 500;
        }

        .info-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .info-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          border: 1px solid #e0e0e0;
        }

        .info-card h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.1rem;
        }

        .info-card p {
          margin: 0.5rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        .info-card strong {
          color: #333;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
          }

          .quality-status-content {
            flex-direction: column;
            text-align: center;
          }

          .sensor-grid {
            grid-template-columns: 1fr;
          }

          .info-section {
            grid-template-columns: 1fr;
          }
        }
      `}</StyledJsxStyle>
    </div>
  );

  // Helper function to determine status indicator class
  function getStatusClass(value: number, min: number, max: number, reverse = false) {
    if (reverse) {
      return value > max ? 'status-critical' : value > min ? 'status-warning' : 'status-good';
    }
    return value < min || value > max ? 'status-critical' : 
           (value < min * 1.1 || value > max * 0.9) ? 'status-warning' : 'status-good';
  }
};

export default Dashboard;
