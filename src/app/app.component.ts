import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PwaInstallerComponent } from './components/pwa-installer/pwa-installer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, PwaInstallerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Nueva Nave';

  ngOnInit() {
    this.registerServiceWorker();
    this.setupPWA();
  }

  private registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration);
          
          // Verificar actualizaciones
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // Nueva versión disponible
                  this.showUpdateNotification();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Error registrando Service Worker:', error);
        });
    }
  }

  private setupPWA() {
    // Configurar PWA
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      // Guardar el evento para mostrarlo más tarde
      (window as any).deferredPrompt = e;
    });

    // Detectar cuando la app es instalada
    window.addEventListener('appinstalled', () => {
      console.log('PWA instalada exitosamente');
      localStorage.setItem('pwa-installed', 'true');
    });

    // Configurar viewport para iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      document.body.classList.add('ios-device');
      
      // Prevenir zoom en inputs
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
        );
      }
    }
  }

  private showUpdateNotification() {
    if (confirm('Nueva versión disponible. ¿Deseas actualizar?')) {
      window.location.reload();
    }
  }
}
