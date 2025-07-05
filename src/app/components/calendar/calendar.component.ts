import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { CalendarService } from '../../services/calendar.service';
import { VehicleService } from '../../services/vehicle.service';
import { ClientService } from '../../services/client.service';
import { UserService } from '../../services/user.service';
import { StaffService } from '../../services/staff.service';
import { ServiceService } from '../../services/service.service';
import { AuthService, UserProfile } from '../../services/auth.service';

import { CalendarEvent } from '../../interfaces/calendar.interface';
import { Vehicle } from '../../interfaces/vehicle.interface';
import { Client } from '../../interfaces/client.interface';
import { Staff } from '../../interfaces/staff.interface';
import { Service } from '../../interfaces/service.interface';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
  // Datos
  events: CalendarEvent[] = [];
  filteredEvents: CalendarEvent[] = [];
  vehicles: Vehicle[] = [];
  clients: Client[] = [];
  sellers: UserProfile[] = [];
  services: Service[] = [];
  
  // Observables
  staff$: Observable<Staff[]>;
  
  // Estado del componente
  loading = false;
  error = '';
  success = '';
  showForm = false;
  editMode = false;
  currentEvent: CalendarEvent | null = null;
  
  // Filtros
  selectedDate = new Date().toISOString().split('T')[0];
  typeFilter = '';
  statusFilter = '';
  staffFilter = '';
  
  // Formulario
  eventForm: FormGroup = this.fb.group({});
  
  // Opciones
  eventTypes = [
    { value: 'fotos', label: '📸 Toma de Fotos' },
    { value: 'notaria', label: '📋 Notaría' },
    { value: 'servicio', label: '🔧 Servicio' },
    { value: 'reunion', label: '🤝 Reunión' },
    { value: 'otro', label: '📝 Otro' }
  ];
  
  eventStatuses = [
    { value: 'programado', label: '📅 Programado' },
    { value: 'en_proceso', label: '⏳ En Proceso' },
    { value: 'completado', label: '✅ Completado' },
    { value: 'cancelado', label: '❌ Cancelado' }
  ];
  
  timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
  ];

  constructor(
    private fb: FormBuilder,
    private calendarService: CalendarService,
    private vehicleService: VehicleService,
    private clientService: ClientService,
    private userService: UserService,
    private staffService: StaffService,
    private serviceService: ServiceService,
    private authService: AuthService
  ) {
    this.staff$ = this.staffService.getStaffMembers();
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadData();
    this.loadEvents();
  }

  private initializeForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      date: [this.selectedDate, Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['10:00', Validators.required],
      type: ['reunion', Validators.required],
      status: ['programado', Validators.required],
      vehicleId: [''],
      clientId: [''],
      sellerId: [''],
      serviceId: [''],
      staffId: [''],
      location: [''],
      notes: ['']
    });
  }

  private async loadData(): Promise<void> {
    try {
      this.loading = true;
      
      // Cargar datos en paralelo
      const [vehicles, clients, sellers, services] = await Promise.all([
        this.vehicleService.getAllVehicles(),
        this.clientService.getAllClients(),
        this.userService.getAllUsers(),
        this.serviceService.getAllServices()
      ]);
      
      this.vehicles = vehicles;
      this.clients = clients;
      this.sellers = sellers.filter(user => user.role === 'vendedor' || user.role === 'administrador');
      this.services = services;
      
    } catch (error) {
      console.error('Error loading data:', error);
      this.error = 'Error al cargar los datos del sistema';
    } finally {
      this.loading = false;
    }
  }

  private async loadEvents(): Promise<void> {
    try {
      this.loading = true;
      this.events = await this.calendarService.getAllEvents();
      this.filterEvents();
      
    } catch (error) {
      console.error('Error loading events:', error);
      this.error = 'Error al cargar los eventos del calendario';
    } finally {
      this.loading = false;
    }
  }

  filterEvents(): void {
    this.filteredEvents = this.events.filter(event => {
      const eventDate = new Date(event.date).toISOString().split('T')[0];
      const matchesDate = eventDate === this.selectedDate;
      const matchesType = !this.typeFilter || event.type === this.typeFilter;
      const matchesStatus = !this.statusFilter || event.status === this.statusFilter;
      const matchesStaff = !this.staffFilter || event.staffId === this.staffFilter;
      
      return matchesDate && matchesType && matchesStatus && matchesStaff;
    });
    
    // Ordenar por hora de inicio
    this.filteredEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  onDateChange(): void {
    this.filterEvents();
  }

  onFilterChange(): void {
    this.filterEvents();
  }

  showAddForm(): void {
    this.showForm = true;
    this.editMode = false;
    this.currentEvent = null;
    this.eventForm.reset();
    this.eventForm.patchValue({
      date: this.selectedDate,
      startTime: '09:00',
      endTime: '10:00',
      type: 'reunion',
      status: 'programado'
    });
  }

  editEvent(event: CalendarEvent): void {
    this.showForm = true;
    this.editMode = true;
    this.currentEvent = event;
    
    const eventDate = new Date(event.date).toISOString().split('T')[0];
    this.eventForm.patchValue({
      title: event.title,
      description: event.description || '',
      date: eventDate,
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      status: event.status,
      vehicleId: event.vehicleId || '',
      clientId: event.clientId || '',
      sellerId: event.sellerId || '',
      serviceId: event.serviceId || '',
      staffId: event.staffId || '',
      location: event.location || '',
      notes: event.notes || ''
    });
  }

  async saveEvent(): Promise<void> {
    if (this.eventForm.valid) {
      try {
        this.loading = true;
        
        const currentUser = await this.authService.getCurrentUser();
        const formData = this.eventForm.value;
        
        const eventData: CalendarEvent = {
          title: formData.title,
          description: formData.description,
          date: new Date(formData.date),
          startTime: formData.startTime,
          endTime: formData.endTime,
          type: formData.type,
          status: formData.status,
          vehicleId: formData.vehicleId || undefined,
          clientId: formData.clientId || undefined,
          sellerId: formData.sellerId || undefined,
          serviceId: formData.serviceId || undefined,
          staffId: formData.staffId || undefined,
          location: formData.location,
          notes: formData.notes,
          createdBy: currentUser?.uid || '',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        if (this.editMode && this.currentEvent?.id) {
          await this.calendarService.updateEvent(this.currentEvent.id, eventData);
          this.success = 'Evento actualizado correctamente';
        } else {
          await this.calendarService.createEvent(eventData);
          this.success = 'Evento creado correctamente';
        }
        
        this.cancelForm();
        this.loadEvents();
        
      } catch (error) {
        console.error('Error saving event:', error);
        this.error = 'Error al guardar el evento';
      } finally {
        this.loading = false;
      }
    }
  }

  async deleteEvent(event: CalendarEvent): Promise<void> {
    if (confirm('¿Está seguro de que desea eliminar este evento?')) {
      try {
        this.loading = true;
        
        if (event.id) {
          await this.calendarService.deleteEvent(event.id);
          this.success = 'Evento eliminado correctamente';
          this.loadEvents();
        }
        
      } catch (error) {
        console.error('Error deleting event:', error);
        this.error = 'Error al eliminar el evento';
      } finally {
        this.loading = false;
      }
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.editMode = false;
    this.currentEvent = null;
    this.eventForm.reset();
    this.clearMessages();
  }

  clearMessages(): void {
    this.error = '';
    this.success = '';
  }

  // Métodos de utilidad
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(time: string): string {
    return time;
  }

  getEventIcon(type: string): string {
    return this.getTypeIcon(type);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'programado': return '#007bff';
      case 'en_proceso': return '#ffc107';
      case 'completado': return '#28a745';
      case 'cancelado': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getStatusLabel(status: string): string {
    const statusObj = this.eventStatuses.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  }

  closeForm(): void {
    this.cancelForm();
  }

  async updateEventStatus(event: CalendarEvent, newStatus: string): Promise<void> {
    if (event.id) {
      try {
        await this.calendarService.updateEvent(event.id, {
          ...event,
          status: newStatus as CalendarEvent['status'],
          updatedAt: new Date()
        });
        this.success = 'Estado del evento actualizado';
        this.loadEvents();
      } catch (error) {
        console.error('Error updating event status:', error);
        this.error = 'Error al actualizar el estado del evento';
      }
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'programado': return 'badge-primary';
      case 'en_proceso': return 'badge-warning';
      case 'completado': return 'badge-success';
      case 'cancelado': return 'badge-danger';
      default: return 'badge-secondary';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'fotos': return '📸';
      case 'notaria': return '📋';
      case 'servicio': return '🔧';
      case 'reunion': return '🤝';
      case 'otro': return '📝';
      default: return '📅';
    }
  }

  getVehicleInfo(vehicleId: string): string {
    if (!vehicleId) return '';
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : '';
  }

  getClientInfo(clientId: string): string {
    if (!clientId) return '';
    const client = this.clients.find(c => c.id === clientId);
    return client ? client.name : '';
  }

  getSellerInfo(sellerId: string): string {
    if (!sellerId) return '';
    const seller = this.sellers.find(s => s.uid === sellerId);
    return seller ? seller.name : '';
  }

  getServiceInfo(serviceId: string): string {
    if (!serviceId) return '';
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.name : '';
  }

  getStaffInfo(staffId: string): string {
    if (!staffId) return '';
    // Since staff$ is an observable, we need to get the current value
    let staffInfo = '';
    this.staff$.subscribe(staffList => {
      const staff = staffList.find(s => s.id === staffId);
      staffInfo = staff ? `${staff.name} - ${staff.specialty}` : '';
    }).unsubscribe();
    return staffInfo;
  }

  // Validación de horarios
  onStartTimeChange(): void {
    const startTime = this.eventForm.get('startTime')?.value;
    const endTime = this.eventForm.get('endTime')?.value;
    
    if (startTime && endTime && startTime >= endTime) {
      // Ajustar hora de fin automáticamente
      const startIndex = this.timeSlots.indexOf(startTime);
      if (startIndex >= 0 && startIndex < this.timeSlots.length - 1) {
        this.eventForm.patchValue({
          endTime: this.timeSlots[startIndex + 1]
        });
      }
    }
  }

  onEndTimeChange(): void {
    const startTime = this.eventForm.get('startTime')?.value;
    const endTime = this.eventForm.get('endTime')?.value;
    
    if (startTime && endTime && endTime <= startTime) {
      // Ajustar hora de inicio automáticamente
      const endIndex = this.timeSlots.indexOf(endTime);
      if (endIndex > 0) {
        this.eventForm.patchValue({
          startTime: this.timeSlots[endIndex - 1]
        });
      }
    }
  }

  // Filtros de tiempo
  getAvailableEndTimes(): string[] {
    const startTime = this.eventForm.get('startTime')?.value;
    if (!startTime) return this.timeSlots;
    
    const startIndex = this.timeSlots.indexOf(startTime);
    return this.timeSlots.slice(startIndex + 1);
  }

  // Navegación de fechas
  goToPreviousDay(): void {
    const currentDate = new Date(this.selectedDate);
    currentDate.setDate(currentDate.getDate() - 1);
    this.selectedDate = currentDate.toISOString().split('T')[0];
    this.filterEvents();
  }

  goToNextDay(): void {
    const currentDate = new Date(this.selectedDate);
    currentDate.setDate(currentDate.getDate() + 1);
    this.selectedDate = currentDate.toISOString().split('T')[0];
    this.filterEvents();
  }

  goToToday(): void {
    this.selectedDate = new Date().toISOString().split('T')[0];
    this.filterEvents();
  }
}
