# Air Quality Data Polling Setup

This application now supports continuous polling of air quality data from a backend API and plays it like a recording with time-based progression.

## Features

- **Continuous Data Polling**: Automatically fetches air quality data from `GET /locations?time=2025-07-04` endpoint
- **Time-based Playback**: Plays historical data like a recording with adjustable speed
- **Real-time Visualization**: Displays air quality readings on an interactive map
- **Multiple Sensor Support**: Shows PM2.5, NO, NO2, OZONE, PM10 readings
- **Interactive Controls**: Play/pause, speed control, and time scrubbing

## Backend API Requirements

The application expects a backend API running on `http://localhost:5080` with the following endpoint:

```
GET /locations?time={timestamp}
```

### Expected Response Format

```json
{
  "readings": [
    {
      "deviceCode": "1570",
      "sensorCode": "PM2.5",
      "timestamp": "2025-07-04T10:00:00+10:00",
      "value": 12.5,
      "unit": "μg/m³",
      "deviceName": "OAKDALE",
      "coordinates": {
        "lat": -34.0517,
        "lng": 150.4982
      }
    }
  ],
  "availableTimes": [
    "2025-07-04T00:00:00+10:00",
    "2025-07-04T01:00:00+10:00",
    "2025-07-04T02:00:00+10:00"
  ],
  "devices": [
    {
      "code": "1570",
      "name": "OAKDALE",
      "coordinates": {
        "lat": -34.0517,
        "lng": 150.4982
      },
      "sensors": ["NO", "NO2", "OZONE", "PM10", "PM2.5"]
    }
  ]
}
```

## Usage

1. **Start the Backend**: Ensure your backend API is running on `localhost:5080`
2. **Start the Frontend**: Run `npm start` in the project directory
3. **Play Historical Data**: Use the time controller to play/pause and adjust speed
4. **View Data**: Air quality readings are displayed as colored markers on the map
5. **Interact**: Click markers to see detailed sensor readings

## Color Coding

- **Green**: Good air quality (PM2.5 < 12 μg/m³)
- **Yellow**: Moderate air quality (PM2.5 12-35 μg/m³)
- **Orange**: Unhealthy for sensitive groups (PM2.5 35-55 μg/m³)
- **Red**: Unhealthy air quality (PM2.5 > 55 μg/m³)

## Configuration

To change the backend URL, modify `src/config/api.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://your-backend-url:port',
  // ...
};
```

## Troubleshooting

- **Connection Error**: Make sure the backend server is running on the correct port
- **No Data**: Check that the API endpoint returns data in the expected format
- **Time Issues**: Ensure timestamps are in ISO format with timezone information
