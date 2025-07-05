import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { AuthService } from '../../services/auth.service';
import { Client } from '../../interfaces/client.interface';

@Component({
  selector: 'app-client-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './client-management.component.html',
  styleUrls: ['./client-management.component.scss']
})
export class ClientManagementComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  loading = false;
  error = '';
  success = '';
  showForm = false;
  editMode = false;
  editingClient: Client | null = null;
  
  clientForm: FormGroup;
  searchTerm = '';

  constructor(
    private clientService: ClientService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(8)]],
      address: ['', Validators.required],
      dni: ['', [Validators.required, Validators.minLength(8)]],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadClients();
  }

  async loadClients() {
    this.loading = true;
    this.error = '';
    
    try {
      const currentUser = this.authService.getCurrentUser();
      
      if (currentUser?.role === 'vendedor') {
        // Vendedores solo ven sus propios clientes
        this.clients = await this.clientService.getClientsBySeller(currentUser.uid);
      } else {
        // Administradores ven todos los clientes
        this.clients = await this.clientService.getAllClients();
      }
      
      this.filteredClients = [...this.clients];
      this.filterClients();
    } catch (error: any) {
      this.error = 'Error cargando clientes: ' + error.message;
    } finally {
      this.loading = false;
    }
  }

  filterClients() {
    if (!this.searchTerm.trim()) {
      this.filteredClients = [...this.clients];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(client => 
      client.name.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.phone.includes(term) ||
      client.dni.includes(term) ||
      client.address.toLowerCase().includes(term)
    );
  }

  showAddForm() {
    this.showForm = true;
    this.editMode = false;
    this.editingClient = null;
    this.clientForm.reset();
  }

  editClient(client: Client) {
    const currentUser = this.authService.getCurrentUser();
    
    // Solo administradores pueden editar
    if (currentUser?.role !== 'administrador') {
      this.error = 'Solo los administradores pueden editar clientes';
      return;
    }
    
    this.showForm = true;
    this.editMode = true;
    this.editingClient = client;
    
    this.clientForm.patchValue({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      dni: client.dni,
      notes: client.notes || ''
    });
  }

  async saveClient() {
    if (!this.clientForm.valid) {
      this.error = 'Por favor complete todos los campos requeridos';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = '';

    try {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('Usuario no autenticado');
      }

      const clientData = {
        ...this.clientForm.value,
        registeredBy: currentUser.uid
      };

      if (this.editMode && this.editingClient?.id) {
        await this.clientService.updateClient(this.editingClient.id, clientData);
        this.success = 'Cliente actualizado exitosamente';
      } else {
        await this.clientService.createClient(clientData);
        this.success = 'Cliente creado exitosamente';
      }

      this.showForm = false;
      await this.loadClients();
    } catch (error: any) {
      this.error = 'Error guardando cliente: ' + error.message;
    } finally {
      this.loading = false;
    }
  }

  async deleteClient(client: Client) {
    const currentUser = this.authService.getCurrentUser();
    
    // Solo administradores pueden eliminar
    if (currentUser?.role !== 'administrador') {
      this.error = 'Solo los administradores pueden eliminar clientes';
      return;
    }
    
    if (!confirm('¿Está seguro de que desea eliminar este cliente?')) {
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      if (client.id) {
        await this.clientService.deleteClient(client.id);
        this.success = 'Cliente eliminado exitosamente';
        await this.loadClients();
      }
    } catch (error: any) {
      this.error = 'Error eliminando cliente: ' + error.message;
    } finally {
      this.loading = false;
    }
  }

  cancelForm() {
    this.showForm = false;
    this.editMode = false;
    this.editingClient = null;
    this.error = '';
    this.success = '';
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  formatPhoneNumber(phone: string): string {
    // Formatear número de teléfono básico
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  }
}
