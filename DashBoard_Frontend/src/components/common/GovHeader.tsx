import React from 'react';
import './GovHeader.css';

const GovHeader: React.FC = () => {
    return (
        <header className="gov-header">
            <div className="gov-header-container">
                {/* Left: Emblem + Identity */}
                <div className="gov-header-identity">
                    <img 
                        src="/assets/emblem.svg" 
                        alt="National Emblem of India" 
                        className="national-emblem"
                    />
                    <div className="gov-identity-text">
                        <h1 className="gov-system-title">
                            जल गुणवत्ता निगरानी प्रणाली | Water Quality Monitoring System
                        </h1>
                        <p className="gov-ministry-line">
                            Ministry of Jal Shakti — Department of Drinking Water & Sanitation
                        </p>
                    </div>
                </div>

                {/* Right: Utility Links + User */}
                <div className="gov-header-actions">
                    <nav className="gov-utility-links" aria-label="Utility Navigation">
                        <a href="https://jalshakti-ddws.gov.in" target="_blank" rel="noopener noreferrer" className="utility-link">Ministry Website</a>
                        <a href="#help" className="utility-link">Help</a>
                        <a href="#contact" className="utility-link">Contact</a>
                        <a href="#sitemap" className="utility-link">Sitemap</a>
                    </nav>
                    <div className="gov-user-badge">
                        <svg className="user-icon" width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                        </svg>
                        <div className="user-info">
                            <span className="user-name">Admin User</span>
                            <span className="user-designation">System Administrator</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default GovHeader;
