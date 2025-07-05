export interface Staff {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  specialty: string; // Especialidad principal
  specialties?: string[]; // Especialidades adicionales
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
  status?: string;
  isActive?: boolean;
}
