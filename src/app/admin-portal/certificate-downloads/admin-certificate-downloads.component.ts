import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminCertificateDownloadService } from '../services/admin-certificate-download.service';
import {
  certificateStatusBadgeClass,
  IAdminCertificateDownload,
  readableCertificateStatus,
} from '../shared/admin-certificate-download.model';

@Component({
  selector: 'app-admin-certificate-downloads',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-certificate-downloads.component.html',
  styleUrl: './admin-certificate-downloads.component.scss',
})
export class AdminCertificateDownloadsComponent implements OnInit {
  private readonly certificateDownloadService = inject(AdminCertificateDownloadService);

  requests = signal<IAdminCertificateDownload[]>([]);
  loading = signal(true);
  error = signal('');
  page = signal(0);
  totalItems = signal(0);
  expandedRequestId = signal<number | null>(null);

  readonly pageSize = 20;
  statusFilter = '';
  manualOnly = false;
  readonly statusBadgeClass = certificateStatusBadgeClass;
  readonly readableStatus = readableCertificateStatus;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    const request: Record<string, string | number | boolean> = {
      page: this.page(),
      size: this.pageSize,
      sort: 'requestedAt,desc',
      manualOnly: this.manualOnly,
    };
    if (this.statusFilter.trim()) request['status'] = this.statusFilter.trim().toUpperCase();

    this.certificateDownloadService.query(request).subscribe({
      next: response => {
        this.requests.set(response.body ?? []);
        this.totalItems.set(Number(response.headers.get('X-Total-Count')) || 0);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Certificate delivery requests could not be loaded. Try again.');
        this.loading.set(false);
      },
    });
  }

  applyFilters(): void {
    this.page.set(0);
    this.expandedRequestId.set(null);
    this.load();
  }

  clearFilters(): void {
    this.statusFilter = '';
    this.manualOnly = false;
    this.applyFilters();
  }

  toggleDetails(id: number): void {
    this.expandedRequestId.update(current => current === id ? null : id);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems() / this.pageSize));
  }

  prevPage(): void {
    if (this.page() > 0) {
      this.page.update(value => value - 1);
      this.load();
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages - 1) {
      this.page.update(value => value + 1);
      this.load();
    }
  }
}
