import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, interval, BehaviorSubject, catchError, of, switchMap } from 'rxjs';
import { SensorData, AppConfig } from '../models/sensor-data.model';

@Injectable({
  providedIn: 'root'
})
export class Esp32Service {
  private dataSubject = new BehaviorSubject<SensorData | null>(null);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private configSubject = new BehaviorSubject<AppConfig>({
    updateInterval: 3000,
    esp32BaseUrl: 'http://192.168.1.100', // Default ESP32 IP
    alertThresholds: {
      temperatureMin: 15,
      temperatureMax: 35,
      humidityMin: 30,
      humidityMax: 80,
      soilMoistureMin: 20
    }
  });

  private historicalData: SensorData[] = [];
  private pollingSubscription: any;

  public data$ = this.dataSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public config$ = this.configSubject.asObservable();

  constructor(private http: HttpClient) {
    this.startPolling();
  }

  private startPolling(): void {
    const config = this.configSubject.value;
    
    this.pollingSubscription = interval(config.updateInterval)
      .pipe(
        switchMap(() => this.fetchSensorData()),
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching sensor data:', error);
          this.connectionStatusSubject.next(false);
          return of(this.generateMockData()); // Fallback to mock data
        })
      )
      .subscribe(data => {
        this.dataSubject.next(data);
        this.connectionStatusSubject.next(true);
        this.addToHistory(data);
      });
  }

  private fetchSensorData(): Observable<SensorData> {
    const baseUrl = this.configSubject.value.esp32BaseUrl;
    
    // In a real scenario, you would make actual HTTP requests to ESP32
    // For demo purposes, we'll simulate the data
    return of(this.generateMockData());
    
    // Uncomment below for real ESP32 integration:
    /*
    return this.http.get<any>(`${baseUrl}/sensors`).pipe(
      map(response => ({
        temperature: response.temperature,
        humidity: response.humidity,
        soilMoisture: response.soil,
        timestamp: new Date()
      }))
    );
    */
  }

  private generateMockData(): SensorData {
    const baseTemp = 25;
    const baseHumidity = 60;
    const baseSoil = 45;
    
    return {
      temperature: Math.round((baseTemp + (Math.random() - 0.5) * 10) * 10) / 10,
      humidity: Math.round((baseHumidity + (Math.random() - 0.5) * 20) * 10) / 10,
      soilMoisture: Math.round((baseSoil + (Math.random() - 0.5) * 30) * 10) / 10,
      timestamp: new Date()
    };
  }

  private addToHistory(data: SensorData): void {
    this.historicalData.push(data);
    // Keep only last 100 records
    if (this.historicalData.length > 100) {
      this.historicalData = this.historicalData.slice(-100);
    }
  }

  getHistoricalData(): SensorData[] {
    return [...this.historicalData];
  }

  updateConfig(config: Partial<AppConfig>): void {
    const currentConfig = this.configSubject.value;
    const newConfig = { ...currentConfig, ...config };
    this.configSubject.next(newConfig);

    // Restart polling if interval changed
    if (config.updateInterval) {
      this.pollingSubscription?.unsubscribe();
      this.startPolling();
    }
  }

  getConfig(): AppConfig {
    return this.configSubject.value;
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }
}