import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { SaleService } from '../../services/sale.service';
import { VehicleService } from '../../services/vehicle.service';
import { ClientService } from '../../services/client.service';
import { UserService } from '../../services/user.service';
import { AuthService, UserProfile } from '../../services/auth.service';
import { Sale } from '../../interfaces/sale.interface';
import { Vehicle } from '../../interfaces/vehicle.interface';
import { Client } from '../../interfaces/client.interface';

@Component({
  selector: 'app-sale-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './sale-management.component.html',
  styleUrls: ['./sale-management.component.scss']
})
export class SaleManagementComponent implements OnInit {
  sales: Sale[] = [];
  filteredSales: Sale[] = [];
  vehicles: Vehicle[] = [];
  clients: Client[] = [];
  sellers: UserProfile[] = [];
  
  loading = false;
  error = '';
  success = '';
  showForm = false;
  editMode = false;
  editingSale: Sale | null = null;
  
  // Formulario
  saleForm: FormGroup;
  
  // Filtros
  searchTerm = '';
  statusFilter = '';
  sellerFilter = '';
  dateFromFilter = '';
  dateToFilter = '';
  
  // Estadísticas
  stats = {
    totalSales: 0,
    totalAmount: 0,
    totalCommission: 0,
    monthlySales: 0,
    monthlyAmount: 0,
    averageTicket: 0
  };
  
  // Configuración
  statuses = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'completada', label: 'Completada' },
    { value: 'cancelada', label: 'Cancelada' }
  ];
  
  // Comisiones
  commissionPercentage = 4; // 4%
  commissionDistribution = {
    saleIn: 20,    // 20%
    saleOff: 20,   // 20%
    company: 60    // 60%
  };

  constructor(
    private saleService: SaleService,
    private vehicleService: VehicleService,
    private clientService: ClientService,
    private userService: UserService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.saleForm = this.fb.group({
      vehicleId: ['', Validators.required],
      clientId: ['', Validators.required],
      sellerId: ['', Validators.required],
      salePrice: [0, [Validators.required, Validators.min(1)]],
      commissionAmount: [0, [Validators.required, Validators.min(0)]],
      saleDate: [new Date().toISOString().split('T')[0], Validators.required],
      status: ['pendiente', Validators.required],
      notes: [''],
      paymentMethod: [''],
      financingDetails: ['']
    });
  }

  ngOnInit() {
    this.loadSales();
    this.loadVehicles();
    this.loadClients();
    this.loadSellers();
    this.calculateStats();
  }

  // Métodos de carga
  async loadSales() {
    this.loading = true;
    this.error = '';
    
    try {
      const currentUser = this.authService.getCurrentUser();
      
      if (currentUser?.role === 'vendedor') {
        // Vendedores solo ven sus propias ventas
        this.sales = await this.saleService.getSalesBySeller(currentUser.uid);
      } else {
        // Administradores ven todas las ventas
        this.sales = await this.saleService.getAllSales();
      }
      
      this.filteredSales = [...this.sales];
      this.filterSales();
      this.calculateStats();
    } catch (error: any) {
      this.error = 'Error cargando ventas: ' + error.message;
    } finally {
      this.loading = false;
    }
  }

  async loadVehicles() {
    try {
      this.vehicles = await this.vehicleService.getAllVehicles();
    } catch (error: any) {
      console.error('Error cargando vehículos:', error);
    }
  }

  async loadClients() {
    try {
      this.clients = await this.clientService.getAllClients();
    } catch (error: any) {
      console.error('Error cargando clientes:', error);
    }
  }

  async loadSellers() {
    try {
      this.sellers = await this.userService.getUsersByRole('vendedor');
      // Incluir administradores también
      const admins = await this.userService.getUsersByRole('administrador');
      this.sellers = [...this.sellers, ...admins];
    } catch (error: any) {
      console.error('Error cargando vendedores:', error);
    }
  }

  // Métodos de filtrado
  filterSales() {
    this.filteredSales = this.sales.filter(sale => {
      const matchesSearch = !this.searchTerm || 
        this.getClientName(sale.clientId).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getVehicleName(sale.vehicleId).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (sale.notes && sale.notes.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesStatus = !this.statusFilter || sale.status === this.statusFilter;
      const matchesSeller = !this.sellerFilter || sale.sellerId === this.sellerFilter;
      
      const matchesDateFrom = !this.dateFromFilter || 
        new Date(sale.saleDate) >= new Date(this.dateFromFilter);
      const matchesDateTo = !this.dateToFilter || 
        new Date(sale.saleDate) <= new Date(this.dateToFilter);
      
      return matchesSearch && matchesStatus && matchesSeller && matchesDateFrom && matchesDateTo;
    });
  }

  // Métodos de formulario
  showAddForm() {
    this.showForm = true;
    this.editMode = false;
    this.editingSale = null;
    this.saleForm.reset({
      vehicleId: '',
      clientId: '',
      sellerId: '',
      salePrice: 0,
      commissionAmount: 0,
      saleDate: new Date().toISOString().split('T')[0],
      status: 'pendiente',
      notes: '',
      paymentMethod: '',
      financingDetails: ''
    });
  }

  editSale(sale: Sale) {
    this.showForm = true;
    this.editMode = true;
    this.editingSale = sale;
    
    this.saleForm.patchValue({
      vehicleId: sale.vehicleId,
      clientId: sale.clientId,
      sellerId: sale.sellerId,
      salePrice: sale.salePrice,
      commissionAmount: sale.commissionAmount,
      saleDate: sale.saleDate,
      status: sale.status,
      notes: sale.notes || '',
      paymentMethod: sale.paymentMethod || '',
      financingDetails: sale.financingDetails || ''
    });
  }

  async saveSale() {
    if (!this.saleForm.valid) {
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

      const formValue = this.saleForm.value;
      const saleData = {
        ...formValue,
        registeredBy: currentUser.uid,
        lastModified: new Date().toISOString()
      };

      if (this.editMode && this.editingSale?.id) {
        await this.saleService.updateSale(this.editingSale.id, saleData);
        this.success = 'Venta actualizada exitosamente';
      } else {
        await this.saleService.createSale(saleData);
        this.success = 'Venta registrada exitosamente';
        
        // Marcar el vehículo como vendido
        if (formValue.vehicleId) {
          await this.vehicleService.updateVehicleStatus(formValue.vehicleId, 'vendido');
        }
      }

      this.showForm = false;
      await this.loadSales();
    } catch (error: any) {
      this.error = 'Error guardando venta: ' + error.message;
    } finally {
      this.loading = false;
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
    this.editingSale = null;
    this.error = '';
    this.success = '';
  }

  async deleteSale(sale: Sale) {
    if (!sale.id) {
      this.error = 'No se puede eliminar una venta sin ID';
      return;
    }

    if (!confirm('¿Está seguro de que desea eliminar esta venta?')) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      await this.saleService.deleteSale(sale.id);
      
      // Marcar el vehículo como disponible nuevamente
      if (sale.vehicleId) {
        await this.vehicleService.updateVehicleStatus(sale.vehicleId, 'en_venta');
      }
      
      this.success = 'Venta eliminada exitosamente';
      await this.loadSales();
    } catch (error: any) {
      this.error = 'Error eliminando venta: ' + error.message;
    } finally {
      this.loading = false;
    }
  }

  // Métodos de cálculo
  calculateCommission() {
    const salePrice = this.saleForm.get('salePrice')?.value || 0;
    const commission = salePrice * (this.commissionPercentage / 100);
    this.saleForm.patchValue({
      commissionAmount: commission
    });
  }

  onVehicleChange() {
    const vehicleId = this.saleForm.get('vehicleId')?.value;
    if (vehicleId) {
      const vehicle = this.vehicles.find(v => v.id === vehicleId);
      if (vehicle) {
        this.saleForm.patchValue({
          salePrice: vehicle.price
        });
        this.calculateCommission();
      }
    }
  }

  getCommissionAmount(type: 'saleIn' | 'saleOff' | 'company'): number {
    const totalCommission = this.saleForm.get('commissionAmount')?.value || 0;
    const percentage = this.commissionDistribution[type];
    return totalCommission * (percentage / 100);
  }

  calculateStats() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    this.stats = {
      totalSales: this.sales.length,
      totalAmount: this.sales.reduce((sum, sale) => sum + sale.salePrice, 0),
      totalCommission: this.sales.reduce((sum, sale) => sum + sale.commissionAmount, 0),
      monthlySales: this.sales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      }).length,
      monthlyAmount: this.sales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
      }).reduce((sum, sale) => sum + sale.salePrice, 0),
      averageTicket: this.sales.length > 0 ? 
        this.sales.reduce((sum, sale) => sum + sale.salePrice, 0) / this.sales.length : 0
    };
  }

  // Métodos de utilidad
  getAvailableVehicles(): Vehicle[] {
    return this.vehicles.filter(v => 
      v.status === 'en_venta' || v.status === 'en_venta_discreta' || 
      (this.editMode && this.editingSale?.vehicleId === v.id)
    );
  }

  getVehicleName(vehicleId: string): string {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehículo no encontrado';
  }

  getVehicleDetails(vehicleId: string): string {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.year} - ${vehicle.color}` : '';
  }

  getClientName(clientId: string): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente no encontrado';
  }

  getSellerName(sellerId: string): string {
    const seller = this.sellers.find(s => s.uid === sellerId);
    return seller ? seller.name : 'Vendedor no encontrado';
  }

  getStatusLabel(status: string): string {
    const statusObj = this.statuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getSellerRanking() {
    const sellerStats = this.sellers.map(seller => {
      const sellerSales = this.sales.filter(sale => sale.sellerId === seller.uid);
      return {
        ...seller,
        salesCount: sellerSales.length,
        totalAmount: sellerSales.reduce((sum, sale) => sum + sale.salePrice, 0),
        totalCommission: sellerSales.reduce((sum, sale) => sum + sale.commissionAmount, 0)
      };
    });

    return sellerStats.sort((a, b) => b.salesCount - a.salesCount);
  }

  getStars(salesCount: number): string[] {
    return Array(Math.min(salesCount, 5)).fill('⭐');
  }

  // Métodos de permisos
  isAdmin(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === 'administrador';
  }

  canEdit(sale: Sale): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === 'administrador' || 
           (currentUser?.role === 'vendedor' && sale.sellerId === currentUser.uid);
  }

  canDelete(sale: Sale): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === 'administrador';
  }

  // Métodos de formato
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  viewDetails(sale: Sale) {
    // Implementar vista de detalles (modal o navegación)
    console.log('Ver detalles de venta:', sale);
  }
}
