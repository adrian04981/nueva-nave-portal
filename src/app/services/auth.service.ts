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
  private readonly USER_STORAGE_KEY = 'nueva_nave_user';
  private readonly SESSION_STORAGE_KEY = 'nueva_nave_session';

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    this.initAuthListener();
    this.loadStoredUser();
  }

  private loadStoredUser() {
    try {
      const storedUser = localStorage.getItem(this.USER_STORAGE_KEY);
      const sessionToken = sessionStorage.getItem(this.SESSION_STORAGE_KEY);
      
      if (storedUser && sessionToken) {
        const userProfile = JSON.parse(storedUser) as UserProfile;
        // Verificar que la sesión no haya expirado (24 horas)
        const sessionData = JSON.parse(sessionToken);
        const sessionTime = new Date(sessionData.timestamp);
        const now = new Date();
        const hoursDiff = (now.getTime() - sessionTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          this.currentUserSubject.next(userProfile);
        } else {
          this.clearStoredSession();
        }
      }
    } catch (error) {
      console.error('Error cargando usuario almacenado:', error);
      this.clearStoredSession();
    }
  }

  private storeUser(userProfile: UserProfile) {
    try {
      localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(userProfile));
      sessionStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify({
        timestamp: new Date().toISOString(),
        uid: userProfile.uid
      }));
    } catch (error) {
      console.error('Error almacenando usuario:', error);
    }
  }

  private clearStoredSession() {
    localStorage.removeItem(this.USER_STORAGE_KEY);
    sessionStorage.removeItem(this.SESSION_STORAGE_KEY);
  }

  private initAuthListener() {
    onAuthStateChanged(this.auth, async (user: User | null) => {
      if (user) {
        const userProfile = await this.getUserProfile(user.uid);
        if (userProfile) {
          this.currentUserSubject.next(userProfile);
          this.storeUser(userProfile);
        }
      } else {
        this.currentUserSubject.next(null);
        this.clearStoredSession();
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

      this.currentUserSubject.next(userProfile);
      this.storeUser(userProfile);
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
      this.clearStoredSession();
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
