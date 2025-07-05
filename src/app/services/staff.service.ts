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
import { Staff, StaffFilter } from '../interfaces/staff.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private staffCollection = collection(this.firestore, 'staff');

  constructor(private firestore: Firestore) {}

  getStaffMembers(): Observable<Staff[]> {
    return collectionData(
      query(this.staffCollection, orderBy('name', 'asc')),
      { idField: 'id' }
    ) as Observable<Staff[]>;
  }

  async getAllStaff(filter?: StaffFilter): Promise<Staff[]> {
    try {
      const constraints: QueryConstraint[] = [orderBy('name', 'asc')];
      
      if (filter) {
        if (filter.isActive !== undefined) {
          constraints.push(where('isActive', '==', filter.isActive));
        }
      }
      
      const q = query(this.staffCollection, ...constraints);
      const querySnapshot = await getDocs(q);
      
      let staff = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Staff));
      
      // Filtros que requieren procesamiento en cliente
      if (filter) {
        if (filter.name) {
          const searchTerm = filter.name.toLowerCase();
          staff = staff.filter(s => s.name.toLowerCase().includes(searchTerm));
        }
        
        if (filter.specialty) {
          staff = staff.filter(s => 
            s.specialty === filter.specialty || 
            (s.specialties && s.specialties.includes(filter.specialty!))
          );
        }
      }
      
      return staff;
    } catch (error) {
      console.error('Error obteniendo personal:', error);
      throw error;
    }
  }

  async getStaffById(id: string): Promise<Staff | null> {
    try {
      const docRef = doc(this.firestore, `staff/${id}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Staff;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo personal:', error);
      throw error;
    }
  }

  async createStaff(staff: Omit<Staff, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const staffData = {
        ...staff,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(this.staffCollection, staffData);
      return docRef.id;
    } catch (error) {
      console.error('Error creando personal:', error);
      throw error;
    }
  }

  async updateStaff(id: string, updates: Partial<Staff>): Promise<void> {
    try {
      const docRef = doc(this.firestore, `staff/${id}`);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error actualizando personal:', error);
      throw error;
    }
  }

  async deleteStaff(id: string): Promise<void> {
    try {
      const docRef = doc(this.firestore, `staff/${id}`);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error eliminando personal:', error);
      throw error;
    }
  }

  async toggleStaffStatus(id: string, isActive: boolean): Promise<void> {
    try {
      await this.updateStaff(id, { isActive });
    } catch (error) {
      console.error('Error cambiando estado del personal:', error);
      throw error;
    }
  }

  async getStaffBySpecialty(specialty: string): Promise<Staff[]> {
    try {
      const allStaff = await this.getAllStaff({ isActive: true });
      return allStaff.filter(staff => 
        staff.specialty === specialty || 
        (staff.specialties && staff.specialties.includes(specialty))
      );
    } catch (error) {
      console.error('Error obteniendo personal por especialidad:', error);
      throw error;
    }
  }
}
