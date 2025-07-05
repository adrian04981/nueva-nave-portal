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
import { Client, ClientFilter } from '../interfaces/client.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private clientsCollection = collection(this.firestore, 'clients');

  constructor(private firestore: Firestore) {}

  async getAllClients(filter?: ClientFilter): Promise<Client[]> {
    try {
      const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
      
      if (filter) {
        if (filter.registeredBy) {
          constraints.push(where('registeredBy', '==', filter.registeredBy));
        }
      }
      
      const q = query(this.clientsCollection, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Client));
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      throw error;
    }
  }

  async getClientById(id: string): Promise<Client | null> {
    try {
      const docRef = doc(this.firestore, `clients/${id}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Client;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo cliente:', error);
      throw error;
    }
  }

  async createClient(client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const clientData = {
        ...client,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(this.clientsCollection, clientData);
      return docRef.id;
    } catch (error) {
      console.error('Error creando cliente:', error);
      throw error;
    }
  }

  async updateClient(id: string, updates: Partial<Client>): Promise<void> {
    try {
      const docRef = doc(this.firestore, `clients/${id}`);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      throw error;
    }
  }

  async deleteClient(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `clients/${id}`);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      throw error;
    }
  }

  async getClientsBySeller(sellerId: string): Promise<Client[]> {
    try {
      const q = query(
        this.clientsCollection,
        where('registeredBy', '==', sellerId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Client));
    } catch (error) {
      console.error('Error obteniendo clientes por vendedor:', error);
      throw error;
    }
  }

  async searchClients(searchTerm: string): Promise<Client[]> {
    try {
      // Nota: Para búsqueda completa de texto, necesitarías usar Algolia o similar
      // Por ahora, buscaremos por coincidencias exactas
      const allClients = await this.getAllClients();
      
      return allClients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        client.dni.includes(searchTerm)
      );
    } catch (error) {
      console.error('Error buscando clientes:', error);
      throw error;
    }
  }
}
