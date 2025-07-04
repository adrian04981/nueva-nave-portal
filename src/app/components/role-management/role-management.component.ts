import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: string[];
  userCount: number;
}

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss']
})
export class RoleManagementComponent implements OnInit {
  roles: Role[] = [
    {
      id: '1',
      name: 'administrador',
      displayName: 'Administrador',
      description: 'Acceso completo al sistema. Puede gestionar usuarios, roles y todas las funcionalidades.',
      permissions: [
        'Gestionar usuarios',
        'Gestionar roles',
        'Ver dashboard',
        'Configurar sistema',
        'Acceso completo'
      ],
      userCount: 1
    },
    {
      id: '2',
      name: 'vendedor',
      displayName: 'Vendedor',
      description: 'Acceso limitado al sistema. Puede acceder al dashboard básico.',
      permissions: [
        'Ver dashboard',
        'Futuras funcionalidades de ventas'
      ],
      userCount: 0
    }
  ];

  constructor() {}

  ngOnInit() {}

  getRoleColor(roleName: string): string {
    switch (roleName) {
      case 'administrador':
        return '#e74c3c';
      case 'vendedor':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  }

  getRoleIcon(roleName: string): string {
    switch (roleName) {
      case 'administrador':
        return '👑';
      case 'vendedor':
        return '🛍️';
      default:
        return '👤';
    }
  }
}
