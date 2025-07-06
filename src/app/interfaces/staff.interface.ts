export interface Staff {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  specialty: string; // Servicio principal (requerido)
  specialties: string[]; // Lista completa de servicios que puede realizar
  status: 'active' | 'inactive' | 'busy' | 'available';
  isActive: boolean;
  hourlyRate?: number; // Tarifa por hora
  commissionRate?: number; // Porcentaje de comisión
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffFilter {
  name?: string;
  specialty?: string;
  specialties?: string[];
  status?: string;
  isActive?: boolean;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}
