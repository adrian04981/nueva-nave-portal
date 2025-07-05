export interface Vehicle {
  id?: string;
  brand: string; // Marca
  model: string; // Modelo
  year: number; // Año
  color: string; // Color
  mileage: number; // Kilometraje
  price: number; // Precio
  description: string; // Descripción
  images: string[]; // Base64 de imágenes (temporal)
  thumbnails?: string[]; // Thumbnails base64 (opcional)
  status: 'en_venta' | 'en_venta_discreta' | 'cancelado' | 'vendido';
  ownerId: string; // ID del cliente dueño
  registeredBy: string; // ID del vendedor que registró
  createdAt: Date;
  updatedAt: Date;
  // Información adicional
  engine?: string; // Motor
  transmission?: string; // Transmisión
  fuel?: string; // Combustible
  doors?: number; // Puertas
  features?: string[]; // Características adicionales
}

export interface VehicleFilter {
  brand?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  status?: Vehicle['status'];
  registeredBy?: string;
}
