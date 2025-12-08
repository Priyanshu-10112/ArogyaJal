import React from 'react';
import './DiseaseSurveillance.css';

const DiseaseSurveillance: React.FC = () => {
    return (
        <div className="disease-surveillance">
            <div className="surveillance-header">
                <h1>Disease Surveillance & Outbreak Monitoring</h1>
                <p className="surveillance-subtitle">
                    Real-time monitoring of waterborne disease outbreaks and symptom clustering
                </p>
            </div>

            <div className="surveillance-content">
                <div className="alert-summary">
                    <div className="summary-card high">
                        <h3>High Risk Areas</h3>
                        <div className="count">0</div>
                        <p>Immediate attention required</p>
                    </div>
                    <div className="summary-card medium">
                        <h3>Medium Risk Areas</h3>
                        <div className="count">0</div>
                        <p>Monitoring required</p>
                    </div>
                    <div className="summary-card low">
                        <h3>Low Risk Areas</h3>
                        <div className="count">0</div>
                        <p>Normal surveillance</p>
                    </div>
                </div>

                <div className="surveillance-table-section">
                    <h2>Active Surveillance Zones</h2>
                    <table className="gov-table">
                        <thead>
                            <tr>
                                <th>S.No.</th>
                                <th>Location</th>
                                <th>Disease Type</th>
                                <th>Cases Reported</th>
                                <th>Risk Level</th>
                                <th>Last Updated</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                                    No active surveillance alerts at this time
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DiseaseSurveillance;
