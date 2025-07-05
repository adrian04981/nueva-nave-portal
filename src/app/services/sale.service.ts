import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc, 
  deleteDoc, 
  addDoc, 
  query, 
  orderBy, 
  where,
  QueryConstraint 
} from '@angular/fire/firestore';
import { Sale, SaleFilter, SaleStatistics, MonthlyStats, SellerStats } from '../interfaces/sale.interface';
import { VehicleService } from './vehicle.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private salesCollection = collection(this.firestore, 'sales');

  constructor(
    private firestore: Firestore,
    private vehicleService: VehicleService,
    private userService: UserService
  ) {}

  async getAllSales(filter?: SaleFilter): Promise<Sale[]> {
    try {
      const constraints: QueryConstraint[] = [orderBy('saleDate', 'desc')];
      
      if (filter) {
        if (filter.vehicleId) {
          constraints.push(where('vehicleId', '==', filter.vehicleId));
        }
        if (filter.clientId) {
          constraints.push(where('clientId', '==', filter.clientId));
        }
        // Usar el sellerId principal para filtros
        if (filter.saleInSellerId) {
          constraints.push(where('sellerId', '==', filter.saleInSellerId));
        }
        if (filter.saleOffSellerId) {
          constraints.push(where('sellerId', '==', filter.saleOffSellerId));
        }
      }
      
      const q = query(this.salesCollection, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Sale));
    } catch (error) {
      console.error('Error obteniendo ventas:', error);
      throw error;
    }
  }

  async getSaleById(id: string): Promise<Sale | null> {
    try {
      const docRef = doc(this.firestore, `sales/${id}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Sale;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo venta:', error);
      throw error;
    }
  }

  async createSale(saleData: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Calcular montos de comisión
      const calculatedSale = this.calculateSaleAmounts(saleData);
      
      const sale = {
        ...calculatedSale,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(this.salesCollection, sale);
      
      // Actualizar estado del vehículo a "vendido"
      if (sale.vehicleId) {
        await this.vehicleService.updateVehicleStatus(sale.vehicleId, 'vendido');
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error creando venta:', error);
      throw error;
    }
  }

  async updateSale(id: string, updates: Partial<Sale>): Promise<void> {
    try {
      const docRef = doc(this.firestore, `sales/${id}`);
      
      // Recalcular montos si se actualizan los porcentajes o precio
      if (updates.salePrice || updates.commissionPercentage || 
          updates.saleInPercentage || updates.saleOffPercentage) {
        const currentSale = await this.getSaleById(id);
        if (currentSale) {
          const updatedSale = { ...currentSale, ...updates };
          const calculatedSale = this.calculateSaleAmounts(updatedSale);
          updates = { ...updates, ...calculatedSale };
        }
      }
      
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error actualizando venta:', error);
      throw error;
    }
  }

  async deleteSale(id: string): Promise<void> {
    try {
      const sale = await this.getSaleById(id);
      if (sale && sale.vehicleId) {
        // Revertir estado del vehículo
        await this.vehicleService.updateVehicleStatus(sale.vehicleId, 'en_venta');
      }
      
      const docRef = doc(this.firestore, `sales/${id}`);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error eliminando venta:', error);
      throw error;
    }
  }

  private calculateSaleAmounts(sale: Partial<Sale>): Partial<Sale> {
    const salePrice = sale.salePrice || 0;
    const commissionPercentage = sale.commissionPercentage || 4;
    const saleInPercentage = sale.saleInPercentage || 20;
    const saleOffPercentage = sale.saleOffPercentage || 20;
    
    // Calcular descuento
    let discountAmount = 0;
    if (sale.discountType && sale.discountValue) {
      if (sale.discountType === 'percentage') {
        discountAmount = (salePrice * sale.discountValue) / 100;
      } else {
        discountAmount = sale.discountValue;
      }
    }
    
    const finalPrice = salePrice - discountAmount;
    const commissionAmount = (finalPrice * commissionPercentage) / 100;
    
    const saleInAmount = (commissionAmount * saleInPercentage) / 100;
    const saleOffAmount = (commissionAmount * saleOffPercentage) / 100;
    const companyPercentage = 100 - saleInPercentage - saleOffPercentage;
    const companyAmount = (commissionAmount * companyPercentage) / 100;
    
    return {
      ...sale,
      commissionAmount,
      saleInAmount,
      saleOffAmount,
      companyPercentage,
      companyAmount,
      discountAmount
    };
  }

  async getSaleStatistics(year?: number): Promise<SaleStatistics> {
    try {
      const sales = await this.getAllSales();
      const targetYear = year || new Date().getFullYear();
      
      // Filtrar por año si se especifica
      const filteredSales = year ? 
        sales.filter(sale => new Date(sale.saleDate).getFullYear() === targetYear) : 
        sales;
      
      const totalSales = filteredSales.length;
      const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.salePrice || 0), 0);
      const totalCommission = filteredSales.reduce((sum, sale) => sum + (sale.commissionAmount || 0), 0);
      const totalCompanyRevenue = filteredSales.reduce((sum, sale) => sum + (sale.companyAmount || 0), 0);
      
      // Estadísticas mensuales
      const monthlyStats = this.calculateMonthlyStats(filteredSales);
      
      // Estadísticas por vendedor
      const sellerStats = await this.calculateSellerStats(filteredSales);
      
      return {
        totalSales,
        totalRevenue,
        totalCommission,
        totalCompanyRevenue,
        monthlyStats,
        sellerStats
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  private calculateMonthlyStats(sales: Sale[]): MonthlyStats[] {
    const monthlyMap = new Map<string, MonthlyStats>();
    
    sales.forEach(sale => {
      const date = new Date(sale.saleDate);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          month: date.toLocaleString('default', { month: 'long' }),
          year: date.getFullYear(),
          totalSales: 0,
          totalRevenue: 0,
          totalCommission: 0
        });
      }
      
      const monthStats = monthlyMap.get(key)!;
      monthStats.totalSales++;
      monthStats.totalRevenue += sale.salePrice || 0;
      monthStats.totalCommission += sale.commissionAmount || 0;
    });
    
    return Array.from(monthlyMap.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return new Date(`${a.month} 1`).getMonth() - new Date(`${b.month} 1`).getMonth();
    });
  }

  private async calculateSellerStats(sales: Sale[]): Promise<SellerStats[]> {
    const sellerMap = new Map<string, SellerStats>();
    
    // Obtener información de vendedores
    const users = await this.userService.getAllUsers();
    const sellerUsers = users.filter(user => user.role === 'vendedor');
    
    // Inicializar estadísticas para cada vendedor
    sellerUsers.forEach(seller => {
      sellerMap.set(seller.uid, {
        sellerId: seller.uid,
        sellerName: seller.name,
        saleInCount: 0,
        saleOffCount: 0,
        totalSales: 0,
        totalEarnings: 0,
        stars: 0
      });
    });
    
    // Calcular estadísticas usando el modelo actual
    sales.forEach(sale => {
      // Usar el sellerId principal para las estadísticas
      const mainSellerId = sale.sellerId;
      if (sellerMap.has(mainSellerId)) {
        const stats = sellerMap.get(mainSellerId)!;
        stats.totalSales++;
        stats.totalEarnings += sale.commissionAmount || 0;
        
        // Si hay vendedores específicos para sale in/off, contabilizar también
        if (sale.saleInSellerId && sellerMap.has(sale.saleInSellerId)) {
          const saleInStats = sellerMap.get(sale.saleInSellerId)!;
          saleInStats.saleInCount++;
          saleInStats.totalEarnings += sale.saleInAmount || 0;
        }
        
        if (sale.saleOffSellerId && sellerMap.has(sale.saleOffSellerId)) {
          const saleOffStats = sellerMap.get(sale.saleOffSellerId)!;
          saleOffStats.saleOffCount++;
          saleOffStats.totalEarnings += sale.saleOffAmount || 0;
        }
      }
    });
    
    // Calcular estrellas basadas en el total de ventas
    sellerMap.forEach(stats => {
      stats.stars = stats.totalSales; // 1 estrella por venta
    });
    
    return Array.from(sellerMap.values()).sort((a, b) => b.stars - a.stars);
  }

  async getSalesBySeller(sellerId: string): Promise<Sale[]> {
    try {
      // Buscar ventas donde el vendedor es el principal
      const mainSales = await this.getAllSales();
      const sellerSales = mainSales.filter(sale => 
        sale.sellerId === sellerId || 
        sale.saleInSellerId === sellerId || 
        sale.saleOffSellerId === sellerId
      );
      
      return sellerSales.sort((a, b) => 
        new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
      );
    } catch (error) {
      console.error('Error obteniendo ventas por vendedor:', error);
      throw error;
    }
  }

  async getMonthlySales(year: number, month: number): Promise<Sale[]> {
    try {
      const sales = await this.getAllSales();
      
      return sales.filter(sale => {
        const saleDate = new Date(sale.saleDate);
        return saleDate.getFullYear() === year && saleDate.getMonth() === month;
      });
    } catch (error) {
      console.error('Error obteniendo ventas mensuales:', error);
      throw error;
    }
  }
}
