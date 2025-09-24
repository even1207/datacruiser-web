import { useState } from 'react';
import Map from './components/Map';
import { UnifiedTimeController } from './components/UnifiedTimeController';
import ChatPanel from './components/ChatPanel';
import { useUnifiedData } from './hooks/useUnifiedData';
import { SYDNEY_CENTER } from './data/locationCoordinates';
import './App.css';

function App() {
  const [showAirQuality, setShowAirQuality] = useState(true);
  const [showPedestrian, setShowPedestrian] = useState(true);

  // Use unified data hook
  const {
    data,
    loading,
    error,
    currentTimeIndex,
    setCurrentTimeIndex,
    currentTimePoint,
    play,
    pause,
    isPlaying,
    speed,
    setSpeed
  } = useUnifiedData();

  if (loading) {
    return (
      <div className="app">
        <div className="loading">
          <h2>Loading data...</h2>
          <p>Processing air quality and pedestrian data for October-December 2024...</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>Error loading data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.timePoints.length === 0) {
    return (
      <div className="app">
        <div className="error">
          <h2>No data available</h2>
          <p>No data found for the specified time range.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Sydney Data Visualization</h1>
        <p>October-December 2024 Air Quality and Pedestrian Data Synchronized Playback</p>
      </header>

      <main className="app-main">
        <div className="app-columns">
          <section className="app-column control-column">
            <UnifiedTimeController
              data={data}
              currentTimeIndex={currentTimeIndex}
              setCurrentTimeIndex={setCurrentTimeIndex}
              isPlaying={isPlaying}
              onPlay={play}
              onPause={pause}
              speed={speed}
              onSpeedChange={setSpeed}
              showAirQuality={showAirQuality}
              setShowAirQuality={setShowAirQuality}
              showPedestrian={showPedestrian}
              setShowPedestrian={setShowPedestrian}
            />
          </section>

          <section className="app-column map-column">
            <div className="map-container">
              <Map
                unifiedData={currentTimePoint}
                center={SYDNEY_CENTER}
                zoom={SYDNEY_CENTER.zoom}
                showAirQuality={showAirQuality}
                showPedestrian={showPedestrian}
              />
            </div>
          </section>

          <section className="app-column chat-column">
            <ChatPanel
              currentData={currentTimePoint ? [
                ...currentTimePoint.airQualityDevices.map(device => ({
                  deviceCode: device.code,
                  sensorCode: 'AIR_QUALITY',
                  value: device.data['PM2.5'] || 0,
                  unit: 'μg/m³',
                  timestamp: currentTimePoint.timestamp.toISOString(),
                  coordinates: device.coordinates
                })),
                ...currentTimePoint.pedestrianData.map((p: any) => ({
                  deviceCode: p.Location_code,
                  sensorCode: 'PEDESTRIAN',
                  value: p.parsedCount,
                  unit: 'people',
                  timestamp: currentTimePoint.timestamp.toISOString(),
                  coordinates: p.coordinates
                }))
              ] : []}
              availableTimes={data ? data.timePoints.map(tp => tp.timestamp.toISOString()) : []}
              layout="column"
            />
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
