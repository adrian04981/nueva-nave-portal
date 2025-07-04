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
      const userDoc = doc(this.firestore, `users/${uid}`);
      await deleteDoc(userDoc);
      
      // Nota: No podemos eliminar el usuario de Firebase Auth desde el cliente
      // Esto debe hacerse desde el backend usando Firebase Admin SDK
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      throw error;
    }
  }
}
