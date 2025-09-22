export interface LocationData {
  Location_code: string;
  Location_Name: string;
  Date: string;
  TotalCount: string;
  Hour: string;
  Day: string;
  DayNo: string;
  Week: string;
  LastWeek: string;
  Previous4DayTimeAvg: string;
  ObjectId: string;
  LastYear: string;
  Previous52DayTimeAvg: string;
}

export interface LocationCoordinates {
  [key: string]: {
    lat: number;
    lng: number;
    name: string;
  };
}

export interface ProcessedLocationData extends LocationData {
  coordinates: {
    lat: number;
    lng: number;
  };
  parsedCount: number;
  timestamp: Date;
}
