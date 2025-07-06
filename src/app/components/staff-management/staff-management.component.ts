import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { StaffService } from '../../services/staff.service';
import { Staff, ServiceType } from '../../interfaces/staff.interface';
import { CalendarService } from '../../services/calendar.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './staff-management.component.html',
  styleUrls: ['./staff-management.component.scss']
})
export class StaffManagementComponent implements OnInit {
  staffMembers$!: Observable<Staff[]>;
  staffForm: FormGroup;
  selectedStaff: Staff | null = null;
  isFormVisible = false;
  isLoading = false;
  searchTerm = '';
  selectedSpecialty = '';
  selectedStatus = '';

  availableSpecialties: ServiceType[] = [
    { id: 'pulido', name: 'Pulido', description: 'Pulido y encerado de vehículos', isActive: true },
    { id: 'limpieza', name: 'Limpieza', description: 'Limpieza interior y exterior', isActive: true },
    { id: 'mantenimiento', name: 'Mantenimiento', description: 'Mantenimiento básico de automóviles', isActive: true },
    { id: 'detailing', name: 'Detailing', description: 'Detailing completo del vehículo', isActive: true },
    { id: 'lavado', name: 'Lavado', description: 'Lavado básico y premium', isActive: true },
    { id: 'encerado', name: 'Encerado', description: 'Encerado y protección de pintura', isActive: true },
    { id: 'aspirado', name: 'Aspirado', description: 'Limpieza de tapicería y alfombras', isActive: true },
    { id: 'motor', name: 'Limpieza de Motor', description: 'Limpieza y desengrase del motor', isActive: true },
    { id: 'mecanica', name: 'Mecánica', description: 'Reparaciones mecánicas básicas', isActive: true },
    { id: 'neumaticos', name: 'Neumáticos', description: 'Cambio y reparación de neumáticos', isActive: true },
    { id: 'pintura', name: 'Pintura', description: 'Retoque y pintura de vehículos', isActive: true },
    { id: 'diagnostico', name: 'Diagnóstico', description: 'Diagnóstico computarizado', isActive: true }
  ];

  statuses = [
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
    { value: 'busy', label: 'Ocupado' },
    { value: 'available', label: 'Disponible' }
  ];

  constructor(
    private fb: FormBuilder,
    private staffService: StaffService,
    private calendarService: CalendarService
  ) {
    this.staffForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      specialty: ['', Validators.required], // Servicio principal
      specialties: this.fb.array([]), // Array de servicios
      status: ['active', Validators.required],
      hourlyRate: [0, [Validators.required, Validators.min(0)]],
      commissionRate: [0, [Validators.min(0), Validators.max(100)]],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadStaffMembers();
  }

  get specialtiesFormArray(): FormArray {
    return this.staffForm.get('specialties') as FormArray;
  }

  loadStaffMembers() {
    this.staffMembers$ = this.staffService.getStaffMembers();
  }

  addSpecialty(specialtyId: string) {
    const specialtiesArray = this.specialtiesFormArray;
    if (!specialtiesArray.value.includes(specialtyId)) {
      specialtiesArray.push(this.fb.control(specialtyId));
    }
  }

  removeSpecialty(index: number) {
    this.specialtiesFormArray.removeAt(index);
  }

  toggleSpecialty(specialtyId: string) {
    const specialtiesArray = this.specialtiesFormArray;
    const currentSpecialties = specialtiesArray.value;
    const index = currentSpecialties.indexOf(specialtyId);
    
    if (index === -1) {
      this.addSpecialty(specialtyId);
      
      // Si no hay servicio principal seleccionado, usar este como principal
      if (!this.staffForm.get('specialty')?.value) {
        this.staffForm.patchValue({ specialty: specialtyId });
      }
    } else {
      // No permitir quitar el servicio principal
      const mainSpecialty = this.staffForm.get('specialty')?.value;
      if (specialtyId === mainSpecialty) {
        return; // No permitir deseleccionar el servicio principal
      }
      this.removeSpecialty(index);
    }
  }

  onMainSpecialtyChange() {
    const mainSpecialty = this.staffForm.get('specialty')?.value;
    if (mainSpecialty && !this.isSpecialtySelected(mainSpecialty)) {
      this.addSpecialty(mainSpecialty);
    }
  }

  isSpecialtySelected(specialtyId: string): boolean {
    return this.specialtiesFormArray.value.includes(specialtyId);
  }

  getSpecialtyName(specialtyId: string): string {
    const specialty = this.availableSpecialties.find(s => s.id === specialtyId);
    return specialty ? specialty.name : specialtyId;
  }

  getSpecialtiesDisplay(specialties: string[]): string {
    if (!specialties || specialties.length === 0) return 'Sin servicios';
    
    const names = specialties.map(id => this.getSpecialtyName(id));
    if (names.length <= 2) {
      return names.join(', ');
    }
    return `${names.slice(0, 2).join(', ')} +${names.length - 2} más`;
  }

  openForm(staff?: Staff) {
    this.selectedStaff = staff || null;
    this.isFormVisible = true;
    
    // Clear existing specialties
    while (this.specialtiesFormArray.length) {
      this.specialtiesFormArray.removeAt(0);
    }
    
    if (staff) {
      this.staffForm.patchValue({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        specialty: staff.specialty,
        status: staff.status,
        hourlyRate: staff.hourlyRate,
        commissionRate: staff.commissionRate,
        notes: staff.notes
      });
      
      // Add existing specialties
      if (staff.specialties) {
        staff.specialties.forEach(specialtyId => {
          this.specialtiesFormArray.push(this.fb.control(specialtyId));
        });
      }
    } else {
      this.staffForm.reset();
      this.staffForm.patchValue({ status: 'active' });
    }
  }

  closeForm() {
    this.isFormVisible = false;
    this.selectedStaff = null;
    this.staffForm.reset();
    
    // Clear specialties array
    while (this.specialtiesFormArray.length) {
      this.specialtiesFormArray.removeAt(0);
    }
  }

  async onSubmit() {
    if (this.staffForm.valid) {
      this.isLoading = true;
      
      try {
        const formValue = this.staffForm.value;
        const specialties = [...formValue.specialties];
        
        // Ensure main specialty is included in specialties array
        if (!specialties.includes(formValue.specialty)) {
          specialties.unshift(formValue.specialty);
        }
        
        const staffData: Partial<Staff> = {
          name: formValue.name,
          email: formValue.email,
          phone: formValue.phone,
          specialty: formValue.specialty,
          specialties: specialties,
          status: formValue.status,
          hourlyRate: formValue.hourlyRate,
          commissionRate: formValue.commissionRate,
          notes: formValue.notes,
          isActive: formValue.status === 'active',
          updatedAt: new Date()
        };

        if (this.selectedStaff?.id) {
          await this.staffService.updateStaff(this.selectedStaff.id, staffData);
        } else {
          staffData.createdAt = new Date();
          await this.staffService.createStaff(staffData as Omit<Staff, 'id'>);
        }

        this.closeForm();
        this.loadStaffMembers();
      } catch (error) {
        console.error('Error al guardar personal:', error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  async deleteStaff(staff: Staff) {
    if (staff.id && confirm(`¿Estás seguro de que deseas eliminar a ${staff.name}?`)) {
      try {
        await this.staffService.deleteStaff(staff.id);
        this.loadStaffMembers();
      } catch (error) {
        console.error('Error al eliminar personal:', error);
      }
    }
  }

  async updateStatus(staff: Staff, newStatus: string) {
    if (staff.id) {
      try {
        await this.staffService.updateStaff(staff.id, { 
          status: newStatus as 'active' | 'inactive' | 'busy' | 'available',
          updatedAt: new Date()
        });
        this.loadStaffMembers();
      } catch (error) {
        console.error('Error al actualizar estado:', error);
      }
    }
  }

  async viewSchedule(staff: Staff) {
    // Implementar vista de agenda del personal
    console.log('Ver agenda de:', staff.name);
  }

  filterStaff(staffMembers: Staff[]): Staff[] {
    return staffMembers.filter(staff => {
      const matchesSearch = !this.searchTerm || 
        staff.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (staff.email && staff.email.toLowerCase().includes(this.searchTerm.toLowerCase()));
      
      const matchesSpecialty = !this.selectedSpecialty || 
        staff.specialty === this.selectedSpecialty ||
        (staff.specialties && staff.specialties.includes(this.selectedSpecialty));
      
      const matchesStatus = !this.selectedStatus || 
        staff.status === this.selectedStatus;
      
      return matchesSearch && matchesSpecialty && matchesStatus;
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return '#28a745';
      case 'busy': return '#dc3545';
      case 'available': return '#17a2b8';
      case 'inactive': return '#6c757d';
      default: return '#6c757d';
    }
  }

  getStatusLabel(status: string): string {
    return this.statuses.find(s => s.value === status)?.label || status;
  }
}
