import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { StaffService } from '../../services/staff.service';
import { Staff } from '../../interfaces/staff.interface';
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

  specialties = [
    'Fotografía',
    'Trámites',
    'Notaría',
    'Gestión Documental',
    'Mecánica',
    'Detallado',
    'Ventas',
    'Administración',
    'Otro'
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
      specialty: ['', Validators.required],
      status: ['active', Validators.required],
      hourlyRate: [0, [Validators.required, Validators.min(0)]],
      commissionRate: [0, [Validators.min(0), Validators.max(100)]],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadStaffMembers();
  }

  loadStaffMembers() {
    this.staffMembers$ = this.staffService.getStaffMembers();
  }

  openForm(staff?: Staff) {
    this.selectedStaff = staff || null;
    this.isFormVisible = true;
    
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
    } else {
      this.staffForm.reset();
      this.staffForm.patchValue({ status: 'active' });
    }
  }

  closeForm() {
    this.isFormVisible = false;
    this.selectedStaff = null;
    this.staffForm.reset();
  }

  async onSubmit() {
    if (this.staffForm.valid) {
      this.isLoading = true;
      
      try {
        const staffData: Partial<Staff> = {
          ...this.staffForm.value,
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
        staff.specialty === this.selectedSpecialty;
      
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
