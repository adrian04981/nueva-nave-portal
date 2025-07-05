import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { VehicleService } from '../../services/vehicle.service';
import { ClientService } from '../../services/client.service';
import { AuthService } from '../../services/auth.service';
import { ImageService } from '../../services/image.service';
import { Vehicle } from '../../interfaces/vehicle.interface';
import { Client } from '../../interfaces/client.interface';
import { ImageUploadComponent } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-vehicle-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ImageUploadComponent],
  templateUrl: './vehicle-management.component.html',
  styleUrls: ['./vehicle-management.component.scss']
})
export class VehicleManagementComponent implements OnInit {
  vehicles: Vehicle[] = [];
  filteredVehicles: Vehicle[] = [];
  loading = false;
  error = '';
  success = '';
  showForm = false;
  editMode = false;
  editingVehicle: Vehicle | null = null;
  
  // Cliente selector
  showClientSelector = false;
  clients: Client[] = [];
  filteredClients: Client[] = [];
  selectedClient: Client | null = null;
  clientSearchTerm = '';
  
  vehicleForm: FormGroup;
  searchTerm = '';
  statusFilter = '';
  
  statuses = [
    { value: 'en_venta', label: 'En Venta' },
    { value: 'en_venta_discreta', label: 'En Venta Discreta' },
    { value: 'cancelado', label: 'Cancelado' },
    { value: 'vendido', label: 'Vendido' }
  ];
  
  brands = [
    'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Hyundai', 'Volkswagen', 
    'Mazda', 'Subaru', 'Kia', 'BMW', 'Mercedes-Benz', 'Audi', 'Otro'
  ];
  
  transmissions = ['Manual', 'Automática', 'CVT'];
  fuels = ['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico'];

  // Imágenes del vehículo
  vehicleImages: string[] = [];
  imageError = '';

  constructor(
    private vehicleService: VehicleService,
    private clientService: ClientService,
    private authService: AuthService,
    private imageService: ImageService,
    private fb: FormBuilder
  ) {
    this.vehicleForm = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(2030)]],
      color: ['', Validators.required],
      mileage: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      status: ['en_venta', Validators.required],
      ownerId: ['', Validators.required],
      engine: [''],
      transmission: [''],
      fuel: [''],
      doors: [4, [Validators.min(2), Validators.max(8)]],
      features: ['']
    });
  }

  ngOnInit() {
    this.loadVehicles();
    this.loadClients();
  }

  async loadClients() {
    try {
      this.clients = await this.clientService.getAllClients();
      this.filteredClients = [...this.clients];
    } catch (error: any) {
      console.error('Error cargando clientes:', error);
    }
  }

  async loadVehicles() {
    this.loading = true;
    this.error = '';
    
    try {
      const currentUser = this.authService.getCurrentUser();
      
      if (currentUser?.role === 'vendedor') {
        // Vendedores solo ven sus propios vehículos
        this.vehicles = await this.vehicleService.getVehiclesBySeller(currentUser.uid);
      } else {
        // Administradores ven todos los vehículos
        this.vehicles = await this.vehicleService.getAllVehicles();
      }
      
      this.filteredVehicles = [...this.vehicles];
      this.filterVehicles();
    } catch (error: any) {
      this.error = 'Error cargando vehículos: ' + error.message;
    } finally {
      this.loading = false;
    }
  }

  filterVehicles() {
    this.filteredVehicles = this.vehicles.filter(vehicle => {
      const matchesSearch = !this.searchTerm || 
        vehicle.brand.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        vehicle.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || vehicle.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  showAddForm() {
    this.showForm = true;
    this.editMode = false;
    this.editingVehicle = null;
    this.selectedClient = null;
    this.vehicleImages = []; // Limpiar imágenes
    this.vehicleForm.reset({
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      mileage: 0,
      price: 0,
      description: '',
      status: 'en_venta',
      ownerId: '',
      engine: '',
      transmission: '',
      fuel: '',
      doors: 4,
      features: ''
    });
  }

  editVehicle(vehicle: Vehicle) {
    const currentUser = this.authService.getCurrentUser();
    
    // Solo administradores pueden editar
    if (currentUser?.role !== 'administrador') {
      this.error = 'Solo los administradores pueden editar vehículos';
      return;
    }
    
    this.showForm = true;
    this.editMode = true;
    this.editingVehicle = vehicle;
    
    // Buscar el cliente seleccionado
    this.selectedClient = this.clients.find(c => c.id === vehicle.ownerId) || null;
    
    // Cargar imágenes existentes
    this.vehicleImages = vehicle.images || [];
    
    this.vehicleForm.patchValue({
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      mileage: vehicle.mileage,
      price: vehicle.price,
      description: vehicle.description,
      status: vehicle.status,
      ownerId: vehicle.ownerId,
      engine: vehicle.engine || '',
      transmission: vehicle.transmission || '',
      fuel: vehicle.fuel || '',
      doors: vehicle.doors || 4,
      features: vehicle.features?.join(', ') || ''
    });
  }

  async saveVehicle() {
    if (!this.vehicleForm.valid) {
      this.error = 'Por favor complete todos los campos requeridos';
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

      const formValue = this.vehicleForm.value;
      const vehicleData = {
        ...formValue,
        features: formValue.features ? formValue.features.split(',').map((f: string) => f.trim()) : [],
        images: this.vehicleImages, // Incluir las imágenes base64
        registeredBy: currentUser.uid
      };

      if (this.editMode && this.editingVehicle?.id) {
        await this.vehicleService.updateVehicle(this.editingVehicle.id, vehicleData);
        this.success = 'Vehículo actualizado exitosamente';
      } else {
        await this.vehicleService.createVehicle(vehicleData);
        this.success = 'Vehículo creado exitosamente';
      }

      this.showForm = false;
      this.vehicleImages = []; // Limpiar imágenes
      await this.loadVehicles();
    } catch (error: any) {
      this.error = 'Error guardando vehículo: ' + error.message;
    } finally {
      this.loading = false;
    }
  }

  async deleteVehicle(vehicle: Vehicle) {
    const currentUser = this.authService.getCurrentUser();
    
    // Solo administradores pueden eliminar
    if (currentUser?.role !== 'administrador') {
      this.error = 'Solo los administradores pueden eliminar vehículos';
      return;
    }
    
    if (!confirm('¿Está seguro de que desea eliminar este vehículo?')) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      if (vehicle.id) {
        await this.vehicleService.deleteVehicle(vehicle.id);
        this.success = 'Vehículo eliminado exitosamente';
        await this.loadVehicles();
      }
    } catch (error: any) {
      this.error = 'Error eliminando vehículo: ' + error.message;
    } finally {
      this.loading = false;
    }
  }

  async updateStatus(vehicle: Vehicle, newStatus: Vehicle['status']) {
    const currentUser = this.authService.getCurrentUser();
    
    // Solo administradores pueden cambiar estado
    if (currentUser?.role !== 'administrador') {
      this.error = 'Solo los administradores pueden cambiar el estado';
      return;
    }
    
    this.loading = true;
    this.error = '';

    try {
      if (vehicle.id) {
        await this.vehicleService.updateVehicleStatus(vehicle.id, newStatus);
        this.success = 'Estado actualizado exitosamente';
        await this.loadVehicles();
      }
    } catch (error: any) {
      this.error = 'Error actualizando estado: ' + error.message;
    } finally {
      this.loading = false;
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
    this.editingVehicle = null;
    this.error = '';
    this.success = '';
    this.vehicleImages = []; // Limpiar imágenes
    this.imageError = '';
  }

  getStatusLabel(status: string): string {
    const statusObj = this.statuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'en_venta': return 'status-available';
      case 'en_venta_discreta': return 'status-discrete';
      case 'cancelado': return 'status-cancelled';
      case 'vendido': return 'status-sold';
      default: return '';
    }
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  // Métodos para selector de clientes
  openClientSelector() {
    this.showClientSelector = true;
    this.clientSearchTerm = '';
    this.filterClients();
  }

  closeClientSelector() {
    this.showClientSelector = false;
    this.clientSearchTerm = '';
  }

  filterClients() {
    if (!this.clientSearchTerm.trim()) {
      this.filteredClients = [...this.clients];
      return;
    }
    
    const term = this.clientSearchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(client => 
      client.name.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.phone.includes(term) ||
      client.dni.includes(term)
    );
  }

  selectClient(client: Client) {
    this.selectedClient = client;
    this.vehicleForm.patchValue({
      ownerId: client.id
    });
    this.showClientSelector = false;
  }

  clearSelectedClient() {
    this.selectedClient = null;
    this.vehicleForm.patchValue({
      ownerId: ''
    });
  }

  getSelectedClientName(): string {
    return this.selectedClient ? this.selectedClient.name : '';
  }

  // Métodos para manejar imágenes
  onImagesChange(images: string[]) {
    this.vehicleImages = images;
    this.imageError = '';
  }

  onImageError(error: string) {
    this.imageError = error;
  }
}
