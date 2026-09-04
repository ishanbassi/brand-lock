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
  selectedFiles: File[] = [];
  /** Files the server refused, shown beside the ones that saved. */
  uploadFailures = signal<{ fileName: string; reason: string }[]>([]);
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
    this.selectedFiles = Array.from(input.files ?? []);
    this.selectedFile = this.selectedFiles[0] ?? null;
  }

  removeSelected(index: number): void {
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
    this.selectedFile = this.selectedFiles[0] ?? null;
  }

  /**
   * Uploads everything selected in one request.
   *
   * <p>Always the bulk endpoint, even for a single file — one code path rather than two, and the
   * per-file result is what lets a batch report "eight saved, one refused" instead of failing
   * whole. Agents scan a folder of correspondence at a time; refusing all nine because one is a
   * .heic would mean working out which and dragging the rest again.
   *
   * <p>One type applies to the batch. Per-file typing is a form filled in twenty times; the
   * document library lets them correct a type afterwards in one click instead.
   */
  upload(): void {
    if (this.selectedFiles.length === 0 || this.uploading()) return;
    this.uploading.set(true);
    this.error.set('');
    this.uploadFailures.set([]);

    this.agentDataService
      .uploadDocuments(this.trademarkId, this.selectedFiles, {
        documentType: this.uploadMeta.documentType,
        notes: this.uploadMeta.notes,
      })
      .subscribe({
        next: result => {
          this.documents.set([...(result.uploaded ?? []), ...this.documents()]);
          this.uploadFailures.set(result.failures ?? []);
          this.uploading.set(false);
          this.selectedFiles = [];
          this.selectedFile = null;
          this.uploadMeta = { documentType: 'OTHER', notes: '', documentDate: '' };
        },
        error: err => {
          this.uploading.set(false);
          this.error.set(err?.error?.message || err?.error?.title || 'Could not upload those files.');
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
