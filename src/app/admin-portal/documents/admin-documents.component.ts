import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { AdminDocumentService } from '../services/admin-document.service';
import {
  DOCUMENT_STATUS_OPTIONS,
  IAdminDocument,
  documentStatusBadgeClass,
  documentStatusLabel,
} from '../shared/admin-document.model';

@Component({
  selector: 'app-admin-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-documents.component.html',
  styleUrl: './admin-documents.component.scss',
})
export class AdminDocumentsComponent implements OnInit {
  private readonly adminDocumentService = inject(AdminDocumentService);
  private readonly toast = inject(ToastrService);

  documents = signal<IAdminDocument[]>([]);
  loading = signal(true);
  error = signal('');
  savingId = signal<number | null>(null);

  // Default the queue to documents awaiting review.
  statusFilter = 'UNDER_REVIEW';

  // Pagination
  page = signal(0);
  readonly pageSize = 20;
  totalItems = signal(0);

  readonly statusOptions = DOCUMENT_STATUS_OPTIONS;
  readonly badgeClass = documentStatusBadgeClass;
  readonly statusLabel = documentStatusLabel;
  private readonly baseApiUrl = environment.BaseApiUrl;

  ngOnInit(): void {
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
    if (this.statusFilter) req['status.equals'] = this.statusFilter;

    this.adminDocumentService.query(req).subscribe({
      next: res => {
        this.documents.set(res.body ?? []);
        this.totalItems.set(Number(res.headers.get('X-Total-Count')) || 0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load documents.');
        this.loading.set(false);
      },
    });
  }

  onFilterChange(): void {
    this.page.set(0);
    this.load();
  }

  setStatus(doc: IAdminDocument, status: string): void {
    this.savingId.set(doc.id);
    this.adminDocumentService.setStatus(doc.id, status).subscribe({
      next: () => {
        this.savingId.set(null);
        this.toast.success(`Document ${this.statusLabel(status).toLowerCase()}`);
        // Reload so the row leaves the current queue if it no longer matches.
        this.load();
      },
      error: () => {
        this.savingId.set(null);
        this.toast.error('Failed to update document');
      },
    });
  }

  fileViewUrl(doc: IAdminDocument): string | null {
    return doc.fileUrl ? `${this.baseApiUrl}files/${doc.fileUrl}` : null;
  }

  applicationLabel(doc: IAdminDocument): string {
    return doc.trademark?.name || (doc.trademark?.applicationNo ? `App. ${doc.trademark.applicationNo}` : '—');
  }

  applicantLabel(doc: IAdminDocument): string {
    const p = doc.userProfile;
    if (p && (p.firstName || p.lastName)) return `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim();
    return doc.trademark?.proprietorName || p?.email || '—';
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
