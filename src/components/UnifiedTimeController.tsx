import React from 'react';
import type { UnifiedData } from '../hooks/useUnifiedData';
import './UnifiedTimeController.css';

interface UnifiedTimeControllerProps {
  data: UnifiedData;
  currentTimeIndex: number;
  setCurrentTimeIndex: (index: number) => void;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  showAirQuality: boolean;
  setShowAirQuality: (show: boolean) => void;
  showPedestrian: boolean;
  setShowPedestrian: (show: boolean) => void;
}

export const UnifiedTimeController: React.FC<UnifiedTimeControllerProps> = ({
  data,
  currentTimeIndex,
  setCurrentTimeIndex,
  isPlaying,
  onPlay,
  onPause,
  speed,
  onSpeedChange,
  showAirQuality,
  setShowAirQuality,
  showPedestrian,
  setShowPedestrian
}) => {
  const currentTimePoint = data.timePoints[currentTimeIndex];
  const progress = data.totalTimePoints > 0 ? (currentTimeIndex / (data.totalTimePoints - 1)) * 100 : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = Math.floor((parseFloat(e.target.value) / 100) * (data.totalTimePoints - 1));
    setCurrentTimeIndex(Math.max(0, Math.min(newIndex, data.totalTimePoints - 1)));
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-AU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Australia/Sydney'
    });
  };

  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 2, label: '2x' },
    { value: 4, label: '4x' },
    { value: 8, label: '8x' }
  ];

  return (
    <div className="unified-time-controller">
      <div className="controller-header">
        <h3>October-December 2024 Data Time Control</h3>
        <div className="time-display">
          {currentTimePoint && (
            <span className="current-time">
              {formatDateTime(currentTimePoint.timestamp)}
            </span>
          )}
          <span className="time-index">
            {currentTimeIndex + 1} / {data.totalTimePoints}
          </span>
        </div>
      </div>

      <div className="controls-main">
        {/* Data type toggle */}
        <div className="data-type-controls">
          <button
            className={`data-toggle ${showAirQuality ? 'active' : ''}`}
            onClick={() => setShowAirQuality(!showAirQuality)}
          >
            🌬️ Air Quality {showAirQuality ? '(Show)' : '(Hide)'}
          </button>
          <button
            className={`data-toggle ${showPedestrian ? 'active' : ''}`}
            onClick={() => setShowPedestrian(!showPedestrian)}
          >
            🚶 Pedestrian Data {showPedestrian ? '(Show)' : '(Hide)'}
          </button>
        </div>

        {/* Playback controls */}
        <div className="playback-controls">
          <button
            className={`play-button ${isPlaying ? 'playing' : ''}`}
            onClick={isPlaying ? onPause : onPlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          
          <div className="speed-control">
            <label htmlFor="speed-select">Playback Speed:</label>
            <select
              id="speed-select"
              value={speed}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
              disabled={isPlaying}
            >
              {speedOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Time slider */}
        <div className="time-slider-container">
          <label htmlFor="time-slider">Time Progress:</label>
          <input
            id="time-slider"
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSliderChange}
            className="time-slider"
            disabled={isPlaying}
          />
          <div className="slider-labels">
            <span>{data.dateRange.start ? formatDateTime(data.dateRange.start) : ''}</span>
            <span>{data.dateRange.end ? formatDateTime(data.dateRange.end) : ''}</span>
          </div>
        </div>
      </div>

      {/* Data statistics */}
      <div className="data-summary">
        {currentTimePoint && (
          <div className="summary-stats">
            <div className="stat-group">
              <h4>Air Quality Data</h4>
              <div className="stat">
                <span className="stat-label">Active Sensors:</span>
                <span className="stat-value">{currentTimePoint.airQualityDevices.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">PM2.5 Average:</span>
                <span className="stat-value">
                  {(() => {
                    const pm25Values = currentTimePoint.airQualityDevices
                      .map(d => d.data['PM2.5'])
                      .filter(v => v !== undefined) as number[];
                    return pm25Values.length > 0 
                      ? (pm25Values.reduce((sum, v) => sum + v, 0) / pm25Values.length).toFixed(1)
                      : '0.0';
                  })()} μg/m³
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Temperature Average:</span>
                <span className="stat-value">
                  {(() => {
                    const tempValues = currentTimePoint.airQualityDevices
                      .map(d => d.data['TEMP'])
                      .filter(v => v !== undefined) as number[];
                    return tempValues.length > 0 
                      ? (tempValues.reduce((sum, v) => sum + v, 0) / tempValues.length).toFixed(1)
                      : '0.0';
                  })()} °C
                </span>
              </div>
            </div>

            <div className="stat-group">
              <h4>Pedestrian Data</h4>
              <div className="stat">
                <span className="stat-label">Monitoring Points:</span>
                <span className="stat-value">{currentTimePoint.pedestrianData.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Total Pedestrians:</span>
                <span className="stat-value">
                  {currentTimePoint.pedestrianData.reduce((sum, p) => sum + (p.parsedCount || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Average Pedestrians:</span>
                <span className="stat-value">
                  {currentTimePoint.pedestrianData.length > 0 
                    ? Math.round(currentTimePoint.pedestrianData.reduce((sum, p) => sum + (p.parsedCount || 0), 0) / currentTimePoint.pedestrianData.length).toLocaleString()
                    : '0'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
