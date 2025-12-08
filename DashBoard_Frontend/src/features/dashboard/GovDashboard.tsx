import React, { useState, useEffect, useCallback } from 'react';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import { DeviceInfo, getDevicesByLocation } from '../../services/waterQuality.service';
import WaterQualityCard from '../../components/WaterQualityCard';
import './GovDashboard.css';

const GovDashboard: React.FC = () => {
    const { filter } = useGlobalFilter();
    const [devices, setDevices] = useState<DeviceInfo[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<DeviceInfo | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchDevices = useCallback(async () => {
        setLoading(true);
        try {
            const fetchedDevices = await getDevicesByLocation(
                filter.state || undefined,
                filter.district || undefined,
                filter.city || undefined,
                filter.village || undefined
            );
            setDevices(fetchedDevices);
        } catch (error) {
            console.error('Error fetching devices:', error);
        } finally {
            setLoading(false);
        }
    }, [filter.state, filter.district, filter.city, filter.village]);

    useEffect(() => {
        fetchDevices();
    }, [fetchDevices]);

    const kpiData = {
        totalStations: devices.length,
        activeStations: devices.filter(d => d.verified).length,
        criticalAlerts: 0,
        avgWQI: 0
    };

    return (
        <div className="gov-dashboard">
            <div className="dashboard-header-gov">
                <h1>Water Quality Monitoring Dashboard</h1>
                <p className="dashboard-subtitle">Real-time monitoring of water quality across North East India</p>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon">📊</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{kpiData.totalStations}</div>
                        <div className="kpi-label">Total Monitoring Stations</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon">✅</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{kpiData.activeStations}</div>
                        <div className="kpi-label">Active Stations</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon">⚠️</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{kpiData.criticalAlerts}</div>
                        <div className="kpi-label">Critical Alerts</div>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon">💧</div>
                    <div className="kpi-content">
                        <div className="kpi-value">{kpiData.avgWQI.toFixed(1)}</div>
                        <div className="kpi-label">Average WQI</div>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="map-section">
                <h2>Geographic Distribution</h2>
                <div className="map-placeholder">
                    <p>🗺️ Interactive Map View</p>
                    <p className="map-note">Map showing all monitoring stations will be displayed here</p>
                </div>
            </div>

            {/* Data Table */}
            <div className="data-table-section">
                <h2>Monitoring Stations ({devices.length})</h2>
                {loading ? (
                    <div className="loading-state">Loading stations...</div>
                ) : (
                    <table className="gov-table">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Device ID</th>
                                <th>Location</th>
                                <th>Source Type</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.length > 0 ? (
                                devices.map((device, index) => (
                                    <tr key={device.deviceId}>
                                        <td>{index + 1}</td>
                                        <td className="device-id-cell">{device.deviceId}</td>
                                        <td>{device.village}, {device.district}, {device.state}</td>
                                        <td>{device.waterSourceType}</td>
                                        <td>
                                            <span className={`status-badge ${device.verified ? 'active' : 'inactive'}`}>
                                                {device.verified ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="view-btn"
                                                onClick={() => setSelectedDevice(device)}
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                                        No monitoring stations found. Please adjust filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal for Device Details */}
            {selectedDevice && (
                <div className="modal-overlay" onClick={() => setSelectedDevice(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Water Quality Details - {selectedDevice.deviceId}</h2>
                            <button className="close-btn" onClick={() => setSelectedDevice(null)}>×</button>
                        </div>
                        <div className="modal-body">
                            <WaterQualityCard deviceId={selectedDevice.deviceId} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GovDashboard;
