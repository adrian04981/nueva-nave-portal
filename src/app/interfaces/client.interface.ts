export interface Client {
  id?: string;
  name: string; // Nombre completo
  email: string; // Email
  phone: string; // Teléfono
  address: string; // Dirección
  dni: string; // DNI/Cédula
  notes?: string; // Notas adicionales
  registeredBy: string; // ID del vendedor que registró
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientFilter {
  name?: string;
  email?: string;
  phone?: string;
  registeredBy?: string;
}
