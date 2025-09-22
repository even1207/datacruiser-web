import type { LocationData, ProcessedLocationData } from '../types';
import { SYDNEY_LOCATIONS } from '../data/locationCoordinates';

export const processLocationData = (data: LocationData[]): ProcessedLocationData[] => {
  return data.map(item => {
    const parsedCount = parseInt(item.TotalCount, 10);

    return {
      ...item,
      coordinates: SYDNEY_LOCATIONS[item.Location_code] || { lat: -33.8688, lng: 151.2093 },
      parsedCount: isNaN(parsedCount) ? 0 : parsedCount,
      timestamp: new Date(item.Date)
    };
  });
};

export const getUniqueTimeStamps = (data: ProcessedLocationData[]): string[] => {
  const uniqueTimes = new Set(data.map(item => item.Date));
  return Array.from(uniqueTimes).sort();
};

export const filterDataByTime = (data: ProcessedLocationData[], targetTime: string): ProcessedLocationData[] => {
  return data.filter(item => item.Date === targetTime);
};

export const getTimeRange = (data: ProcessedLocationData[]): { start: Date; end: Date } => {
  if (data.length === 0) {
    return { start: new Date(), end: new Date() };
  }

  const timestamps = data.map(item => item.timestamp);
  return {
    start: new Date(Math.min(...timestamps.map(t => t.getTime()))),
    end: new Date(Math.max(...timestamps.map(t => t.getTime())))
  };
};
