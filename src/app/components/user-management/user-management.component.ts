import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserProfile } from '../../services/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: UserProfile[] = [];
  loading = false;
  error = '';
  showCreateForm = false;
  userForm: FormGroup;

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: ['', [Validators.required, Validators.minLength(2)]],
      role: ['vendedor', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    this.error = '';
    
    try {
      this.users = await this.userService.getAllUsers();
    } catch (error: any) {
      this.error = 'Error cargando usuarios: ' + error.message;
    } finally {
      this.loading = false;
    }
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
    if (!this.showCreateForm) {
      this.userForm.reset();
      this.userForm.patchValue({ role: 'vendedor' });
    }
  }

  async onCreateUser() {
    if (this.userForm.valid) {
      this.loading = true;
      this.error = '';
      
      try {
        const userData = this.userForm.value;
        await this.userService.createUser(userData);
        this.showCreateForm = false;
        this.userForm.reset();
        this.userForm.patchValue({ role: 'vendedor' });
        await this.loadUsers();
      } catch (error: any) {
        this.error = 'Error creando usuario: ' + error.message;
      } finally {
        this.loading = false;
      }
    }
  }

  async toggleUserStatus(user: UserProfile) {
    this.loading = true;
    this.error = '';
    
    try {
      await this.userService.toggleUserStatus(user.uid, !user.active);
      await this.loadUsers();
    } catch (error: any) {
      this.error = 'Error cambiando estado del usuario: ' + error.message;
    } finally {
      this.loading = false;
    }
  }

  async deleteUser(user: UserProfile) {
    if (confirm(`¿Estás seguro de que quieres eliminar al usuario ${user.name}?`)) {
      this.loading = true;
      this.error = '';
      
      try {
        await this.userService.deleteUser(user.uid);
        await this.loadUsers();
      } catch (error: any) {
        this.error = 'Error eliminando usuario: ' + error.message;
      } finally {
        this.loading = false;
      }
    }
  }

  getRoleColor(role: string): string {
    switch (role) {
      case 'administrador':
        return '#e74c3c';
      case 'vendedor':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  }
}
