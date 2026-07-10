import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentImportResult, AgentPortfolioTrademark } from '../../../models/agent.model';

type UploadPhase = 'select' | 'preview' | 'importing' | 'done' | 'error';

@Component({
  selector: 'app-agent-portfolio-upload',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './agent-portfolio-upload.component.html',
  styleUrl: './agent-portfolio-upload.component.scss',
})
export class AgentPortfolioUploadComponent {
  phase = signal<UploadPhase>('select');
  dragOver = signal(false);

  selectedFile = signal<File | null>(null);
  previewResult = signal<AgentImportResult | null>(null);
  importResult = signal<AgentImportResult | null>(null);
  errorMessage = signal('');

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(): void {
    this.dragOver.set(false);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragOver.set(false);
    const file = e.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  onFileSelected(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.handleFile(file);
  }

  handleFile(file: File): void {
    if (!this.isValidExcel(file)) {
      this.errorMessage.set('Please upload a valid Excel file (.xlsx or .xls).');
      this.phase.set('error');
      return;
    }
    this.selectedFile.set(file);
    this.errorMessage.set('');
    this.phase.set('preview');
    this.loadPreview(file);
  }

  isValidExcel(file: File): boolean {
    return (
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    );
  }

  loadPreview(file: File): void {
    this.agentDataService.previewImport(file).subscribe({
      next: (result) => {
        this.previewResult.set(result);
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Failed to parse the file. Check the format and try again.');
        this.phase.set('error');
      },
    });
  }

  confirmImport(): void {
    const file = this.selectedFile();
    if (!file) return;
    this.phase.set('importing');
    this.agentDataService.confirmImport(file).subscribe({
      next: (result) => {
        this.importResult.set(result);
        this.phase.set('done');
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'Import failed. Please try again.');
        this.phase.set('error');
      },
    });
  }

  reset(): void {
    this.phase.set('select');
    this.selectedFile.set(null);
    this.previewResult.set(null);
    this.importResult.set(null);
    this.errorMessage.set('');
  }

  fileSizeLabel(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  get preview(): AgentPortfolioTrademark[] {
    return this.previewResult()?.previewRows ?? [];
  }

  constructor(private readonly agentDataService: AgentDataService) {}
}
