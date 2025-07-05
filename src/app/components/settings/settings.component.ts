import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from '../../services/settings.service';
import { AuthService } from '../../services/auth.service';
import { Settings } from '../../interfaces/settings.interface';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="settings-management">
      <div class="header">
        <h2>Configuración del Sistema</h2>
      </div>
      
      <!-- Mensajes -->
      <div class="alert alert-error" *ngIf="error">{{ error }}</div>
      <div class="alert alert-success" *ngIf="success">{{ success }}</div>
      
      <!-- Loader -->
      <div class="loader" *ngIf="loading">Cargando...</div>
      
      <!-- Formulario de configuración -->
      <form [formGroup]="settingsForm" (ngSubmit)="saveSettings()" *ngIf="!loading">
        <div class="settings-section">
          <h3>Configuración de Comisiones</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Comisión por Defecto (%)</label>
              <input type="number" formControlName="defaultCommissionPercentage" 
                     min="0" max="100" step="0.1">
              <small>Porcentaje de comisión sobre el precio de venta</small>
            </div>
            
            <div class="form-group">
              <label>Sale In (%)</label>
              <input type="number" formControlName="defaultSaleInPercentage" 
                     min="0" max="100" step="0.1">
              <small>Porcentaje para el vendedor que captó el auto</small>
            </div>
            
            <div class="form-group">
              <label>Sale Off (%)</label>
              <input type="number" formControlName="defaultSaleOffPercentage" 
                     min="0" max="100" step="0.1">
              <small>Porcentaje para el vendedor que cerró la venta</small>
            </div>
            
            <div class="form-group">
              <label>Empresa (%)</label>
              <input type="number" formControlName="defaultCompanyPercentage" 
                     min="0" max="100" step="0.1" readonly>
              <small>Se calcula automáticamente (100% - Sale In - Sale Off)</small>
            </div>
          </div>
        </div>
        
        <div class="settings-section">
          <h3>Información de la Empresa</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre de la Empresa</label>
              <input type="text" formControlName="companyName">
            </div>
            
            <div class="form-group">
              <label>Email</label>
              <input type="email" formControlName="companyEmail">
            </div>
            
            <div class="form-group">
              <label>Teléfono</label>
              <input type="tel" formControlName="companyPhone">
            </div>
            
            <div class="form-group full-width">
              <label>Dirección</label>
              <input type="text" formControlName="companyAddress">
            </div>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" (click)="resetToDefaults()">
            Restaurar Valores por Defecto
          </button>
          <button type="submit" class="btn btn-primary" [disabled]="!settingsForm.valid || loading">
            Guardar Configuración
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .settings-management {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .header {
      margin-bottom: 30px;
    }
    
    .header h2 {
      margin: 0;
      color: #2c3e50;
    }
    
    .alert {
      padding: 12px;
      margin: 10px 0;
      border-radius: 4px;
      font-weight: 500;
    }
    
    .alert-error {
      background-color: #fee;
      color: #c33;
      border: 1px solid #fcc;
    }
    
    .alert-success {
      background-color: #efe;
      color: #363;
      border: 1px solid #cfc;
    }
    
    .loader {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    
    .settings-section {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .settings-section h3 {
      margin: 0 0 20px 0;
      color: #2c3e50;
      font-size: 18px;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
    }
    
    .form-group.full-width {
      grid-column: 1 / -1;
    }
    
    .form-group label {
      margin-bottom: 5px;
      font-weight: 500;
      color: #333;
    }
    
    .form-group input {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: #3498db;
    }
    
    .form-group input[readonly] {
      background-color: #f8f9fa;
      color: #6c757d;
    }
    
    .form-group small {
      margin-top: 5px;
      color: #666;
      font-size: 12px;
    }
    
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
    
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    
    .btn-primary {
      background-color: #3498db;
      color: white;
    }
    
    .btn-primary:hover {
      background-color: #2980b9;
    }
    
    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover {
      background-color: #5a6268;
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
      .settings-management {
        padding: 15px;
      }
      
      .form-grid {
        grid-template-columns: 1fr;
      }
      
      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(
    private settingsService: SettingsService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.settingsForm = this.fb.group({
      defaultCommissionPercentage: [4, [Validators.required, Validators.min(0), Validators.max(100)]],
      defaultSaleInPercentage: [20, [Validators.required, Validators.min(0), Validators.max(100)]],
      defaultSaleOffPercentage: [20, [Validators.required, Validators.min(0), Validators.max(100)]],
      defaultCompanyPercentage: [60, [Validators.required, Validators.min(0), Validators.max(100)]],
      companyName: ['Nueva Nave', Validators.required],
      companyEmail: ['info@nuevanave.com', [Validators.required, Validators.email]],
      companyPhone: ['+1234567890', Validators.required],
      companyAddress: ['Dirección de la empresa', Validators.required]
    });
    
    // Calcular automáticamente el porcentaje de la empresa
    this.settingsForm.get('defaultSaleInPercentage')?.valueChanges.subscribe(() => {
      this.calculateCompanyPercentage();
    });
    
    this.settingsForm.get('defaultSaleOffPercentage')?.valueChanges.subscribe(() => {
      this.calculateCompanyPercentage();
    });
  }

  ngOnInit() {
    this.loadSettings();
  }

  async loadSettings() {
    this.loading = true;
    this.error = '';
    
    try {
      const settings = await this.settingsService.getSettings();
      this.settingsForm.patchValue(settings);
    } catch (error: any) {
      this.error = 'Error cargando configuración: ' + error.message;
    } finally {
      this.loading = false;
    }
  }

  calculateCompanyPercentage() {
    const saleIn = this.settingsForm.get('defaultSaleInPercentage')?.value || 0;
    const saleOff = this.settingsForm.get('defaultSaleOffPercentage')?.value || 0;
    const company = 100 - saleIn - saleOff;
    
    this.settingsForm.patchValue({
      defaultCompanyPercentage: company
    }, { emitEvent: false });
  }

  async saveSettings() {
    if (!this.settingsForm.valid) {
      this.error = 'Por favor complete todos los campos correctamente';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      await this.settingsService.updateSettings(
        this.settingsForm.value,
        currentUser.uid
      );
      
      this.success = 'Configuración guardada exitosamente';
    } catch (error: any) {
      this.error = 'Error guardando configuración: ' + error.message;
    } finally {
      this.loading = false;
    }
  }

  async resetToDefaults() {
    if (!confirm('¿Está seguro de que desea restaurar los valores por defecto?')) {
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      await this.settingsService.resetToDefaults(currentUser.uid);
      await this.loadSettings();
      this.success = 'Configuración restaurada a valores por defecto';
    } catch (error: any) {
      this.error = 'Error restaurando configuración: ' + error.message;
    } finally {
      this.loading = false;
    }
  }
}
