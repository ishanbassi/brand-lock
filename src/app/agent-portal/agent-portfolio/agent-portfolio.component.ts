import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentPortfolioTrademark } from '../../../models/agent.model';

@Component({
  selector: 'app-agent-portfolio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './agent-portfolio.component.html',
  styleUrl: './agent-portfolio.component.scss',
})
export class AgentPortfolioComponent implements OnInit {
  trademarks = signal<AgentPortfolioTrademark[]>([]);
  loading = signal(true);
  error = signal('');

  // Pagination
  page = 0;
  pageSize = 20;
  totalCount = 0;
  totalPages = 0;

  // Filters
  searchQuery = '';
  filterStatus = '';
  filterClass = '';
  private searchSubject = new Subject<string>();

  // Delete
  deletingId = signal<number | null>(null);
  confirmDeleteId = signal<number | null>(null);

  // Export
  exportingExcel = signal(false);
  exportingPdf = signal(false);

  readonly STATUS_OPTIONS = [
    'Registered', 'Objected', 'Opposed', 'Abandoned', 'Refused', 'Advertised', 'Filed'
  ];

  readonly CLASS_OPTIONS = Array.from({ length: 45 }, (_, i) => i + 1);

  constructor(private readonly agentDataService: AgentDataService) {}

  ngOnInit(): void {
    this.load();
    this.searchSubject.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
      this.page = 0;
      this.load();
    });
  }

  load(): void {
    this.loading.set(true);
    this.agentDataService.getPortfolio(this.page, this.pageSize).subscribe({
      next: (res) => {
        this.trademarks.set(res.body || []);
        const total = res.headers.get('X-Total-Count');
        this.totalCount = total ? parseInt(total, 10) : (res.body?.length || 0);
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load portfolio.');
        this.loading.set(false);
      },
    });
  }

  get filtered(): AgentPortfolioTrademark[] {
    let result = this.trademarks();
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(tm =>
        tm.name?.toLowerCase().includes(q) ||
        tm.proprietorName?.toLowerCase().includes(q) ||
        String(tm.applicationNo).includes(q)
      );
    }
    if (this.filterStatus) {
      result = result.filter(tm =>
        tm.trademarkStatus?.toLowerCase().includes(this.filterStatus.toLowerCase())
      );
    }
    if (this.filterClass) {
      result = result.filter(tm => String(tm.tmClass) === this.filterClass);
    }
    return result;
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages) return;
    this.page = p;
    this.load();
  }

  startDelete(id: number): void {
    this.confirmDeleteId.set(id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(id: number): void {
    this.deletingId.set(id);
    this.confirmDeleteId.set(null);
    this.agentDataService.deletePortfolioItem(id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.trademarks.update(list => list.filter(t => t.id !== id));
        this.totalCount--;
      },
      error: () => this.deletingId.set(null),
    });
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'unknown';
    const s = status.toLowerCase();
    if (s.includes('register') || s.includes('renew')) return 'active';
    if (s.includes('object') || s.includes('oppos')) return 'warning';
    if (s.includes('abandon') || s.includes('refused')) return 'inactive';
    if (s.includes('advertis') || s.includes('filed')) return 'pending';
    return 'unknown';
  }

  isExpiringSoon(date: string | Date | undefined): boolean {
    if (!date) return false;
    const d = new Date(date);
    const diffDays = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 90;
  }

  getPageRange(): number[] {
    const pages: number[] = [];
    const total = this.totalPages;
    const cur = this.page;
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i);
    }
    pages.push(0);
    if (cur > 2) pages.push(-1);
    for (let p = Math.max(1, cur - 1); p <= Math.min(total - 2, cur + 1); p++) pages.push(p);
    if (cur < total - 3) pages.push(-1);
    pages.push(total - 1);
    return pages;
  }

  trackById(_: number, tm: AgentPortfolioTrademark): any {
    return tm.id;
  }

  exportExcel(): void {
    this.exportingExcel.set(true);
    this.agentDataService.exportPortfolioExcel().subscribe({
      next: (blob) => {
        this.downloadBlob(blob, 'trademark-portfolio.xlsx');
        this.exportingExcel.set(false);
      },
      error: () => this.exportingExcel.set(false),
    });
  }

  exportPdf(): void {
    this.exportingPdf.set(true);
    this.agentDataService.exportPortfolioPdf().subscribe({
      next: (blob) => {
        this.downloadBlob(blob, 'trademark-portfolio.pdf');
        this.exportingPdf.set(false);
      },
      error: () => this.exportingPdf.set(false),
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
