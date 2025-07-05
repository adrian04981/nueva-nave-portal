import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() { }

  /**
   * Convierte un archivo a base64
   */
  async convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => {
        reject(new Error('Error al convertir archivo a base64'));
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Redimensiona una imagen antes de convertirla a base64
   */
  async resizeAndConvertToBase64(file: File, maxWidth: number = 800, maxHeight: number = 600, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo la proporción
        let { width, height } = this.calculateDimensions(img.width, img.height, maxWidth, maxHeight);
        
        canvas.width = width;
        canvas.height = height;

        // Dibujar la imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a base64
        const base64 = canvas.toDataURL('image/jpeg', quality);
        resolve(base64);
      };

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };

      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calcula las nuevas dimensiones manteniendo la proporción
   */
  private calculateDimensions(originalWidth: number, originalHeight: number, maxWidth: number, maxHeight: number) {
    let width = originalWidth;
    let height = originalHeight;

    // Redimensionar si es necesario
    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width, height };
  }

  /**
   * Valida que el archivo sea una imagen válida
   */
  validateImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no válido. Solo se permiten JPEG, PNG y WebP.');
    }

    if (file.size > maxSize) {
      throw new Error('El archivo es muy grande. Máximo 10MB.');
    }

    return true;
  }

  /**
   * Obtiene información de una imagen base64
   */
  getImageInfo(base64: string): { size: number, type: string } {
    // Calcular tamaño aproximado del base64
    const base64Length = base64.length;
    const sizeInBytes = Math.round((base64Length * 3) / 4);
    
    // Extraer tipo MIME
    const typeMatch = base64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    const type = typeMatch ? typeMatch[1] : 'unknown';

    return {
      size: sizeInBytes,
      type: type
    };
  }

  /**
   * Convierte base64 a Blob (útil para descargas)
   */
  base64ToBlob(base64: string): Blob {
    const arr = base64.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  }

  /**
   * Genera thumbnail de una imagen base64
   */
  async generateThumbnail(base64: string, maxWidth: number = 150, maxHeight: number = 150): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        const { width, height } = this.calculateDimensions(img.width, img.height, maxWidth, maxHeight);
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
        resolve(thumbnail);
      };

      img.onerror = () => reject(new Error('Error al generar thumbnail'));
      img.src = base64;
    });
  }
}
