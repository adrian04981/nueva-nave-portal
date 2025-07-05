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
  limit,
  startAfter,
  QueryConstraint 
} from '@angular/fire/firestore';
import { Vehicle, VehicleFilter } from '../interfaces/vehicle.interface';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private vehiclesCollection = collection(this.firestore, 'vehicles');

  constructor(private firestore: Firestore) {}

  async getAllVehicles(filter?: VehicleFilter): Promise<Vehicle[]> {
    try {
      const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
      
      if (filter) {
        if (filter.brand) {
          constraints.push(where('brand', '==', filter.brand));
        }
        if (filter.status) {
          constraints.push(where('status', '==', filter.status));
        }
        if (filter.registeredBy) {
          constraints.push(where('registeredBy', '==', filter.registeredBy));
        }
      }
      
      const q = query(this.vehiclesCollection, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Vehicle));
    } catch (error) {
      console.error('Error obteniendo vehículos:', error);
      throw error;
    }
  }

  async getVehicleById(id: string): Promise<Vehicle | null> {
    try {
      const docRef = doc(this.firestore, `vehicles/${id}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Vehicle;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo vehículo:', error);
      throw error;
    }
  }

  async createVehicle(vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const vehicleData = {
        ...vehicle,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(this.vehiclesCollection, vehicleData);
      return docRef.id;
    } catch (error) {
      console.error('Error creando vehículo:', error);
      throw error;
    }
  }

  async updateVehicle(id: string, updates: Partial<Vehicle>): Promise<void> {
    try {
      const docRef = doc(this.firestore, `vehicles/${id}`);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error actualizando vehículo:', error);
      throw error;
    }
  }

  async deleteVehicle(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `vehicles/${id}`);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error eliminando vehículo:', error);
      throw error;
    }
  }

  async updateVehicleStatus(id: string, status: Vehicle['status']): Promise<void> {
    try {
      await this.updateVehicle(id, { status });
    } catch (error) {
      console.error('Error actualizando estado del vehículo:', error);
      throw error;
    }
  }

  async getVehiclesByStatus(status: Vehicle['status']): Promise<Vehicle[]> {
    try {
      const q = query(
        this.vehiclesCollection,
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Vehicle));
    } catch (error) {
      console.error('Error obteniendo vehículos por estado:', error);
      throw error;
    }
  }

  async getVehiclesBySeller(sellerId: string): Promise<Vehicle[]> {
    try {
      const q = query(
        this.vehiclesCollection,
        where('registeredBy', '==', sellerId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Vehicle));
    } catch (error) {
      console.error('Error obteniendo vehículos por vendedor:', error);
      throw error;
    }
  }
}
