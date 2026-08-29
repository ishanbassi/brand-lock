import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AgentDataService } from '../../shared/services/agent-data.service';
import {
  AGENT_DOCUMENT_TYPES,
  AgentDocument,
  AgentPortfolioTrademark,
} from '../../../models/agent.model';

/**
 * Everything about one mark in the agent's portfolio, and the only place its actions live.
 *
 * The portfolio list previously carried refresh, edit and delete inline. Destructive and
 * registry-touching actions sitting one mis-click apart in a dense table is the wrong place for
 * them — particularly delete, which behaves differently depending on where the mark came from. They
 * belong here, next to the context needed to decide.
 */
@Component({
  selector: 'app-agent-trademark-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './agent-trademark-detail.component.html',
  styleUrl: './agent-trademark-detail.component.scss',
})
export class AgentTrademarkDetailComponent implements OnInit {
  readonly documentTypes = AGENT_DOCUMENT_TYPES;

  trademarkId!: number;
  mark = signal<AgentPortfolioTrademark | null>(null);
  loading = signal(true);
  error = signal('');
  notice = signal('');

  // Actions
  refreshing = signal(false);
  confirmRemove = signal(false);
  removing = signal(false);

  // Notes (held on the portfolio link, so editable whatever the mark's provenance)
  notes = { agentNotes: '', clientReference: '' };
  savingNotes = signal(false);
  notesSaved = signal(false);

  // Documents
  documents = signal<AgentDocument[]>([]);
  documentsLoading = signal(false);
  selectedFile: File | null = null;
  uploadMeta = { documentType: 'OTHER', notes: '', documentDate: '' };
  uploading = signal(false);
  deletingDocId = signal<number | null>(null);

  /** Registry-backed marks are read-only; only agent-entered ones can still be edited. */
  editable = computed(() => this.mark()?.editable === true);

  constructor(
    private readonly agentDataService: AgentDataService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('No trademark specified.');
      this.loading.set(false);
      return;
    }
    this.trademarkId = id;
    this.load();
    this.loadDocuments();
  }

  load(): void {
    this.loading.set(true);
    this.agentDataService.getPortfolioItem(this.trademarkId).subscribe({
      next: tm => {
        this.mark.set(tm);
        this.notes.agentNotes = tm.agentNotes ?? '';
        this.notes.clientReference = tm.clientReference ?? '';
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load this trademark.');
        this.loading.set(false);
      },
    });
  }

  // ── Registry refresh ─────────────────────────────────────────────────────

  refresh(): void {
    if (this.refreshing()) return;
    this.refreshing.set(true);
    this.notice.set('');
    this.agentDataService.refreshFromRegistry(this.trademarkId).subscribe({
      next: res => {
        this.refreshing.set(false);
        switch (res.state) {
          case 'QUEUED':
            this.notice.set('Requested an update from the register. It usually lands within a few minutes.');
            break;
          case 'BUSY':
            this.notice.set('The register queue is busy right now — please try again shortly.');
            break;
          case 'NO_APPLICATION_NO':
            this.notice.set('This mark has no application number, so there is nothing to look up yet.');
            break;
          default:
            this.notice.set('Update requested.');
        }
      },
      error: () => {
        this.refreshing.set(false);
        this.error.set('Could not request an update.');
      },
    });
  }

  // ── Remove from portfolio ────────────────────────────────────────────────

  /**
   * Wording is deliberately "remove from portfolio", not "delete". For a mark that came from the
   * register this only drops the agent's link to it — the record itself is public data and stays.
   */
  removeFromPortfolio(): void {
    this.removing.set(true);
    this.agentDataService.deletePortfolioItem(this.trademarkId).subscribe({
      next: () => {
        this.removing.set(false);
        this.router.navigate(['/agent-portal/portfolio']);
      },
      error: () => {
        this.removing.set(false);
        this.confirmRemove.set(false);
        this.error.set('Could not remove this mark from your portfolio.');
      },
    });
  }

  // ── Notes ────────────────────────────────────────────────────────────────

  saveNotes(): void {
    this.savingNotes.set(true);
    this.notesSaved.set(false);
    this.agentDataService.updatePortfolioLink(this.trademarkId, { ...this.notes }).subscribe({
      next: () => {
        this.savingNotes.set(false);
        this.notesSaved.set(true);
      },
      error: () => {
        this.savingNotes.set(false);
        this.error.set('Could not save your notes.');
      },
    });
  }

  // ── Documents ────────────────────────────────────────────────────────────

  loadDocuments(): void {
    this.documentsLoading.set(true);
    this.agentDataService.listDocuments(this.trademarkId).subscribe({
      next: docs => {
        this.documents.set(docs);
        this.documentsLoading.set(false);
      },
      error: () => this.documentsLoading.set(false),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  upload(): void {
    if (!this.selectedFile || this.uploading()) return;
    this.uploading.set(true);
    this.error.set('');
    this.agentDataService.uploadDocument(this.trademarkId, this.selectedFile, this.uploadMeta).subscribe({
      next: doc => {
        this.documents.set([doc, ...this.documents()]);
        this.uploading.set(false);
        this.selectedFile = null;
        this.uploadMeta = { documentType: 'OTHER', notes: '', documentDate: '' };
      },
      error: err => {
        this.uploading.set(false);
        this.error.set(err?.error?.message || err?.error?.title || 'Could not upload that file.');
      },
    });
  }

  /**
   * Downloads through the API and hands the browser a blob.
   *
   * These files are stored outside every web-served directory, so there is no URL to link to — the
   * bytes only come back through the endpoint that checks the caller owns them.
   */
  download(doc: AgentDocument): void {
    this.agentDataService.downloadDocument(doc.id).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.originalFileName || `document-${doc.id}`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.error.set('Could not download that document.'),
    });
  }

  deleteDocument(doc: AgentDocument): void {
    this.deletingDocId.set(doc.id);
    this.agentDataService.deleteDocument(doc.id).subscribe({
      next: () => {
        this.documents.set(this.documents().filter(d => d.id !== doc.id));
        this.deletingDocId.set(null);
      },
      error: () => {
        this.deletingDocId.set(null);
        this.error.set('Could not delete that document.');
      },
    });
  }

  documentTypeLabel(value: string | undefined): string {
    return this.documentTypes.find(t => t.value === value)?.label ?? 'Other';
  }

  formatSize(bytes: number | undefined): string {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
