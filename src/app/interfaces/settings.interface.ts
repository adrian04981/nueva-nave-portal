export interface Settings {
  id?: string;
  // Porcentajes por defecto
  defaultCommissionPercentage: number; // 4%
  defaultSaleInPercentage: number; // 20%
  defaultSaleOffPercentage: number; // 20%
  defaultCompanyPercentage: number; // 60%
  
  // Configuración de la empresa
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  
  updatedAt: Date;
  updatedBy: string;
}

export const DEFAULT_SETTINGS: Settings = {
  defaultCommissionPercentage: 4,
  defaultSaleInPercentage: 20,
  defaultSaleOffPercentage: 20,
  defaultCompanyPercentage: 60,
  companyName: 'Nueva Nave',
  companyEmail: 'info@nuevanave.com',
  companyPhone: '+1234567890',
  companyAddress: 'Dirección de la empresa',
  updatedAt: new Date(),
  updatedBy: ''
};
