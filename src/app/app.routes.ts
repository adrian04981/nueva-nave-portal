import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'setup',
    loadComponent: () => import('./components/setup/setup.component').then(m => m.SetupComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'vehicles',
        loadComponent: () => import('./components/vehicle-management/vehicle-management.component').then(m => m.VehicleManagementComponent)
      },
      {
        path: 'clients',
        loadComponent: () => import('./components/client-management/client-management.component').then(m => m.ClientManagementComponent)
      },
      {
        path: 'sales',
        loadComponent: () => import('./components/sale-management/sale-management.component').then(m => m.SaleManagementComponent)
      },
      {
        path: 'calendar',
        loadComponent: () => import('./components/calendar/calendar.component').then(m => m.CalendarComponent)
      },
      {
        path: 'staff',
        loadComponent: () => import('./components/staff-management/staff-management.component').then(m => m.StaffManagementComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./components/service-management/service-management.component').then(m => m.ServiceManagementComponent)
      },
      {
        path: 'finances',
        loadComponent: () => import('./components/finance-management/finance-management.component').then(m => m.FinanceManagementComponent),
        canActivate: [AdminGuard]
      },
      {
        path: 'users',
        loadComponent: () => import('./components/user-management/user-management.component').then(m => m.UserManagementComponent),
        canActivate: [AdminGuard]
      },
      {
        path: 'roles',
        loadComponent: () => import('./components/role-management/role-management.component').then(m => m.RoleManagementComponent),
        canActivate: [AdminGuard]
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [AdminGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
