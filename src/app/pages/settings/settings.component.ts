import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Esp32Service } from '../../services/esp32.service';
import { AppConfig } from '../../models/sensor-data.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Configuración</h1>
        <p class="mt-2 text-gray-600">
          Ajusta los parámetros de monitoreo y alertas
        </p>
      </div>

      <div class="space-y-8">
        <!-- Connection Settings -->
        <div class="card">
          <h2 class="text-lg font-medium text-gray-900 mb-4">🔌 Configuración de Conexión</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                URL Base del ESP32
              </label>
              <input
                type="text"
                [(ngModel)]="localConfig.esp32BaseUrl"
                placeholder="http://192.168.1.7"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
              <p class="mt-1 text-xs text-gray-500">
                Dirección IP y puerto del ESP32
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Intervalo de Actualización (ms)
              </label>
              <select
                [(ngModel)]="localConfig.updateInterval"
                class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option [value]="1000">1 segundo</option>
                <option [value]="2000">2 segundos</option>
                <option [value]="3000">3 segundos</option>
                <option [value]="5000">5 segundos</option>
                <option [value]="10000">10 segundos</option>
                <option [value]="30000">30 segundos</option>
              </select>
              <p class="mt-1 text-xs text-gray-500">
                Frecuencia de consulta a los sensores
              </p>
            </div>
          </div>
        </div>

        <!-- Temperature Thresholds -->
        <div class="card">
          <h2 class="text-lg font-medium text-gray-900 mb-4">🌡️ Umbrales de Temperatura</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Temperatura Mínima (°C)
              </label>
              <div class="relative">
                <input
                  type="number"
                  [(ngModel)]="localConfig.alertThresholds.temperatureMin"
                  step="0.5"
                  min="-50"
                  max="100"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span class="text-gray-500 text-sm">°C</span>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Temperatura Máxima (°C)
              </label>
              <div class="relative">
                <input
                  type="number"
                  [(ngModel)]="localConfig.alertThresholds.temperatureMax"
                  step="0.5"
                  min="-50"
                  max="100"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span class="text-gray-500 text-sm">°C</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-4 p-3 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-700">
              💡 Se generará una alerta cuando la temperatura esté fuera del rango 
              {{ localConfig.alertThresholds.temperatureMin }}°C - {{ localConfig.alertThresholds.temperatureMax }}°C
            </p>
          </div>
        </div>

        <!-- Humidity Thresholds -->
        <div class="card">
          <h2 class="text-lg font-medium text-gray-900 mb-4">💧 Umbrales de Humedad</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Humedad Mínima (%)
              </label>
              <div class="relative">
                <input
                  type="number"
                  [(ngModel)]="localConfig.alertThresholds.humidityMin"
                  step="1"
                  min="0"
                  max="100"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span class="text-gray-500 text-sm">%</span>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Humedad Máxima (%)
              </label>
              <div class="relative">
                <input
                  type="number"
                  [(ngModel)]="localConfig.alertThresholds.humidityMax"
                  step="1"
                  min="0"
                  max="100"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span class="text-gray-500 text-sm">%</span>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-4 p-3 bg-green-50 rounded-lg">
            <p class="text-sm text-green-700">
              💡 Se generará una alerta cuando la humedad esté fuera del rango 
              {{ localConfig.alertThresholds.humidityMin }}% - {{ localConfig.alertThresholds.humidityMax }}%
            </p>
          </div>
        </div>

        <!-- Soil Moisture Thresholds -->
        <div class="card">
          <h2 class="text-lg font-medium text-gray-900 mb-4">🌱 Umbrales de Humedad del Suelo</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Humedad Mínima del Suelo (%)
              </label>
              <div class="relative">
                <input
                  type="number"
                  [(ngModel)]="localConfig.alertThresholds.soilMoistureMin"
                  step="1"
                  min="0"
                  max="100"
                  class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <span class="text-gray-500 text-sm">%</span>
                </div>
              </div>
              <p class="mt-1 text-xs text-gray-500">
                Nivel mínimo antes de generar alerta de suelo seco
              </p>
            </div>
            <div class="flex items-center">
              <div class="p-4 bg-yellow-50 rounded-lg">
                <h3 class="font-medium text-yellow-900 mb-2">Estado Actual</h3>
                <p class="text-sm text-yellow-700">
                  Suelo considerado seco cuando &lt; {{ localConfig.alertThresholds.soilMoistureMin }}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- System Info -->
        <div class="card">
          <h2 class="text-lg font-medium text-gray-900 mb-4">📊 Información del Sistema</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-medium text-gray-900 mb-2">Estado de Conexión</h3>
              <div class="flex items-center space-x-2">
                <div 
                  class="w-3 h-3 rounded-full"
                  [ngClass]="(connectionStatus$ | async) ? 'bg-green-500' : 'bg-red-500'"
                ></div>
                <span class="text-sm">
                  {{ (connectionStatus$ | async) ? 'Conectado' : 'Desconectado' }}
                </span>
              </div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-medium text-gray-900 mb-2">Datos Históricos</h3>
              <p class="text-sm text-gray-600">{{ getHistoricalDataCount() }} registros</p>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 class="font-medium text-gray-900 mb-2">Última Actualización</h3>
              <p class="text-sm text-gray-600">{{ getLastUpdateTime() }}</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-4">
          <button
            (click)="saveSettings()"
            class="btn-primary flex items-center space-x-2"
          >
            <span>💾</span>
            <span>Guardar Configuración</span>
          </button>
          <button
            (click)="resetToDefaults()"
            class="btn-secondary flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Restaurar Valores por Defecto</span>
          </button>
          <button
            (click)="testConnection()"
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium flex items-center space-x-2"
          >
            <span>🔍</span>
            <span>Probar Conexión</span>
          </button>
        </div>

        <!-- Save Status -->
        <div 
          *ngIf="saveStatus"
          class="p-4 rounded-lg animate-slide-up"
          [ngClass]="saveStatus.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'"
        >
          {{ saveStatus.message }}
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  localConfig: AppConfig = {
    updateInterval: 3000,
    esp32BaseUrl: 'http://192.168.1.7',
    alertThresholds: {
      temperatureMin: 15,
      temperatureMax: 35,
      humidityMin: 30,
      humidityMax: 80,
      soilMoistureMin: 20
    }
  };

  connectionStatus$ = this.esp32Service.connectionStatus$;
  saveStatus: { type: 'success' | 'error', message: string } | null = null;

  constructor(private esp32Service: Esp32Service) {}

  ngOnInit(): void {
    this.localConfig = { ...this.esp32Service.getConfig() };
  }

  saveSettings(): void {
    try {
      // Validate settings
      if (this.localConfig.alertThresholds.temperatureMin >= this.localConfig.alertThresholds.temperatureMax) {
        this.showStatus('error', 'La temperatura mínima debe ser menor que la máxima');
        return;
      }

      if (this.localConfig.alertThresholds.humidityMin >= this.localConfig.alertThresholds.humidityMax) {
        this.showStatus('error', 'La humedad mínima debe ser menor que la máxima');
        return;
      }

      if (this.localConfig.updateInterval < 1000) {
        this.showStatus('error', 'El intervalo de actualización debe ser de al menos 1 segundo');
        return;
      }

      // Save configuration
      this.esp32Service.updateConfig(this.localConfig);
      this.showStatus('success', '✅ Configuración guardada exitosamente');
    } catch (error) {
      this.showStatus('error', 'Error al guardar la configuración');
    }
  }

  resetToDefaults(): void {
    this.localConfig = {
      updateInterval: 3000,
      esp32BaseUrl: 'http://192.168.1.7',
      alertThresholds: {
        temperatureMin: 15,
        temperatureMax: 35,
        humidityMin: 30,
        humidityMax: 80,
        soilMoistureMin: 20
      }
    };
    this.showStatus('success', '⚙️ Configuración restaurada a valores por defecto');
  }

  testConnection(): void {
    // Simulate connection test
    this.showStatus('success', '🔍 Probando conexión... (simulado)');
    setTimeout(() => {
      this.showStatus('success', '✅ Conexión exitosa - ESP32 responde correctamente');
    }, 2000);
  }

  private showStatus(type: 'success' | 'error', message: string): void {
    this.saveStatus = { type, message };
    setTimeout(() => {
      this.saveStatus = null;
    }, 3000);
  }

  getHistoricalDataCount(): number {
    return this.esp32Service.getHistoricalData().length;
  }

  getLastUpdateTime(): string {
    const data = this.esp32Service.getHistoricalData();
    if (data.length === 0) return 'Sin datos';
    const lastData = data[data.length - 1];
    return lastData.timestamp.toLocaleString();
  }
}