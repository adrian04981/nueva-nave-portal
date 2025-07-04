import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string;
  role: 'administrador' | 'vendedor';
  name: string;
  active: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    this.initAuthListener();
  }

  private initAuthListener() {
    onAuthStateChanged(this.auth, async (user: User | null) => {
      if (user) {
        const userProfile = await this.getUserProfile(user.uid);
        this.currentUserSubject.next(userProfile);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      const userProfile = await this.getUserProfile(credential.user.uid);
      
      if (!userProfile?.active) {
        await this.logout();
        throw new Error('Usuario inactivo');
      }
      
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(this.firestore, `users/${uid}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }
  }

  async createUserProfile(uid: string, email: string, name: string, role: 'administrador' | 'vendedor'): Promise<void> {
    try {
      const userProfile: UserProfile = {
        uid,
        email,
        name,
        role,
        active: true,
        createdAt: new Date()
      };
      
      const docRef = doc(this.firestore, `users/${uid}`);
      await setDoc(docRef, userProfile);
    } catch (error) {
      console.error('Error creando perfil:', error);
      throw error;
    }
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: 'administrador' | 'vendedor'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole('administrador');
  }

  isSeller(): boolean {
    return this.hasRole('vendedor');
  }
}
