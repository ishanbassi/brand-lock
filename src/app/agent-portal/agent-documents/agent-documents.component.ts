import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AGENT_DOCUMENT_TYPES,
  AgentDocumentLibrarySummary,
  AgentLibraryDocument,
} from '../../../models/agent.model';
import { AgentDataService } from '../../shared/services/agent-data.service';

/**
 * Every document the agent holds, across every mark.
 *
 * <p>The portfolio already lists documents one trademark at a time. That answers "what is attached
 * to this mark", which is the wrong question when an agent is looking for a hearing notice and does
 * not remember which of four hundred applications it was filed against.
 */
@Component({
  selector: 'app-agent-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-documents.component.html',
  styleUrl: './agent-documents.component.scss',
})
export class AgentDocumentsComponent implements OnInit {
  private readonly agentData = inject(AgentDataService);
  private readonly router = inject(Router);

  readonly documentTypes = AGENT_DOCUMENT_TYPES;

  readonly items = signal<AgentLibraryDocument[]>([]);
  readonly summary = signal<AgentDocumentLibrarySummary | null>(null);
  readonly loading = signal(false);
  readonly page = signal(0);
  readonly totalPages = signal(0);
  readonly totalElements = signal(0);

  readonly activeType = signal<string | null>(null);
  readonly activeClientRef = signal<string | null>(null);
  searchTerm = '';

  /** Id of the row whose type dropdown is open, so only one is editable at a time. */
  readonly editingType = signal<number | null>(null);
  readonly downloading = signal<number | null>(null);

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadSummary();
    this.load();
  }

  // ── Loading ──────────────────────────────────────────────────────────────

  load(page = 0): void {
    this.loading.set(true);
    this.agentData
      .getDocumentLibrary({
        type: this.activeType(),
        clientRef: this.activeClientRef(),
        q: this.searchTerm.trim() || null,
        page,
      })
      .subscribe({
        next: result => {
          this.items.set(result.items ?? []);
          this.page.set(result.page ?? page);
          this.totalPages.set(result.totalPages ?? 0);
          this.totalElements.set(result.totalElements ?? 0);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  loadSummary(): void {
    this.agentData.getDocumentLibrarySummary().subscribe({
      next: summary => this.summary.set(summary),
      error: () => undefined,
    });
  }

  // ── Filters ──────────────────────────────────────────────────────────────

  selectType(type: string | null): void {
    this.activeType.set(this.activeType() === type ? null : type);
    this.load();
  }

  selectClientRef(ref: string | null): void {
    this.activeClientRef.set(ref);
    this.load();
  }

  /** Debounced so a typed query is one request rather than one per keystroke. */
  onSearchChange(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => this.load(), 350);
  }

  clearFilters(): void {
    this.activeType.set(null);
    this.activeClientRef.set(null);
    this.searchTerm = '';
    this.load();
  }

  get hasFilters(): boolean {
    return this.activeType() !== null || this.activeClientRef() !== null || this.searchTerm.trim().length > 0;
  }

  countFor(type: string): number {
    return this.summary()?.countsByType?.[type] ?? 0;
  }

  /** Only types the agent actually holds, so the chip row does not list eleven mostly-empty kinds. */
  get typesInUse(): { value: string; label: string }[] {
    const counts = this.summary()?.countsByType;
    if (!counts) return [];
    return this.documentTypes.filter(t => (counts[t.value] ?? 0) > 0);
  }

  labelForType(value?: string): string {
    return this.documentTypes.find(t => t.value === value)?.label ?? 'Other';
  }

  // ── Row actions ──────────────────────────────────────────────────────────

  download(item: AgentLibraryDocument): void {
    this.downloading.set(item.id);
    this.agentData.downloadDocument(item.id).subscribe({
      next: blob => {
        // Streamed through an authorising endpoint, so there is no static URL to link to — the
        // blob has to be turned back into a download here.
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = item.originalFileName ?? 'document';
        anchor.click();
        URL.revokeObjectURL(url);
        this.downloading.set(null);
      },
      error: () => this.downloading.set(null),
    });
  }

  openMark(item: AgentLibraryDocument): void {
    if (item.trademarkId) {
      void this.router.navigate(['/agent-portal/portfolio', item.trademarkId]);
    }
  }

  toggleTypeEditor(item: AgentLibraryDocument, event: MouseEvent): void {
    event.stopPropagation();
    this.editingType.set(this.editingType() === item.id ? null : item.id);
  }

  reclassify(item: AgentLibraryDocument, type: string, event: Event): void {
    event.stopPropagation();
    this.editingType.set(null);
    if (type === item.documentType) {
      return;
    }

    // Updated locally first; the list is not reloaded because a type filter would make the row the
    // agent just corrected disappear from under them.
    this.items.update(list => list.map(d => (d.id === item.id ? { ...d, documentType: type } : d)));

    this.agentData.reclassifyDocument(item.id, type).subscribe({
      next: () => this.loadSummary(),
      error: () => this.load(this.page()),
    });
  }

  remove(item: AgentLibraryDocument, event: MouseEvent): void {
    event.stopPropagation();
    if (!confirm(`Delete "${item.originalFileName}"? This cannot be undone.`)) {
      return;
    }
    this.agentData.deleteDocument(item.id).subscribe({
      next: () => {
        this.items.update(list => list.filter(d => d.id !== item.id));
        this.totalElements.update(n => Math.max(0, n - 1));
        this.loadSummary();
      },
      error: () => undefined,
    });
  }

  // ── Formatting ───────────────────────────────────────────────────────────

  formatSize(bytes?: number): string {
    if (bytes == null) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  formatDate(iso?: string): string {
    if (!iso) return '';
    const date = new Date(iso);
    return Number.isNaN(date.getTime())
      ? ''
      : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
