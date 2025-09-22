import type { LocationCoordinates } from '../types';

// Approximate coordinates for major streets in Sydney CBD
export const SYDNEY_LOCATIONS: LocationCoordinates = {
  'A001': { lat: -33.8688, lng: 151.2093, name: 'Bridge Street' },
  'A002': { lat: -33.8737, lng: 151.2098, name: 'Elizabeth Street' },
  'A003': { lat: -33.8730, lng: 151.2065, name: 'Market Street' },
  'A004': { lat: -33.8725, lng: 151.2070, name: 'Park Street' },
  // Additional locations can be added based on actual data
};

// Default map center point for Sydney CBD
export const SYDNEY_CENTER = {
  lat: -33.8688,
  lng: 151.2093,
  zoom: 15
};
