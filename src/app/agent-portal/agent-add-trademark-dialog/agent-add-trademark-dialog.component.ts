import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentCustomField, AgentImportResult, AgentPortfolioTrademark } from '../../../models/agent.model';
import { AgentPortfolioClaimComponent } from '../agent-portfolio-claim/agent-portfolio-claim.component';
import { IconComponent } from '../ui/icon.component';

export type AddTrademarkStartView = 'choose' | 'manual';
type AddTrademarkView = AddTrademarkStartView | 'import' | 'claim' | 'closed';

/**
 * The complete portfolio intake flow. Hosts use this one dialog so every entry point offers the
 * same Excel import, register claim and manual-entry paths.
 */
@Component({
  selector: 'app-agent-add-trademark-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, AgentPortfolioClaimComponent],
  templateUrl: './agent-add-trademark-dialog.component.html',
  styleUrl: './agent-add-trademark-dialog.component.scss',
})
export class AgentAddTrademarkDialogComponent implements OnInit {
  @Input() initialView: AddTrademarkStartView = 'choose';
  @Output() readonly closed = new EventEmitter<void>();
  @Output() readonly completed = new EventEmitter<void>();

  readonly view = signal<AddTrademarkView>('choose');
  readonly draft = signal<Partial<AgentPortfolioTrademark> | null>(null);
  readonly customFields = signal<AgentCustomField[]>([]);
  draftCustomValues: Record<string, string> = {};
  readonly savingDraft = signal(false);
  readonly draftError = signal('');

  readonly uploadDragOver = signal(false);
  readonly uploadFile = signal<File | null>(null);
  readonly uploadPreview = signal<AgentImportResult | null>(null);
  readonly uploadResult = signal<AgentImportResult | null>(null);
  readonly uploadBusy = signal(false);
  readonly uploadProgress = signal(0);
  readonly uploadStage = signal<'idle' | 'uploading' | 'processing'>('idle');
  readonly uploadError = signal('');

  readonly classOptions = Array.from({ length: 45 }, (_, i) => i + 1);
  readonly statusOptions = ['Not yet filed', 'Registered', 'Objected', 'Opposed', 'Abandoned', 'Refused', 'Advertised', 'Filed', 'Pending'];
  readonly typeOptions = [
    { value: 'TRADEMARK', label: 'Word Mark' },
    { value: 'IMAGEMARK', label: 'Image / Device Mark' },
    { value: 'TRADEMARK_WITH_IMAGE', label: 'Word + Image' },
    { value: 'SOUNDMARK', label: 'Sound Mark' },
    { value: 'SLOGAN', label: 'Slogan' },
  ];

  constructor(private readonly agentDataService: AgentDataService) {}

  ngOnInit(): void {
    this.loadCustomFields();
    if (this.initialView === 'manual') {
      this.view.set('closed');
      this.openDraft();
    }
    else this.view.set('choose');
  }

  close(): void {
    if (this.uploadBusy() || this.savingDraft()) return;
    this.closed.emit();
  }

  chooseManualEntry(): void {
    this.view.set('closed');
    this.openDraft();
  }

  chooseImport(): void {
    this.uploadError.set('');
    this.uploadFile.set(null);
    this.uploadPreview.set(null);
    this.uploadResult.set(null);
    this.uploadProgress.set(0);
    this.uploadStage.set('idle');
    this.view.set('import');
  }

  chooseAgentClaim(): void {
    this.view.set('claim');
  }

  onUploadDragOver(event: DragEvent): void {
    event.preventDefault();
    this.uploadDragOver.set(true);
  }

  onUploadDrop(event: DragEvent): void {
    event.preventDefault();
    this.uploadDragOver.set(false);
    const file = event.dataTransfer?.files[0];
    if (file) this.previewUpload(file);
  }

  onUploadFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.previewUpload(file);
  }

  confirmImport(): void {
    const batchId = this.uploadPreview()?.batchId;
    if (batchId == null || this.uploadBusy()) return;
    this.uploadBusy.set(true);
    this.uploadError.set('');
    this.agentDataService.confirmImport(batchId).subscribe({
      next: result => {
        this.uploadResult.set(result);
        this.uploadBusy.set(false);
        this.completed.emit();
      },
      error: err => {
        this.uploadError.set(err?.error?.message || 'Import failed. Please try again.');
        this.uploadBusy.set(false);
      },
    });
  }

  onClaimComplete(): void {
    this.completed.emit();
    this.close();
  }

  cancelDraft(): void {
    if (this.savingDraft()) return;
    this.draft.set(null);
    this.draftError.set('');
    this.close();
  }

  saveDraft(): void {
    const draft = this.draft();
    if (!draft || this.savingDraft()) return;
    if (!draft.name?.trim() && !draft.applicationNo) {
      this.draftError.set('Enter a trademark name or application number before saving.');
      return;
    }
    this.draftError.set('');
    this.savingDraft.set(true);
    const customFields = Object.fromEntries(Object.entries(this.draftCustomValues)
      .filter(([, value]) => String(value ?? '').trim())
      .map(([key, value]) => [key, String(value)]));
    this.agentDataService.addPortfolioItem({ ...draft, name: draft.name?.trim(), customFields }).subscribe({
      next: () => {
        this.savingDraft.set(false);
        this.completed.emit();
        this.closed.emit();
      },
      error: err => {
        this.savingDraft.set(false);
        this.draftError.set(err?.error?.message || err?.error?.detail || 'Could not save this trademark. Try again.');
      },
    });
  }

  private openDraft(): void {
    this.draft.set({ name: '', trademarkStatus: 'Not yet filed' });
    this.draftCustomValues = {};
    this.draftError.set('');
    setTimeout(() => document.getElementById('new-trademark-name')?.focus());
  }

  private loadCustomFields(): void {
    this.agentDataService.getCustomFields().subscribe({
      next: fields => this.customFields.set(fields),
      error: () => this.customFields.set([]),
    });
  }

  private previewUpload(file: File): void {
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      this.uploadError.set('Choose an Excel file in .xlsx or .xls format.');
      return;
    }
    this.uploadError.set('');
    this.uploadFile.set(file);
    this.uploadPreview.set(null);
    this.uploadResult.set(null);
    this.uploadBusy.set(true);
    this.uploadProgress.set(0);
    this.uploadStage.set('uploading');
    this.agentDataService.previewImportWithProgress(file).subscribe({
      next: event => {
        if (event.type === HttpEventType.UploadProgress) {
          const finishedUploading = event.total != null && event.loaded >= event.total;
          this.uploadProgress.set(event.total ? Math.min(90, Math.round((event.loaded / event.total) * 90)) : 0);
          if (finishedUploading) this.uploadStage.set('processing');
        } else if (event.type === HttpEventType.Response) {
          this.uploadProgress.set(100);
          this.uploadStage.set('idle');
          this.uploadPreview.set(event.body ?? null);
          this.uploadBusy.set(false);
        }
      },
      error: err => {
        this.uploadError.set(err?.error?.message || 'We could not read that spreadsheet. Try another Excel file.');
        this.uploadBusy.set(false);
        this.uploadStage.set('idle');
      },
    });
  }
}
