import { useState, useEffect } from 'react';
import type { LocationData, ProcessedLocationData } from '../types';
import { processLocationData, getUniqueTimeStamps } from '../utils/dataProcessor';

export const useFootfallData = () => {
  const [rawData, setRawData] = useState<LocationData[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedLocationData[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/data.json');

        if (!response.ok) {
          throw new Error('Failed to load data');
        }

        const data: LocationData[] = await response.json();
        setRawData(data);

        const processed = processLocationData(data);
        setProcessedData(processed);

        const times = getUniqueTimeStamps(processed);
        setAvailableTimes(times);

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    rawData,
    processedData,
    availableTimes,
    isLoading,
    error
  };
};
