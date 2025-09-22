import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import type { ProcessedLocationData } from '../types';
import 'leaflet/dist/leaflet.css';
import './Map.css';

interface MapProps {
  data: ProcessedLocationData[];
  center: { lat: number; lng: number };
  zoom: number;
}

const Map: React.FC<MapProps> = ({ data, center, zoom }) => {
  // Memoize calculations for better performance
  const { maxCount, markers } = useMemo(() => {
    const maxCount = Math.max(...data.map(d => d.parsedCount), 1);

    // Pre-calculate marker styles
    const getMarkerStyle = (count: number) => {
      const normalizedCount = count / maxCount;
      const size = Math.max(8, normalizedCount * 40 + 5); // Dynamic sizing: 8-45px

      // Enhanced color gradient (green -> yellow -> red)
      const intensity = normalizedCount;
      let red, green, blue;

      if (intensity < 0.5) {
        // Green to yellow
        red = Math.floor(intensity * 2 * 255);
        green = 255;
        blue = 0;
      } else {
        // Yellow to red
        red = 255;
        green = Math.floor((1 - intensity) * 2 * 255);
        blue = 0;
      }

      return {
        radius: size,
        fillColor: `rgb(${red}, ${green}, ${blue})`,
        color: '#fff',
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.7
      };
    };

    const markers = data.map((location, index) => ({
      location,
      style: getMarkerStyle(location.parsedCount),
      key: `${location.Location_code}-${location.Date}-${index}`
    }));

    return { maxCount, markers };
  }, [data]);

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

      {markers.map(({ location, style, key }) => (
        <CircleMarker
          key={key}
          center={[location.coordinates.lat, location.coordinates.lng]}
          {...style}
        >
          <Popup>
              <div className="popup-content">
                <h3>{location.Location_Name}</h3>
                <p><strong>Current Count:</strong> {parseInt(location.TotalCount).toLocaleString()}</p>
                <p><strong>Location Code:</strong> {location.Location_code}</p>
                <p><strong>Date:</strong> {new Date(location.Date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {location.Hour}:00 ({location.Day})</p>
                <p><strong>Last Week:</strong> {parseInt(location.LastWeek).toLocaleString()}</p>
              </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default Map;
