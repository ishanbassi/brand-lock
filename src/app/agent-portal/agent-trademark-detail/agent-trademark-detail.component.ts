import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { IconComponent } from '../ui/icon.component';
import { ExportFormat, ExportMenuComponent } from '../ui/export-menu.component';
import { fileSlug, saveBlob } from '../ui/save-blob';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AgentDataService } from '../../shared/services/agent-data.service';
import {
  AGENT_DOCUMENT_TYPES,
  AgentCustomField,
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
  imports: [IconComponent, ExportMenuComponent, CommonModule, FormsModule, RouterModule],
  templateUrl: './agent-trademark-detail.component.html',
  styleUrl: './agent-trademark-detail.component.scss',
})
export class AgentTrademarkDetailComponent implements OnInit, OnDestroy {
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

  /**
   * The firm's own spreadsheet columns.
   *
   * Definitions come from the agent's schema and values from this mark's link, so a field the
   * agent has but never filled in for this mark renders as an empty box rather than vanishing.
   * These stay editable whatever the mark's provenance — the register has no opinion on a firm's
   * receipt numbers, so nothing here can contradict it.
   */
  customFields = signal<AgentCustomField[]>([]);
  customValues: Record<string, string> = {};
  savingCustom = signal(false);
  customSaved = signal(false);
  addingField = signal(false);
  newFieldLabel = '';

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

  // Export
  exporting = signal<ExportFormat | null>(null);

  /**
   * The mark's artwork as an object URL. Fetched through the API rather than linked from /files/:
   * about a third of stored images are JPEG 2000, which no browser draws, and the server transcodes
   * those. 'failed' keeps the frame with a note rather than silently dropping the image.
   */
  artworkUrl = signal<string | null>(null);
  artworkState = signal<'none' | 'loading' | 'ready' | 'failed'>('none');

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
    this.loadCustomFields();
  }

  private loadCustomFields(): void {
    this.agentDataService.getCustomFields().subscribe({
      // A firm with no imported spreadsheet has none, which is a normal empty state, not an error.
      next: fields => this.customFields.set(fields),
      error: () => this.customFields.set([]),
    });
  }

  load(): void {
    this.loading.set(true);
    this.agentDataService.getPortfolioItem(this.trademarkId).subscribe({
      next: tm => {
        this.mark.set(tm);
        this.notes.agentNotes = tm.agentNotes ?? '';
        this.notes.clientReference = tm.clientReference ?? '';
        this.customValues = { ...(tm.customFields ?? {}) };
        this.loading.set(false);
        this.loadArtwork(tm);
      },
      error: () => {
        this.error.set('Could not load this trademark.');
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.releaseArtwork();
  }

  private loadArtwork(tm: AgentPortfolioTrademark): void {
    this.releaseArtwork();
    if (!tm.imgUrl) {
      this.artworkState.set('none');
      return;
    }
    this.artworkState.set('loading');
    this.agentDataService.getTrademarkArtwork(this.trademarkId).subscribe({
      next: blob => {
        this.artworkUrl.set(URL.createObjectURL(blob));
        this.artworkState.set('ready');
      },
      error: () => this.artworkState.set('failed'),
    });
  }

  private releaseArtwork(): void {
    const url = this.artworkUrl();
    if (url) URL.revokeObjectURL(url);
    this.artworkUrl.set(null);
  }

  // ── Export ───────────────────────────────────────────────────────────────

  export(format: ExportFormat): void {
    if (this.exporting()) return;
    this.exporting.set(format);
    const tm = this.mark();
    const key = tm?.applicationNo ? String(tm.applicationNo) : fileSlug(tm?.name, 'trademark');
    const request = format === 'excel'
      ? this.agentDataService.exportTrademarkExcel(this.trademarkId)
      : this.agentDataService.exportTrademarkPdf(this.trademarkId);
    request.subscribe({
      next: blob => {
        saveBlob(blob, `trademark-${key}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
        this.exporting.set(null);
      },
      error: () => {
        this.error.set(`Could not generate the ${format === 'excel' ? 'Excel file' : 'PDF'}.`);
        this.exporting.set(null);
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

  // ── Custom fields ────────────────────────────────────────────────────────

  /**
   * Saves this mark's values for the firm's own fields.
   *
   * Every known key is sent, including the empty ones: the server merges rather than replaces, and
   * an emptied box has to arrive as a blank so the key is removed. Sending only the filled ones
   * would make clearing a field impossible.
   */
  saveCustomFields(): void {
    this.savingCustom.set(true);
    this.customSaved.set(false);
    const payload: Record<string, string | null> = {};
    for (const field of this.customFields()) {
      payload[field.fieldKey] = this.customValues[field.fieldKey] ?? '';
    }
    this.agentDataService.updatePortfolioLink(this.trademarkId, { customFields: payload }).subscribe({
      next: () => {
        this.savingCustom.set(false);
        this.customSaved.set(true);
      },
      error: () => {
        this.savingCustom.set(false);
        this.error.set('Could not save these details.');
      },
    });
  }

  /** Adds a field to the firm's schema, so it appears on every mark, not just this one. */
  addCustomField(): void {
    const label = this.newFieldLabel.trim();
    if (!label) return;
    this.addingField.set(true);
    this.agentDataService.createCustomField(label).subscribe({
      next: field => {
        this.customFields.set([...this.customFields(), field]);
        this.newFieldLabel = '';
        this.addingField.set(false);
      },
      error: err => {
        this.addingField.set(false);
        this.error.set(err?.error?.detail ?? 'Could not add that field.');
      },
    });
  }

  /**
   * Removes a field from the firm's schema.
   *
   * Worth spelling out in the confirm: this takes the column off every mark, not just this one.
   * The values are kept server-side, so re-creating a field of the same name brings them back.
   */
  removeCustomField(field: AgentCustomField): void {
    if (!confirm(`Remove "${field.label}" from every mark in your portfolio?`)) return;
    this.agentDataService.deleteCustomField(field.id).subscribe({
      next: () => this.customFields.set(this.customFields().filter(f => f.id !== field.id)),
      error: () => this.error.set('Could not remove that field.'),
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
      next: blob => saveBlob(blob, doc.originalFileName || `document-${doc.id}`),
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
