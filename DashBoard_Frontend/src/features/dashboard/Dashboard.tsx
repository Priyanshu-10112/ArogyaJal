import React, { useState, useEffect } from 'react';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import LocationFilter from '../../features/filters/LocationFilter';
import WaterQualityCard from '../../components/WaterQualityCard';
import { DeviceInfo, getDevicesByLocation } from '../../services/waterQuality.service';
import '../../App.css';

const DashboardUpdated: React.FC = () => {
  const { filter, updateFilter } = useGlobalFilter();
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);

  // Fetch devices based on global filter
  useEffect(() => {
    fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    }
  };

  const handleDevicesChange = (newDevices: DeviceInfo[]) => {
    setDevices(newDevices);

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
                      {device.lat && device.lon && (
                        <p className="coordinates">
                          {device.lat.toFixed(4)}°N, {device.lon.toFixed(4)}°E
                        </p>
                      )}
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





    </div>
  );
};

export default DashboardUpdated;
