export interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface CSVData {
  id: string;
  name: string;
  data: any[];
  columns: string[];
  uploadedAt: Date;
  metadata?: {
    rows: number;
    size: number;
    type: 'time-series' | 'geospatial' | 'tabular';
  };
}

export interface VisualizationConfig {
  type: 'chart' | 'map' | 'table';
  chartType?: 'line' | 'bar' | 'scatter' | 'area' | 'pie';
  data: any[];
  xAxis?: string;
  yAxis?: string;
  title?: string;
  description?: string;
}

export interface AnalysisResult {
  insights: string[];
  predictions?: {
    timeframe: string;
    confidence: number;
    values: any[];
  };
  visualizations: VisualizationConfig[];
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}
