import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AlertService } from '../../services/alert.service';
import { Esp32Service } from '../../services/esp32.service';
import { Alert } from '../../models/sensor-data.model';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-fade-in">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Sistema de Alertas</h1>
        <p class="mt-2 text-gray-600">
          Monitoreo de condiciones críticas y notificaciones
        </p>
      </div>

      <!-- Alert Summary -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="card text-center">
          <div class="text-3xl mb-2">🚨</div>
          <p class="text-2xl font-bold text-red-600">{{ getActiveAlertsCount() }}</p>
          <p class="text-sm text-gray-500">Alertas Activas</p>
        </div>
        <div class="card text-center">
          <div class="text-3xl mb-2">⚠️</div>
          <p class="text-2xl font-bold text-yellow-600">{{ getWarningAlertsCount() }}</p>
          <p class="text-sm text-gray-500">Advertencias</p>
        </div>
        <div class="card text-center">
          <div class="text-3xl mb-2">❌</div>
          <p class="text-2xl font-bold text-red-600">{{ getErrorAlertsCount() }}</p>
          <p class="text-sm text-gray-500">Errores</p>
        </div>
        <div class="card text-center">
          <div class="text-3xl mb-2">📊</div>
          <p class="text-2xl font-bold text-gray-600">{{ getTotalAlertsCount() }}</p>
          <p class="text-sm text-gray-500">Total Alertas</p>
        </div>
      </div>

      <!-- Current Thresholds -->
      <div class="card mb-8">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Umbrales Actuales</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="font-medium text-blue-900 mb-2">🌡️ Temperatura</h3>
            <div class="space-y-1 text-sm">
              <p><span class="font-semibold">Mín:</span> {{ config.alertThresholds.temperatureMin }}°C</p>
              <p><span class="font-semibold">Máx:</span> {{ config.alertThresholds.temperatureMax }}°C</p>
            </div>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <h3 class="font-medium text-green-900 mb-2">💧 Humedad</h3>
            <div class="space-y-1 text-sm">
              <p><span class="font-semibold">Mín:</span> {{ config.alertThresholds.humidityMin }}%</p>
              <p><span class="font-semibold">Máx:</span> {{ config.alertThresholds.humidityMax }}%</p>
            </div>
          </div>
          <div class="bg-yellow-50 p-4 rounded-lg">
            <h3 class="font-medium text-yellow-900 mb-2">🌱 Suelo</h3>
            <div class="space-y-1 text-sm">
              <p><span class="font-semibold">Mín:</span> {{ config.alertThresholds.soilMoistureMin }}%</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Alerts -->
      <div class="card mb-8" *ngIf="getActiveAlerts().length > 0">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-gray-900 flex items-center">
            <span class="animate-pulse mr-2">🔴</span>
            Alertas Activas
          </h2>
          <button
            (click)="dismissAllActiveAlerts()"
            class="text-sm text-gray-500 hover:text-gray-700"
          >
            Descartar todas
          </button>
        </div>
        <div class="space-y-3">
          <div
            *ngFor="let alert of getActiveAlerts()"
            class="flex items-center justify-between p-4 rounded-lg border-l-4 animate-slide-up"
            [ngClass]="getAlertCardClass(alert)"
          >
            <div class="flex items-center space-x-3">
              <span class="text-2xl">{{ getAlertIcon(alert) }}</span>
              <div>
                <p class="font-medium" [ngClass]="getAlertTextClass(alert)">
                  {{ alert.message }}
                </p>
                <p class="text-sm text-gray-500">
                  {{ alert.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}
                </p>
              </div>
            </div>
            <button
              (click)="dismissAlert(alert.id)"
              class="text-gray-400 hover:text-gray-600 p-1"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- All Alerts History -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-medium text-gray-900">Histórico de Alertas</h2>
          <div class="flex space-x-2">
            <button
              (click)="setFilter('all')"
              [class]="getFilterButtonClass('all')"
            >
              Todas
            </button>
            <button
              (click)="setFilter('active')"
              [class]="getFilterButtonClass('active')"
            >
              Activas
            </button>
            <button
              (click)="setFilter('dismissed')"
              [class]="getFilterButtonClass('dismissed')"
            >
              Descartadas
            </button>
          </div>
        </div>

        <div class="space-y-3 max-h-96 overflow-y-auto">
          <div
            *ngFor="let alert of getFilteredAlerts()"
            class="flex items-center justify-between p-3 border rounded-lg"
            [ngClass]="alert.active ? 'bg-white' : 'bg-gray-50'"
          >
            <div class="flex items-center space-x-3">
              <span class="text-xl">{{ getAlertIcon(alert) }}</span>
              <div class="flex-1">
                <p class="text-sm font-medium" [ngClass]="alert.active ? 'text-gray-900' : 'text-gray-600'">
                  {{ alert.message }}
                </p>
                <div class="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                  <span>{{ alert.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</span>
                  <span class="px-2 py-1 rounded-full" 
                        [ngClass]="alert.active ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'">
                    {{ alert.active ? 'Activa' : 'Descartada' }}
                  </span>
                  <span class="px-2 py-1 rounded-full"
                        [ngClass]="alert.severity === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'">
                    {{ alert.severity === 'error' ? 'Error' : 'Advertencia' }}
                  </span>
                </div>
              </div>
            </div>
            <button
              *ngIf="alert.active"
              (click)="dismissAlert(alert.id)"
              class="text-gray-400 hover:text-gray-600 p-1"
            >
              ✕
            </button>
          </div>
          <div *ngIf="getFilteredAlerts().length === 0" class="text-center py-8 text-gray-500">
            No hay alertas para mostrar
          </div>
        </div>
      </div>
    </div>
  `
})
export class AlertsComponent implements OnInit, OnDestroy {
  alerts: Alert[] = [];
  config = this.esp32Service.getConfig();
  currentFilter: 'all' | 'active' | 'dismissed' = 'all';

  private subscriptions = new Subscription();

  constructor(
    private alertService: AlertService,
    private esp32Service: Esp32Service
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.alertService.alerts$.subscribe(alerts => {
        this.alerts = alerts;
      })
    );

    this.subscriptions.add(
      this.esp32Service.config$.subscribe(config => {
        this.config = config;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => alert.active);
  }

  getActiveAlertsCount(): number {
    return this.getActiveAlerts().length;
  }

  getWarningAlertsCount(): number {
    return this.getActiveAlerts().filter(alert => alert.severity === 'warning').length;
  }

  getErrorAlertsCount(): number {
    return this.getActiveAlerts().filter(alert => alert.severity === 'error').length;
  }

  getTotalAlertsCount(): number {
    return this.alerts.length;
  }

  dismissAlert(alertId: string): void {
    this.alertService.dismissAlert(alertId);
  }

  dismissAllActiveAlerts(): void {
    this.getActiveAlerts().forEach(alert => {
      this.alertService.dismissAlert(alert.id);
    });
  }

  getAlertIcon(alert: Alert): string {
    switch (alert.type) {
      case 'temperature':
        return '🌡️';
      case 'humidity':
        return '💧';
      case 'soil':
        return '🌱';
      default:
        return '⚠️';
    }
  }

  getAlertCardClass(alert: Alert): string {
    if (alert.severity === 'error') {
      return 'bg-red-50 border-red-500';
    }
    return 'bg-yellow-50 border-yellow-500';
  }

  getAlertTextClass(alert: Alert): string {
    if (alert.severity === 'error') {
      return 'text-red-800';
    }
    return 'text-yellow-800';
  }

  setFilter(filter: 'all' | 'active' | 'dismissed'): void {
    this.currentFilter = filter;
  }

  getFilteredAlerts(): Alert[] {
    switch (this.currentFilter) {
      case 'active':
        return this.alerts.filter(alert => alert.active);
      case 'dismissed':
        return this.alerts.filter(alert => !alert.active);
      default:
        return this.alerts;
    }
  }

  getFilterButtonClass(filter: 'all' | 'active' | 'dismissed'): string {
    const base = 'px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200';
    return this.currentFilter === filter
      ? `${base} bg-primary-500 text-white`
      : `${base} bg-gray-100 text-gray-700 hover:bg-gray-200`;
  }
}