export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'fotos' | 'notaria' | 'servicio' | 'reunion' | 'otro';
  status: 'programado' | 'en_proceso' | 'completado' | 'cancelado';
  
  // Referencias
  vehicleId?: string;
  clientId?: string;
  sellerId?: string; // Vendedor asignado
  serviceId?: string; // Si es un servicio
  staffId?: string; // Si requiere personal específico
  
  // Información adicional
  location?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarFilter {
  date?: Date;
  dateFrom?: Date;
  dateTo?: Date;
  type?: CalendarEvent['type'];
  status?: CalendarEvent['status'];
  sellerId?: string;
  staffId?: string;
}
