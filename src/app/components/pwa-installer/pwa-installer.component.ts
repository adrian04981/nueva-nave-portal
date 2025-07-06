import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../services/pwa.service';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-pwa-installer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pwa-installer" *ngIf="showInstaller">
      <div class="installer-content">
        <div class="installer-header">
          <h3>📱 Instalar Nueva Nave</h3>
          <button class="close-btn" (click)="hideInstaller()" aria-label="Cerrar">×</button>
        </div>
        
        <div class="installer-body">
          <div class="device-icon">📱</div>
          <p>Para una mejor experiencia, instala Nueva Nave en tu iPhone:</p>
          
          <div class="installation-steps">
            <div class="step">
              <span class="step-number">1</span>
              <span class="step-text">Toca el botón <strong>Compartir</strong> <span class="share-icon">📤</span> en Safari</span>
            </div>
            
            <div class="step">
              <span class="step-number">2</span>
              <span class="step-text">Selecciona <strong>"Agregar a la pantalla de inicio"</strong></span>
            </div>
            
            <div class="step">
              <span class="step-number">3</span>
              <span class="step-text">Toca <strong>"Agregar"</strong> para confirmar</span>
            </div>
          </div>
          
          <div class="benefits">
            <h4>Beneficios:</h4>
            <ul>
              <li>✅ Acceso directo desde tu pantalla de inicio</li>
              <li>✅ Funciona sin conexión</li>
              <li>✅ Experiencia similar a una app nativa</li>
              <li>✅ Notificaciones push</li>
            </ul>
          </div>
        </div>
        
        <div class="installer-footer">
          <button class="btn-secondary" (click)="hideInstaller()">
            Ahora no
          </button>
          <button class="btn-primary" (click)="openInstructions()">
            Mostrar instrucciones
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pwa-installer {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    }

    .installer-content {
      background: white;
      border-radius: 16px;
      max-width: 400px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .installer-header {
      padding: 24px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #2c3e50;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #7f8c8d;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease;

        &:hover {
          background-color: #f5f5f5;
        }
      }
    }

    .installer-body {
      padding: 24px;
      text-align: center;

      .device-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }

      p {
        font-size: 16px;
        color: #2c3e50;
        margin-bottom: 24px;
        line-height: 1.5;
      }
    }

    .installation-steps {
      text-align: left;
      margin-bottom: 24px;

      .step {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 16px;

        .step-number {
          background: #3498db;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .step-text {
          flex: 1;
          font-size: 14px;
          line-height: 1.4;
          color: #2c3e50;

          .share-icon {
            font-size: 16px;
          }
        }
      }
    }

    .benefits {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      text-align: left;

      h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        color: #2c3e50;
      }

      ul {
        margin: 0;
        padding-left: 0;
        list-style: none;

        li {
          font-size: 14px;
          color: #2c3e50;
          margin-bottom: 8px;
          padding-left: 4px;
        }
      }
    }

    .installer-footer {
      padding: 24px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      gap: 12px;
      justify-content: flex-end;

      button {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        min-height: 44px;
      }

      .btn-secondary {
        background: #95a5a6;
        color: white;

        &:hover {
          background: #7f8c8d;
        }
      }

      .btn-primary {
        background: #3498db;
        color: white;

        &:hover {
          background: #2980b9;
        }
      }
    }

    @media (max-width: 480px) {
      .pwa-installer {
        padding: 12px;
      }

      .installer-content {
        border-radius: 12px;
      }

      .installer-header,
      .installer-body,
      .installer-footer {
        padding: 16px;
      }

      .installer-footer {
        flex-direction: column;

        button {
          width: 100%;
        }
      }
    }
  `]
})
export class PwaInstallerComponent implements OnInit, OnDestroy {
  showInstaller = false;
  private destroy$ = new Subject<void>();

  constructor(private pwaService: PwaService) {}

  ngOnInit() {
    this.setupInstaller();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupInstaller() {
    // Mostrar instalador solo para iOS que no esté en modo standalone y sea instalable
    combineLatest([
      this.pwaService.isIOS$,
      this.pwaService.isStandalone$,
      this.pwaService.isInstallable$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(([isIOS, isStandalone, isInstallable]) => {
      this.showInstaller = isIOS && !isStandalone && isInstallable;
    });
  }

  hideInstaller() {
    this.showInstaller = false;
    this.pwaService.dismissInstallPrompt();
  }

  openInstructions() {
    const instructions = this.pwaService.showIOSInstallInstructions();
    alert(instructions);
    this.hideInstaller();
  }
}
