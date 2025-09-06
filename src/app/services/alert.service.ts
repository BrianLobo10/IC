import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';
import { Alert, SensorData, AlertThresholds } from '../models/sensor-data.model';
import { Esp32Service } from './esp32.service';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertsSubject = new BehaviorSubject<Alert[]>([]);
  public alerts$ = this.alertsSubject.asObservable();

  constructor(private esp32Service: Esp32Service) {
    this.initializeAlertMonitoring();
  }

  private initializeAlertMonitoring(): void {
    combineLatest([
      this.esp32Service.data$,
      this.esp32Service.config$
    ]).pipe(
      map(([data, config]) => ({ data, thresholds: config.alertThresholds }))
    ).subscribe(({ data, thresholds }) => {
      if (data) {
        this.checkAlerts(data, thresholds);
      }
    });
  }

  private checkAlerts(data: SensorData, thresholds: AlertThresholds): void {
    const newAlerts: Alert[] = [];

    // Temperature alerts
    if (data.temperature < thresholds.temperatureMin) {
      newAlerts.push({
        id: `temp-low-${Date.now()}`,
        type: 'temperature',
        message: `Temperatura muy baja: ${data.temperature}°C`,
        severity: 'warning',
        timestamp: new Date(),
        active: true
      });
    } else if (data.temperature > thresholds.temperatureMax) {
      newAlerts.push({
        id: `temp-high-${Date.now()}`,
        type: 'temperature',
        message: `Temperatura muy alta: ${data.temperature}°C`,
        severity: 'error',
        timestamp: new Date(),
        active: true
      });
    }

    // Humidity alerts
    if (data.humidity < thresholds.humidityMin) {
      newAlerts.push({
        id: `humidity-low-${Date.now()}`,
        type: 'humidity',
        message: `Humedad muy baja: ${data.humidity}%`,
        severity: 'warning',
        timestamp: new Date(),
        active: true
      });
    } else if (data.humidity > thresholds.humidityMax) {
      newAlerts.push({
        id: `humidity-high-${Date.now()}`,
        type: 'humidity',
        message: `Humedad muy alta: ${data.humidity}%`,
        severity: 'error',
        timestamp: new Date(),
        active: true
      });
    }

    // Soil moisture alerts
    if (data.soilMoisture < thresholds.soilMoistureMin) {
      newAlerts.push({
        id: `soil-low-${Date.now()}`,
        type: 'soil',
        message: `Suelo muy seco: ${data.soilMoisture}%`,
        severity: 'warning',
        timestamp: new Date(),
        active: true
      });
    }

    if (newAlerts.length > 0) {
      const currentAlerts = this.alertsSubject.value;
      const updatedAlerts = [...currentAlerts, ...newAlerts];
      // Keep only last 50 alerts
      this.alertsSubject.next(updatedAlerts.slice(-50));
    }
  }

  dismissAlert(alertId: string): void {
    const currentAlerts = this.alertsSubject.value;
    const updatedAlerts = currentAlerts.map(alert => 
      alert.id === alertId ? { ...alert, active: false } : alert
    );
    this.alertsSubject.next(updatedAlerts);
  }

  getActiveAlerts(): Alert[] {
    return this.alertsSubject.value.filter(alert => alert.active);
  }
}