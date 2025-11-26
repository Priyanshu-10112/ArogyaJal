import React, { useState, useEffect } from 'react';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import './OutbreakPredictionPanel.css';

interface OutbreakPrediction {
  riskScore: number;
  riskLevel: string;
  confidence: number;
  contributingFactors: {
    cluster_factor: number;
    report_factor: number;
    quality_factor: number;
    water_factor: number;
  };
  recommendations: string[];
}

const OutbreakPredictionPanel: React.FC = () => {
  const { filter, getBreadcrumb } = useGlobalFilter();
  const [prediction, setPrediction] = useState<OutbreakPrediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutbreakPrediction();
    const interval = setInterval(fetchOutbreakPrediction, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchOutbreakPrediction = async () => {
    const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    
    try {
      const response = await fetch(`${API_BASE}/api/outbreak-predictions/latest`);
      if (response.ok) {
        const data = await response.json();
        
        console.log('Outbreak prediction data:', data);
        
        // Transform backend response to match frontend interface
        const transformedData: OutbreakPrediction = {
          riskScore: data.risk_score || 0,
          riskLevel: data.risk_level || data.outbreak_risk || 'LOW',  // Fixed: use risk_level first
          confidence: data.confidence || 0,
          contributingFactors: {
            cluster_factor: data.contributing_factors?.cluster_factor || data.risk_factors?.cluster_factor || 0,
            report_factor: data.contributing_factors?.report_factor || data.risk_factors?.report_factor || 0,
            quality_factor: data.contributing_factors?.quality_factor || data.risk_factors?.quality_factor || 0,
            water_factor: data.contributing_factors?.water_factor || data.risk_factors?.water_factor || 0
          },
          recommendations: data.recommendations || ['No specific recommendations at this time']
        };
        
        console.log('Transformed prediction:', transformedData);
        setPrediction(transformedData);
      }
    } catch (error) {
      console.error('Error fetching outbreak prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <div className="outbreak-panel loading">Loading prediction...</div>;
  }

  if (!prediction) {
    return <div className="outbreak-panel no-data">No outbreak data available</div>;
  }

  const breadcrumb = getBreadcrumb();
  const hasFilter = breadcrumb.length > 0;

  return (
    <div className="outbreak-panel">
      <h2>Outbreak Risk Prediction</h2>
      {hasFilter && (
        <div style={{ 
          fontSize: '12px', 
          color: '#f59e0b', 
          marginBottom: '10px',
          padding: '8px',
          background: '#fffbeb',
          borderRadius: '4px',
          border: '1px solid #fef3c7'
        }}>
          ⚠️ Note: Risk prediction is region-wide (not filtered by location)
        </div>
      )}
      
      {/* Risk Meter */}
      <div className="risk-meter">
        <div className="risk-circle" style={{ borderColor: getRiskColor(prediction.riskLevel) }}>
          <div className="risk-score">{prediction.riskScore.toFixed(1)}</div>
          <div className="risk-label">{prediction.riskLevel}</div>
        </div>
        <div className="confidence">
          Confidence: {prediction.confidence.toFixed(0)}%
        </div>
      </div>

      {/* Contributing Factors */}
      <div className="factors">
        <h3>Contributing Factors</h3>
        <div className="factor-bars">
          <div className="factor">
            <span>Clusters</span>
            <div className="bar">
              <div className="fill" style={{ width: `${prediction.contributingFactors.cluster_factor}%` }}></div>
            </div>
            <span>{prediction.contributingFactors.cluster_factor.toFixed(1)}</span>
          </div>
          <div className="factor">
            <span>Reports</span>
            <div className="bar">
              <div className="fill" style={{ width: `${prediction.contributingFactors.report_factor}%` }}></div>
            </div>
            <span>{prediction.contributingFactors.report_factor.toFixed(1)}</span>
          </div>
          <div className="factor">
            <span>Quality</span>
            <div className="bar">
              <div className="fill" style={{ width: `${prediction.contributingFactors.quality_factor}%` }}></div>
            </div>
            <span>{prediction.contributingFactors.quality_factor.toFixed(1)}</span>
          </div>
          <div className="factor">
            <span>Water</span>
            <div className="bar">
              <div className="fill" style={{ width: `${prediction.contributingFactors.water_factor}%` }}></div>
            </div>
            <span>{prediction.contributingFactors.water_factor.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="recommendations">
        <h3>Recommendations</h3>
        <ul>
          {prediction.recommendations.map((rec, index) => (
            <li key={index} className={rec.startsWith('PRIORITY') ? 'priority' : ''}>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OutbreakPredictionPanel;
