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
  const { getBreadcrumb } = useGlobalFilter();
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
    <div className="outbreak-panel" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 className="outbreak-title" style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #e5e7eb' }}>
        Outbreak Risk Prediction
      </h2>
      
      {hasFilter && (
        <div className="filter-warning" style={{ marginBottom: '12px' }}>
          ⚠️ Note: Risk prediction is region-wide (not filtered by location)
        </div>
      )}
      
      {/* Risk Meter */}
      <div className="risk-meter" style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div className="risk-circle" style={{ 
          borderColor: getRiskColor(prediction.riskLevel),
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div className="risk-score" style={{ margin: 0 }}>{prediction.riskScore.toFixed(1)}</div>
          <div className="risk-label" style={{ margin: 0 }}>{prediction.riskLevel}</div>
        </div>
        <div className="confidence" style={{ margin: 0 }}>
          Confidence: {prediction.confidence.toFixed(0)}%
        </div>
      </div>

      {/* Contributing Factors */}
      <div className="factors" style={{ padding: '16px 0', borderTop: '1px solid #f3f4f6' }}>
        <h3 className="factors-title" style={{ marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
          Contributing Factors
        </h3>
        <div className="factor-bars" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="factor" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 60px', gap: '12px', minHeight: '32px' }}>
            <span className="factor-label">Clusters</span>
            <div className="bar">
              <div 
                className="fill" 
                style={{ width: `${prediction.contributingFactors.cluster_factor}%` }}
              ></div>
            </div>
            <span className="factor-value">{prediction.contributingFactors.cluster_factor.toFixed(1)}</span>
          </div>
          <div className="factor" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 60px', gap: '12px', minHeight: '32px' }}>
            <span className="factor-label">Reports</span>
            <div className="bar">
              <div 
                className="fill" 
                style={{ width: `${prediction.contributingFactors.report_factor}%` }}
              ></div>
            </div>
            <span className="factor-value">{prediction.contributingFactors.report_factor.toFixed(1)}</span>
          </div>
          <div className="factor" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 60px', gap: '12px', minHeight: '32px' }}>
            <span className="factor-label">Quality</span>
            <div className="bar">
              <div 
                className="fill" 
                style={{ width: `${prediction.contributingFactors.quality_factor}%` }}
              ></div>
            </div>
            <span className="factor-value">{prediction.contributingFactors.quality_factor.toFixed(1)}</span>
          </div>
          <div className="factor" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 60px', gap: '12px', minHeight: '32px' }}>
            <span className="factor-label">Water</span>
            <div className="bar">
              <div 
                className="fill" 
                style={{ width: `${prediction.contributingFactors.water_factor}%` }}
              ></div>
            </div>
            <span className="factor-value">{prediction.contributingFactors.water_factor.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="recommendations" style={{ padding: '16px 0', borderTop: '1px solid #f3f4f6' }}>
        <h3 className="recommendations-title" style={{ marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
          Recommendations
        </h3>
        <ul className="recommendations-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {prediction.recommendations.map((rec, index) => (
            <li 
              key={index} 
              className={`recommendation-item ${rec.startsWith('PRIORITY') ? 'priority' : ''}`}
              style={{ display: 'block', marginBottom: '8px' }}
            >
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OutbreakPredictionPanel;
