import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService, UserProfile } from '../../services/auth.service';
import { PwaService } from '../../services/pwa.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
  currentUser$: Observable<UserProfile | null>;
  sidebarOpen = false;
  isMobile = false;
  isIOS$ = this.pwaService.isIOS$;
  isStandalone$ = this.pwaService.isStandalone$;
  isInstallable$ = this.pwaService.isInstallable$;
  private destroy$ = new Subject<void>();
  private touchStartX = 0;
  private touchStartY = 0;
  private isDragging = false;

  constructor(
    private authService: AuthService,
    private pwaService: PwaService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.checkDevice();
    this.pwaService.setupIOSPWA();
    this.setupTouchGestures();
    
    // Suscribirse a cambios de estado PWA
    this.isIOS$.pipe(takeUntil(this.destroy$)).subscribe(isIOS => {
      if (isIOS) {
        document.body.classList.add('ios-device');
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkDevice();
    // Auto-cerrar sidebar en escritorio
    if (!this.isMobile && this.sidebarOpen) {
      this.sidebarOpen = false;
    }
  }

  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange(event: any) {
    // Timeout para esperar a que se complete el cambio de orientación
    setTimeout(() => {
      this.checkDevice();
      // Cerrar sidebar al cambiar orientación en móvil
      if (this.isMobile && this.sidebarOpen) {
        this.sidebarOpen = false;
      }
    }, 100);
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent) {
    if (this.sidebarOpen && this.isMobile) {
      this.closeSidebar();
    }
  }

  private setupTouchGestures() {
    // Solo para dispositivos móviles
    if (this.isMobile) {
      document.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: true });
      document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
      document.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: true });
    }
  }

  private onTouchStart(event: TouchEvent) {
    if (!this.isMobile) return;
    
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
    this.isDragging = false;
  }

  private onTouchMove(event: TouchEvent) {
    if (!this.isMobile || !this.touchStartX) return;
    
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;
    const deltaX = touchX - this.touchStartX;
    const deltaY = touchY - this.touchStartY;
    
    // Solo considerar swipe horizontal si no es vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      this.isDragging = true;
      
      // Swipe desde el borde izquierdo para abrir
      if (this.touchStartX < 20 && deltaX > 50 && !this.sidebarOpen) {
        event.preventDefault();
        this.openSidebar();
      }
      
      // Swipe hacia la izquierda para cerrar cuando está abierto
      if (this.sidebarOpen && deltaX < -50) {
        event.preventDefault();
        this.closeSidebar();
      }
    }
  }

  private onTouchEnd(event: TouchEvent) {
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.isDragging = false;
  }

  private checkDevice() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;
    
    // Si cambió de móvil a escritorio, asegurar que el sidebar esté visible
    if (wasMobile && !this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.updateBodyClass();
  }

  openSidebar() {
    this.sidebarOpen = true;
    this.updateBodyClass();
  }

  closeSidebar() {
    this.sidebarOpen = false;
    this.updateBodyClass();
  }

  private updateBodyClass() {
    if (this.isMobile) {
      if (this.sidebarOpen) {
        document.body.classList.add('sidebar-open', 'no-scroll');
      } else {
        document.body.classList.remove('sidebar-open', 'no-scroll');
      }
    } else {
      document.body.classList.remove('sidebar-open', 'no-scroll');
    }
  }

  async logout() {
    await this.authService.logout();
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  isSeller(): boolean {
    return this.authService.isSeller();
  }

  // Métodos para PWA
  showInstallPrompt() {
    this.pwaService.isIOS$.pipe(takeUntil(this.destroy$)).subscribe(isIOS => {
      if (isIOS) {
        const message = this.pwaService.showIOSInstallInstructions();
        alert(message);
        this.pwaService.dismissInstallPrompt();
      } else {
        this.pwaService.installPWA().then(success => {
          if (success) {
            console.log('PWA instalada exitosamente');
          }
        });
      }
    });
  }

  getDeviceClass(): string {
    let classes = '';
    
    if (this.isMobile) classes += ' mobile';
    
    // Usar observables de forma síncrona para las clases CSS
    this.isIOS$.pipe(takeUntil(this.destroy$)).subscribe(isIOS => {
      if (isIOS) classes += ' ios';
    });
    
    this.isStandalone$.pipe(takeUntil(this.destroy$)).subscribe(isStandalone => {
      if (isStandalone) classes += ' standalone';
    });
    
    return classes;
  }
}
