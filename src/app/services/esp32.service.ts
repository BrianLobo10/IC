import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, BehaviorSubject, of, switchMap, map, catchError } from 'rxjs';
import { SensorData, AppConfig } from '../models/sensor-data.model';

@Injectable({
  providedIn: 'root'
})
export class Esp32Service {
  private dataSubject = new BehaviorSubject<SensorData | null>(null);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private configSubject = new BehaviorSubject<AppConfig>({
    updateInterval: 1000,
    esp32BaseUrl: 'http://192.168.1.7',
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
        switchMap(() => {
          console.log('[Esp32Service] Polling ->', this.configSubject.value.esp32BaseUrl);
          return this.fetchSensorData();
        })
      )
      .subscribe(data => {
        if (data) {
          console.log('[Esp32Service] data received', data);
          this.dataSubject.next(data);
          this.connectionStatusSubject.next(true);
          this.addToHistory(data);
        } else {
          console.log('[Esp32Service] no data (null)');
          this.dataSubject.next(null);
          this.connectionStatusSubject.next(false);
        }
      });
  }

  private fetchSensorData(): Observable<SensorData | null> {
    const baseUrl = this.configSubject.value.esp32BaseUrl;
    return this.http.get<any>(`${baseUrl}/sensors`).pipe(
      map(response => ({
        temperature: response.temperature,
        humidity: response.humidity,
        soilMoisture: response.soil,
        timestamp: new Date()
      })),
      catchError(err => {
        console.error('❌ Error al conectar con ESP32:', err);
        return of(null);
      })
    );
  }

  testConnection(): Promise<boolean> {
    const baseUrl = this.configSubject.value.esp32BaseUrl;
    return this.http.get<any>(`${baseUrl}/sensors`).toPromise()
      .then(resp => {
        console.log('testConnection resp:', resp);
        return !!resp && (resp.temperature !== undefined || resp.humidity !== undefined);
      })
      .catch(err => {
        console.error('testConnection error:', err);
        return false;
      });
  }

  private addToHistory(data: SensorData): void {
    this.historicalData.push(data);
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

    const intervalChanged = config.updateInterval !== undefined && config.updateInterval !== currentConfig.updateInterval;
    const urlChanged = config.esp32BaseUrl !== undefined && config.esp32BaseUrl !== currentConfig.esp32BaseUrl;

    if (intervalChanged || urlChanged) {
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