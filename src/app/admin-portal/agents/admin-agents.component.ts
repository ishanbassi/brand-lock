import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminAgentService } from '../services/admin-agent.service';
import {
  AGENT_STATUS_OPTIONS,
  IAdminAgent,
  agentStatusBadgeClass,
  agentStatusLabel,
} from '../shared/admin-agent.model';

@Component({
  selector: 'app-admin-agents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-agents.component.html',
  styleUrl: './admin-agents.component.scss',
})
export class AdminAgentsComponent implements OnInit {
  private readonly adminAgentService = inject(AdminAgentService);
  private readonly toast = inject(ToastrService);

  agents = signal<IAdminAgent[]>([]);
  loading = signal(true);
  error = signal('');
  savingId = signal<number | null>(null);

  // Default the queue to agents awaiting approval.
  statusFilter = 'PENDING_REVIEW';

  // Pagination
  page = signal(0);
  readonly pageSize = 20;
  totalItems = signal(0);

  readonly statusOptions = AGENT_STATUS_OPTIONS;
  readonly badgeClass = agentStatusBadgeClass;
  readonly statusLabel = agentStatusLabel;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const req: any = {
      page: this.page(),
      size: this.pageSize,
      sort: 'createdDate,desc',
    };
    if (this.statusFilter) req['status'] = this.statusFilter;

    this.adminAgentService.query(req).subscribe({
      next: res => {
        this.agents.set(res.body ?? []);
        this.totalItems.set(Number(res.headers.get('X-Total-Count')) || 0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load agents.');
        this.loading.set(false);
      },
    });
  }

  onFilterChange(): void {
    this.page.set(0);
    this.load();
  }

  setStatus(agent: IAdminAgent, status: string): void {
    this.savingId.set(agent.id);
    this.adminAgentService.setStatus(agent.id, status).subscribe({
      next: () => {
        this.savingId.set(null);
        this.toast.success(`Agent ${this.statusLabel(status).toLowerCase()}`);
        this.load();
      },
      error: () => {
        this.savingId.set(null);
        this.toast.error('Failed to update agent');
      },
    });
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
}
