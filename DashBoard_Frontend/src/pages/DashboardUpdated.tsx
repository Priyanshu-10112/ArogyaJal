import React, { useState, useEffect } from 'react';
import { useGlobalFilter } from '../contexts/GlobalFilterContext';
import LocationFilter from '../components/LocationFilter';
import WaterQualityCard from '../components/WaterQualityCard';
import { DeviceInfo, getDevicesByLocation } from '../services/waterQuality.service';
import '../App.css';

const DashboardUpdated: React.FC = () => {
  const { filter, updateFilter } = useGlobalFilter();
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch devices based on global filter
  useEffect(() => {
    fetchDevices();
  }, [filter.state, filter.district, filter.city, filter.village]);

  // Restore selected device from global filter
  useEffect(() => {
    if (filter.deviceId && devices.length > 0) {
      const device = devices.find(d => d.deviceId === filter.deviceId);
      if (device) {
        setSelectedDevice(device);
      }
    }
  }, [filter.deviceId, devices]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const fetchedDevices = await getDevicesByLocation(
        filter.state || undefined,
        filter.district || undefined,
        filter.city || undefined,
        filter.village || undefined
      );
      setDevices(fetchedDevices);
      
      // Don't auto-select - let user choose
      // If filter has deviceId, restore it
      if (filter.deviceId && fetchedDevices.length > 0) {
        const device = fetchedDevices.find(d => d.deviceId === filter.deviceId);
        if (device) {
          setSelectedDevice(device);
        } else {
          // Device not found in current filter, clear selection
          setSelectedDevice(null);
          updateFilter('deviceId', null);
        }
      } else if (fetchedDevices.length === 0) {
        setSelectedDevice(null);
        if (filter.deviceId) {
          updateFilter('deviceId', null);
        }
      }
    } catch (error) {
      console.error('Error fetching devices:', error);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDevicesChange = (newDevices: DeviceInfo[]) => {
    setDevices(newDevices);
    setLoading(false);
    
    // Don't auto-select - let user choose
    // Only restore if deviceId exists in filter
    if (filter.deviceId && newDevices.length > 0) {
      const device = newDevices.find(d => d.deviceId === filter.deviceId);
      if (device) {
        setSelectedDevice(device);
      } else {
        setSelectedDevice(null);
        updateFilter('deviceId', null);
      }
    } else if (newDevices.length === 0) {
      setSelectedDevice(null);
      if (filter.deviceId) {
        updateFilter('deviceId', null);
      }
    }
  };

  const handleBreadcrumbChange = () => {
    // Breadcrumb is now managed by global filter context
  };

  const handleDeviceSelect = (device: DeviceInfo) => {
    setSelectedDevice(device);
    updateFilter('deviceId', device.deviceId);
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div className="dashboard-header-new">
        <h1>ArogyaJal Water Quality Dashboard</h1>
        <p className="subtitle">Real-time monitoring across North East India</p>
        <p className="region-info">
          Assam • Meghalaya • Arunachal Pradesh • Nagaland • Manipur • Mizoram • Tripura • Sikkim
        </p>
      </div>

      {/* Location Filter */}
      <LocationFilter
        onDevicesChange={handleDevicesChange}
        onBreadcrumbChange={handleBreadcrumbChange}
      />

      {/* Main Dashboard Layout */}
      <div className="dashboard-layout">
        {/* Left Side - Device List */}
        <div className="devices-column">
          {devices.length > 0 ? (
            <>
              <h2>Available Devices ({devices.length})</h2>
              <div className="device-list">
                {devices.map((device) => (
                  <div
                    key={device.deviceId}
                    className={`device-card ${selectedDevice?.deviceId === device.deviceId ? 'selected' : ''}`}
                    onClick={() => handleDeviceSelect(device)}
                  >
                    <div className="device-card-header">
                      <span className="device-icon">SENSOR</span>
                      <h3>{device.deviceId}</h3>
                      {device.verified && <span className="verified-badge">Verified</span>}
                    </div>
                    <div className="device-card-body">
                      <p><strong>Location:</strong></p>
                      <p className="location-text">
                        {device.village}, {device.cityOrTown}<br />
                        {device.district}, {device.state}
                      </p>
                      <p><strong>Source:</strong> {device.waterSourceType}</p>
                      <p className="coordinates">
                        {device.lat.toFixed(4)}°N, {device.lon.toFixed(4)}°E
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-devices-message">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <p>No devices found</p>
              <p className="empty-subtitle">Select a location filter</p>
            </div>
          )}
        </div>

        {/* Right Side - Water Quality Assessment */}
        <div className="details-column">
          {selectedDevice ? (
            <div className="quality-assessment-section">
              <h2>Water Quality Assessment - {selectedDevice.deviceId}</h2>
              <WaterQualityCard deviceId={selectedDevice.deviceId} />
            </div>
          ) : (
            <div className="no-selection">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <h3>Select a Device</h3>
              <p>Choose a device from the list to view its water quality assessment</p>
            </div>
          )}
        </div>
      </div>



      <style jsx>{`
        .dashboard-header-new {
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          color: white;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          text-align: center;
          box-shadow: 0 4px 15px rgba(14, 165, 233, 0.2);
        }

        .dashboard-header-new h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2rem;
          font-weight: 600;
        }

        .subtitle {
          margin: 0.5rem 0;
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .region-info {
          margin: 0.5rem 0 0 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        /* Dashboard Layout */
        .dashboard-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 2rem;
          margin-top: 2rem;
        }

        /* Devices Column */
        .devices-column {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .devices-column h2 {
          margin: 0 0 1rem 0;
          color: #1e293b;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .device-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: calc(100vh - 250px);
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .device-list::-webkit-scrollbar {
          width: 6px;
        }

        .device-list::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .device-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .device-list::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        .no-devices-message {
          text-align: center;
          padding: 3rem 1.5rem;
          background: #f8fafc;
          border-radius: 12px;
          border: 2px dashed #cbd5e1;
        }

        .no-devices-message svg {
          color: #94a3b8;
          margin-bottom: 1rem;
        }

        .no-devices-message p {
          margin: 0.5rem 0;
          color: #64748b;
          font-weight: 500;
        }

        /* Details Column */
        .details-column {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .no-selection {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 4rem 2rem;
          background: #f8fafc;
          border-radius: 12px;
          border: 2px dashed #cbd5e1;
          min-height: 400px;
        }

        .no-selection svg {
          color: #94a3b8;
          margin-bottom: 1.5rem;
        }

        .no-selection h3 {
          margin: 0 0 0.5rem 0;
          color: #1e293b;
          font-size: 1.5rem;
        }

        .no-selection p {
          margin: 0;
          color: #64748b;
          max-width: 400px;
        }

        .device-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .device-card:hover {
          border-color: #0ea5e9;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);
          transform: translateY(-2px);
        }

        .device-card.selected {
          border-color: #0ea5e9;
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }

        .device-card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .device-icon {
          font-size: 0.7rem;
          font-weight: 700;
          background: rgba(14, 165, 233, 0.1);
          color: #0ea5e9;
          padding: 0.4rem 0.6rem;
          border-radius: 6px;
          letter-spacing: 0.5px;
        }

        .device-card-header h3 {
          margin: 0;
          flex: 1;
          font-size: 1.1rem;
          color: #333;
        }

        .verified-badge {
          background: #10b981;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .device-card-body {
          font-size: 0.9rem;
          color: #666;
        }

        .device-card-body p {
          margin: 0.5rem 0;
        }

        .device-card-body strong {
          color: #333;
        }

        .location-text {
          color: #0ea5e9;
          font-weight: 500;
          margin-left: 0.5rem;
        }

        .coordinates {
          font-size: 0.85rem;
          color: #999;
          margin-top: 0.75rem;
        }

        .quality-assessment-section {
          margin: 0;
        }

        .quality-assessment-section h2 {
          margin: 0 0 1.5rem 0;
          color: #1e293b;
          font-size: 1.5rem;
          font-weight: 600;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e5e7eb;
        }

        /* Mobile responsive */
        @media (max-width: 1200px) {
          .dashboard-layout {
            grid-template-columns: 1fr;
          }

          .device-list {
            max-height: 400px;
          }

          .readings-grid {
            max-height: 400px;
          }
        }

        @media (max-width: 768px) {
          .reading-values {
            grid-template-columns: 1fr;
          }
          
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .dashboard-header-new h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardUpdated;
