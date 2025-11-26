/**
 * Water Quality Service
 * Connects to new government-standard water quality assessment API
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export interface WaterQualityResponse {
  finalStatus: 'GOOD' | 'MODERATE' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
  statusReason: string;
  parameterStatus: {
    pH: string;
    TDS: string;
    Turbidity: string;
    Temperature: string;
  };
  deviceHealth: {
    batteryVoltage: number | null;
    batteryStatus: 'NORMAL' | 'LOW' | 'CRITICAL' | 'NOT_REPORTING';
  };
  wqiScore?: number;
  latestReadings?: {
    pH: number | null;
    TDS: number | null;
    Turbidity: number | null;
    Temperature: number | null;
  };
}

export interface LocationHierarchy {
  states: string[];
  districts: string[];
  cities: string[];
  villages: string[];
}

export interface DeviceInfo {
  deviceId: string;
  state: string;
  district: string;
  cityOrTown: string;
  village: string;
  lat: number;
  lon: number;
  waterSourceType: string;
  verified: boolean;
}

/**
 * Fetch water quality assessment for a device
 */
export const getWaterQuality = async (deviceId: string): Promise<WaterQualityResponse> => {
  try {
    const response = await fetch(`${API_BASE}/api/sensor-data/water-quality/${deviceId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching water quality:', error);
    throw error;
  }
};

/**
 * Fetch all states with registered devices
 */
export const getStates = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/locations/states`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching states:', error);
    return [];
  }
};

/**
 * Fetch districts for a state
 */
export const getDistricts = async (state: string): Promise<string[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/locations/districts?state=${encodeURIComponent(state)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
};

/**
 * Fetch cities for a state and district
 */
export const getCities = async (state: string, district: string): Promise<string[]> => {
  try {
    const response = await fetch(
      `${API_BASE}/api/locations/cities?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

/**
 * Fetch villages for a location hierarchy (city is optional)
 */
export const getVillages = async (state: string, district: string, city?: string): Promise<string[]> => {
  try {
    const params = new URLSearchParams();
    params.append('state', state);
    params.append('district', district);
    if (city) {
      params.append('city', city);
    }
    
    const response = await fetch(`${API_BASE}/api/locations/villages?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching villages:', error);
    return [];
  }
};

/**
 * Fetch devices by location hierarchy (all parameters optional)
 */
export const getDevicesByLocation = async (
  state?: string,
  district?: string,
  city?: string,
  village?: string
): Promise<DeviceInfo[]> => {
  try {
    const params = new URLSearchParams();
    if (state) params.append('state', state);
    if (district) params.append('district', district);
    if (city) params.append('city', city);
    if (village) params.append('village', village);
    
    const url = `${API_BASE}/api/locations/devices${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching devices:', error);
    return [];
  }
};

/**
 * Get status configuration for UI display
 */
export const getStatusConfig = (status: string) => {
  const configs: Record<string, { label: string; color: string; badge: string }> = {
    GOOD: {
      label: 'Safe',
      color: '#10b981', // green
      badge: 'success'
    },
    MODERATE: {
      label: 'Needs Monitoring',
      color: '#f59e0b', // yellow
      badge: 'warning'
    },
    HIGH: {
      label: 'Unsafe',
      color: '#f97316', // orange
      badge: 'danger'
    },
    CRITICAL: {
      label: 'Dangerous – Do Not Drink',
      color: '#ef4444', // red
      badge: 'critical'
    },
    UNKNOWN: {
      label: 'Data Not Available',
      color: '#6b7280', // gray
      badge: 'secondary'
    },
    NOT_REPORTING: {
      label: 'Not reporting',
      color: '#9ca3af', // light gray
      badge: 'secondary'
    }
  };
  
  return configs[status] || configs.UNKNOWN;
};

/**
 * Get battery status configuration
 */
export const getBatteryConfig = (status: string) => {
  const configs: Record<string, { label: string; color: string }> = {
    NORMAL: {
      label: 'Normal',
      color: '#10b981' // green
    },
    LOW: {
      label: 'Low',
      color: '#f59e0b' // yellow
    },
    CRITICAL: {
      label: 'Critical',
      color: '#ef4444' // red
    },
    NOT_REPORTING: {
      label: 'Not reporting',
      color: '#6b7280' // gray
    }
  };
  
  return configs[status] || configs.NOT_REPORTING;
};
