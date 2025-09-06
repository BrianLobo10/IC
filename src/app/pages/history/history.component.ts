import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Esp32Service } from '../../services/esp32.service';
import { SensorData } from '../../models/sensor-data.model';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Histórico de Datos</h1>
        <p class="mt-2 text-gray-600">
          Registro completo de todas las lecturas de sensores
        </p>
      </div>

      <!-- Filters -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Filtros</h2>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Desde
            </label>
            <input
              type="datetime-local"
              [(ngModel)]="startDate"
              (change)="filterData()"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Hasta
            </label>
            <input
              type="datetime-local"
              [(ngModel)]="endDate"
              (change)="filterData()"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Registros por página
            </label>
            <select
              [(ngModel)]="pageSize"
              (change)="updatePagination()"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              (click)="exportData()"
              class="btn-secondary w-full"
            >
              📥 Exportar CSV
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Summary -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="card text-center">
          <p class="text-2xl font-bold text-primary-600">{{ filteredData.length }}</p>
          <p class="text-sm text-gray-500">Total Registros</p>
        </div>
        <div class="card text-center">
          <p class="text-2xl font-bold text-success-600">{{ getAverageTemperature() }}°C</p>
          <p class="text-sm text-gray-500">Temp. Promedio</p>
        </div>
        <div class="card text-center">
          <p class="text-2xl font-bold text-primary-600">{{ getAverageHumidity() }}%</p>
          <p class="text-sm text-gray-500">Humedad Promedio</p>
        </div>
        <div class="card text-center">
          <p class="text-2xl font-bold text-warning-600">{{ getAverageSoil() }}%</p>
          <p class="text-sm text-gray-500">Suelo Promedio</p>
        </div>
      </div>

      <!-- Data Table -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-gray-900">
            Datos Históricos
          </h2>
          <div class="text-sm text-gray-500">
            Mostrando {{ getStartIndex() + 1 }}-{{ getEndIndex() }} de {{ filteredData.length }} registros
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    (click)="sortBy('timestamp')">
                  Fecha y Hora
                  <span *ngIf="sortField === 'timestamp'">
                    {{ sortDirection === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    (click)="sortBy('temperature')">
                  Temperatura (°C)
                  <span *ngIf="sortField === 'temperature'">
                    {{ sortDirection === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    (click)="sortBy('humidity')">
                  Humedad (%)
                  <span *ngIf="sortField === 'humidity'">
                    {{ sortDirection === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    (click)="sortBy('soilMoisture')">
                  Suelo (%)
                  <span *ngIf="sortField === 'soilMoisture'">
                    {{ sortDirection === 'asc' ? '↑' : '↓' }}
                  </span>
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let data of getPaginatedData()" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ data.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                    [ngClass]="getTemperatureClass(data.temperature)">
                  {{ data.temperature }}°C
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                    [ngClass]="getHumidityClass(data.humidity)">
                  {{ data.humidity }}%
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium"
                    [ngClass]="getSoilClass(data.soilMoisture)">
                  {{ data.soilMoisture }}%
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [ngClass]="getStatusBadgeClass(data)">
                    {{ getStatus(data) }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="filteredData.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                  No hay datos disponibles en el rango seleccionado
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200"
             *ngIf="filteredData.length > pageSize">
          <div class="text-sm text-gray-700">
            Página {{ currentPage }} de {{ getTotalPages() }}
          </div>
          <div class="flex space-x-2">
            <button
              (click)="previousPage()"
              [disabled]="currentPage <= 1"
              class="px-3 py-1 rounded-md text-sm font-medium"
              [ngClass]="currentPage <= 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'"
            >
              Anterior
            </button>
            <button
              (click)="nextPage()"
              [disabled]="currentPage >= getTotalPages()"
              class="px-3 py-1 rounded-md text-sm font-medium"
              [ngClass]="currentPage >= getTotalPages() 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HistoryComponent implements OnInit {
  allData: SensorData[] = [];
  filteredData: SensorData[] = [];
  
  startDate: string = '';
  endDate: string = '';
  pageSize: number = 25;
  currentPage: number = 1;
  sortField: keyof SensorData = 'timestamp';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(private esp32Service: Esp32Service) {}

  ngOnInit(): void {
    this.loadData();
    this.setDefaultDateRange();
  }

  private loadData(): void {
    this.allData = this.esp32Service.getHistoricalData();
    this.filterData();
  }

  private setDefaultDateRange(): void {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    this.startDate = oneDayAgo.toISOString().slice(0, 16);
    this.endDate = now.toISOString().slice(0, 16);
  }

  filterData(): void {
    let filtered = [...this.allData];

    if (this.startDate) {
      const start = new Date(this.startDate);
      filtered = filtered.filter(d => d.timestamp >= start);
    }

    if (this.endDate) {
      const end = new Date(this.endDate);
      filtered = filtered.filter(d => d.timestamp <= end);
    }

    // Sort data
    filtered.sort((a, b) => {
      const aVal = a[this.sortField] as any;
      const bVal = b[this.sortField] as any;
      
      if (this.sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    this.filteredData = filtered;
    this.currentPage = 1;
  }

  sortBy(field: keyof SensorData): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }
    this.filterData();
  }

  updatePagination(): void {
    this.currentPage = 1;
  }

  getPaginatedData(): SensorData[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredData.slice(start, end);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredData.length);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  getTemperatureClass(temp: number): string {
    const config = this.esp32Service.getConfig();
    if (temp < config.alertThresholds.temperatureMin) return 'text-blue-600';
    if (temp > config.alertThresholds.temperatureMax) return 'text-red-600';
    return 'text-green-600';
  }

  getHumidityClass(humidity: number): string {
    const config = this.esp32Service.getConfig();
    if (humidity < config.alertThresholds.humidityMin) return 'text-red-600';
    if (humidity > config.alertThresholds.humidityMax) return 'text-blue-600';
    return 'text-green-600';
  }

  getSoilClass(soil: number): string {
    const config = this.esp32Service.getConfig();
    if (soil < config.alertThresholds.soilMoistureMin) return 'text-red-600';
    return 'text-green-600';
  }

  getStatus(data: SensorData): string {
    const config = this.esp32Service.getConfig();
    const tempOk = data.temperature >= config.alertThresholds.temperatureMin && 
                   data.temperature <= config.alertThresholds.temperatureMax;
    const humidityOk = data.humidity >= config.alertThresholds.humidityMin && 
                       data.humidity <= config.alertThresholds.humidityMax;
    const soilOk = data.soilMoisture >= config.alertThresholds.soilMoistureMin;

    if (tempOk && humidityOk && soilOk) return 'Normal';
    return 'Alerta';
  }

  getStatusBadgeClass(data: SensorData): string {
    const status = this.getStatus(data);
    return status === 'Normal' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  getAverageTemperature(): string {
    if (this.filteredData.length === 0) return '0.0';
    const avg = this.filteredData.reduce((sum, d) => sum + d.temperature, 0) / this.filteredData.length;
    return avg.toFixed(1);
  }

  getAverageHumidity(): string {
    if (this.filteredData.length === 0) return '0.0';
    const avg = this.filteredData.reduce((sum, d) => sum + d.humidity, 0) / this.filteredData.length;
    return avg.toFixed(1);
  }

  getAverageSoil(): string {
    if (this.filteredData.length === 0) return '0.0';
    const avg = this.filteredData.reduce((sum, d) => sum + d.soilMoisture, 0) / this.filteredData.length;
    return avg.toFixed(1);
  }

  exportData(): void {
    if (this.filteredData.length === 0) return;

    const headers = ['Fecha y Hora', 'Temperatura (°C)', 'Humedad (%)', 'Suelo (%)', 'Estado'];
    const csvContent = [
      headers.join(','),
      ...this.filteredData.map(data => [
        data.timestamp.toISOString(),
        data.temperature,
        data.humidity,
        data.soilMoisture,
        this.getStatus(data)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sensor_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}