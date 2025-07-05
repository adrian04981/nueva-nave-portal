export interface Sale {
  id?: string;
  vehicleId: string; // ID del vehículo vendido
  clientId: string; // ID del cliente comprador
  sellerId: string; // ID del vendedor principal
  salePrice: number; // Precio de venta final
  
  // Comisiones
  commissionPercentage?: number; // Porcentaje de comisión (por defecto 4%)
  commissionAmount: number; // Monto de comisión calculado
  
  // Distribución de comisiones
  saleInPercentage?: number; // Porcentaje para sale in (por defecto 20%)
  saleOffPercentage?: number; // Porcentaje para sale off (por defecto 20%)
  companyPercentage?: number; // Porcentaje para la empresa (por defecto 60%)
  
  saleInAmount?: number; // Monto para sale in
  saleOffAmount?: number; // Monto para sale off
  companyAmount?: number; // Monto para la empresa
  
  // Vendedores adicionales (opcional)
  saleInSellerId?: string; // ID del vendedor que captó el auto
  saleOffSellerId?: string; // ID del vendedor que cerró la venta
  
  // Estado y métodos de pago
  status: 'pendiente' | 'completada' | 'cancelada';
  paymentMethod?: 'efectivo' | 'transferencia' | 'cheque' | 'credito' | 'mixto';
  financingDetails?: string; // Detalles del financiamiento
  
  // Descuentos
  discountType?: 'percentage' | 'amount'; // Tipo de descuento
  discountValue?: number; // Valor del descuento
  discountAmount?: number; // Monto del descuento aplicado
  
  // Información adicional
  notes?: string; // Notas de la venta
  saleDate: string; // Fecha de la venta (formato YYYY-MM-DD)
  registeredBy: string; // ID del administrador que registró
  lastModified?: string; // Fecha de última modificación
  createdAt?: string;
  updatedAt?: string;
}

export interface SaleFilter {
  vehicleId?: string;
  clientId?: string;
  saleInSellerId?: string;
  saleOffSellerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  priceFrom?: number;
  priceTo?: number;
}

export interface SaleStatistics {
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  totalCompanyRevenue: number;
  monthlyStats: MonthlyStats[];
  sellerStats: SellerStats[];
}

export interface MonthlyStats {
  month: string;
  year: number;
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
}

export interface SellerStats {
  sellerId: string;
  sellerName: string;
  saleInCount: number;
  saleOffCount: number;
  totalSales: number;
  totalEarnings: number;
  stars: number; // Puntuación basada en ventas
}
