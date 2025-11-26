import React, { useEffect, useState, useCallback } from 'react';
import { useGlobalFilter } from '../contexts/GlobalFilterContext';
import { MapContainer, TileLayer, CircleMarker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { coordsToLocation, getAllowedDeviceIds } from '../utils/locationMapper';
import '../App.css';

// Interfaces
interface SensorData {
  id: string;
  sensorId: string;
  location: string;
  latitude: number;
  longitude: number;
  temperature?: number;
  ph?: number;
  turbidity?: number;
  dissolvedOxygen?: number;
  conductivity?: number;
  totalDissolvedSolids?: number;
  timestamp: string;
  wqi?: number;
  qualityStatus?: string;
}

interface Alert {
  id: string;
  sensorId: string;
  severity: string;
  title: string;
  description: string;
  location: string;
}

interface Cluster {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  reportCount: number;
  overallSeverity: string;
  status: string;
}

const MapPage: React.FC = () => {
  const { filter } = useGlobalFilter();
  const [isClient, setIsClient] = useState(false);
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [showClusters, setShowClusters] = useState(true);
  
  // North East India region center (Assam/Meghalaya area)
  const center: [number, number] = [26.2006, 92.9376]; // Guwahati, Assam - NER Hub

  const fetchMapData = useCallback(async () => {
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    
    try {
      // Get allowed device IDs based on global filter
      const allowedDeviceIds = await getAllowedDeviceIds({
        state: filter.state,
        district: filter.district,
        city: filter.city,
        village: filter.village
      });
      
      // Fetch sensors with readings
      try {
        const sensorsResponse = await fetch(`${API_BASE}/api/sensors/readings`);
        if (sensorsResponse.ok) {
          const sensorsData = await sensorsResponse.json();
          
          // Transform data: parse location string to lat/lng
          const transformedSensors = sensorsData.map((sensor: any) => {
            const [lat, lng] = sensor.location ? sensor.location.split(',').map(Number) : [0, 0];
            return {
              ...sensor,
              latitude: lat || 0,
              longitude: lng || 0
            };
          }).filter((s: any) => s.latitude !== 0 && s.longitude !== 0);
          
          // Filter sensors based on allowed device IDs
          const filteredSensors = transformedSensors.filter((sensor: SensorData) => {
            // If no filter, show all
            if (allowedDeviceIds.size === 0 && !filter.state && !filter.district && !filter.city && !filter.village) {
              return true;
            }
            // Check if device is in allowed list
            if (allowedDeviceIds.size > 0 && !allowedDeviceIds.has(sensor.sensorId)) {
              return false;
            }
            // Check specific deviceId filter
            if (filter.deviceId && sensor.sensorId !== filter.deviceId) {
              return false;
            }
            return true;
          });
          
          setSensors(filteredSensors);
        } else {
          console.warn('Failed to fetch sensors:', sensorsResponse.status);
        }
      } catch (err) {
        console.error('Error fetching sensors:', err);
      }

      // Fetch alerts
      try {
        const alertsResponse = await fetch(`${API_BASE}/api/alerts`);
        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json();
          
          // Filter alerts based on allowed device IDs
          const filteredAlerts = alertsData.filter((alert: Alert) => {
            // If no filter, show all
            if (allowedDeviceIds.size === 0 && !filter.state && !filter.district && !filter.city && !filter.village) {
              return true;
            }
            // Check if alert's sensor is in allowed list
            if (allowedDeviceIds.size > 0 && alert.sensorId && !allowedDeviceIds.has(alert.sensorId)) {
              return false;
            }
            // Check specific deviceId filter
            if (filter.deviceId && alert.sensorId !== filter.deviceId) {
              return false;
            }
            return true;
          });
          
          setAlerts(filteredAlerts);
        } else {
          console.warn('Failed to fetch alerts:', alertsResponse.status);
        }
      } catch (err) {
        console.error('Error fetching alerts:', err);
      }

      // Fetch clusters
      try {
        const clustersResponse = await fetch(`${API_BASE}/api/clusters/active`);
        if (clustersResponse.ok) {
          const clustersData = await clustersResponse.json();
          setClusters(clustersData);
        } else {
          console.warn('Failed to fetch clusters:', clustersResponse.status);
        }
      } catch (err) {
        console.error('Error fetching clusters:', err);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching map data:', error);
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setIsClient(true);
    fetchMapData();
    
    // Refresh every 15 seconds for near real-time updates
    const interval = setInterval(fetchMapData, 15000);
    return () => clearInterval(interval);
  }, [fetchMapData]);

  // Get color based on water quality
  const getQualityColor = (sensor: SensorData): string => {
    // If WQI available, use it
    if (sensor.wqi !== undefined && sensor.wqi !== null) {
      if (sensor.wqi >= 80) return '#10b981'; // Green - Excellent
      if (sensor.wqi >= 60) return '#3b82f6'; // Blue - Good
      if (sensor.wqi >= 40) return '#f59e0b'; // Orange - Fair
      if (sensor.wqi >= 20) return '#ef4444'; // Red - Poor
      return '#991b1b'; // Dark Red - Very Poor
    }

    // Fallback: Check individual parameters
    const issues = [];
    if (sensor.ph && (sensor.ph < 6.5 || sensor.ph > 8.5)) issues.push('pH');
    if (sensor.turbidity && sensor.turbidity > 5) issues.push('turbidity');
    // DO sensor not available
    if (sensor.temperature && sensor.temperature > 30) issues.push('temp');

    if (issues.length === 0) return '#10b981'; // Green - Good
    if (issues.length === 1) return '#f59e0b'; // Orange - Warning
    return '#ef4444'; // Red - Critical
  };

  // Get severity color for clusters
  const getClusterColor = (severity: string): string => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return '#991b1b';
      case 'SEVERE': return '#ef4444';
      case 'MODERATE': return '#f59e0b';
      case 'MILD': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  // Get alerts for a sensor
  const getSensorAlerts = (sensorId: string): Alert[] => {
    return alerts.filter(alert => alert.sensorId === sensorId);
  };

  // Format timestamp
  const formatTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Unknown';
    }
  };

  if (!isClient) {
    return <div className="page-content">Loading map...</div>;
  }

  if (loading) {
    return (
      <div className="page-content">
        <h1>🗺️ Interactive Water Quality Map</h1>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          Loading map data...
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1>🗺️ Water Quality Map - North East India</h1>
          <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '14px' }}>
            Real-time monitoring across Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura & Sikkim
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={showClusters} 
              onChange={(e) => setShowClusters(e.target.checked)}
            />
            Show Clusters
          </label>
          <button 
            onClick={fetchMapData}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Legend */}
      <div style={{ 
        background: 'white', 
        padding: '12px', 
        borderRadius: '8px', 
        marginBottom: '1rem',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ fontWeight: 'bold' }}>Legend:</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
          <span>Excellent (WQI 80+)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6' }}></div>
          <span>Good (WQI 60-80)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
          <span>Fair (WQI 40-60)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
          <span>Poor (WQI 20-40)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#991b1b' }}></div>
          <span>Very Poor (WQI &lt;20)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.3)', border: '2px solid #ef4444' }}></div>
          <span>Outbreak Cluster</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ 
        background: 'white', 
        padding: '12px', 
        borderRadius: '8px', 
        marginBottom: '1rem',
        display: 'flex',
        gap: '20px'
      }}>
        <div>📍 <strong>{new Set(sensors.map(s => s.sensorId)).size}</strong> Sensors</div>
        <div>🚨 <strong>{alerts.length}</strong> Active Alerts</div>
        <div>🎯 <strong>{clusters.length}</strong> Active Clusters</div>
      </div>

      <div className="map-container" style={{ height: '600px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer 
          center={center} 
          zoom={7} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Sensor Markers */}
          {sensors.map((sensor, index) => {
            const sensorAlerts = getSensorAlerts(sensor.sensorId);
            const color = getQualityColor(sensor);
            
            // Add small offset to prevent overlapping markers at same location
            // Create a spiral pattern for overlapping markers
            const offset = 0.0005; // ~50 meters
            const angle = (index * 45) * (Math.PI / 180); // 45 degrees apart
            const latOffset = Math.cos(angle) * offset * (Math.floor(index / 8) + 1);
            const lngOffset = Math.sin(angle) * offset * (Math.floor(index / 8) + 1);
            
            return (
              <CircleMarker
                key={sensor.id}
                center={[sensor.latitude + latOffset, sensor.longitude + lngOffset]}
                radius={10}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.8,
                  color: '#fff',
                  weight: 2
                }}
              >
                <Popup>
                  <div style={{ minWidth: '250px' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>
                      📍 {sensor.sensorId}
                    </h3>
                    <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '12px' }}>
                      📍 {coordsToLocation(sensor.location)}
                    </p>
                    <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '12px' }}>
                      🕐 {formatTime(sensor.timestamp)}
                    </p>
                    
                    <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                    
                    <div style={{ fontSize: '13px' }}>
                      <strong>Current Readings:</strong>
                      {sensor.wqi !== undefined && sensor.wqi !== null && (
                        <div style={{ margin: '5px 0' }}>
                          💧 <strong>WQI:</strong> {sensor.wqi.toFixed(1)}
                        </div>
                      )}
                      {sensor.temperature !== undefined && sensor.temperature !== null && (
                        <div style={{ margin: '5px 0' }}>
                          🌡️ <strong>Temperature:</strong> {sensor.temperature.toFixed(1)}°C
                        </div>
                      )}
                      {sensor.ph !== undefined && sensor.ph !== null && (
                        <div style={{ margin: '5px 0' }}>
                          ⚗️ <strong>pH:</strong> {sensor.ph.toFixed(2)}
                        </div>
                      )}
                      {sensor.turbidity !== undefined && sensor.turbidity !== null && (
                        <div style={{ margin: '5px 0' }}>
                          🌫️ <strong>Turbidity:</strong> {sensor.turbidity.toFixed(2)} NTU
                        </div>
                      )}
                      {/* DO sensor not available - removed */}
                      {sensor.conductivity !== undefined && sensor.conductivity !== null && (
                        <div style={{ margin: '5px 0' }}>
                          ⚡ <strong>Conductivity:</strong> {sensor.conductivity.toFixed(0)} µS/cm
                        </div>
                      )}
                      {sensor.totalDissolvedSolids !== undefined && sensor.totalDissolvedSolids !== null && (
                        <div style={{ margin: '5px 0' }}>
                          🧪 <strong>TDS:</strong> {sensor.totalDissolvedSolids.toFixed(0)} ppm
                        </div>
                      )}
                    </div>

                    {sensorAlerts.length > 0 && (
                      <>
                        <hr style={{ margin: '10px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                        <div style={{ fontSize: '13px' }}>
                          <strong style={{ color: '#ef4444' }}>🚨 Active Alerts ({sensorAlerts.length}):</strong>
                          {sensorAlerts.slice(0, 3).map((alert, idx) => (
                            <div 
                              key={idx}
                              style={{ 
                                margin: '5px 0', 
                                padding: '5px', 
                                background: '#fef2f2', 
                                borderRadius: '4px',
                                fontSize: '12px'
                              }}
                            >
                              <div style={{ fontWeight: 'bold', color: '#991b1b' }}>
                                {alert.severity}: {alert.title}
                              </div>
                              <div style={{ color: '#6b7280' }}>
                                {alert.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

          {/* Cluster Circles */}
          {showClusters && clusters.map((cluster) => (
            <Circle
              key={cluster.id}
              center={[cluster.latitude, cluster.longitude]}
              radius={5000} // 5km radius
              pathOptions={{
                fillColor: getClusterColor(cluster.overallSeverity),
                fillOpacity: 0.2,
                color: getClusterColor(cluster.overallSeverity),
                weight: 2,
                dashArray: '5, 5'
              }}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>
                    🎯 Outbreak Cluster
                  </h3>
                  <div style={{ fontSize: '13px' }}>
                    <div style={{ margin: '5px 0' }}>
                      📍 <strong>Location:</strong> {cluster.location}
                    </div>
                    <div style={{ margin: '5px 0' }}>
                      📊 <strong>Reports:</strong> {cluster.reportCount}
                    </div>
                    <div style={{ margin: '5px 0' }}>
                      ⚠️ <strong>Severity:</strong> 
                      <span style={{ 
                        color: getClusterColor(cluster.overallSeverity),
                        fontWeight: 'bold',
                        marginLeft: '5px'
                      }}>
                        {cluster.overallSeverity}
                      </span>
                    </div>
                    <div style={{ margin: '5px 0' }}>
                      🔄 <strong>Status:</strong> {cluster.status}
                    </div>
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>

      {sensors.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          background: '#fef3c7', 
          borderRadius: '8px',
          marginTop: '1rem'
        }}>
          ⚠️ No sensor data available. Add sensors to see them on the map.
        </div>
      )}
    </div>
  );
};

export default MapPage;
