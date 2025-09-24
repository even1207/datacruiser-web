import Papa from 'papaparse';

// Function to extract device code from filename
function extractDeviceCode(filename) {
  const match = filename.match(/open\.NSW-AIRQ\.(\d+)\./);
  return match ? match[1] : null;
}

// Function to extract parameter type from filename
function extractParameter(filename) {
  const match = filename.match(/open\.NSW-AIRQ\.\d+\.(.+)\.csv$/);
  return match ? match[1] : null;
}

// Function to parse CSV data
async function parseCSVData(csvText) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn('CSV parsing warnings:', results.errors);
        }
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

// Function to process air quality data from CSV files
export async function processAirQualityData(csvFiles, devicesData) {
  const processedData = new Map();
  
  // Filter for PM2.5 and TEMP files only, and 2020-2024 data
  const targetFiles = csvFiles.filter(file => {
    const parameter = extractParameter(file.name);
    return (parameter === 'PM2.5' || parameter === 'TEMP') && 
           file.name.includes('open.NSW-AIRQ');
  });

  console.log(`Found ${targetFiles.length} PM2.5 and TEMP files to process`);

  for (const file of targetFiles) {
    try {
      const deviceCode = extractDeviceCode(file.name);
      const parameter = extractParameter(file.name);
      
      if (!deviceCode || !parameter) {
        console.warn(`Could not extract device code or parameter from ${file.name}`);
        continue;
      }

      // Get device location data
      const deviceKey = `open/NSW-AIRQ/${deviceCode}`;
      const deviceInfo = devicesData[deviceKey];
      
      if (!deviceInfo) {
        console.warn(`No device info found for code ${deviceCode}`);
        continue;
      }

      // Parse CSV data
      const csvData = await parseCSVData(file.text);
      
      // Filter data for 2020-2024
      const filteredData = csvData.filter(row => {
        if (!row.begin) return false;
        const year = new Date(row.begin).getFullYear();
        return year >= 2020 && year <= 2024;
      });

      if (filteredData.length === 0) {
        console.warn(`No data in 2020-2024 range for ${file.name}`);
        continue;
      }

      // Process each data point
      filteredData.forEach(row => {
        if (!row.begin || !row.v || row.v === '' || row.v === 'null') return;
        
        const timestamp = new Date(row.begin);
        const value = parseFloat(row.v);
        
        if (isNaN(value)) return;

        const timeKey = timestamp.toISOString();
        
        if (!processedData.has(timeKey)) {
          processedData.set(timeKey, {
            timestamp,
            devices: new Map()
          });
        }

        const timeData = processedData.get(timeKey);
        
        if (!timeData.devices.has(deviceCode)) {
          timeData.devices.set(deviceCode, {
            code: deviceCode,
            name: deviceInfo.name,
            description: deviceInfo.description,
            coordinates: deviceInfo.geometry.coordinates,
            data: {}
          });
        }

        const deviceData = timeData.devices.get(deviceCode);
        deviceData.data[parameter] = value;
      });

    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
    }
  }

  // Convert Map to sorted array
  const sortedData = Array.from(processedData.entries())
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([timeKey, data]) => ({
      timestamp: data.timestamp,
      devices: Array.from(data.devices.values()).filter(device => 
        device.data['PM2.5'] !== undefined || device.data['TEMP'] !== undefined
      )
    }))
    .filter(timePoint => timePoint.devices.length > 0);

  console.log(`Processed ${sortedData.length} time points with air quality data`);
  
  return {
    timePoints: sortedData,
    totalTimePoints: sortedData.length,
    dateRange: {
      start: sortedData[0]?.timestamp,
      end: sortedData[sortedData.length - 1]?.timestamp
    }
  };
}

// Function to load all CSV files
export async function loadCSVFiles(csvFilePaths) {
  const files = [];
  
  for (const filePath of csvFilePaths) {
    try {
      const response = await fetch(filePath);
      const text = await response.text();
      const fileName = filePath.split('/').pop();
      
      files.push({
        name: fileName,
        text: text,
        path: filePath
      });
    } catch (error) {
      console.error(`Error loading file ${filePath}:`, error);
    }
  }
  
  return files;
}

// Function to get all PM2.5 and TEMP CSV file paths
export function getAirQualityCSVPaths(baseUrl = '/data/air-quality/') {
  // This will be populated with actual file paths
  // For now, we'll return a pattern that can be used
  const deviceCodes = ['15', '1001', '1007', '107', '113', '1141', '1148', '155', '1570', '1580', '1650', '171', '1750', '1800', '190', '206', '2330', '2560', '2570', '259', '264', '287', '300', '304', '322', '329', '330', '333', '336', '340', '379', '390', '450', '500', '526', '573', '574', '640', '760', '780', '795', '798', '802', '803', '805', '919', '919', '1007', '1107', '113', '1141', '1148', '1330', '1333', '1350', '155', '1560', '1570', '1580', '1650', '171', '1750', '1800', '190', '206', '2330', '2333', '2560', '2570', '259', '264', '287', '2921', '294', '295', '300', '304', '322', '329', '330', '333', '336', '340', '379', '390', '4330', '450', '500', '526', '573', '574', '6330', '640', '7330', '760', '780', '795', '798', '802', '803', '805', '8330', '919', '9480', '94880', '9507', '9551', '9585', '95880', '9642', '9648', '9663', '9666', '9671', '9675', '9680', '9700', '9731', '9738', '9739', '9794', '9800', '9830', '9832', '9835', '9836', '9840', '9870', '9877', '9880', '99381', '99801', '99806', '99807', '92648', '92731', '92800', '9302', '93496', '92551', '92380', '92650'];
  
  const csvPaths = [];
  
  deviceCodes.forEach(code => {
    csvPaths.push(`${baseUrl}open.NSW-AIRQ.${code}.PM2.5.csv`);
    csvPaths.push(`${baseUrl}open.NSW-AIRQ.${code}.TEMP.csv`);
  });
  
  return csvPaths;
}
