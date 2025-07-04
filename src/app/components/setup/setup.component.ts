import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent {
  setupForm: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    this.setupForm = this.fb.group({
      email: ['admin@nuevanave.com', [Validators.required, Validators.email]],
      password: ['123456', [Validators.required, Validators.minLength(6)]],
      name: ['Administrador', [Validators.required, Validators.minLength(2)]]
    });
  }

  async onSetup() {
    if (this.setupForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';
      
      try {
        const { email, password, name } = this.setupForm.value;
        
        // Crear usuario en Firebase Auth y perfil en Firestore
        await this.userService.createUser({
          email,
          password,
          name,
          role: 'administrador'
        });
        
        this.success = 'Usuario administrador creado exitosamente. Puedes hacer login ahora.';
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
        
      } catch (error: any) {
        this.error = 'Error creando usuario: ' + error.message;
      } finally {
        this.loading = false;
      }
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
