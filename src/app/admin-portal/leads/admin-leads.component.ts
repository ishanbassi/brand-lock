import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ILead, LeadStatus } from '../../../models/lead.model';
import { IEmployee } from '../../../models/employee.model';
import { AdminLeadService } from '../services/admin-lead.service';
import { AdminEmployeeService } from '../services/admin-employee.service';
import { LEAD_STATUS_OPTIONS, leadStatusBadgeClass } from '../shared/lead-status.util';

@Component({
  selector: 'app-admin-leads',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-leads.component.html',
  styleUrl: './admin-leads.component.scss',
})
export class AdminLeadsComponent implements OnInit {
  private readonly adminLeadService = inject(AdminLeadService);
  private readonly adminEmployeeService = inject(AdminEmployeeService);

  leads = signal<ILead[]>([]);
  employees = signal<IEmployee[]>([]);
  loading = signal(true);
  error = signal('');

  // Filters
  search = '';
  statusFilter = '';
  sourceFilter = '';
  assigneeFilter = '';

  // Pagination
  page = signal(0);
  readonly pageSize = 20;
  totalItems = signal(0);

  readonly statusOptions = LEAD_STATUS_OPTIONS;
  readonly badgeClass = leadStatusBadgeClass;

  private readonly searchDebounce = new Subject<void>();

  ngOnInit(): void {
    this.adminEmployeeService.query().subscribe({
      next: res => this.employees.set(res.body ?? []),
      error: () => {},
    });

    this.searchDebounce.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page.set(0);
      this.load();
    });

    this.load();
  }

  load(): void {
    this.loading.set(true);
    const req: any = {
      page: this.page(),
      size: this.pageSize,
      sort: 'createdDate,desc',
      'deleted.equals': false,
    };
    if (this.search.trim()) req['fullName.contains'] = this.search.trim();
    if (this.statusFilter) req['status.equals'] = this.statusFilter;
    if (this.sourceFilter.trim()) req['leadSource.contains'] = this.sourceFilter.trim();
    if (this.assigneeFilter) req['assignedToId.equals'] = this.assigneeFilter;

    this.adminLeadService.query(req).subscribe({
      next: res => {
        this.leads.set(res.body ?? []);
        this.totalItems.set(Number(res.headers.get('X-Total-Count')) || 0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load leads.');
        this.loading.set(false);
      },
    });
  }

  onSearchChange(): void {
    this.searchDebounce.next();
  }

  onFilterChange(): void {
    this.page.set(0);
    this.load();
  }

  clearFilters(): void {
    this.search = '';
    this.statusFilter = '';
    this.sourceFilter = '';
    this.assigneeFilter = '';
    this.page.set(0);
    this.load();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems() / this.pageSize));
  }

  prevPage(): void {
    if (this.page() > 0) {
      this.page.update(p => p - 1);
      this.load();
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages - 1) {
      this.page.update(p => p + 1);
      this.load();
    }
  }

  assigneeName(lead: ILead): string {
    return lead.assignedTo?.fullName || '—';
  }

  statusLabel(status: keyof typeof LeadStatus | null | undefined): string {
    return status ? status.replace(/_/g, ' ') : 'Unknown';
  }
}
