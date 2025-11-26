import React, { useEffect, useState } from 'react';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import { getStates, getDistricts, getCities, getVillages, getDevicesByLocation, DeviceInfo } from '../../services/waterQuality.service';
import './LocationFilter.css';

interface LocationFilterProps {
  onDevicesChange: (devices: DeviceInfo[]) => void;
  onBreadcrumbChange: (breadcrumb: string[]) => void;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ onDevicesChange, onBreadcrumbChange }) => {
  const { filter, updateFilter, resetFilter, isFieldLocked } = useGlobalFilter();

  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [villages, setVillages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  // Sync local state with global filter
  const selectedState = filter.state || '';
  const selectedDistrict = filter.district || '';
  const selectedCity = filter.city || '';
  const selectedVillage = filter.village || '';

  // Load states on mount
  useEffect(() => {
    loadStates();
  }, []);

  // Update breadcrumb whenever selection changes
  useEffect(() => {
    const breadcrumb: string[] = [];
    if (selectedState) breadcrumb.push(selectedState);
    if (selectedDistrict) breadcrumb.push(selectedDistrict);
    if (selectedCity) breadcrumb.push(selectedCity);
    if (selectedVillage) breadcrumb.push(selectedVillage);
    onBreadcrumbChange(breadcrumb);
  }, [selectedState, selectedDistrict, selectedCity, selectedVillage]);

  // Load devices whenever filters change
  useEffect(() => {
    loadDevices();
  }, [selectedState, selectedDistrict, selectedCity, selectedVillage]);

  const loadStates = async () => {
    setLoading(true);
    try {
      const data = await getStates();
      setStates(data);
    } catch (error) {
      console.error('Error loading states:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDevices = async () => {
    try {
      const devices = await getDevicesByLocation(
        selectedState || undefined,
        selectedDistrict || undefined,
        selectedCity || undefined,
        selectedVillage || undefined
      );
      onDevicesChange(devices);
    } catch (error) {
      console.error('Error loading devices:', error);
      onDevicesChange([]);
    }
  };

  const handleStateChange = async (state: string) => {
    updateFilter('state', state || null);
    setDistricts([]);
    setCities([]);
    setVillages([]);

    if (state) {
      setLoading(true);
      try {
        const data = await getDistricts(state);
        setDistricts(data);
      } catch (error) {
        console.error('Error loading districts:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDistrictChange = async (district: string) => {
    updateFilter('district', district || null);
    setCities([]);
    setVillages([]);

    if (district && selectedState) {
      setLoading(true);
      try {
        const data = await getCities(selectedState, district);
        setCities(data);

        // If no cities found, load villages directly
        if (data.length === 0) {
          console.log('No cities found, loading villages directly for district:', district);
          const villageData = await getVillages(selectedState, district);
          setVillages(villageData);
        }
      } catch (error) {
        console.error('Error loading cities:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCityChange = async (city: string) => {
    updateFilter('city', city || null);
    setVillages([]);

    if (selectedState && selectedDistrict) {
      setLoading(true);
      try {
        // Load villages with or without city
        const data = await getVillages(selectedState, selectedDistrict, city || undefined);
        setVillages(data);
      } catch (error) {
        console.error('Error loading villages:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVillageChange = (village: string) => {
    updateFilter('village', village || null);
  };

  const handleClearFilters = () => {
    resetFilter();
    setDistricts([]);
    setCities([]);
    setVillages([]);
  };

  return (
    <div className="location-filter">
      <div className="filter-header">
        <h3>📍 Filter by Location</h3>
        {(selectedState || selectedDistrict || selectedCity || selectedVillage) && (
          <button className="clear-button" onClick={handleClearFilters}>
            Clear Filters
          </button>
        )}
      </div>

      <div className="filter-grid">
        {/* State Dropdown */}
        <div className="filter-item">
          <label htmlFor="state-select">
            State {isFieldLocked('state') && <span className="lock-icon">🔒</span>}
          </label>
          <select
            id="state-select"
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            disabled={loading || isFieldLocked('state')}
            className={isFieldLocked('state') ? 'locked-field' : ''}
          >
            <option value="">All States</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>

        {/* District Dropdown */}
        <div className="filter-item">
          <label htmlFor="district-select">
            District {isFieldLocked('district') && <span className="lock-icon">🔒</span>}
          </label>
          <select
            id="district-select"
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={!selectedState || loading || isFieldLocked('district')}
            className={isFieldLocked('district') ? 'locked-field' : ''}
          >
            <option value="">All Districts</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        {/* City/Town Dropdown */}
        <div className="filter-item">
          <label htmlFor="city-select">
            City/Town {isFieldLocked('city') && <span className="lock-icon">🔒</span>}
            {selectedDistrict && cities.length === 0 && !loading && (
              <span style={{ fontSize: '11px', color: '#6b7280', marginLeft: '5px' }}>
                (No cities - skip to villages)
              </span>
            )}
          </label>
          <select
            id="city-select"
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={!selectedDistrict || loading || isFieldLocked('city')}
            className={isFieldLocked('city') ? 'locked-field' : ''}
          >
            <option value="">All Cities/Towns</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Village Dropdown */}
        <div className="filter-item">
          <label htmlFor="village-select">
            Village {isFieldLocked('village') && <span className="lock-icon">🔒</span>}
          </label>
          <select
            id="village-select"
            value={selectedVillage}
            onChange={(e) => handleVillageChange(e.target.value)}
            disabled={!selectedDistrict || loading || isFieldLocked('village')}
            className={isFieldLocked('village') ? 'locked-field' : ''}
          >
            <option value="">All Villages</option>
            {villages.map((village) => (
              <option key={village} value={village}>
                {village}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="filter-loading">
          <span>Loading...</span>
        </div>
      )}
    </div>
  );
};

export default LocationFilter;
