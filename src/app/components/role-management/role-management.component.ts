import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
}

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss']
})
export class RoleManagementComponent implements OnInit {
  roles: Role[] = [];
  availablePermissions: Permission[] = [
    // Dashboard
    { id: 'dashboard.view', name: 'dashboard_view', displayName: 'Ver Dashboard', description: 'Acceso al panel principal', category: 'Dashboard' },
    { id: 'dashboard.analytics', name: 'dashboard_analytics', displayName: 'Ver Analíticas', description: 'Acceso a reportes y estadísticas', category: 'Dashboard' },
    
    // Usuarios
    { id: 'users.view', name: 'users_view', displayName: 'Ver Usuarios', description: 'Listar y ver usuarios', category: 'Usuarios' },
    { id: 'users.create', name: 'users_create', displayName: 'Crear Usuarios', description: 'Crear nuevos usuarios', category: 'Usuarios' },
    { id: 'users.edit', name: 'users_edit', displayName: 'Editar Usuarios', description: 'Modificar datos de usuarios', category: 'Usuarios' },
    { id: 'users.delete', name: 'users_delete', displayName: 'Eliminar Usuarios', description: 'Eliminar usuarios del sistema', category: 'Usuarios' },
    
    // Roles
    { id: 'roles.view', name: 'roles_view', displayName: 'Ver Roles', description: 'Listar y ver roles', category: 'Roles' },
    { id: 'roles.create', name: 'roles_create', displayName: 'Crear Roles', description: 'Crear nuevos roles', category: 'Roles' },
    { id: 'roles.edit', name: 'roles_edit', displayName: 'Editar Roles', description: 'Modificar roles existentes', category: 'Roles' },
    { id: 'roles.delete', name: 'roles_delete', displayName: 'Eliminar Roles', description: 'Eliminar roles del sistema', category: 'Roles' },
    
    // Vehículos
    { id: 'vehicles.view', name: 'vehicles_view', displayName: 'Ver Vehículos', description: 'Listar y ver vehículos', category: 'Vehículos' },
    { id: 'vehicles.create', name: 'vehicles_create', displayName: 'Crear Vehículos', description: 'Registrar nuevos vehículos', category: 'Vehículos' },
    { id: 'vehicles.edit', name: 'vehicles_edit', displayName: 'Editar Vehículos', description: 'Modificar datos de vehículos', category: 'Vehículos' },
    { id: 'vehicles.delete', name: 'vehicles_delete', displayName: 'Eliminar Vehículos', description: 'Eliminar vehículos del sistema', category: 'Vehículos' },
    
    // Clientes
    { id: 'clients.view', name: 'clients_view', displayName: 'Ver Clientes', description: 'Listar y ver clientes', category: 'Clientes' },
    { id: 'clients.create', name: 'clients_create', displayName: 'Crear Clientes', description: 'Registrar nuevos clientes', category: 'Clientes' },
    { id: 'clients.edit', name: 'clients_edit', displayName: 'Editar Clientes', description: 'Modificar datos de clientes', category: 'Clientes' },
    { id: 'clients.delete', name: 'clients_delete', displayName: 'Eliminar Clientes', description: 'Eliminar clientes del sistema', category: 'Clientes' },
    
    // Ventas
    { id: 'sales.view', name: 'sales_view', displayName: 'Ver Ventas', description: 'Listar y ver ventas', category: 'Ventas' },
    { id: 'sales.create', name: 'sales_create', displayName: 'Crear Ventas', description: 'Registrar nuevas ventas', category: 'Ventas' },
    { id: 'sales.edit', name: 'sales_edit', displayName: 'Editar Ventas', description: 'Modificar datos de ventas', category: 'Ventas' },
    { id: 'sales.delete', name: 'sales_delete', displayName: 'Eliminar Ventas', description: 'Eliminar ventas del sistema', category: 'Ventas' },
    { id: 'sales.own_only', name: 'sales_own_only', displayName: 'Solo Ventas Propias', description: 'Solo puede ver sus propias ventas', category: 'Ventas' },
    
    // Finanzas
    { id: 'finances.view', name: 'finances_view', displayName: 'Ver Finanzas', description: 'Acceso a información financiera', category: 'Finanzas' },
    { id: 'finances.manage', name: 'finances_manage', displayName: 'Gestionar Finanzas', description: 'Gestionar aspectos financieros', category: 'Finanzas' },
    
    // Servicios
    { id: 'services.view', name: 'services_view', displayName: 'Ver Servicios', description: 'Listar y ver servicios', category: 'Servicios' },
    { id: 'services.create', name: 'services_create', displayName: 'Crear Servicios', description: 'Registrar nuevos servicios', category: 'Servicios' },
    { id: 'services.edit', name: 'services_edit', displayName: 'Editar Servicios', description: 'Modificar servicios', category: 'Servicios' },
    { id: 'services.delete', name: 'services_delete', displayName: 'Eliminar Servicios', description: 'Eliminar servicios', category: 'Servicios' },
    
    // Sistema
    { id: 'system.settings', name: 'system_settings', displayName: 'Configuración Sistema', description: 'Acceso a configuración del sistema', category: 'Sistema' },
    { id: 'system.logs', name: 'system_logs', displayName: 'Ver Logs', description: 'Acceso a logs del sistema', category: 'Sistema' },
    { id: 'system.backup', name: 'system_backup', displayName: 'Respaldos', description: 'Gestionar respaldos del sistema', category: 'Sistema' }
  ];

  // UI State
  loading = false;
  error = '';
  success = '';
  showForm = false;
  showDetails = false;
  editMode = false;
  selectedRole: Role | null = null;

  // Form
  roleForm: FormGroup;
  selectedPermissions: string[] = [];
  permissionCategories: string[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z_][a-zA-Z0-9_]*$/)]],
      displayName: ['', Validators.required],
      description: ['', Validators.required],
      permissions: [[]]
    });

    // Get unique categories
    this.permissionCategories = [...new Set(this.availablePermissions.map(p => p.category))];
  }

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    // Load default roles and any custom roles
    this.roles = [
      {
        id: '1',
        name: 'administrador',
        displayName: 'Administrador',
        description: 'Acceso completo al sistema. Puede gestionar usuarios, roles y todas las funcionalidades.',
        permissions: this.availablePermissions.map(p => p.id),
        userCount: 1,
        isSystemRole: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'vendedor',
        displayName: 'Vendedor',
        description: 'Acceso para gestionar ventas y clientes. Puede ver dashboard y gestionar sus propias ventas.',
        permissions: [
          'dashboard.view',
          'dashboard.analytics',
          'vehicles.view',
          'clients.view',
          'clients.create',
          'clients.edit',
          'sales.view',
          'sales.create',
          'sales.edit',
          'sales.own_only'
        ],
        userCount: 0,
        isSystemRole: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '3',
        name: 'supervisor',
        displayName: 'Supervisor',
        description: 'Acceso intermedio. Puede gestionar ventas, vehículos y clientes pero no usuarios ni roles.',
        permissions: [
          'dashboard.view',
          'dashboard.analytics',
          'vehicles.view',
          'vehicles.create',
          'vehicles.edit',
          'clients.view',
          'clients.create',
          'clients.edit',
          'sales.view',
          'sales.create',
          'sales.edit',
          'services.view',
          'services.create',
          'services.edit'
        ],
        userCount: 0,
        isSystemRole: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // Role Management Methods
  showAddForm() {
    this.showForm = true;
    this.editMode = false;
    this.selectedRole = null;
    this.selectedPermissions = [];
    this.roleForm.reset();
    this.error = '';
    this.success = '';
  }

  editRole(role: Role) {
    this.showForm = true;
    this.editMode = true;
    this.selectedRole = role;
    this.selectedPermissions = [...role.permissions];
    
    this.roleForm.patchValue({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      permissions: role.permissions
    });
    
    this.error = '';
    this.success = '';
  }

  viewDetails(role: Role) {
    this.selectedRole = role;
    this.showDetails = true;
  }

  async saveRole() {
    if (!this.roleForm.valid) {
      this.error = 'Por favor complete todos los campos requeridos';
      return;
    }

    if (this.selectedPermissions.length === 0) {
      this.error = 'Debe seleccionar al menos un permiso';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      const formValue = this.roleForm.value;
      const roleData: Role = {
        id: this.editMode ? this.selectedRole!.id : this.generateId(),
        name: formValue.name,
        displayName: formValue.displayName,
        description: formValue.description,
        permissions: [...this.selectedPermissions],
        userCount: this.editMode ? this.selectedRole!.userCount : 0,
        isSystemRole: false,
        createdAt: this.editMode ? this.selectedRole!.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (this.editMode) {
        // Update existing role
        const index = this.roles.findIndex(r => r.id === this.selectedRole!.id);
        if (index !== -1) {
          this.roles[index] = roleData;
        }
        this.success = 'Rol actualizado exitosamente';
      } else {
        // Create new role
        this.roles.push(roleData);
        this.success = 'Rol creado exitosamente';
      }

      this.closeForm();
    } catch (error: any) {
      this.error = 'Error guardando rol: ' + error.message;
    } finally {
      this.loading = false;
    }
  }

  deleteRole(role: Role) {
    if (role.isSystemRole) {
      this.error = 'No se pueden eliminar roles del sistema';
      return;
    }

    if (role.userCount > 0) {
      this.error = 'No se puede eliminar un rol que tiene usuarios asignados';
      return;
    }

    if (!confirm(`¿Está seguro de que desea eliminar el rol "${role.displayName}"?`)) {
      return;
    }

    try {
      this.roles = this.roles.filter(r => r.id !== role.id);
      this.success = 'Rol eliminado exitosamente';
    } catch (error: any) {
      this.error = 'Error eliminando rol: ' + error.message;
    }
  }

  // Permission Management
  togglePermission(permissionId: string) {
    const index = this.selectedPermissions.indexOf(permissionId);
    if (index === -1) {
      this.selectedPermissions.push(permissionId);
    } else {
      this.selectedPermissions.splice(index, 1);
    }
  }

  isPermissionSelected(permissionId: string): boolean {
    return this.selectedPermissions.includes(permissionId);
  }

  getPermissionsByCategory(category: string): Permission[] {
    return this.availablePermissions.filter(p => p.category === category);
  }

  selectAllPermissions(category: string) {
    const categoryPermissions = this.getPermissionsByCategory(category);
    categoryPermissions.forEach(permission => {
      if (!this.isPermissionSelected(permission.id)) {
        this.selectedPermissions.push(permission.id);
      }
    });
  }

  deselectAllPermissions(category: string) {
    const categoryPermissions = this.getPermissionsByCategory(category);
    categoryPermissions.forEach(permission => {
      const index = this.selectedPermissions.indexOf(permission.id);
      if (index !== -1) {
        this.selectedPermissions.splice(index, 1);
      }
    });
  }

  // UI Methods
  closeForm() {
    this.showForm = false;
    this.editMode = false;
    this.selectedRole = null;
    this.selectedPermissions = [];
    this.error = '';
    this.success = '';
  }

  closeDetails() {
    this.showDetails = false;
    this.selectedRole = null;
  }

  // Utility Methods
  generateId(): string {
    return 'role_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getRoleColor(roleName: string): string {
    const colors: { [key: string]: string } = {
      'administrador': '#e74c3c',
      'vendedor': '#3498db',
      'supervisor': '#f39c12',
      'gerente': '#8e44ad',
      'contador': '#27ae60',
      'recepcionista': '#95a5a6'
    };
    return colors[roleName] || '#34495e';
  }

  getRoleIcon(roleName: string): string {
    const icons: { [key: string]: string } = {
      'administrador': '👑',
      'vendedor': '🛍️',
      'supervisor': '👥',
      'gerente': '📊',
      'contador': '💰',
      'recepcionista': '📞'
    };
    return icons[roleName] || '👤';
  }

  getPermissionDisplayName(permissionId: string): string {
    const permission = this.availablePermissions.find(p => p.id === permissionId);
    return permission ? permission.displayName : permissionId;
  }

  canEditRole(role: Role): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === 'administrador';
  }

  canDeleteRole(role: Role): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === 'administrador' && !role.isSystemRole && role.userCount === 0;
  }

  isAdmin(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === 'administrador';
  }

  hasPermissionsInCategory(category: string): boolean {
    if (!this.selectedRole) return false;
    return this.getPermissionsByCategory(category).some(p => this.selectedRole!.permissions.includes(p.id));
  }
}
