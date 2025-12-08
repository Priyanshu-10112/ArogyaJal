import React from 'react';
import './GovHeader.css';

const GovHeader: React.FC = () => {
    return (
        <header className="gov-header">
            {/* Row 1: Main Header - Government Info + Scheme Info */}
            <div className="gov-header-main">
                {/* Left: Emblem Column */}
                <div className="gov-emblem-column">
                    <img 
                        src="/assets/emblem.svg" 
                        alt="National Emblem of India" 
                        className="national-emblem"
                    />
                </div>

                {/* Middle: Ministry & Title Column */}
                <div className="gov-title-column">
                    <h1 className="gov-title-hindi">जल गुणवत्ता निगरानी प्रणाली</h1>
                    <h2 className="gov-title-english">Water Quality Monitoring System</h2>
                    <p className="gov-ministry">Ministry of Jal Shakti | Department of Drinking Water and Sanitation</p>
                </div>

                {/* Right: Scheme & User Column */}
                <div className="gov-scheme-column">
                    <div className="scheme-info">
                        <div className="scheme-name">
                            <span className="scheme-hindi">आरोग्य जल</span>
                            <span className="scheme-english">ArogyaJal</span>
                        </div>
                        <p className="scheme-tagline">Real-time Water Quality & Disease Outbreak Monitoring</p>
                        <span className="region-badge">North East India Region</span>
                    </div>
                </div>
            </div>

            {/* Row 2: Navigation Bar */}
            <div className="gov-header-nav">
                <div className="nav-links">
                    <a href="https://jalshakti-ddws.gov.in" target="_blank" rel="noopener noreferrer">
                        Ministry Website
                    </a>
                    <a href="#help">Help</a>
                    <a href="#contact">Contact</a>
                    <a href="#sitemap">Sitemap</a>
                </div>
                <div className="user-badge">
                    <span className="user-icon">👤</span>
                    <span className="user-name">Admin User</span>
                </div>
            </div>
        </header>
    );
};

export default GovHeader;
