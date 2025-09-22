import React, { useState } from 'react';
import Map from './components/Map';
import TimeController from './components/TimeController';
import ChatPanel from './components/ChatPanel';
import { useFootfallData } from './hooks/useFootfallData';
import { filterDataByTime } from './utils/dataProcessor';
import { SYDNEY_CENTER } from './data/locationCoordinates';
import './App.css';

function App() {
  const { processedData, availableTimes, isLoading, error } = useFootfallData();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // 设置初始时间
  React.useEffect(() => {
    if (availableTimes.length > 0 && !currentTime) {
      setCurrentTime(availableTimes[0]);
    }
  }, [availableTimes, currentTime]);

  const handleTimeChange = (time: string, pausePlayback = true) => {
    setCurrentTime(time);
    if (pausePlayback) {
      setIsPlaying(false); // Only pause when manually changed
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  // 获取当前时间的数据
  const currentData = currentTime ? filterDataByTime(processedData, currentTime) : [];

  // Debug: 只在特定时间输出数据
  React.useEffect(() => {
    if (currentTime.includes('2020/02/14 16:00:00') && currentData.length > 0) {
      console.log('🔍 DEBUGGING 16:00 DATA:');
      console.log('Current Time:', currentTime);
      console.log('Current Data Count:', currentData.length);
      console.log('Individual counts:', currentData.map(d => ({
        location: d.Location_Name,
        count: d.parsedCount,
        original: d.TotalCount
      })));
      console.log('Total:', currentData.reduce((sum, item) => sum + item.parsedCount, 0));
      console.log('Average:', Math.round(currentData.reduce((sum, item) => sum + item.parsedCount, 0) / currentData.length));
    }
  }, [currentData, currentTime]);

  if (isLoading) {
    return (
      <div className="app">
        <div className="loading">
          <h2>Loading footfall data...</h2>
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

  return (
    <div className="app">
      <header className="app-header">
        <h1>Sydney City Footfall Monitoring</h1>
        <p>Real-time visualization of pedestrian traffic across Sydney locations</p>
      </header>

      <main className={`app-main ${isChatOpen ? 'chat-open' : ''}`}>
        <TimeController
          availableTimes={availableTimes}
          currentTime={currentTime}
          onTimeChange={handleTimeChange}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          playbackSpeed={playbackSpeed}
          onSpeedChange={handleSpeedChange}
        />

        {/* Quick time jump for testing */}
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <button
            onClick={() => {
              const targetTime = '2020/02/14 16:00:00+00';
              if (availableTimes.includes(targetTime)) {
                handleTimeChange(targetTime);
              } else {
                console.log('Available times:', availableTimes.filter(t => t.includes('2020/02/14')));
                alert('Target time not found. Check console for available 2020/02/14 times.');
              }
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Jump to 2020/02/14 16:00
          </button>
          <button
            onClick={() => {
              console.log('All available times containing "16:00":',
                availableTimes.filter(t => t.includes('16:00')).slice(0, 10)
              );
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Show 16:00 Times
          </button>
        </div>

        <div className="map-container">
          <Map
            data={currentData}
            center={SYDNEY_CENTER}
            zoom={SYDNEY_CENTER.zoom}
          />
        </div>

        <div className="stats">
          <div className="stat-item">
            <h3>Active Locations</h3>
            <p>{currentData.length}</p>
          </div>
          <div className="stat-item">
            <h3>Total Footfall</h3>
            <p>{currentData.reduce((sum, item) => sum + item.parsedCount, 0).toLocaleString()}</p>
          </div>
          <div className="stat-item">
            <h3>Average per Location</h3>
            <p>{currentData.length > 0 ? Math.round(currentData.reduce((sum, item) => sum + item.parsedCount, 0) / currentData.length).toLocaleString() : 0}</p>
          </div>
          <div className="stat-item">
            <h3>Highest Location</h3>
            <p>{currentData.length > 0 ? Math.max(...currentData.map(item => item.parsedCount)).toLocaleString() : 0}</p>
          </div>
        </div>
      </main>

      {/* Chat Panel */}
      <ChatPanel
        isOpen={isChatOpen}
        onToggle={handleChatToggle}
        currentData={currentData}
        availableTimes={availableTimes}
      />
    </div>
  );
}

export default App;