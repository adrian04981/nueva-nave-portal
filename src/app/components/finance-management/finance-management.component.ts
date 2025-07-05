import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SaleService } from '../../services/sale.service';
import { ServiceService } from '../../services/service.service';
import { SettingsService } from '../../services/settings.service';
import { Sale } from '../../interfaces/sale.interface';
import { Service, ServiceOrder } from '../../interfaces/service.interface';
import { Settings } from '../../interfaces/settings.interface';
import { Observable, combineLatest, map } from 'rxjs';

interface FinancialSummary {
  totalSales: number;
  totalCommissions: number;
  totalServices: number;
  totalServiceCommissions: number;
  netRevenue: number;
  monthlyGrowth: number;
}

interface CommissionReport {
  sellerId: string;
  sellerName: string;
  salesCount: number;
  salesAmount: number;
  salesCommission: number;
  servicesCount: number;
  servicesAmount: number;
  servicesCommission: number;
  totalCommission: number;
}

@Component({
  selector: 'app-finance-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finance-management.component.html',
  styleUrls: ['./finance-management.component.scss']
})
export class FinanceManagementComponent implements OnInit {
  currentUser$ = this.authService.currentUser$;
  sales: Sale[] = [];
  serviceOrders: ServiceOrder[] = [];
  settings: Settings | null = null;
  
  financialSummary: FinancialSummary = {
    totalSales: 0,
    totalCommissions: 0,
    totalServices: 0,
    totalServiceCommissions: 0,
    netRevenue: 0,
    monthlyGrowth: 0
  };
  
  commissionReports: CommissionReport[] = [];
  
  selectedPeriod = 'current-month';
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;
  
  loading = false;
  activeTab = 'summary';

  periods = [
    { value: 'current-month', label: 'Mes Actual' },
    { value: 'last-month', label: 'Mes Anterior' },
    { value: 'current-year', label: 'Año Actual' },
    { value: 'custom', label: 'Personalizado' }
  ];

  months = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ];

  constructor(
    private authService: AuthService,
    private saleService: SaleService,
    private serviceService: ServiceService,
    private settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.loadFinancialData();
    this.loadSettings();
  }

  async loadFinancialData() {
    this.loading = true;
    try {
      // Cargar ventas y órdenes de servicio
      const [sales, serviceOrders] = await Promise.all([
        this.saleService.getAllSales(),
        this.serviceService.getServiceOrders()
      ]);

      this.sales = sales;
      this.serviceOrders = serviceOrders;

      // Filtrar por período seleccionado
      const filteredSales = this.filterByPeriod(sales);
      const filteredServiceOrders = this.filterByPeriod(serviceOrders);

      // Calcular resumen financiero
      this.calculateFinancialSummary(filteredSales, filteredServiceOrders);

      // Calcular reportes de comisiones
      this.calculateCommissionReports(filteredSales, filteredServiceOrders);

    } catch (error) {
      console.error('Error cargando datos financieros:', error);
    } finally {
      this.loading = false;
    }
  }

  async loadSettings() {
    try {
      this.settings = await this.settingsService.getSettings();
    } catch (error) {
      console.error('Error cargando configuración:', error);
    }
  }

  filterByPeriod(items: any[]): any[] {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return items.filter(item => {
      // Manejar diferentes formatos de fecha
      let itemDate: Date;
      
      if (item.saleDate) {
        // Para ventas, usar saleDate
        itemDate = typeof item.saleDate === 'string' ? new Date(item.saleDate) : item.saleDate;
      } else if (item.createdAt) {
        // Para servicios y otros, usar createdAt
        if (item.createdAt.toDate) {
          // Timestamp de Firestore
          itemDate = item.createdAt.toDate();
        } else if (typeof item.createdAt === 'string') {
          // String ISO
          itemDate = new Date(item.createdAt);
        } else {
          // Objeto Date
          itemDate = item.createdAt;
        }
      } else {
        // Si no hay fecha, excluir el item
        return false;
      }
      
      switch (this.selectedPeriod) {
        case 'current-month':
          return itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth;
        
        case 'last-month':
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return itemDate.getFullYear() === lastMonthYear && itemDate.getMonth() === lastMonth;
        
        case 'current-year':
          return itemDate.getFullYear() === currentYear;
        
        case 'custom':
          return itemDate.getFullYear() === this.selectedYear && 
                 itemDate.getMonth() === this.selectedMonth - 1;
        
        default:
          return true;
      }
    });
  }

  calculateFinancialSummary(sales: Sale[], serviceOrders: ServiceOrder[]) {
    // Calcular totales de ventas
    const totalSales = sales.reduce((sum, sale) => sum + (sale.salePrice || 0), 0);
    const totalCommissions = sales.reduce((sum, sale) => sum + (sale.commissionAmount || 0), 0);

    // Calcular totales de servicios
    const totalServices = serviceOrders.reduce((sum, order) => sum + (order.servicePrice || 0), 0);
    const totalServiceCommissions = serviceOrders.reduce((sum, order) => sum + (order.sellerCommission || 0), 0);

    // Calcular ingresos netos
    const netRevenue = totalSales + totalServices - totalCommissions - totalServiceCommissions;

    this.financialSummary = {
      totalSales,
      totalCommissions,
      totalServices,
      totalServiceCommissions,
      netRevenue,
      monthlyGrowth: 0 // TODO: Calcular crecimiento mensual
    };
  }

  calculateCommissionReports(sales: Sale[], serviceOrders: ServiceOrder[]) {
    const sellerMap = new Map<string, CommissionReport>();

    // Procesar ventas
    sales.forEach(sale => {
      // Usar el sellerId principal ya que el modelo actual es más simple
      const sellerId = sale.sellerId;
      
      if (!sellerMap.has(sellerId)) {
        sellerMap.set(sellerId, {
          sellerId: sellerId,
          sellerName: 'Vendedor', // Se actualizará con el nombre real después
          salesCount: 0,
          salesAmount: 0,
          salesCommission: 0,
          servicesCount: 0,
          servicesAmount: 0,
          servicesCommission: 0,
          totalCommission: 0
        });
      }

      const report = sellerMap.get(sellerId)!;
      report.salesCount++;
      report.salesAmount += sale.salePrice || 0;
      report.salesCommission += sale.commissionAmount || 0;
    });

    // Procesar órdenes de servicio
    serviceOrders.forEach(order => {
      const sellerId = order.sellerId;
      if (!sellerMap.has(sellerId)) {
        sellerMap.set(sellerId, {
          sellerId,
          sellerName: 'Vendedor',
          salesCount: 0,
          salesAmount: 0,
          salesCommission: 0,
          servicesCount: 0,
          servicesAmount: 0,
          servicesCommission: 0,
          totalCommission: 0
        });
      }

      const report = sellerMap.get(sellerId)!;
      report.servicesCount++;
      report.servicesAmount += order.servicePrice || 0;
      report.servicesCommission += order.sellerCommission || 0;
    });

    // Calcular comisiones totales
    sellerMap.forEach(report => {
      report.totalCommission = report.salesCommission + report.servicesCommission;
    });

    this.commissionReports = Array.from(sellerMap.values())
      .sort((a, b) => b.totalCommission - a.totalCommission);
  }

  onPeriodChange() {
    this.loadFinancialData();
  }

  onCustomPeriodChange() {
    if (this.selectedPeriod === 'custom') {
      this.loadFinancialData();
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  exportReport() {
    // TODO: Implementar exportación a Excel/PDF
    console.log('Exportar reporte financiero');
  }
}
