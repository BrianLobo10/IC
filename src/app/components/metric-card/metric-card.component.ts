import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="metric-card" [ngClass]="getCardClass()">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">{{ label }}</p>
          <p class="text-3xl font-bold" [ngClass]="getValueClass()">
            {{ value }}{{ unit }}
          </p>
        </div>
        <div class="text-4xl opacity-80">
          {{ icon }}
        </div>
      </div>
      <div class="mt-4 flex items-center text-sm">
        <span [ngClass]="getTrendClass()">
          {{ getTrendIcon() }} {{ getTrendText() }}
        </span>
      </div>
    </div>
  `
})
export class MetricCardComponent {
  @Input() label!: string;
  @Input() value!: number;
  @Input() unit!: string;
  @Input() icon!: string;
  @Input() status: 'normal' | 'warning' | 'error' = 'normal';
  @Input() trend: 'up' | 'down' | 'stable' = 'stable';
  @Input() previousValue?: number;

  getCardClass(): string {
    switch (this.status) {
      case 'warning':
        return 'border-l-4 border-warning-500 bg-warning-50';
      case 'error':
        return 'border-l-4 border-danger-500 bg-danger-50';
      default:
        return 'border-l-4 border-primary-500';
    }
  }

  getValueClass(): string {
    switch (this.status) {
      case 'warning':
        return 'text-warning-600';
      case 'error':
        return 'text-danger-600';
      default:
        return 'text-gray-900';
    }
  }

  getTrendClass(): string {
    switch (this.trend) {
      case 'up':
        return 'text-success-600';
      case 'down':
        return 'text-danger-600';
      default:
        return 'text-gray-500';
    }
  }

  getTrendIcon(): string {
    switch (this.trend) {
      case 'up':
        return '↗️';
      case 'down':
        return '↘️';
      default:
        return '→';
    }
  }

  getTrendText(): string {
    if (this.previousValue !== undefined) {
      const diff = this.value - this.previousValue;
      return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`;
    }
    return 'Sin cambios';
  }
}