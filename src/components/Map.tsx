import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import type { ProcessedLocationData } from '../types';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Define types locally
interface AirQualityDevice {
  code: string;
  name: string;
  description: string;
  coordinates: [number, number];
  data: {
    'PM2.5'?: number;
    'TEMP'?: number;
  };
}

interface UnifiedTimePoint {
  timestamp: Date;
  airQualityDevices: AirQualityDevice[];
  pedestrianData: ProcessedLocationData[];
}

interface MapProps {
  unifiedData: UnifiedTimePoint | null;
  center: { lat: number; lng: number };
  zoom: number;
  showAirQuality: boolean;
  showPedestrian: boolean;
}

// Legend component that scales with map zoom
const Legend: React.FC<{ showAirQuality: boolean; showPedestrian: boolean }> = ({ 
  showAirQuality, 
  showPedestrian 
}) => {
  const map = useMap();
  const [zoom, setZoom] = React.useState(map.getZoom());

  React.useEffect(() => {
    const updateZoom = () => setZoom(map.getZoom());
    map.on('zoom', updateZoom);
    return () => {
      map.off('zoom', updateZoom);
    };
  }, [map]);

  // Calculate scale factor based on zoom level
  const scaleFactor = Math.max(0.7, Math.min(1.5, zoom / 10));
  const fontSize = Math.max(10, 14 * scaleFactor);
  const iconSize = Math.max(12, 16 * scaleFactor);
  const padding = Math.max(8, 12 * scaleFactor);

  return (
    <div 
      className="map-legend"
      style={{
        fontSize: `${fontSize}px`,
        padding: `${padding}px`,
        transform: `scale(${scaleFactor})`,
        transformOrigin: 'bottom left'
      }}
    >
      <h4 style={{ margin: '0 0 8px 0', fontSize: `${fontSize + 2}px` }}>Legend</h4>
      
      {showAirQuality && (
        <div className="legend-section">
          <h5 style={{ margin: '4px 0', fontSize: `${fontSize}px` }}>🌬️ Air Quality (PM2.5)</h5>
          <div className="legend-item">
            <div 
              className="legend-color" 
              style={{ 
                width: `${iconSize}px`, 
                height: `${iconSize}px`,
                backgroundColor: 'rgb(0, 255, 0)'
              }}
            ></div>
            <span>Good (0-12 μg/m³)</span>
          </div>
          <div className="legend-item">
            <div 
              className="legend-color" 
              style={{ 
                width: `${iconSize}px`, 
                height: `${iconSize}px`,
                backgroundColor: 'rgb(255, 255, 0)'
              }}
            ></div>
            <span>Moderate (12-35 μg/m³)</span>
          </div>
          <div className="legend-item">
            <div 
              className="legend-color" 
              style={{ 
                width: `${iconSize}px`, 
                height: `${iconSize}px`,
                backgroundColor: 'rgb(255, 165, 0)'
              }}
            ></div>
            <span>Unhealthy for Sensitive (35-55 μg/m³)</span>
          </div>
          <div className="legend-item">
            <div 
              className="legend-color" 
              style={{ 
                width: `${iconSize}px`, 
                height: `${iconSize}px`,
                backgroundColor: 'rgb(255, 0, 0)'
              }}
            ></div>
            <span>Unhealthy (55+ μg/m³)</span>
          </div>
        </div>
      )}
      
      {showPedestrian && (
        <div className="legend-section">
          <h5 style={{ margin: '4px 0', fontSize: `${fontSize}px` }}>🚶 Pedestrian Count</h5>
          <div className="legend-item">
            <div 
              className="legend-color" 
              style={{ 
                width: `${iconSize}px`, 
                height: `${iconSize}px`,
                backgroundColor: 'rgb(0, 100, 255)'
              }}
            ></div>
            <span>Low density</span>
          </div>
          <div className="legend-item">
            <div 
              className="legend-color" 
              style={{ 
                width: `${iconSize}px`, 
                height: `${iconSize}px`,
                backgroundColor: 'rgb(100, 150, 255)'
              }}
            ></div>
            <span>Medium density</span>
          </div>
          <div className="legend-item">
            <div 
              className="legend-color" 
              style={{ 
                width: `${iconSize}px`, 
                height: `${iconSize}px`,
                backgroundColor: 'rgb(255, 100, 0)'
              }}
            ></div>
            <span>High density</span>
          </div>
        </div>
      )}
    </div>
  );
};

const Map: React.FC<MapProps> = ({ unifiedData, center, zoom, showAirQuality, showPedestrian }) => {
  // Memoize calculations for better performance
  const { airQualityMarkers, pedestrianMarkers } = useMemo(() => {
    // Process Air Quality Data
    let airQualityMarkers: any[] = [];
    if (showAirQuality && unifiedData && unifiedData.airQualityDevices.length > 0) {
      // Get max PM2.5 value for normalization
      const pm25Values = unifiedData.airQualityDevices
        .map((d: AirQualityDevice) => d.data['PM2.5'])
        .filter((v: number | undefined) => v !== undefined) as number[];
      const maxPM25 = pm25Values.length > 0 ? Math.max(...pm25Values) : 1;

      // Get max TEMP value for normalization
      const tempValues = unifiedData.airQualityDevices
        .map((d: AirQualityDevice) => d.data['TEMP'])
        .filter((v: number | undefined) => v !== undefined) as number[];
      const maxTemp = tempValues.length > 0 ? Math.max(...tempValues) : 1;

      // Pre-calculate marker styles based on air quality values
      const getAirQualityMarkerStyle = (device: AirQualityDevice) => {
        // Use PM2.5 as primary indicator, fallback to TEMP
        const pm25Value = device.data['PM2.5'];
        const tempValue = device.data['TEMP'];
        
        if (pm25Value !== undefined) {
          // PM2.5 color coding (green -> yellow -> orange -> red)
          let red, green, blue;
          
          if (pm25Value <= 12) {
            // Good (0-12 μg/m³) - Green
            red = 0; green = 255; blue = 0;
          } else if (pm25Value <= 35) {
            // Moderate (12-35 μg/m³) - Yellow
            red = 255; green = 255; blue = 0;
          } else if (pm25Value <= 55) {
            // Unhealthy for sensitive groups (35-55 μg/m³) - Orange
            red = 255; green = 165; blue = 0;
          } else {
            // Unhealthy (55+ μg/m³) - Red
            red = 255; green = 0; blue = 0;
          }
          
          // Size based on PM2.5 value
          const size = Math.max(8, Math.min(40, pm25Value / maxPM25 * 30 + 8));
          
          return {
            radius: size,
            fillColor: `rgb(${red}, ${green}, ${blue})`,
            color: '#fff',
            weight: 2,
            opacity: 0.9,
            fillOpacity: 0.7
          };
        } else if (tempValue !== undefined) {
          // Temperature color coding (blue -> red gradient)
          const normalizedTemp = tempValue / maxTemp;
          const red = Math.floor(normalizedTemp * 255);
          const green = Math.floor((1 - normalizedTemp) * 100);
          const blue = Math.floor((1 - normalizedTemp) * 255);
          
          // Size based on temperature
          const size = Math.max(8, Math.min(30, normalizedTemp * 20 + 8));
          
          return {
            radius: size,
            fillColor: `rgb(${red}, ${green}, ${blue})`,
            color: '#fff',
            weight: 2,
            opacity: 0.9,
            fillOpacity: 0.7
          };
        } else {
          // Default style for devices with no data
          return {
            radius: 8,
            fillColor: 'rgb(128, 128, 128)',
            color: '#fff',
            weight: 2,
            opacity: 0.9,
            fillOpacity: 0.7
          };
        }
      };

      airQualityMarkers = unifiedData.airQualityDevices.map((device: AirQualityDevice, index: number) => ({
        device,
        style: getAirQualityMarkerStyle(device),
        key: `air-${device.code}-${index}`,
        type: 'airQuality'
      }));
    }

    // Process Pedestrian Data
    let pedestrianMarkers: any[] = [];
    if (showPedestrian && unifiedData && unifiedData.pedestrianData.length > 0) {
      // Get max pedestrian count for normalization
      const maxPedestrianCount = Math.max(...unifiedData.pedestrianData.map(p => p.parsedCount));

      const getPedestrianMarkerStyle = (count: number) => {
        const normalizedValue = count / maxPedestrianCount;
        const size = Math.max(10, normalizedValue * 40 + 10); // Dynamic sizing: 10-50px

        // Pedestrian color coding (blue gradient)
        const intensity = Math.min(normalizedValue, 1);
        const red = Math.floor(intensity * 100);
        const green = Math.floor(intensity * 150);
        const blue = 255;

        return {
          radius: size,
          fillColor: `rgb(${red}, ${green}, ${blue})`,
          color: '#fff',
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.7
        };
      };

      pedestrianMarkers = unifiedData.pedestrianData.map((location, index) => ({
        location,
        style: getPedestrianMarkerStyle(location.parsedCount),
        key: `pedestrian-${location.Location_code}-${index}`,
        type: 'pedestrian'
      }));
    }

    return { airQualityMarkers, pedestrianMarkers };
  }, [unifiedData, showAirQuality, showPedestrian]);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      className="map-container"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Legend component */}
      <Legend showAirQuality={showAirQuality} showPedestrian={showPedestrian} />

      {/* Render Air Quality Markers */}
      {airQualityMarkers.map(({ device, style, key }) => {
        const [lng, lat] = device.coordinates;
        
        return (
          <CircleMarker
            key={key}
            center={[lat, lng]}
            {...style}
          >
            <Popup>
              <div className="popup-content">
                <h3>🌬️ Air Quality Device {device.code}</h3>
                <p><strong>Name:</strong> {device.name}</p>
                <p><strong>Description:</strong> {device.description}</p>
                <p><strong>Timestamp:</strong> {unifiedData?.timestamp.toLocaleString()}</p>
                <div style={{ marginTop: '10px' }}>
                  <h4>Sensor Readings:</h4>
                  {device.data['PM2.5'] !== undefined && (
                    <p style={{ margin: '2px 0', fontSize: '12px' }}>
                      <strong>PM2.5:</strong> {device.data['PM2.5'].toFixed(2)} μg/m³
                    </p>
                  )}
                  {device.data['TEMP'] !== undefined && (
                    <p style={{ margin: '2px 0', fontSize: '12px' }}>
                      <strong>Temperature:</strong> {device.data['TEMP'].toFixed(2)} °C
                    </p>
                  )}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}

      {/* Render Pedestrian Markers */}
      {pedestrianMarkers.map(({ location, style, key }) => {
        const coordinates = location.coordinates || { lat: -33.8688, lng: 151.2093 }; // Default to Sydney
        
        return (
          <CircleMarker
            key={key}
            center={[coordinates.lat, coordinates.lng]}
            {...style}
          >
            <Popup>
              <div className="popup-content">
                <h3>🚶 Pedestrian Count - {location.Location_Name}</h3>
                <p><strong>Location Code:</strong> {location.Location_code}</p>
                <p><strong>Current Count:</strong> {location.parsedCount.toLocaleString()}</p>
                <p><strong>Date:</strong> {new Date(location.Date).toLocaleString()}</p>
                <p><strong>Hour:</strong> {location.Hour}:00</p>
                <p><strong>Day:</strong> {location.Day}</p>
                <div style={{ marginTop: '10px' }}>
                  <h4>Historical Data:</h4>
                  <p style={{ margin: '2px 0', fontSize: '12px' }}>
                    <strong>Last Week:</strong> {location.LastWeek}
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '12px' }}>
                    <strong>4-Day Average:</strong> {location.Previous4DayTimeAvg}
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '12px' }}>
                    <strong>Last Year:</strong> {location.LastYear}
                  </p>
                  <p style={{ margin: '2px 0', fontSize: '12px' }}>
                    <strong>52-Day Average:</strong> {location.Previous52DayTimeAvg}
                  </p>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
};

export default Map;
