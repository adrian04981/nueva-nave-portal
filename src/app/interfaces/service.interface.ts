export interface Service {
  id?: string;
  name: string;
  description: string;
  basePrice: number;
  duration: number; // En minutos
  estimatedDuration: number; // Alias para duration
  category: string;
  
  // Comisiones para vendedores
  sellerCommissionPercentage: number; // Ej: 20% o 10%
  commissionRate: number; // Alias para sellerCommissionPercentage
  
  // Requerimientos
  requiresStaff: boolean;
  requiredSpecialties: string[]; // Especialidades necesarias del personal
  
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceFilter {
  name?: string;
  category?: string;
  isActive?: boolean;
}

export interface ServiceOrder {
  id?: string;
  serviceId: string;
  vehicleId: string;
  clientId: string;
  sellerId: string; // Vendedor que vendió el servicio
  staffId?: string; // Personal asignado
  
  // Precios y comisiones
  servicePrice: number;
  sellerCommission: number;
  
  status: 'cotizado' | 'confirmado' | 'en_proceso' | 'completado' | 'cancelado';
  scheduledDate?: Date;
  completedDate?: Date;
  
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
