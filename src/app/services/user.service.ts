import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, doc, updateDoc, deleteDoc, addDoc, query, orderBy } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword, deleteUser } from '@angular/fire/auth';
import { AuthService, UserProfile } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usersCollection = collection(this.firestore, 'users');

  constructor(
    private firestore: Firestore,
    private auth: Auth,
    private authService: AuthService
  ) {}

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const q = query(this.usersCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as UserProfile);
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }

  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role: 'administrador' | 'vendedor';
  }): Promise<void> {
    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        userData.email,
        userData.password
      );

      // Crear perfil de usuario en Firestore
      await this.authService.createUserProfile(
        userCredential.user.uid,
        userData.email,
        userData.name,
        userData.role
      );
    } catch (error) {
      console.error('Error creando usuario:', error);
      throw error;
    }
  }

  async updateUser(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userDoc = doc(this.firestore, `users/${uid}`);
      await updateDoc(userDoc, updates);
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  }

  async toggleUserStatus(uid: string, active: boolean): Promise<void> {
    try {
      await this.updateUser(uid, { active });
    } catch (error) {
      console.error('Error cambiando estado del usuario:', error);
      throw error;
    }
  }

  async deleteUser(uid: string): Promise<void> {
    try {
      // Eliminar documento de Firestore
      await deleteDoc(doc(this.firestore, 'users', uid));
      
      // Nota: No se puede eliminar el usuario de Auth desde el lado del cliente
      // Esto debe hacerse desde el lado del servidor o manualmente
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }

  // Nuevo método para obtener usuarios por rol
  async getUsersByRole(role: 'administrador' | 'vendedor'): Promise<UserProfile[]> {
    try {
      const allUsers = await this.getAllUsers();
      return allUsers.filter(user => user.role === role && user.active);
    } catch (error) {
      console.error('Error obteniendo usuarios por rol:', error);
      throw error;
    }
  }
}
