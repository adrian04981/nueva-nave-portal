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
import { CalendarEvent, CalendarFilter } from '../interfaces/calendar.interface';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {
  private eventsCollection = collection(this.firestore, 'calendar-events');

  constructor(private firestore: Firestore) {}

  async getAllEvents(filter?: CalendarFilter): Promise<CalendarEvent[]> {
    try {
      const constraints: QueryConstraint[] = [orderBy('date', 'asc')];
      
      if (filter) {
        if (filter.type) {
          constraints.push(where('type', '==', filter.type));
        }
        if (filter.status) {
          constraints.push(where('status', '==', filter.status));
        }
        if (filter.sellerId) {
          constraints.push(where('sellerId', '==', filter.sellerId));
        }
        if (filter.staffId) {
          constraints.push(where('staffId', '==', filter.staffId));
        }
      }
      
      const q = query(this.eventsCollection, ...constraints);
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CalendarEvent));
    } catch (error) {
      console.error('Error obteniendo eventos:', error);
      throw error;
    }
  }

  async getEventById(id: string): Promise<CalendarEvent | null> {
    try {
      const docRef = doc(this.firestore, `calendar-events/${id}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as CalendarEvent;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo evento:', error);
      throw error;
    }
  }

  async createEvent(event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const eventData = {
        ...event,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(this.eventsCollection, eventData);
      return docRef.id;
    } catch (error) {
      console.error('Error creando evento:', error);
      throw error;
    }
  }

  async updateEvent(id: string, updates: Partial<CalendarEvent>): Promise<void> {
    try {
      const docRef = doc(this.firestore, `calendar-events/${id}`);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error actualizando evento:', error);
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `calendar-events/${id}`);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error eliminando evento:', error);
      throw error;
    }
  }

  async getEventsByDate(date: Date): Promise<CalendarEvent[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const q = query(
        this.eventsCollection,
        where('date', '>=', startOfDay),
        where('date', '<=', endOfDay),
        orderBy('date'),
        orderBy('startTime')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CalendarEvent));
    } catch (error) {
      console.error('Error obteniendo eventos por fecha:', error);
      throw error;
    }
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    try {
      const q = query(
        this.eventsCollection,
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date'),
        orderBy('startTime')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CalendarEvent));
    } catch (error) {
      console.error('Error obteniendo eventos por rango:', error);
      throw error;
    }
  }

  async getEventsBySeller(sellerId: string): Promise<CalendarEvent[]> {
    try {
      const q = query(
        this.eventsCollection,
        where('sellerId', '==', sellerId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CalendarEvent));
    } catch (error) {
      console.error('Error obteniendo eventos por vendedor:', error);
      throw error;
    }
  }
}
