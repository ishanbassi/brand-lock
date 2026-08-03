import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IBacklinkOpportunity, NewBacklinkOpportunity } from '../../../models/backlink-opportunity.model';
import { AdminBacklinkService } from '../services/admin-backlink.service';
import {
  BACKLINK_CATEGORY_OPTIONS,
  BACKLINK_STATUS_OPTIONS,
  backlinkCategoryLabel,
  backlinkStatusBadgeClass,
  backlinkStatusLabel,
} from '../shared/backlink-status.util';

type NewOpportunityForm = {
  siteName: string;
  url: string;
  category: string;
  qualityNote: string;
  submissionMethod: string;
  contactEmail: string;
  followUpDate: string;
  notes: string;
};

function emptyForm(): NewOpportunityForm {
  return {
    siteName: '',
    url: '',
    category: 'DIRECTORY',
    qualityNote: '',
    submissionMethod: '',
    contactEmail: '',
    followUpDate: '',
    notes: '',
  };
}

@Component({
  selector: 'app-admin-backlinks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-backlinks.component.html',
  styleUrl: './admin-backlinks.component.scss',
})
export class AdminBacklinksComponent implements OnInit {
  private readonly adminBacklinkService = inject(AdminBacklinkService);

  opportunities = signal<IBacklinkOpportunity[]>([]);
  dueForFollowUp = signal<IBacklinkOpportunity[]>([]);
  loading = signal(true);
  error = signal('');
  success = signal('');

  // Filters
  statusFilter = '';
  categoryFilter = '';
  dueOnly = false;

  // Pagination
  page = signal(0);
  readonly pageSize = 20;
  totalItems = signal(0);

  readonly statusOptions = BACKLINK_STATUS_OPTIONS;
  readonly categoryOptions = BACKLINK_CATEGORY_OPTIONS;
  readonly badgeClass = backlinkStatusBadgeClass;
  readonly statusLabel = backlinkStatusLabel;
  readonly categoryLabel = backlinkCategoryLabel;

  expandedRowId = signal<number | null>(null);
  editState: Record<number, Partial<IBacklinkOpportunity>> = {};

  showAddForm = signal(false);
  addForm: NewOpportunityForm = emptyForm();
  saving = signal(false);

  ngOnInit(): void {
    this.loadDueForFollowUp();
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
    if (this.categoryFilter) req['category'] = this.categoryFilter;

    this.adminBacklinkService.query(req).subscribe({
      next: res => {
        this.opportunities.set(res.body ?? []);
        this.totalItems.set(Number(res.headers.get('X-Total-Count')) || 0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load backlink opportunities.');
        this.loading.set(false);
      },
    });
  }

  loadDueForFollowUp(): void {
    this.adminBacklinkService.dueForFollowUp().subscribe({
      next: list => this.dueForFollowUp.set(list ?? []),
      error: () => {},
    });
  }

  onFilterChange(): void {
    this.page.set(0);
    this.load();
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.categoryFilter = '';
    this.page.set(0);
    this.load();
  }

  filterToDueOnly(): void {
    this.statusFilter = '';
    this.categoryFilter = '';
    this.dueOnly = true;
    // The "due" list already came scoped from the backend; surface it directly instead of re-querying.
    this.opportunities.set(this.dueForFollowUp());
    this.totalItems.set(this.dueForFollowUp().length);
  }

  exitDueOnly(): void {
    this.dueOnly = false;
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

  toggleRow(opportunity: IBacklinkOpportunity): void {
    if (this.expandedRowId() === opportunity.id) {
      this.expandedRowId.set(null);
      return;
    }
    this.expandedRowId.set(opportunity.id);
    this.editState[opportunity.id] = {
      notes: opportunity.notes ?? '',
      followUpDate: opportunity.followUpDate ?? '',
      dateSubmitted: opportunity.dateSubmitted ?? '',
      dateLive: opportunity.dateLive ?? '',
    };
  }

  isExpanded(id: number): boolean {
    return this.expandedRowId() === id;
  }

  onStatusChange(opportunity: IBacklinkOpportunity, status: string): void {
    const patch: any = { id: opportunity.id, status };
    // Convenience: stamp the relevant date when the status implies it and it isn't set yet.
    if (status === 'SUBMITTED' && !opportunity.dateSubmitted) {
      patch.dateSubmitted = new Date().toISOString().slice(0, 10);
    }
    if (status === 'LIVE' && !opportunity.dateLive) {
      patch.dateLive = new Date().toISOString().slice(0, 10);
    }
    this.saveOpportunity(patch);
  }

  saveExpandedRow(opportunity: IBacklinkOpportunity): void {
    const edits = this.editState[opportunity.id] ?? {};
    this.saveOpportunity({ id: opportunity.id, ...edits });
  }

  private saveOpportunity(patch: Partial<IBacklinkOpportunity> & { id: number }): void {
    this.adminBacklinkService.update(patch).subscribe({
      next: res => {
        const updated = res.body!;
        this.opportunities.update(list => list.map(o => (o.id === updated.id ? updated : o)));
        this.success.set('Saved.');
        setTimeout(() => this.success.set(''), 1500);
        this.loadDueForFollowUp();
      },
      error: () => this.error.set('Failed to save changes.'),
    });
  }

  toggleAddForm(): void {
    this.showAddForm.update(v => !v);
    if (this.showAddForm()) {
      this.addForm = emptyForm();
    }
  }

  submitAddForm(): void {
    if (!this.addForm.siteName.trim() || !this.addForm.url.trim()) {
      this.error.set('Site name and URL are required.');
      return;
    }
    this.saving.set(true);
    const payload: NewBacklinkOpportunity = {
      id: null,
      siteName: this.addForm.siteName.trim(),
      url: this.addForm.url.trim(),
      category: this.addForm.category as any,
      qualityNote: this.addForm.qualityNote.trim() || null,
      submissionMethod: this.addForm.submissionMethod.trim() || null,
      contactEmail: this.addForm.contactEmail.trim() || null,
      followUpDate: this.addForm.followUpDate || null,
      notes: this.addForm.notes.trim() || null,
      status: 'FOUND',
    };
    this.adminBacklinkService.create(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.showAddForm.set(false);
        this.page.set(0);
        this.load();
        this.loadDueForFollowUp();
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Failed to add opportunity.');
      },
    });
  }
}
