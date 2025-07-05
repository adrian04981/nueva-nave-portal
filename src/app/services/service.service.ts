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
  QueryConstraint,
  collectionData 
} from '@angular/fire/firestore';
import { Service, ServiceFilter, ServiceOrder } from '../interfaces/service.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private servicesCollection = collection(this.firestore, 'services');
  private serviceOrdersCollection = collection(this.firestore, 'serviceOrders');

  constructor(private firestore: Firestore) {}

  getServices(): Observable<Service[]> {
    return collectionData(
      query(this.servicesCollection, orderBy('name', 'asc')),
      { idField: 'id' }
    ) as Observable<Service[]>;
  }

  async getAllServices(filter?: ServiceFilter): Promise<Service[]> {
    try {
      const constraints: QueryConstraint[] = [orderBy('name', 'asc')];
      
      if (filter) {
        if (filter.isActive !== undefined) {
          constraints.push(where('isActive', '==', filter.isActive));
        }
        if (filter.category) {
          constraints.push(where('category', '==', filter.category));
        }
      }
      
      const q = query(this.servicesCollection, ...constraints);
      const querySnapshot = await getDocs(q);
      
      let services = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Service));
      
      // Filtros que requieren procesamiento en cliente
      if (filter && filter.name) {
        const searchTerm = filter.name.toLowerCase();
        services = services.filter(s => 
          s.name.toLowerCase().includes(searchTerm) ||
          s.description.toLowerCase().includes(searchTerm)
        );
      }
      
      return services;
    } catch (error) {
      console.error('Error obteniendo servicios:', error);
      throw error;
    }
  }

  async getServiceById(id: string): Promise<Service | null> {
    try {
      const docRef = doc(this.firestore, `services/${id}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Service;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo servicio:', error);
      throw error;
    }
  }

  async createService(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const serviceData = {
        ...service,
        // Sincronizar campos duplicados
        duration: service.estimatedDuration,
        sellerCommissionPercentage: service.commissionRate,
        requiresStaff: service.requiredSpecialties?.length > 0 || false,
        requiredSpecialties: service.requiredSpecialties || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(this.servicesCollection, serviceData);
      return docRef.id;
    } catch (error) {
      console.error('Error creando servicio:', error);
      throw error;
    }
  }

  async updateService(id: string, updates: Partial<Service>): Promise<void> {
    try {
      const docRef = doc(this.firestore, `services/${id}`);
      
      // Sincronizar campos duplicados
      const serviceData = {
        ...updates,
        updatedAt: new Date()
      };
      
      if (updates.estimatedDuration) {
        serviceData.duration = updates.estimatedDuration;
      }
      
      if (updates.commissionRate) {
        serviceData.sellerCommissionPercentage = updates.commissionRate;
      }
      
      await updateDoc(docRef, serviceData);
    } catch (error) {
      console.error('Error actualizando servicio:', error);
      throw error;
    }
  }

  async deleteService(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `services/${id}`);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error eliminando servicio:', error);
      throw error;
    }
  }

  async toggleServiceStatus(id: string, isActive: boolean): Promise<void> {
    try {
      await this.updateService(id, { isActive });
    } catch (error) {
      console.error('Error cambiando estado del servicio:', error);
      throw error;
    }
  }

  async getServicesByCategory(category: string): Promise<Service[]> {
    try {
      return await this.getAllServices({ category, isActive: true });
    } catch (error) {
      console.error('Error obteniendo servicios por categoría:', error);
      throw error;
    }
  }

  // Métodos para órdenes de servicio
  async createServiceOrder(order: Omit<ServiceOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const orderData = {
        ...order,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(this.serviceOrdersCollection, orderData);
      return docRef.id;
    } catch (error) {
      console.error('Error creando orden de servicio:', error);
      throw error;
    }
  }

  async getServiceOrders(): Promise<ServiceOrder[]> {
    try {
      const q = query(this.serviceOrdersCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ServiceOrder));
    } catch (error) {
      console.error('Error obteniendo órdenes de servicio:', error);
      throw error;
    }
  }

  async updateServiceOrder(id: string, updates: Partial<ServiceOrder>): Promise<void> {
    try {
      const docRef = doc(this.firestore, `serviceOrders/${id}`);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error actualizando orden de servicio:', error);
      throw error;
    }
  }
}
