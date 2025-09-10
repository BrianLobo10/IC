import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Esp32Service } from '../../services/esp32.service';
import { AlertService } from '../../services/alert.service';
import { MetricCardComponent } from '../../components/metric-card/metric-card.component';
import { SensorData, Alert } from '../../models/sensor-data.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MetricCardComponent],
  template: `
    <div class="animate-fade-in">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Dashboard Ambiental</h1>
        <p class="mt-2 text-gray-600">
          Monitoreo en tiempo real de sensores ESP32
        </p>
        <div class="mt-2 flex items-center space-x-4">
          <div class="flex items-center">
            <div 
              class="w-3 h-3 rounded-full mr-2"
              [ngClass]="(connectionStatus$ | async) ? 'bg-success-500 animate-pulse' : 'bg-danger-500'"
            ></div>
            <span class="text-sm text-gray-600">
              {{ (connectionStatus$ | async) ? 'Conectado' : 'Desconectado' }}
            </span>
          </div>
          <span class="text-sm text-gray-500" *ngIf="lastUpdate">
            Última actualización: {{ lastUpdate | date:'medium' }}
          </span>
        </div>
      </div>

      <div *ngIf="activeAlerts.length > 0" class="mb-6">
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 class="text-red-800 font-medium mb-2">🚨 Alertas Activas</h3>
          <div class="space-y-2">
            <div 
              *ngFor="let alert of activeAlerts" 
              class="flex items-center justify-between bg-white p-2 rounded border-l-4"
              [ngClass]="alert.severity === 'error' ? 'border-red-500' : 'border-yellow-500'"
            >
              <span class="text-sm">{{ alert.message }}</span>
              <button 
                (click)="dismissAlert(alert.id)"
                class="text-gray-400 hover:text-gray-600 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <app-metric-card
          *ngIf="currentData"
          label="Temperatura"
          [value]="currentData.temperature"
          unit="°C"
          icon="🌡️"
          [status]="getTemperatureStatus(currentData.temperature)"
          [trend]="getTemperatureTrend()"
          [previousValue]="previousData?.temperature"
        ></app-metric-card>

        <app-metric-card
          *ngIf="currentData"
          label="Humedad"
          [value]="currentData.humidity"
          unit="%"
          icon="💧"
          [status]="getHumidityStatus(currentData.humidity)"
          [trend]="getHumidityTrend()"
          [previousValue]="previousData?.humidity"
        ></app-metric-card>

        <app-metric-card
          *ngIf="currentData"
          label="Humedad del Suelo"
          [value]="currentData.soilMoisture"
          unit="%"
          icon="🌱"
          [status]="getSoilMoistureStatus(currentData.soilMoisture)"
          [trend]="getSoilMoistureTrend()"
          [previousValue]="previousData?.soilMoisture"
        ></app-metric-card>
      </div>

      <!-- Quick Stats -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Estadísticas Rápidas</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <p class="text-2xl font-bold text-primary-600">{{ getTotalReadings() }}</p>
            <p class="text-sm text-gray-500">Lecturas Total</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-success-600">{{ getUptimePercentage() }}%</p>
            <p class="text-sm text-gray-500">Disponibilidad</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-warning-600">{{ activeAlerts.length }}</p>
            <p class="text-sm text-gray-500">Alertas Activas</p>
          </div>
          <div class="text-center">
            <p class="text-2xl font-bold text-gray-600">{{ getUpdateInterval() }}s</p>
            <p class="text-sm text-gray-500">Intervalo</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentData: SensorData | null = null;
  previousData: SensorData | null = null;
  activeAlerts: Alert[] = [];
  connectionStatus$ = this.esp32Service.connectionStatus$;
  lastUpdate: Date | null = null;

  private subscriptions = new Subscription();

  constructor(
    private esp32Service: Esp32Service,
    private alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.esp32Service.data$.subscribe(data => {
        if (data) {
          this.previousData = this.currentData;
          this.currentData = data;
          this.lastUpdate = data.timestamp;
        } else {
          this.previousData = this.currentData ?? null;
          this.currentData = null;
          this.lastUpdate = null;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getTemperatureStatus(temp: number): 'normal' | 'warning' | 'error' {
    const config = this.esp32Service.getConfig();
    if (temp < config.alertThresholds.temperatureMin || temp > config.alertThresholds.temperatureMax) {
      return temp < config.alertThresholds.temperatureMin ? 'warning' : 'error';
    }
    return 'normal';
  }

  getHumidityStatus(humidity: number): 'normal' | 'warning' | 'error' {
    const config = this.esp32Service.getConfig();
    if (humidity < config.alertThresholds.humidityMin || humidity > config.alertThresholds.humidityMax) {
      return humidity < config.alertThresholds.humidityMin ? 'warning' : 'error';
    }
    return 'normal';
  }

  getSoilMoistureStatus(soil: number): 'normal' | 'warning' | 'error' {
    const config = this.esp32Service.getConfig();
    return soil < config.alertThresholds.soilMoistureMin ? 'warning' : 'normal';
  }

  getTemperatureTrend(): 'up' | 'down' | 'stable' {
    if (!this.previousData || !this.currentData) return 'stable';
    const diff = this.currentData.temperature - this.previousData.temperature;
    return Math.abs(diff) < 0.5 ? 'stable' : diff > 0 ? 'up' : 'down';
  }

  getHumidityTrend(): 'up' | 'down' | 'stable' {
    if (!this.previousData || !this.currentData) return 'stable';
    const diff = this.currentData.humidity - this.previousData.humidity;
    return Math.abs(diff) < 1 ? 'stable' : diff > 0 ? 'up' : 'down';
  }

  getSoilMoistureTrend(): 'up' | 'down' | 'stable' {
    if (!this.previousData || !this.currentData) return 'stable';
    const diff = this.currentData.soilMoisture - this.previousData.soilMoisture;
    return Math.abs(diff) < 1 ? 'stable' : diff > 0 ? 'up' : 'down';
  }

  getTotalReadings(): number {
    return this.esp32Service.getHistoricalData().length;
  }

  getUptimePercentage(): number {
    return 98.5;
  }

  getUpdateInterval(): number {
    return this.esp32Service.getConfig().updateInterval / 1000;
  }

  dismissAlert(alertId: string): void {
    this.alertService.dismissAlert(alertId);
  }
}