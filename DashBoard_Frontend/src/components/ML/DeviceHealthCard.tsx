import React from 'react';
import './DeviceHealthCard.css';

interface DeviceHealthProps {
  sensorId: string;
  location: string;
  batteryLevel?: number;
  batteryVoltage?: number;
  signalStrength?: number;
  uptime?: number;
  wqi?: number;
  qualityStatus?: string;
  lastUpdated?: string;
}

const DeviceHealthCard: React.FC<DeviceHealthProps> = ({
  sensorId,
  location,
  batteryLevel,
  batteryVoltage,
  signalStrength,
  uptime,
  wqi,
  qualityStatus,
  lastUpdated
}) => {
  const getBatteryIcon = (level?: number) => {
    if (!level) return '🔋';
    if (level >= 80) return '🔋';
    if (level >= 50) return '🔋';
    if (level >= 20) return '🪫';
    return '🪫';
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return '#6b7280';
    if (level >= 70) return '#10b981';
    if (level >= 30) return '#f59e0b';
    return '#dc2626';
  };

  const getSignalIcon = (strength?: number) => {
    if (!strength) return '📶';
    if (strength >= -60) return '📶';
    if (strength >= -70) return '📶';
    if (strength >= -80) return '📶';
    return '📶';
  };

  const getSignalQuality = (strength?: number) => {
    if (!strength) return 'Unknown';
    if (strength >= -60) return 'Excellent';
    if (strength >= -70) return 'Good';
    if (strength >= -80) return 'Fair';
    return 'Weak';
  };

  const getSignalColor = (strength?: number) => {
    if (!strength) return '#6b7280';
    if (strength >= -60) return '#10b981';
    if (strength >= -70) return '#3b82f6';
    if (strength >= -80) return '#f59e0b';
    return '#dc2626';
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const getWQIColor = (wqi?: number) => {
    if (!wqi) return '#6b7280';
    if (wqi >= 90) return '#10b981';
    if (wqi >= 70) return '#3b82f6';
    if (wqi >= 50) return '#f59e0b';
    if (wqi >= 25) return '#ea580c';
    return '#dc2626';
  };

  return (
    <div className="device-health-card">
      <div className="device-header">
        <div>
          <h3>{sensorId}</h3>
          <p className="location">{location}</p>
        </div>
        {lastUpdated && (
          <span className="last-updated">
            {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Water Quality */}
      {wqi !== undefined && wqi !== null && (
        <div className="wqi-section">
          <div className="wqi-circle" style={{ borderColor: getWQIColor(wqi) }}>
            <div className="wqi-value">{wqi.toFixed(1)}</div>
            <div className="wqi-label">WQI</div>
          </div>
          <div className="wqi-status" style={{ color: getWQIColor(wqi) }}>
            {qualityStatus || 'Unknown'}
          </div>
        </div>
      )}

      {/* Device Status */}
      <div className="device-status">
        {/* Battery */}
        {batteryLevel !== undefined && (
          <div className="status-item">
            <div className="status-icon">{getBatteryIcon(batteryLevel)}</div>
            <div className="status-info">
              <div className="status-label">Battery</div>
              <div className="status-value" style={{ color: getBatteryColor(batteryLevel) }}>
                {batteryLevel}%
                {batteryVoltage !== undefined && batteryVoltage !== null && <span className="sub-value"> ({batteryVoltage.toFixed(2)}V)</span>}
              </div>
            </div>
            <div className="status-bar">
              <div 
                className="status-fill" 
                style={{ 
                  width: `${batteryLevel}%`,
                  background: getBatteryColor(batteryLevel)
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Signal */}
        {signalStrength !== undefined && (
          <div className="status-item">
            <div className="status-icon">{getSignalIcon(signalStrength)}</div>
            <div className="status-info">
              <div className="status-label">Signal</div>
              <div className="status-value" style={{ color: getSignalColor(signalStrength) }}>
                {getSignalQuality(signalStrength)}
                <span className="sub-value"> ({signalStrength} dBm)</span>
              </div>
            </div>
          </div>
        )}

        {/* Uptime */}
        {uptime !== undefined && (
          <div className="status-item">
            <div className="status-icon">⏱️</div>
            <div className="status-info">
              <div className="status-label">Uptime</div>
              <div className="status-value">{formatUptime(uptime)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {(batteryLevel !== undefined && batteryLevel < 30) && (
        <div className="device-alert warning">
          ⚠️ Low battery - replacement recommended
        </div>
      )}
      {(signalStrength !== undefined && signalStrength < -80) && (
        <div className="device-alert warning">
          ⚠️ Weak signal - check connectivity
        </div>
      )}
      {(wqi !== undefined && wqi !== null && wqi < 50) && (
        <div className="device-alert critical">
          🚨 Poor water quality detected
        </div>
      )}
    </div>
  );
};

export default DeviceHealthCard;
