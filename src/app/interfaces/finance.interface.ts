export interface FinancialSummary {
  period: 'month' | 'quarter' | 'year';
  startDate: Date;
  endDate: Date;
  
  // Ventas de vehículos
  vehicleSales: {
    totalSales: number;
    totalRevenue: number;
    totalCommissions: number;
    companyRevenue: number;
  };
  
  // Servicios
  serviceRevenue: {
    totalServices: number;
    totalRevenue: number;
    totalCommissions: number;
    companyRevenue: number;
  };
  
  // Gastos operativos
  operationalExpenses: {
    staffCosts: number;
    otherExpenses: number;
    totalExpenses: number;
  };
  
  // Resumen
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

export interface Expense {
  id?: string;
  description: string;
  amount: number;
  category: 'staff' | 'marketing' | 'office' | 'maintenance' | 'other';
  date: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

export interface SellerCommissionReport {
  sellerId: string;
  sellerName: string;
  period: { start: Date; end: Date };
  
  vehicleCommissions: {
    saleInCount: number;
    saleOffCount: number;
    saleInAmount: number;
    saleOffAmount: number;
    totalVehicleCommissions: number;
  };
  
  serviceCommissions: {
    serviceCount: number;
    totalServiceCommissions: number;
  };
  
  totalCommissions: number;
}
