import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import './TimeController.css';

interface TimeControllerProps {
  availableTimes: string[];
  currentTime: string;
  onTimeChange: (time: string, pausePlayback?: boolean) => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
}

const TimeController: React.FC<TimeControllerProps> = ({
  availableTimes,
  currentTime,
  onTimeChange,
  isPlaying,
  onPlayPause,
  playbackSpeed,
  onSpeedChange
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Find the index of current time in the array
  useEffect(() => {
    const index = availableTimes.findIndex(time => time === currentTime);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [currentTime, availableTimes]);

  // Auto-play logic with optimized timing
  useEffect(() => {
    if (!isPlaying || availableTimes.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % availableTimes.length;
        onTimeChange(availableTimes[nextIndex], false); // Don't pause during auto-play
        return nextIndex;
      });
    }, Math.max(50, 500 / playbackSpeed)); // Minimum 50ms interval for smooth animation

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, availableTimes, onTimeChange]);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(event.target.value);
    setCurrentIndex(index);
    onTimeChange(availableTimes[index]); // This will pause playback
  };

  const formatDisplayTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return format(date, 'yyyy-MM-dd HH:mm');
    } catch {
      return timeString;
    }
  };

  const goToPrevious = () => {
    const newIndex = Math.max(0, currentIndex - 1);
    setCurrentIndex(newIndex);
    onTimeChange(availableTimes[newIndex]); // This will pause playback
  };

  const goToNext = () => {
    const newIndex = Math.min(availableTimes.length - 1, currentIndex + 1);
    setCurrentIndex(newIndex);
    onTimeChange(availableTimes[newIndex]); // This will pause playback
  };

  if (availableTimes.length === 0) {
    return <div className="time-controller">Loading...</div>;
  }

  return (
    <div className="time-controller">
      <div className="time-display">
        <h3>Current Time: {formatDisplayTime(currentTime)}</h3>
      </div>

      <div className="controls">
        <button
          className="control-button"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
        >
          ⏮️
        </button>

        <button
          className="control-button play-pause"
          onClick={onPlayPause}
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>

        <button
          className="control-button"
          onClick={goToNext}
          disabled={currentIndex === availableTimes.length - 1}
        >
          ⏭️
        </button>
      </div>

      <div className="slider-container">
        <input
          type="range"
          min="0"
          max={availableTimes.length - 1}
          value={currentIndex}
          onChange={handleSliderChange}
          className="time-slider"
        />
        <div className="time-labels">
          <span>{formatDisplayTime(availableTimes[0])}</span>
          <span>{formatDisplayTime(availableTimes[availableTimes.length - 1])}</span>
        </div>
      </div>

      <div className="speed-control">
        <label>Playback Speed: </label>
        <select
          value={playbackSpeed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          className="speed-select"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={5}>5x</option>
          <option value={10}>10x</option>
        </select>
      </div>
    </div>
  );
};

export default TimeController;
