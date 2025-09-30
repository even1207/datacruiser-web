import Papa from 'papaparse';

export interface ProcessedCSVData {
  data: any[];
  columns: string[];
  metadata: {
    rows: number;
    size: number;
    type: 'time-series' | 'geospatial' | 'tabular';
    hasCoordinates: boolean;
    hasTimeData: boolean;
  };
}

export const processCSVFile = (file: File): Promise<ProcessedCSVData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as any[];
          const columns = results.meta.fields || [];
          
          // Analyze data structure
          const metadata = analyzeDataStructure(data, columns);
          
          resolve({
            data,
            columns,
            metadata
          });
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

const analyzeDataStructure = (data: any[], columns: string[]) => {
  const hasCoordinates = columns.some(col => 
    col.toLowerCase().includes('lat') || 
    col.toLowerCase().includes('lng') ||
    col.toLowerCase().includes('longitude') ||
    col.toLowerCase().includes('latitude')
  );
  
  const hasTimeData = columns.some(col => 
    col.toLowerCase().includes('time') ||
    col.toLowerCase().includes('date') ||
    col.toLowerCase().includes('timestamp')
  );
  
  let type: 'time-series' | 'geospatial' | 'tabular' = 'tabular';
  
  if (hasTimeData && data.length > 10) {
    type = 'time-series';
  } else if (hasCoordinates) {
    type = 'geospatial';
  }
  
  return {
    rows: data.length,
    size: JSON.stringify(data).length,
    type,
    hasCoordinates,
    hasTimeData
  };
};

export const generateSampleVisualizations = (processedData: ProcessedCSVData) => {
  const { data, columns, metadata } = processedData;
  
  if (metadata.type === 'time-series' && metadata.hasTimeData) {
    const timeColumn = columns.find(col => 
      col.toLowerCase().includes('time') ||
      col.toLowerCase().includes('date')
    );
    
    const numericColumns = columns.filter(col => {
      if (col === timeColumn) return false;
      return data.some(row => !isNaN(parseFloat(row[col])));
    });
    
    if (timeColumn && numericColumns.length > 0) {
      return [{
        type: 'chart' as const,
        chartType: 'line' as const,
        data: data.slice(0, 50), // Limit to first 50 points for performance
        xAxis: timeColumn,
        yAxis: numericColumns[0],
        title: `${numericColumns[0]} Over Time`,
        description: `Time series visualization of ${numericColumns[0]} data`
      }];
    }
  }
  
  if (metadata.type === 'geospatial' && metadata.hasCoordinates) {
    const latColumn = columns.find(col => 
      col.toLowerCase().includes('lat') ||
      col.toLowerCase().includes('latitude')
    );
    
    const lngColumn = columns.find(col => 
      col.toLowerCase().includes('lng') ||
      col.toLowerCase().includes('longitude') ||
      col.toLowerCase().includes('lon')
    );
    
    if (latColumn && lngColumn) {
      const mapData = data.slice(0, 20).map(row => ({
        lat: parseFloat(row[latColumn]),
        lng: parseFloat(row[lngColumn]),
        name: row.name || `${row[latColumn]}, ${row[lngColumn]}`,
        description: `Location at ${row[latColumn]}, ${row[lngColumn]}`
      }));
      
      return [{
        type: 'map' as const,
        data: mapData,
        title: 'Geographic Distribution',
        description: 'Map visualization of your data points'
      }];
    }
  }
  
  // Default bar chart for numeric data
  const numericColumns = columns.filter(col => {
    return data.some(row => !isNaN(parseFloat(row[col])));
  });
  
  if (numericColumns.length >= 2) {
    return [{
      type: 'chart' as const,
      chartType: 'bar' as const,
      data: data.slice(0, 20),
      xAxis: columns[0],
      yAxis: numericColumns[0],
      title: `${numericColumns[0]} Distribution`,
      description: `Bar chart showing ${numericColumns[0]} values`
    }];
  }
  
  return [];
};
