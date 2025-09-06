export interface SensorData {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  timestamp: Date;
}

export interface AlertThresholds {
  temperatureMin: number;
  temperatureMax: number;
  humidityMin: number;
  humidityMax: number;
  soilMoistureMin: number;
}

export interface Alert {
  id: string;
  type: 'temperature' | 'humidity' | 'soil';
  message: string;
  severity: 'warning' | 'error';
  timestamp: Date;
  active: boolean;
}

export interface AppConfig {
  updateInterval: number;
  esp32BaseUrl: string;
  alertThresholds: AlertThresholds;
}