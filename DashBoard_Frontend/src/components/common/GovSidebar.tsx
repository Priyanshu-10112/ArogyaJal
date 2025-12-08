import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHome, 
    faDroplet, 
    faVirus, 
    faMapMarkedAlt, 
    faFileDownload, 
    faQuestionCircle 
} from '@fortawesome/free-solid-svg-icons';
import './GovSidebar.css';

const GovSidebar: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <aside className="gov-sidebar">
            <nav className="gov-nav">
                <div className="nav-section">
                    <h3 className="nav-section-title">Main Menu</h3>
                    <Link to="/" className={`gov-nav-link ${isActive('/') ? 'active' : ''}`}>
                        <FontAwesomeIcon icon={faHome} className="nav-icon" />
                        <span>Home Dashboard</span>
                    </Link>
                </div>

                <div className="nav-section">
                    <h3 className="nav-section-title">Water Quality Monitoring</h3>
                    <Link 
                        to="/water-quality/a1" 
                        className={`gov-nav-link ${isActive('/water-quality/a1') ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faDroplet} className="nav-icon" />
                        <span>A1 - Drinking Water Source</span>
                    </Link>
                    <Link 
                        to="/water-quality/a2" 
                        className={`gov-nav-link ${isActive('/water-quality/a2') ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faDroplet} className="nav-icon" />
                        <span>A2 - Outdoor Bathing</span>
                    </Link>
                    <Link 
                        to="/water-quality/a3" 
                        className={`gov-nav-link ${isActive('/water-quality/a3') ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faDroplet} className="nav-icon" />
                        <span>A3 - Drinking Water (Treatment)</span>
                    </Link>
                </div>

                <div className="nav-section">
                    <h3 className="nav-section-title">Disease Surveillance</h3>
                    <Link 
                        to="/disease-surveillance" 
                        className={`gov-nav-link ${isActive('/disease-surveillance') ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faVirus} className="nav-icon" />
                        <span>Outbreak Monitoring</span>
                    </Link>
                    <Link 
                        to="/ml-dashboard" 
                        className={`gov-nav-link ${isActive('/ml-dashboard') ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faVirus} className="nav-icon" />
                        <span>ML Predictions</span>
                    </Link>
                    <Link 
                        to="/alerts" 
                        className={`gov-nav-link ${isActive('/alerts') ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faVirus} className="nav-icon" />
                        <span>Active Alerts</span>
                    </Link>
                </div>

                <div className="nav-section">
                    <h3 className="nav-section-title">Geographic Information</h3>
                    <Link 
                        to="/gis-map" 
                        className={`gov-nav-link ${isActive('/gis-map') ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faMapMarkedAlt} className="nav-icon" />
                        <span>GIS Map View</span>
                    </Link>
                </div>

                <div className="nav-section">
                    <h3 className="nav-section-title">Reports & Data</h3>
                    <Link 
                        to="/reports" 
                        className={`gov-nav-link ${isActive('/reports') ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faFileDownload} className="nav-icon" />
                        <span>Reports and Downloads</span>
                    </Link>
                    <Link 
                        to="/trends" 
                        className={`gov-nav-link ${isActive('/trends') ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faFileDownload} className="nav-icon" />
                        <span>Trends Analysis</span>
                    </Link>
                </div>

                <div className="nav-section">
                    <h3 className="nav-section-title">Support</h3>
                    <Link 
                        to="/help" 
                        className={`gov-nav-link ${isActive('/help') ? 'active' : ''}`}
                    >
                        <FontAwesomeIcon icon={faQuestionCircle} className="nav-icon" />
                        <span>Help & Methodology</span>
                    </Link>
                </div>
            </nav>
        </aside>
    );
};

export default GovSidebar;
