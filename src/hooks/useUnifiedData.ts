import { useState, useEffect, useCallback } from 'react';
import { useFootfallData } from './useFootfallData';

// Define air quality device type
export interface AirQualityDevice {
  code: string;
  name: string;
  description: string;
  coordinates: [number, number];
  data: {
    'PM2.5'?: number;
    'TEMP'?: number;
  };
}

// Define time point data
export interface UnifiedTimePoint {
  timestamp: Date;
  airQualityDevices: AirQualityDevice[];
  pedestrianData: any[];
}

// Define unified data interface
export interface UnifiedData {
  timePoints: UnifiedTimePoint[];
  totalTimePoints: number;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export interface UseUnifiedDataReturn {
  data: UnifiedData | null;
  loading: boolean;
  error: string | null;
  currentTimeIndex: number;
  setCurrentTimeIndex: (index: number) => void;
  currentTimePoint: UnifiedTimePoint | null;
  play: () => void;
  pause: () => void;
  isPlaying: boolean;
  speed: number;
  setSpeed: (speed: number) => void;
}

export function useUnifiedData(): UseUnifiedDataReturn {
  const [data, setData] = useState<UnifiedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Get pedestrian data
  const {
    processedData: footfallData,
    availableTimes: footfallAvailableTimes,
    isLoading: footfallLoading,
    error: footfallError
  } = useFootfallData();

  // Mock air quality data (based on real device locations) - reduce device count for better performance
  const mockAirQualityDevices: AirQualityDevice[] = [
    {
      code: '15',
      name: 'ALEXANDRIA',
      description: 'Sydney East - ALEXANDRIA',
      coordinates: [151.1972670, -33.9053170],
      data: {
        'PM2.5': 15.5,
        'TEMP': 22.3
      }
    },
    {
      code: '1001',
      name: 'COOK AND PHILLIP',
      description: 'Sydney East - COOK AND PHILLIP',
      coordinates: [151.2132300, -33.8728800],
      data: {
        'PM2.5': 12.8,
        'TEMP': 21.7
      }
    },
    {
      code: '107',
      name: 'LIVERPOOL',
      description: 'Sydney South-west - LIVERPOOL',
      coordinates: [150.9072700, -33.9313200],
      data: {
        'PM2.5': 18.2,
        'TEMP': 23.1
      }
    }
  ];

  // Process data, focusing only on October to December 2024 data
  useEffect(() => {
    if (footfallLoading) return;

    const processData = () => {
      setLoading(true);
      setError(null);

      try {
        // Filter data for October to December 2024
        const filteredTimes = footfallAvailableTimes.filter(timeStr => {
          const date = new Date(timeStr);
          const year = date.getFullYear();
          const month = date.getMonth() + 1; // getMonth() returns 0-11
          return year === 2024 && month >= 10 && month <= 12;
        });

        console.log(`Original time points: ${footfallAvailableTimes.length}`);
        console.log(`October-December 2024 time points: ${filteredTimes.length}`);

        // For performance, further limit data volume - only take a few time points per day
        const sampledTimes = filteredTimes.filter((_, index) => {
          // Take one data point every 8 hours to further reduce data volume
          return index % 8 === 0;
        });

        console.log(`Sampled time points: ${sampledTimes.length}`);

        // Use filtered time points as the base
        const timePoints: UnifiedTimePoint[] = sampledTimes.map((timeStr, index) => {
          const timestamp = new Date(timeStr);
          
          // Get pedestrian data for this time point
          const pedestrianData = footfallData.filter((item: any) => item.Date === timeStr);
          
          // Add some time variation to air quality data (simulation)
          const timeVariation = Math.sin(index * 0.1) * 5; // Simple sine wave variation
          const airQualityDevices = mockAirQualityDevices.map(device => ({
            ...device,
            data: {
              'PM2.5': Math.max(0, (device.data['PM2.5'] || 0) + timeVariation),
              'TEMP': (device.data['TEMP'] || 0) + (Math.random() - 0.5) * 2
            }
          }));

          return {
            timestamp,
            airQualityDevices,
            pedestrianData
          };
        });

        const unifiedData: UnifiedData = {
          timePoints,
          totalTimePoints: timePoints.length,
          dateRange: {
            start: timePoints[0]?.timestamp || null,
            end: timePoints[timePoints.length - 1]?.timestamp || null
          }
        };

        setData(unifiedData);
        setCurrentTimeIndex(0);
        
        console.log('Unified data loading completed:', unifiedData);
        console.log(`Data range: ${unifiedData.dateRange.start?.toLocaleDateString()} to ${unifiedData.dateRange.end?.toLocaleDateString()}`);
      } catch (err) {
        console.error('Data processing error:', err);
        setError('Data processing failed');
      } finally {
        setLoading(false);
      }
    };

    if (footfallAvailableTimes.length > 0) {
      processData();
    } else if (footfallError) {
      setError(footfallError);
      setLoading(false);
    }
  }, [footfallData, footfallAvailableTimes, footfallLoading, footfallError]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || !data || data.timePoints.length === 0) return;

    const interval = setInterval(() => {
      setCurrentTimeIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= data.timePoints.length) {
          setIsPlaying(false);
          return 0; // Return to start
        }
        return nextIndex;
      });
    }, 1000 / speed); // Adjust interval based on speed

    return () => clearInterval(interval);
  }, [isPlaying, data, speed]);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const currentTimePoint = data ? data.timePoints[currentTimeIndex] : null;

  return {
    data,
    loading: loading || footfallLoading,
    error: error || footfallError,
    currentTimeIndex,
    setCurrentTimeIndex,
    currentTimePoint,
    play,
    pause,
    isPlaying,
    speed,
    setSpeed
  };
}
