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

  constructor(
    private authService: AuthService,
    private pwaService: PwaService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    this.checkDevice();
    this.pwaService.setupIOSPWA();
    
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
  }

  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange(event: any) {
    // Timeout para esperar a que se complete el cambio de orientación
    setTimeout(() => {
      this.checkDevice();
    }, 100);
  }

  private checkDevice() {
    this.isMobile = window.innerWidth < 768;
    
    if (this.isMobile && this.sidebarOpen) {
      // Cerrar sidebar automáticamente en móviles
      this.sidebarOpen = false;
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
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
