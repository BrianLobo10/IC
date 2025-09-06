import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <h1 class="text-xl font-bold text-gray-900">
                🌡️ Monitor Ambiental
              </h1>
            </div>
          </div>

          <div class="flex space-x-8">
            <a
              routerLink="/dashboard"
              routerLinkActive="border-primary-500 text-primary-600"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
            >
              📊 Dashboard
            </a>
            <a
              routerLink="/charts"
              routerLinkActive="border-primary-500 text-primary-600"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
            >
              📈 Gráficas
            </a>
            <a
              routerLink="/history"
              routerLinkActive="border-primary-500 text-primary-600"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
            >
              📋 Histórico
            </a>
            <a
              routerLink="/alerts"
              routerLinkActive="border-primary-500 text-primary-600"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 relative"
            >
              🚨 Alertas
              <span 
                *ngIf="(activeAlertsCount$ | async)! > 0"
                class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse"
              >
                {{ activeAlertsCount$ | async }}
              </span>
            </a>
            <a
              routerLink="/settings"
              routerLinkActive="border-primary-500 text-primary-600"
              class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200"
            >
              ⚙️ Configuración
            </a>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  activeAlertsCount$ = this.alertService.alerts$.pipe(
    map(alerts => alerts.filter(alert => alert.active).length)
  );

  constructor(private alertService: AlertService) {}
}