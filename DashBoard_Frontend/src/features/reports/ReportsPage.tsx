import React, { useState } from 'react';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import { useReportDownload } from '../../hooks/useReportDownload';
import './ReportsPage.css';

const ReportsPage: React.FC = () => {
    const { filter } = useGlobalFilter();
    const { downloadReport, isGenerating, error } = useReportDownload();
    const [reportType] = useState('water-quality');
    const [dateRange] = useState('24h');

    const handleDownloadReport = async () => {
        await downloadReport({
            type: reportType,
            state: filter.state || undefined,
            district: filter.district || undefined,
            city: filter.city || undefined,
            village: filter.village || undefined,
            range: dateRange
        });
    };

    return (
        <div className="reports-page">
            <div className="reports-header">
                <h1>Reports and Downloads</h1>
                <p className="reports-subtitle">Generate and download comprehensive water quality and disease surveillance reports</p>
            </div>

            <div className="reports-grid">
                {/* Report Type Selection */}
                <div className="report-card">
                    <h3>📊 Water Quality Reports</h3>
                    <p>Comprehensive water quality assessment reports with sensor data and analysis</p>
                    <button className="download-btn" onClick={handleDownloadReport} disabled={isGenerating}>
                        {isGenerating ? 'Generating...' : 'Download PDF Report'}
                    </button>
                </div>

                <div className="report-card">
                    <h3>🦠 Disease Surveillance Reports</h3>
                    <p>Outbreak monitoring reports with symptom clustering and risk assessment</p>
                    <button className="download-btn">Download PDF Report</button>
                </div>

                <div className="report-card">
                    <h3>📈 Trends Analysis Reports</h3>
                    <p>Historical trends and statistical analysis of water quality parameters</p>
                    <button className="download-btn">Download PDF Report</button>
                </div>

                <div className="report-card">
                    <h3>📋 Compliance Reports</h3>
                    <p>Regulatory compliance reports based on WHO/BIS standards</p>
                    <button className="download-btn">Download PDF Report</button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
        </div>
    );
};

export default ReportsPage;
