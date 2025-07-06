import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private promptEvent: any;
  private isInstallableSubject = new BehaviorSubject<boolean>(false);
  private isInstalledSubject = new BehaviorSubject<boolean>(false);
  private isIOSSubject = new BehaviorSubject<boolean>(false);
  private isStandaloneSubject = new BehaviorSubject<boolean>(false);

  public isInstallable$: Observable<boolean> = this.isInstallableSubject.asObservable();
  public isInstalled$: Observable<boolean> = this.isInstalledSubject.asObservable();
  public isIOS$: Observable<boolean> = this.isIOSSubject.asObservable();
  public isStandalone$: Observable<boolean> = this.isStandaloneSubject.asObservable();

  constructor() {
    this.initPWA();
  }

  private initPWA() {
    // Detectar iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    this.isIOSSubject.next(isIOS);

    // Detectar modo standalone
    const isStandalone = (window.navigator as any).standalone === true || 
                        window.matchMedia('(display-mode: standalone)').matches;
    this.isStandaloneSubject.next(isStandalone);

    // Detectar si ya está instalado
    const isInstalled = localStorage.getItem('pwa-installed') === 'true' || isStandalone;
    this.isInstalledSubject.next(isInstalled);

    // Configurar evento de instalación
    if (!isIOS) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.promptEvent = e;
        this.isInstallableSubject.next(true);
      });

      window.addEventListener('appinstalled', () => {
        this.isInstalledSubject.next(true);
        this.isInstallableSubject.next(false);
        localStorage.setItem('pwa-installed', 'true');
      });
    }

    // Para iOS, verificar después de un tiempo si puede ser instalable
    if (isIOS && !isStandalone) {
      setTimeout(() => {
        const hasPromptBeenShown = localStorage.getItem('pwa-install-prompt-shown');
        if (!hasPromptBeenShown) {
          this.isInstallableSubject.next(true);
        }
      }, 3000);
    }
  }

  async installPWA(): Promise<boolean> {
    if (!this.promptEvent) {
      return false;
    }

    try {
      const result = await this.promptEvent.prompt();
      return result.outcome === 'accepted';
    } catch (error) {
      console.error('Error installing PWA:', error);
      return false;
    }
  }

  showIOSInstallInstructions(): string {
    return `Para instalar Nueva Nave en tu dispositivo iOS:

1. Toca el botón Compartir (📤) en Safari
2. Desplázate hacia abajo y selecciona "Agregar a la pantalla de inicio"
3. Personaliza el nombre si lo deseas
4. Toca "Agregar" para confirmar

¡La app aparecerá en tu pantalla de inicio!`;
  }

  dismissInstallPrompt() {
    localStorage.setItem('pwa-install-prompt-shown', 'true');
    this.isInstallableSubject.next(false);
  }

  // Funcionalidades offline
  isOnline(): boolean {
    return navigator.onLine;
  }

  getNetworkStatus(): Observable<boolean> {
    return new Observable(observer => {
      observer.next(navigator.onLine);
      
      const handleOnline = () => observer.next(true);
      const handleOffline = () => observer.next(false);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    });
  }

  // Configuración específica para iOS
  setupIOSPWA() {
    if (!this.isIOSSubject.value) return;

    // Configurar viewport para iOS
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
      );
    }

    // Prevenir el bounce scroll
    document.addEventListener('touchmove', function(event: any) {
      if (event.scale !== undefined && event.scale !== 1) {
        event.preventDefault();
      }
    }, { passive: false });

    // Configurar status bar
    if (this.isStandaloneSubject.value) {
      document.body.style.paddingTop = 'env(safe-area-inset-top)';
      document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';
    }

    // Prevenir zoom en inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
          viewport.setAttribute('content', 
            'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
          );
        }
      });

      input.addEventListener('blur', () => {
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
          viewport.setAttribute('content', 
            'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
          );
        }
      });
    });
  }

  // Manejo de actualizaciones
  checkForUpdate(): Promise<boolean> {
    return new Promise((resolve) => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration) {
            registration.update().then(() => {
              resolve(true);
            }).catch(() => {
              resolve(false);
            });
          } else {
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
  }

  // Notificaciones push (para futuro)
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }

  showNotification(title: string, options?: NotificationOptions) {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification(title, {
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/icon-72x72.png',
            ...options
          });
        });
      }
    }
  }
}
