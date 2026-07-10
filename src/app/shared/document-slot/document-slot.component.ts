import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { IDocuments } from '../../../models/documents.model';
import { DocumentType } from '../../enumerations/document-type.model';
import { TrademarkService } from '../services/trademark.service';

export interface DocumentSlot {
  type: DocumentType;
  label: string;
  hint: string;
  uploading: boolean;
  document: IDocuments | null;
}

/**
 * A single document upload "slot" bound to one DocumentType of a trademark.
 * Handles file validation, upload and removal against the per-trademark
 * document endpoints, and emits when its document changes so parents can react.
 */
@Component({
  selector: 'app-document-slot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-slot.component.html',
  styleUrl: './document-slot.component.scss',
})
export class DocumentSlotComponent {
  /** The trademark this document belongs to. May be null while the parent loads it. */
  @Input({ required: true }) trademarkId: number | null | undefined;
  @Input({ required: true }) slot!: DocumentSlot;

  @Output() uploaded = new EventEmitter<DocumentSlot>();
  @Output() removed = new EventEmitter<DocumentSlot>();

  private readonly trademarkService = inject(TrademarkService);
  private readonly toastService = inject(ToastrService);

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      this.toastService.error('File size must be under 5MB');
      return;
    }
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      this.toastService.error('Only PNG, JPG, and PDF files are accepted');
      return;
    }
    if (!this.trademarkId) {
      this.toastService.warning('Please wait while we load your application.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.substring(result.indexOf(',') + 1);
      this.upload(file, base64);
    };
    reader.readAsDataURL(file);
  }

  private upload(file: File, base64: string) {
    this.slot.uploading = true;
    const payload: Partial<IDocuments> = {
      ...(this.slot.document?.id ? { id: this.slot.document.id } : {}),
      documentType: this.slot.type as keyof typeof DocumentType,
      fileName: file.name,
      fileContentType: file.type,
      file: base64,
      trademark: { id: this.trademarkId! },
    };

    this.trademarkService.uploadOnboardingDocument(this.trademarkId!, payload).pipe(
      finalize(() => this.slot.uploading = false)
    ).subscribe({
      next: (res) => {
        this.slot.document = res.body;
        this.uploaded.emit(this.slot);
      },
      error: () => {
        this.toastService.error(`Could not upload ${this.slot.label}. Please try again.`);
      }
    });
  }

  remove() {
    if (!this.slot.document?.id || !this.trademarkId) return;
    this.slot.uploading = true;
    this.trademarkService.deleteOnboardingDocument(this.trademarkId, this.slot.document.id).pipe(
      finalize(() => this.slot.uploading = false)
    ).subscribe({
      next: () => {
        this.slot.document = null;
        this.removed.emit(this.slot);
      },
      error: () => {
        this.toastService.error('Could not remove the document. Please try again.');
      }
    });
  }
}
