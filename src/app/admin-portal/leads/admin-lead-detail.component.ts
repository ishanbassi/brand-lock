import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ILead } from '../../../models/lead.model';
import { IEmployee } from '../../../models/employee.model';
import { AdminLeadService } from '../services/admin-lead.service';
import { AdminEmployeeService } from '../services/admin-employee.service';
import { LEAD_STATUS_OPTIONS, leadStatusBadgeClass } from '../shared/lead-status.util';

@Component({
  selector: 'app-admin-lead-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-lead-detail.component.html',
  styleUrl: './admin-lead-detail.component.scss',
})
export class AdminLeadDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly adminLeadService = inject(AdminLeadService);
  private readonly adminEmployeeService = inject(AdminEmployeeService);
  private readonly toast = inject(ToastrService);

  lead = signal<ILead | null>(null);
  employees = signal<IEmployee[]>([]);
  loading = signal(true);
  saving = signal(false);
  error = signal('');

  // Editable fields
  statusModel = '';
  assigneeModel = '';
  commentsModel = '';

  readonly statusOptions = LEAD_STATUS_OPTIONS;
  readonly badgeClass = leadStatusBadgeClass;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.adminEmployeeService.query().subscribe({
      next: res => this.employees.set(res.body ?? []),
      error: () => {},
    });

    this.adminLeadService.find(id).subscribe({
      next: res => {
        const lead = res.body;
        this.lead.set(lead);
        this.statusModel = (lead?.status as string) ?? '';
        this.assigneeModel = lead?.assignedTo?.id ? String(lead.assignedTo.id) : '';
        this.commentsModel = lead?.comments ?? '';
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load this lead.');
        this.loading.set(false);
      },
    });
  }

  save(): void {
    const current = this.lead();
    if (!current) return;

    this.saving.set(true);
    const patch: any = {
      id: current.id,
      status: this.statusModel || null,
      comments: this.commentsModel?.trim() || null,
      // Set the relationship by id; clearing it sends null.
      assignedTo: this.assigneeModel ? { id: Number(this.assigneeModel) } : null,
    };

    this.adminLeadService.update(patch).subscribe({
      next: res => {
        this.lead.set(res.body);
        this.saving.set(false);
        this.toast.success('Lead updated');
      },
      error: () => {
        this.saving.set(false);
        this.toast.error('Failed to update lead');
      },
    });
  }

  statusLabel(status: string | null | undefined): string {
    return status ? status.replace(/_/g, ' ') : 'Unknown';
  }
}
