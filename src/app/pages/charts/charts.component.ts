import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Subscription } from 'rxjs';
import { Esp32Service } from '../../services/esp32.service';
import { SensorData } from '../../models/sensor-data.model';

Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="animate-fade-in">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Gráficas en Tiempo Real</h1>
        <p class="mt-2 text-gray-600">
          Visualización de la evolución de los sensores ambientales
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div class="flex flex-wrap gap-4 items-center">
          <button
            (click)="setTimeRange(10)"
            [class]="getButtonClass(10)"
          >
            10 min
          </button>
          <button
            (click)="setTimeRange(30)"
            [class]="getButtonClass(30)"
          >
            30 min
          </button>
          <button
            (click)="setTimeRange(60)"
            [class]="getButtonClass(60)"
          >
            1 hora
          </button>
          <div class="flex items-center space-x-2 ml-4">
            <label class="text-sm text-gray-600">Auto-actualizar:</label>
            <input
              type="checkbox"
              [(ngModel)]="autoUpdate"
              class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            >
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="card">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Tendencias Temporales</h2>
          <div class="h-96">
            <canvas #lineChart></canvas>
          </div>
        </div>

        <div class="card">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Valores Actuales</h2>
          <div class="h-80">
            <canvas #barChart></canvas>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="card text-center">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Temperatura</h3>
            <div class="space-y-2">
              <p><span class="font-semibold">Promedio:</span> {{ getAverage('temperature') }}°C</p>
              <p><span class="font-semibold">Mínima:</span> {{ getMin('temperature') }}°C</p>
              <p><span class="font-semibold">Máxima:</span> {{ getMax('temperature') }}°C</p>
            </div>
          </div>
          <div class="card text-center">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Humedad</h3>
            <div class="space-y-2">
              <p><span class="font-semibold">Promedio:</span> {{ getAverage('humidity') }}%</p>
              <p><span class="font-semibold">Mínima:</span> {{ getMin('humidity') }}%</p>
              <p><span class="font-semibold">Máxima:</span> {{ getMax('humidity') }}%</p>
            </div>
          </div>
          <div class="card text-center">
            <h3 class="text-lg font-medium text-gray-900 mb-2">Suelo</h3>
            <div class="space-y-2">
              <p><span class="font-semibold">Promedio:</span> {{ getAverage('soilMoisture') }}%</p>
              <p><span class="font-semibold">Mínima:</span> {{ getMin('soilMoisture') }}%</p>
              <p><span class="font-semibold">Máxima:</span> {{ getMax('soilMoisture') }}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ChartsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('lineChart', { static: false }) lineChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('barChart', { static: false }) barChartRef!: ElementRef<HTMLCanvasElement>;

  private lineChart!: Chart;
  private barChart!: Chart;
  private subscriptions = new Subscription();

  timeRange = 30; // minutes
  autoUpdate = true;
  currentData: SensorData | null = null;
  historicalData: SensorData[] = [];

  constructor(private esp32Service: Esp32Service) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.esp32Service.data$.subscribe(data => {
        if (data) {
          this.currentData = data;
          this.historicalData = this.esp32Service.getHistoricalData();
          if (this.autoUpdate && this.lineChart && this.barChart) {
            this.updateCharts();
          }
        }
      })
    );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.lineChart) {
      this.lineChart.destroy();
    }
    if (this.barChart) {
      this.barChart.destroy();
    }
  }

  private initializeCharts(): void {
    this.createLineChart();
    this.createBarChart();
    this.updateCharts();
  }

  private createLineChart(): void {
    const ctx = this.lineChartRef.nativeElement.getContext('2d')!;
    
    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Temperatura (°C)',
            data: [],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Humedad (%)',
            data: [],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Suelo (%)',
            data: [],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Tiempo'
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Valor'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              title: (context) => {
                return new Date(context[0].label).toLocaleTimeString();
              }
            }
          }
        }
      }
    };

    this.lineChart = new Chart(ctx, config);
  }

  private createBarChart(): void {
    const ctx = this.barChartRef.nativeElement.getContext('2d')!;
    
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['Temperatura', 'Humedad', 'Suelo'],
        datasets: [{
          label: 'Valores Actuales',
          data: [0, 0, 0],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ],
          borderColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Valor'
            }
          }
        }
      }
    };

    this.barChart = new Chart(ctx, config);
  }

  private updateCharts(): void {
    const filteredData = this.getFilteredData();
    
    if (this.lineChart) {
      this.lineChart.data.labels = filteredData.map(d => d.timestamp.toISOString());
      this.lineChart.data.datasets[0].data = filteredData.map(d => d.temperature);
      this.lineChart.data.datasets[1].data = filteredData.map(d => d.humidity);
      this.lineChart.data.datasets[2].data = filteredData.map(d => d.soilMoisture);
      this.lineChart.update('none');
    }

    if (this.barChart && this.currentData) {
      this.barChart.data.datasets[0].data = [
        this.currentData.temperature,
        this.currentData.humidity,
        this.currentData.soilMoisture
      ];
      this.barChart.update('none');
    }
  }

  private getFilteredData(): SensorData[] {
    const cutoff = new Date(Date.now() - this.timeRange * 60 * 1000);
    return this.historicalData.filter(d => d.timestamp >= cutoff);
  }

  setTimeRange(minutes: number): void {
    this.timeRange = minutes;
    if (this.lineChart) {
      this.updateCharts();
    }
  }

  getButtonClass(minutes: number): string {
    const base = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200';
    return this.timeRange === minutes 
      ? `${base} bg-primary-500 text-white` 
      : `${base} bg-gray-100 text-gray-700 hover:bg-gray-200`;
  }

  getAverage(metric: keyof SensorData): string {
    const data = this.getFilteredData();
    if (data.length === 0) return '0.0';
    const sum = data.reduce((acc, d) => acc + (d[metric] as number), 0);
    return (sum / data.length).toFixed(1);
  }

  getMin(metric: keyof SensorData): string {
    const data = this.getFilteredData();
    if (data.length === 0) return '0.0';
    const min = Math.min(...data.map(d => d[metric] as number));
    return min.toFixed(1);
  }

  getMax(metric: keyof SensorData): string {
    const data = this.getFilteredData();
    if (data.length === 0) return '0.0';
    const max = Math.max(...data.map(d => d[metric] as number));
    return max.toFixed(1);
  }
}