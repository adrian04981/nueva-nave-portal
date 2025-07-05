import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="image-upload">
      <!-- Vista previa de imágenes existentes -->
      <div class="current-images" *ngIf="images.length > 0">
        <h4>Imágenes actuales</h4>
        <div class="image-grid">
          <div class="image-item" *ngFor="let image of images; let i = index">
            <img [src]="image" [alt]="'Imagen ' + (i + 1)" class="preview-image">
            <button type="button" class="remove-btn" (click)="removeImage(i)" title="Eliminar">
              ×
            </button>
            <button type="button" class="set-main-btn" 
                    [class.main-image]="i === 0" 
                    (click)="setMainImage(i)" 
                    title="Imagen principal">
              ⭐
            </button>
          </div>
        </div>
      </div>

      <!-- Área de carga -->
      <div class="upload-area" 
           [class.dragover]="isDragOver"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)"
           (click)="fileInput.click()">
        
        <div class="upload-content">
          <div class="upload-icon">📸</div>
          <p class="upload-text">
            Arrastra imágenes aquí o haz clic para seleccionar
          </p>
          <p class="upload-hint">
            Máximo {{ maxImages }} imágenes • JPEG, PNG, WebP • Máximo 10MB c/u
          </p>
        </div>

        <input #fileInput
               type="file"
               multiple
               accept="image/jpeg,image/png,image/webp"
               (change)="onFileSelect($event)"
               style="display: none;">
      </div>

      <!-- Progreso de carga -->
      <div class="upload-progress" *ngIf="isUploading">
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="uploadProgress"></div>
        </div>
        <p>Procesando imágenes... {{ uploadProgress }}%</p>
      </div>

      <!-- Errores -->
      <div class="error-message" *ngIf="errorMessage">
        {{ errorMessage }}
      </div>

      <!-- Información -->
      <div class="image-info" *ngIf="images.length > 0">
        <p><strong>{{ images.length }}</strong> de {{ maxImages }} imágenes</p>
        <p class="size-info">Tamaño total aproximado: {{ getTotalSize() }}</p>
      </div>
    </div>
  `,
  styles: [`
    .image-upload {
      margin: 1rem 0;
    }

    .current-images {
      margin-bottom: 1rem;
    }

    .current-images h4 {
      margin-bottom: 0.5rem;
      color: #333;
    }

    .image-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .image-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid #e0e0e0;
      transition: border-color 0.3s;
    }

    .image-item.main-image {
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .preview-image {
      width: 100%;
      height: 100px;
      object-fit: cover;
      display: block;
    }

    .remove-btn, .set-main-btn {
      position: absolute;
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      transition: background-color 0.3s;
    }

    .remove-btn {
      top: 4px;
      right: 4px;
      background: rgba(220, 53, 69, 0.8);
    }

    .remove-btn:hover {
      background: rgba(220, 53, 69, 1);
    }

    .set-main-btn {
      top: 4px;
      left: 4px;
      background: rgba(255, 193, 7, 0.8);
    }

    .set-main-btn:hover, .set-main-btn.main-image {
      background: rgba(255, 193, 7, 1);
    }

    .upload-area {
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fafafa;
    }

    .upload-area:hover, .upload-area.dragover {
      border-color: #007bff;
      background: #f0f8ff;
    }

    .upload-content {
      pointer-events: none;
    }

    .upload-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .upload-text {
      font-size: 1.1rem;
      color: #4b5563;
      margin-bottom: 0.5rem;
    }

    .upload-hint {
      font-size: 0.9rem;
      color: #6b7280;
      margin: 0;
    }

    .upload-progress {
      margin: 1rem 0;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: #007bff;
      transition: width 0.3s ease;
    }

    .error-message {
      background: #fee2e2;
      color: #dc2626;
      padding: 0.75rem;
      border-radius: 6px;
      margin: 1rem 0;
      border: 1px solid #fecaca;
    }

    .image-info {
      background: #f3f4f6;
      padding: 0.75rem;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
      margin-top: 1rem;
    }

    .image-info p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
      color: #4b5563;
    }

    .size-info {
      color: #6b7280;
    }

    @media (max-width: 768px) {
      .image-grid {
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 0.5rem;
      }

      .preview-image {
        height: 80px;
      }

      .upload-area {
        padding: 1.5rem 1rem;
      }

      .upload-icon {
        font-size: 2rem;
      }
    }
  `]
})
export class ImageUploadComponent implements OnInit {
  @Input() images: string[] = [];
  @Input() maxImages: number = 10;
  @Input() maxSizePerImage: number = 10; // MB
  @Output() imagesChange = new EventEmitter<string[]>();
  @Output() errorChange = new EventEmitter<string>();

  isDragOver = false;
  isUploading = false;
  uploadProgress = 0;
  errorMessage = '';

  constructor(private imageService: ImageService) {}

  ngOnInit() {
    // Asegurar que images sea un array
    if (!this.images) {
      this.images = [];
    }
  }

  async onFileSelect(event: any) {
    const files = Array.from(event.target.files) as File[];
    await this.processFiles(files);
    // Limpiar el input
    event.target.value = '';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  async onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = Array.from(event.dataTransfer?.files || []) as File[];
    await this.processFiles(files);
  }

  async processFiles(files: File[]) {
    this.errorMessage = '';
    this.errorChange.emit('');

    // Validar número de imágenes
    if (this.images.length + files.length > this.maxImages) {
      this.setError(`Máximo ${this.maxImages} imágenes permitidas. Tienes ${this.images.length} y intentas agregar ${files.length}.`);
      return;
    }

    // Filtrar solo imágenes
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      this.setError('Solo se permiten archivos de imagen.');
      return;
    }

    if (imageFiles.length === 0) {
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    try {
      const newImages: string[] = [];
      
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        
        // Validar archivo
        try {
          this.imageService.validateImageFile(file);
        } catch (error: any) {
          this.setError(error.message);
          continue;
        }

        // Convertir a base64 con redimensionamiento
        try {
          const base64 = await this.imageService.resizeAndConvertToBase64(file, 1200, 800, 0.8);
          newImages.push(base64);
          
          // Actualizar progreso
          this.uploadProgress = Math.round(((i + 1) / imageFiles.length) * 100);
        } catch (error) {
          console.error('Error procesando imagen:', error);
          this.setError(`Error procesando ${file.name}`);
        }
      }

      // Agregar nuevas imágenes
      this.images = [...this.images, ...newImages];
      this.imagesChange.emit(this.images);

    } catch (error) {
      console.error('Error general:', error);
      this.setError('Error procesando las imágenes');
    } finally {
      this.isUploading = false;
      this.uploadProgress = 0;
    }
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
    this.imagesChange.emit(this.images);
  }

  setMainImage(index: number) {
    if (index !== 0) {
      // Mover la imagen seleccionada al inicio
      const selectedImage = this.images[index];
      this.images.splice(index, 1);
      this.images.unshift(selectedImage);
      this.imagesChange.emit(this.images);
    }
  }

  getTotalSize(): string {
    let totalBytes = 0;
    this.images.forEach(image => {
      const info = this.imageService.getImageInfo(image);
      totalBytes += info.size;
    });

    if (totalBytes < 1024 * 1024) {
      return `${Math.round(totalBytes / 1024)} KB`;
    } else {
      return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  }

  private setError(message: string) {
    this.errorMessage = message;
    this.errorChange.emit(message);
  }

  get error() {
    return this.errorMessage;
  }
}
