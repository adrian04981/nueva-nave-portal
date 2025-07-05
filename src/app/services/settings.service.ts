import { Injectable } from '@angular/core';
import { 
  Firestore, 
  doc, 
  getDoc,
  setDoc,
  updateDoc 
} from '@angular/fire/firestore';
import { Settings, DEFAULT_SETTINGS } from '../interfaces/settings.interface';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsDocRef = doc(this.firestore, 'settings/main');

  constructor(private firestore: Firestore) {}

  async getSettings(): Promise<Settings> {
    try {
      const docSnap = await getDoc(this.settingsDocRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as Settings;
      } else {
        // Crear configuración por defecto si no existe
        await this.createDefaultSettings();
        return DEFAULT_SETTINGS;
      }
    } catch (error) {
      console.error('Error obteniendo configuración:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(updates: Partial<Settings>, updatedBy: string): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      
      const updatedSettings = {
        ...currentSettings,
        ...updates,
        updatedAt: new Date(),
        updatedBy
      };
      
      await setDoc(this.settingsDocRef, updatedSettings);
    } catch (error) {
      console.error('Error actualizando configuración:', error);
      throw error;
    }
  }

  private async createDefaultSettings(): Promise<void> {
    try {
      await setDoc(this.settingsDocRef, DEFAULT_SETTINGS);
    } catch (error) {
      console.error('Error creando configuración por defecto:', error);
      throw error;
    }
  }

  async resetToDefaults(updatedBy: string): Promise<void> {
    try {
      const defaultSettings = {
        ...DEFAULT_SETTINGS,
        updatedAt: new Date(),
        updatedBy
      };
      
      await setDoc(this.settingsDocRef, defaultSettings);
    } catch (error) {
      console.error('Error reseteando configuración:', error);
      throw error;
    }
  }
}
