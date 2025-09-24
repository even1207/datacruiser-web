// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5080',
  ENDPOINTS: {
    LOCATIONS: '/locations',
    DEVICES: '/devices',
    SENSORS: '/sensors'
  }
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string, params?: Record<string, string>) => {
  const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  return url.toString();
};
