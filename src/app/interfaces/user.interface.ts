export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'administrador' | 'vendedor';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFilter {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}
