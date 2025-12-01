import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Try localhost first since dashboard is running on localhost:3000
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8080' 
  : 'http://192.168.137.35:8080';

interface PhotoEvidence {
  id: string;
  lat: number;
  lng: number;
  description: string;
  category: string;
  status: string;
  imageUrls: string[];
  timestamp: number;
  userId: string;
}

interface EmergencyAlert {
  alertId: string;
  userId: string;
  userPhone: string;
  type: string;
  location: { latitude: number; longitude: number };
  address: string;
  riskLevel: string;
  status: string;
  timestamp: number;
}

const EmergencyDashboard: React.FC = () => {
  const [photoEvidence, setPhotoEvidence] = useState<PhotoEvidence[]>([]);
  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvidence, setSelectedEvidence] = useState<PhotoEvidence | null>(null);

  useEffect(() => {
    fetchEmergencyData();
    const interval = setInterval(fetchEmergencyData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchEmergencyData = async () => {
    try {
      console.log('Fetching emergency data from:', API_BASE_URL);
      
      // Fetch evidence (this works)
      const evidenceRes = await axios.get(`${API_BASE_URL}/api/evidence/map`);
      console.log('Evidence response:', evidenceRes.data);
      setPhotoEvidence(evidenceRes.data);
      
      // Try to fetch alerts (may fail if endpoint not ready)
      try {
        const alertsRes = await axios.get(`${API_BASE_URL}/api/emergency/alerts/active`);
        console.log('Alerts response:', alertsRes.data);
        setEmergencyAlerts(alertsRes.data.alerts || []);
      } catch (alertError) {
        console.warn('Alerts endpoint not available yet, using empty array');
        setEmergencyAlerts([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching emergency data:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
        console.error('Status:', error.response?.status);
      }
      setLoading(false);
    }
  };


  // Custom marker icons
  const evidenceIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const alertIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff4444';
      case 'acknowledged': return '#ffaa00';
      case 'resolved': return '#00C851';
      default: return '#666';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Dirty Water': return '💧';
      case 'Broken Pipe': return '🔧';
      case 'Stagnant Water': return '🌊';
      case 'Sewage Leak': return '⚠️';
      default: return '📷';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ fontSize: '24px', color: '#666' }}>Loading Emergency Dashboard...</div>
      </div>
    );
  }

  console.log('Rendering with photoEvidence:', photoEvidence.length, 'items');

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      width: '100%',
      overflow: 'auto'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#d32f2f', marginBottom: '10px' }}>
          🚨 Emergency Response Dashboard
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Real-time monitoring of photo evidence and emergency alerts ({photoEvidence.length} photos)
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Photo Evidence</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#d32f2f' }}>{photoEvidence.length}</div>
        </div>
        
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Pending Cases</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff9800' }}>
            {photoEvidence.filter(e => e.status === 'pending').length}
          </div>
        </div>
        
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Active Alerts</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f44336' }}>{emergencyAlerts.length}</div>
        </div>
        
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Resolved</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4caf50' }}>
            {photoEvidence.filter(e => e.status === 'resolved').length}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* Map Section */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
            📍 Emergency Locations Map
          </h2>
          <div style={{ height: '500px', borderRadius: '8px', overflow: 'hidden' }}>
            <MapContainer
              center={[22.8211, 75.9428]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              
              {/* Photo Evidence Markers */}
              {photoEvidence.map((evidence) => (
                <Marker
                  key={evidence.id}
                  position={[evidence.lat, evidence.lng]}
                  icon={evidenceIcon}
                  eventHandlers={{
                    click: () => setSelectedEvidence(evidence)
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: '200px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>
                        {getCategoryIcon(evidence.category)} {evidence.category}
                      </div>
                      <div style={{ marginBottom: '8px', color: '#666' }}>{evidence.description}</div>
                      <div style={{ 
                        display: 'inline-block', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        backgroundColor: getStatusColor(evidence.status),
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {evidence.status.toUpperCase()}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
              
              {/* Emergency Alert Markers */}
              {emergencyAlerts.map((alert) => (
                <Marker
                  key={alert.alertId}
                  position={[alert.location.latitude, alert.location.longitude]}
                  icon={alertIcon}
                >
                  <Popup>
                    <div style={{ minWidth: '200px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>🚨 Emergency Alert</div>
                      <div style={{ marginBottom: '4px' }}>Type: {alert.type}</div>
                      <div style={{ marginBottom: '4px' }}>Risk: {alert.riskLevel}</div>
                      <div style={{ marginBottom: '4px' }}>Phone: {alert.userPhone}</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Evidence List Section */}
        <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#333' }}>
            📸 Recent Photo Evidence
          </h2>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {photoEvidence.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                No photo evidence reported yet
              </div>
            ) : (
              photoEvidence.map((evidence) => (
                <div
                  key={evidence.id}
                  onClick={() => setSelectedEvidence(evidence)}
                  style={{
                    padding: '15px',
                    marginBottom: '12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: selectedEvidence?.id === evidence.id ? '#fff3e0' : '#fff'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                      {getCategoryIcon(evidence.category)} {evidence.category}
                    </div>
                    <div style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      backgroundColor: getStatusColor(evidence.status),
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {evidence.status}
                    </div>
                  </div>
                  <div style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>
                    {evidence.description}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    📍 {evidence.lat.toFixed(4)}, {evidence.lng.toFixed(4)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    🕒 {new Date(evidence.timestamp * 1000).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Photo Detail Modal */}
      {selectedEvidence && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setSelectedEvidence(null)}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedEvidence(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#f44336',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
            
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
              {getCategoryIcon(selectedEvidence.category)} {selectedEvidence.category}
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'inline-block', 
                padding: '6px 12px', 
                borderRadius: '6px', 
                backgroundColor: getStatusColor(selectedEvidence.status),
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}>
                Status: {selectedEvidence.status.toUpperCase()}
              </div>
              
              <div style={{ fontSize: '16px', color: '#333', marginBottom: '10px' }}>
                <strong>Description:</strong> {selectedEvidence.description}
              </div>
              
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                <strong>Location:</strong> {selectedEvidence.lat.toFixed(6)}, {selectedEvidence.lng.toFixed(6)}
              </div>
              
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                <strong>Reported:</strong> {new Date(selectedEvidence.timestamp * 1000).toLocaleString()}
              </div>
              
              <div style={{ fontSize: '14px', color: '#666' }}>
                <strong>Evidence ID:</strong> {selectedEvidence.id}
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>Photos:</h3>
              {selectedEvidence.imageUrls && selectedEvidence.imageUrls.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  {selectedEvidence.imageUrls.map((url, index) => (
                    <div key={index} style={{ borderRadius: '8px', overflow: 'hidden', border: '2px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
                      <img
                        src={url}
                        alt={`Evidence ${index + 1}`}
                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          // Use a data URI to avoid network errors
                          e.currentTarget.onerror = null; // Prevent infinite loop
                          e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23ff6b6b"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="white"%3EPhoto Unavailable%3C/text%3E%3C/svg%3E';
                          e.currentTarget.style.padding = '20px';
                        }}
                      />
                      <div style={{ padding: '8px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                        Photo {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>📷</div>
                  <div style={{ color: '#999' }}>No photos available</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyDashboard;
