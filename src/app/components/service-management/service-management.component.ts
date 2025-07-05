import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ServiceService } from '../../services/service.service';
import { Service } from '../../interfaces/service.interface';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-service-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './service-management.component.html',
  styleUrls: ['./service-management.component.scss']
})
export class ServiceManagementComponent implements OnInit {
  services$!: Observable<Service[]>;
  serviceForm: FormGroup;
  selectedService: Service | null = null;
  isFormVisible = false;
  isLoading = false;
  searchTerm = '';
  selectedCategory = '';

  categories = [
    'Limpieza y Detallado',
    'Pulido',
    'Encerado',
    'Aspirado',
    'Lavado',
    'Tratamiento de Llantas',
    'Limpieza de Motor',
    'Otros'
  ];

  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceService
  ) {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      basePrice: [0, [Validators.required, Validators.min(0)]],
      commissionRate: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      estimatedDuration: [0, [Validators.required, Validators.min(1)]],
      isActive: [true],
      notes: [''],
      requiredSpecialties: [[]]
    });
  }

  ngOnInit() {
    this.loadServices();
  }

  loadServices() {
    this.services$ = this.serviceService.getServices();
  }

  openForm(service?: Service) {
    this.selectedService = service || null;
    this.isFormVisible = true;
    
    if (service) {
      this.serviceForm.patchValue({
        name: service.name,
        description: service.description,
        category: service.category,
        basePrice: service.basePrice,
        commissionRate: service.commissionRate,
        estimatedDuration: service.estimatedDuration,
        isActive: service.isActive,
        notes: service.notes
      });
    } else {
      this.serviceForm.reset();
      this.serviceForm.patchValue({ 
        isActive: true,
        basePrice: 0,
        commissionRate: 0,
        estimatedDuration: 1
      });
    }
  }

  closeForm() {
    this.isFormVisible = false;
    this.selectedService = null;
    this.serviceForm.reset();
  }

  async onSubmit() {
    if (this.serviceForm.valid) {
      this.isLoading = true;
      
      try {
        const serviceData: Partial<Service> = {
          ...this.serviceForm.value,
          updatedAt: new Date()
        };

        if (this.selectedService?.id) {
          await this.serviceService.updateService(this.selectedService.id, serviceData);
        } else {
          serviceData.createdAt = new Date();
          await this.serviceService.createService(serviceData as Omit<Service, 'id'>);
        }

        this.closeForm();
        this.loadServices();
      } catch (error) {
        console.error('Error al guardar servicio:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  async deleteService(service: Service) {
    if (service.id && confirm(`¿Estás seguro de que deseas eliminar el servicio "${service.name}"?`)) {
      try {
        await this.serviceService.deleteService(service.id);
        this.loadServices();
      } catch (error) {
        console.error('Error al eliminar servicio:', error);
      }
    }
  }

  async toggleServiceStatus(service: Service) {
    if (service.id) {
      try {
        await this.serviceService.updateService(service.id, { 
          isActive: !service.isActive,
          updatedAt: new Date()
        });
        this.loadServices();
      } catch (error) {
        console.error('Error al cambiar estado del servicio:', error);
      }
    }
  }

  filterServices(services: Service[]): Service[] {
    return services.filter(service => {
      const matchesSearch = !this.searchTerm || 
        service.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || 
        service.category === this.selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  }

  calculateCommission(basePrice: number, commissionRate: number): number {
    return (basePrice * commissionRate) / 100;
  }
}
