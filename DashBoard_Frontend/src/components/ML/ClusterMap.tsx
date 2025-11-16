import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ClusterMap.css';

interface Cluster {
  id: string;
  location: string;
  centroid: {
    latitude: number;
    longitude: number;
  };
  reportCount: number;
  dominantSymptoms: string[];
  clusterScore: number;
  status: string;
}

const ClusterMap: React.FC = () => {
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClusters();
    const interval = setInterval(fetchClusters, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchClusters = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/symptom-clusters');
      if (response.ok) {
        const data = await response.json();
        
        // Transform backend response to match frontend interface
        const transformedClusters: Cluster[] = Array.isArray(data.clusters) 
          ? data.clusters.map((cluster: any, index: number) => ({
              id: cluster.cluster_id || `cluster-${index}`,
              location: cluster.location || 'Unknown Location',
              centroid: {
                latitude: cluster.centroid?.latitude || cluster.latitude || 28.6139,
                longitude: cluster.centroid?.longitude || cluster.longitude || 77.2090
              },
              reportCount: cluster.report_count || cluster.size || 0,
              dominantSymptoms: cluster.dominant_symptoms || cluster.symptoms || ['No symptoms'],
              clusterScore: cluster.risk_score || cluster.score || 0,
              status: cluster.status || 'ACTIVE'
            }))
          : [];
        
        setClusters(transformedClusters);
      }
    } catch (error) {
      console.error('Error fetching clusters:', error);
      setClusters([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const getClusterIcon = (score: number) => {
    const color = score >= 75 ? '#dc2626' : score >= 50 ? '#f59e0b' : '#10b981';
    return L.divIcon({
      className: 'cluster-marker',
      html: `<div style="background-color: ${color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${score.toFixed(0)}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });
  };

  const getClusterRadius = (reportCount: number) => {
    return Math.min(reportCount * 500, 5000); // Max 5km radius
  };

  const getClusterColor = (score: number) => {
    if (score >= 75) return '#dc2626';
    if (score >= 50) return '#f59e0b';
    return '#10b981';
  };

  if (loading) {
    return <div className="cluster-map loading">Loading clusters...</div>;
  }

  if (!clusters || clusters.length === 0) {
    return (
      <div className="cluster-map-container">
        <div className="cluster-map-header">
          <h2>Active Symptom Clusters</h2>
          <div className="cluster-count">0 Active Clusters</div>
        </div>
        <div className="no-clusters">
          <p>No active symptom clusters detected.</p>
          <p>This is a good sign - no outbreak patterns identified.</p>
        </div>
      </div>
    );
  }

  const defaultCenter: [number, number] = clusters.length > 0 
    ? [clusters[0].centroid.latitude, clusters[0].centroid.longitude]
    : [28.6139, 77.2090]; // Default to Delhi

  return (
    <div className="cluster-map-container">
      <div className="cluster-map-header">
        <h2>Active Symptom Clusters</h2>
        <div className="cluster-count">
          {clusters.length} Active Cluster{clusters.length !== 1 ? 's' : ''}
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '500px', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {clusters.map((cluster) => (
          <React.Fragment key={cluster.id}>
            {/* Cluster Circle */}
            <Circle
              center={[cluster.centroid.latitude, cluster.centroid.longitude]}
              radius={getClusterRadius(cluster.reportCount)}
              pathOptions={{
                color: getClusterColor(cluster.clusterScore),
                fillColor: getClusterColor(cluster.clusterScore),
                fillOpacity: 0.2,
                weight: 2
              }}
            />

            {/* Cluster Marker */}
            <Marker
              position={[cluster.centroid.latitude, cluster.centroid.longitude]}
              icon={getClusterIcon(cluster.clusterScore)}
            >
              <Popup>
                <div className="cluster-popup">
                  <h3>{cluster.location}</h3>
                  <div className="cluster-info">
                    <div className="info-row">
                      <span className="label">Reports:</span>
                      <span className="value">{cluster.reportCount}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Score:</span>
                      <span className="value">{cluster.clusterScore.toFixed(1)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Status:</span>
                      <span className={`status ${cluster.status.toLowerCase()}`}>
                        {cluster.status}
                      </span>
                    </div>
                  </div>
                  <div className="symptoms">
                    <strong>Dominant Symptoms:</strong>
                    <ul>
                      {cluster.dominantSymptoms.slice(0, 3).map((symptom, idx) => (
                        <li key={idx}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="cluster-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#dc2626' }}></div>
          <span>High Risk (75+)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#f59e0b' }}></div>
          <span>Medium Risk (50-74)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#10b981' }}></div>
          <span>Low Risk (&lt;50)</span>
        </div>
      </div>
    </div>
  );
};

export default ClusterMap;
