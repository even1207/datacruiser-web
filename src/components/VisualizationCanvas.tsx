import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { TrendingUp, MapPin, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { VisualizationConfig } from '../types';
import 'leaflet/dist/leaflet.css';

interface VisualizationCanvasProps {
  visualizations: VisualizationConfig[];
  isLoading?: boolean;
}

const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({ 
  visualizations, 
  isLoading = false 
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const canvasRef = useRef<HTMLDivElement>(null);

  const chartColors = ['#00d4ff', '#7c3aed', '#06ffa5', '#ff6b6b', '#feca57'];

  // Coerce values to numbers and filter invalid rows
  const coerceNumeric = (value: any): number | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const cleaned = String(value).replace(/[,\s]/g, '');
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  };

  const prepareData = (config: VisualizationConfig) => {
    const xKey = config.xAxis || '';
    const yKey = config.yAxis || '';
    let dropped = 0;
    let filtered: any[] = [];

    if (config.chartType === 'scatter') {
      filtered = (config.data || []).filter((row) => {
        const x = coerceNumeric(row[xKey]);
        const y = coerceNumeric(row[yKey]);
        const keep = x !== null && y !== null;
        if (!keep) dropped += 1;
        if (keep) {
          row[xKey] = x as number;
          row[yKey] = y as number;
        }
        return keep;
      });
    } else {
      filtered = (config.data || []).filter((row) => {
        const y = coerceNumeric(row[yKey]);
        const keep = y !== null;
        if (!keep) dropped += 1;
        if (keep) row[yKey] = y as number;
        return keep;
      });
    }

    return { filtered, dropped };
  };

  const renderChart = (config: VisualizationConfig) => {
    const { filtered, dropped } = prepareData(config);
    const axisLabelColor = '#a0a0a0';
    const note = dropped > 0 ? (
      <div className="data-note">{dropped} invalid row{dropped > 1 ? 's' : ''} skipped (non-numeric values)</div>
    ) : null;
    switch (config.chartType) {
      case 'scatter':
        return (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis
                  dataKey={config.xAxis}
                  name={config.xAxis}
                  stroke="#a0a0a0"
                  tick={{ fill: '#a0a0a0' }}
                  type="number"
                  label={{ value: config.xAxis || 'X', position: 'insideBottomRight', offset: -5, fill: axisLabelColor }}
                />
                <YAxis
                  dataKey={config.yAxis}
                  name={config.yAxis}
                  stroke="#a0a0a0"
                  tick={{ fill: '#a0a0a0' }}
                  type="number"
                  label={{ value: config.yAxis || 'Y', angle: -90, position: 'insideLeft', fill: axisLabelColor }}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    backgroundColor: '#1a1a24',
                    border: '1px solid #2a2a3a',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Scatter name="points" data={filtered} fill="#06ffa5" />
              </ScatterChart>
            </ResponsiveContainer>
            {note}
          </>
        );
      case 'line':
        return (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={filtered}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis 
                  dataKey={config.xAxis} 
                  stroke="#a0a0a0"
                  tick={{ fill: '#a0a0a0' }}
                  label={{ value: config.xAxis || 'X', position: 'insideBottomRight', offset: -5, fill: axisLabelColor }}
                />
                <YAxis 
                  stroke="#a0a0a0"
                  tick={{ fill: '#a0a0a0' }}
                  label={{ value: config.yAxis || 'Y', angle: -90, position: 'insideLeft', fill: axisLabelColor }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a24',
                    border: '1px solid #2a2a3a',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={config.yAxis}
                  stroke="#00d4ff"
                  strokeWidth={2}
                  dot={{ fill: '#00d4ff', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#00d4ff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
            {note}
          </>
        );
      
      case 'bar':
        return (
          <>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={filtered}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                <XAxis 
                  dataKey={config.xAxis} 
                  stroke="#a0a0a0"
                  tick={{ fill: '#a0a0a0' }}
                  label={{ value: config.xAxis || 'X', position: 'insideBottomRight', offset: -5, fill: axisLabelColor }}
                />
                <YAxis 
                  stroke="#a0a0a0"
                  tick={{ fill: '#a0a0a0' }}
                  label={{ value: config.yAxis || 'Y', angle: -90, position: 'insideLeft', fill: axisLabelColor }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a24',
                    border: '1px solid #2a2a3a',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Bar dataKey={config.yAxis} fill="#7c3aed" />
              </BarChart>
            </ResponsiveContainer>
            {note}
          </>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={config.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={config.yAxis}
              >
                {config.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a24',
                  border: '1px solid #2a2a3a',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <div className="no-chart">
            <TrendingUp size={48} />
            <p>Chart visualization not available</p>
          </div>
        );
    }
  };

  const renderMap = (config: VisualizationConfig) => {
    return (
      <div className="map-container">
        <MapContainer
          center={[51.505, -0.09]}
          zoom={13}
          style={{ height: '400px', width: '100%' }}
          className="map"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {config.data.map((point, index) => (
            <Marker key={index} position={[point.lat, point.lng]}>
              <Popup>
                <div>
                  <h3>{point.name}</h3>
                  <p>{point.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'chart':
        return <BarChart3 size={20} />;
      case 'map':
        return <MapPin size={20} />;
      default:
        return <TrendingUp size={20} />;
    }
  };

  if (isLoading) {
    return (
      <motion.div
        className="visualization-canvas loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="loading-content">
          <div className="loading-spinner large" />
          <p>Generating visualizations...</p>
        </div>
      </motion.div>
    );
  }

  if (!visualizations || visualizations.length === 0) {
    return (
      <motion.div
        className="visualization-canvas empty"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="empty-content">
          <TrendingUp size={64} />
          <h3>Ready to Visualize</h3>
          <p>Upload a CSV file and ask me to analyze your data</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="visualization-canvas"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      ref={canvasRef}
    >
      <div className="canvas-header">
        <h2>Data Visualizations</h2>
        <div className="tab-indicators">
          {visualizations.map((viz, index) => (
            <button
              key={index}
              className={`tab-indicator ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(index)}
            >
              {getIcon(viz.type)}
              <span>{viz.title || `Visualization ${index + 1}`}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="canvas-content">
        <AnimatePresence mode="wait">
          {visualizations[activeTab] && (
            <motion.div
              key={activeTab}
              className="visualization-item"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="visualization-header">
                <h3>{visualizations[activeTab].title}</h3>
                {visualizations[activeTab].description && (
                  <p>{visualizations[activeTab].description}</p>
                )}
              </div>
              
              <div className="visualization-body">
                {visualizations[activeTab].type === 'map' 
                  ? renderMap(visualizations[activeTab])
                  : renderChart(visualizations[activeTab])
                }
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .visualization-canvas {
          background: linear-gradient(135deg, rgba(17, 17, 24, 0.9) 0%, rgba(26, 26, 36, 0.9) 100%);
          border: 1px solid var(--border-primary);
          border-radius: 16px;
          padding: 24px;
          backdrop-filter: blur(10px);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .visualization-canvas.loading,
        .visualization-canvas.empty {
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        
        .canvas-header {
          margin-bottom: 24px;
        }
        
        .canvas-header h2 {
          color: var(--text-primary);
          margin-bottom: 16px;
          font-size: 24px;
          font-weight: 600;
        }
        
        .tab-indicators {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .tab-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--secondary-bg);
          border: 1px solid var(--border-primary);
          border-radius: 8px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
        }
        
        .tab-indicator:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
        }
        
        .tab-indicator.active {
          background: var(--gradient-primary);
          border-color: var(--accent-primary);
          color: white;
        }
        
        .canvas-content {
          flex: 1;
          overflow: hidden;
        }
        
        .visualization-item {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .visualization-header {
          margin-bottom: 20px;
        }
        
        .visualization-header h3 {
          color: var(--text-primary);
          margin-bottom: 8px;
          font-size: 20px;
          font-weight: 500;
        }
        
        .visualization-header p {
          color: var(--text-secondary);
          line-height: 1.5;
        }
        
        .visualization-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .map-container {
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid var(--border-primary);
        }
        
        .map {
          background: var(--secondary-bg);
        }
        
        .no-chart {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          gap: 16px;
        }
        
        .loading-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          color: var(--text-secondary);
        }
        
        .loading-spinner.large {
          width: 48px;
          height: 48px;
          border: 3px solid transparent;
          border-top: 3px solid var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        .empty-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          color: var(--text-muted);
        }
        
        .empty-content h3 {
          color: var(--text-secondary);
          font-size: 20px;
          font-weight: 500;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
};

export default VisualizationCanvas;
