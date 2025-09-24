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

  return (
    <div className="page-content">
      <div className="dashboard-header">
        <h1>Water Quality Dashboard</h1>
        {dashboardData.deviceData ? (
          <div className="device-info">
            <div className="device-header">
              <h3>Device Information</h3>
              <div className="device-id-badge">
                <span className="device-id-label">Device ID:</span>
                <span className="device-id-value">{dashboardData.deviceData.deviceId}</span>
              </div>
            </div>
            <div className="sensor-reading">
              <span className="sensor-label">Turbidity:</span>
              <span className="sensor-value">
                {dashboardData.deviceData.turbidity !== null ? dashboardData.deviceData.turbidity.toFixed(2) : 'N/A'}
              </span>
              <span className="sensor-unit">NTU</span>
            </div>
            <div className="sensor-reading">
              <span className="sensor-label">TDS:</span>
              <span className="sensor-value">
                {dashboardData.deviceData.totalDissolvedSolids !== null ? dashboardData.deviceData.totalDissolvedSolids.toFixed(0) : 'N/A'}
              </span>
              <span className="sensor-unit">ppm</span>
            </div>
            <div className="sensor-reading">
              <span className="sensor-label">Dissolved Oxygen:</span>
              <span className="sensor-value">
                {dashboardData.deviceData.dissolvedOxygen !== null ? dashboardData.deviceData.dissolvedOxygen.toFixed(2) : 'N/A'}
              </span>
              <span className="sensor-unit">mg/L</span>
            </div>
            <div className="sensor-reading">
              <span className="sensor-label">Temperature:</span>
              <span className="sensor-value">
                {dashboardData.deviceData.temperature !== null ? dashboardData.deviceData.temperature.toFixed(1) : 'N/A'}
              </span>
              <span className="sensor-unit">°C</span>
            </div>
          </div>
        ) : (
          <div>No sensor data available</div>
        )}
        <div className="dashboard-card">
          <h3>Water Quality</h3>
          <div className="metric">
            <span className="metric-value">{waterQualityScore}%</span>
            <span className="metric-label">Overall Score</span>
          </div>
        </div>
      </div>

      {dashboardData.deviceData && (
        <div className="dashboard-container">
          <div className="sensor-data">
            <div className="data-grid">
              <div className="data-card">
                <div className="data-value">{dashboardData.deviceData.ph.toFixed(2)}</div>
                <div className="data-label">pH Level</div>
                <div className={`status-indicator ${getStatusClass(dashboardData.deviceData.ph, 6.5, 8.5)}`}></div>
              </div>

              <div className="data-card">
                <div className="data-value">{dashboardData.deviceData.turbidity.toFixed(2)}</div>
                <div className="data-label">Turbidity (NTU)</div>
                <div className={`status-indicator ${getStatusClass(dashboardData.deviceData.turbidity, 0, 5, true)}`}></div>
              </div>

              <div className="data-card">
                <div className="data-value">{dashboardData.deviceData.dissolvedOxygen.toFixed(2)}</div>
                <div className="data-label">Dissolved O₂ (mg/L)</div>
                <div className={`status-indicator ${getStatusClass(dashboardData.deviceData.dissolvedOxygen, 5, 10)}`}></div>
              </div>

              <div className="data-card">
                <div className="data-value">{dashboardData.deviceData.temperature.toFixed(2)}°C</div>
                <div className="data-label">Temperature</div>
                <div className={`status-indicator ${getStatusClass(dashboardData.deviceData.temperature, 10, 30)}`}></div>
              </div>

              <div className="data-card">
                <div className="data-value">{dashboardData.deviceData.batteryVoltage.toFixed(2)}V</div>
                <div className="data-label">Battery</div>
                <div className={`status-indicator ${getStatusClass(dashboardData.deviceData.batteryVoltage, 3.6, 4.2)}`}></div>
              </div>

              <div className="data-card location-card">
                <div className="location-icon">📍</div>
                <div className="location-details">
                  <div className="data-label">Location</div>
                  <div className="location-coords">{dashboardData.deviceData.location}</div>
                </div>
              </div>
            </div>

            <div className="last-updated">
              Last updated: {currentTime || 'Loading...'}
            </div>
          </div>
        </div>
      )}

      <StyledJsxStyle jsx>{`
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .status-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .realtime-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #4caf50;
          font-weight: bold;
        }

        .pulse {
          width: 10px;
          height: 10px;
          background-color: #4caf50;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.7; }
        }

        .data-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .data-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: relative;
          overflow: hidden;
        }

        .data-card::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 4px;
          height: 100%;
          background: #4caf50;
        }

        .data-value {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .data-label {
          color: #666;
          font-size: 0.9rem;
        }

        .status-indicator {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .status-good { background-color: #4caf50; }
        .status-warning { background-color: #ffc107; }
        .status-critical { background-color: #f44336; }

        .location-card {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .location-icon {
          font-size: 2rem;
        }

        .last-updated {
          text-align: right;
          color: #666;
          font-size: 0.9rem;
          margin-top: 1rem;
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
