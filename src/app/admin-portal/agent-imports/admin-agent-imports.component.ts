import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminAgentImportService } from '../services/admin-agent-import.service';
import {
  IAdminAgentImport,
  IMPORT_STATUS_OPTIONS,
  describeMapping,
  formatBytes,
  importStatusBadgeClass,
  importStatusLabel,
  parseErrorMessages,
  AgentImportGrid,
  AgentImportRepair,
  MAPPABLE_FIELDS,
  confidenceLabel,
  confidenceNeedsCheck,
} from '../shared/admin-agent-import.model';

/**
 * Review queue for retained agent portfolio uploads.
 *
 * The parser reads only the first sheet and matches headers exactly, so imports fail quietly.
 * This screen surfaces those failures - multi-sheet workbooks, unrecognised headers, zero-row
 * imports - and lets an admin download the original file or replay it through the current parser.
 */
@Component({
  selector: 'app-admin-agent-imports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-agent-imports.component.html',
  styleUrl: './admin-agent-imports.component.scss',
})
export class AdminAgentImportsComponent implements OnInit {
  private readonly service = inject(AdminAgentImportService);
  private readonly toast = inject(ToastrService);

  imports = signal<IAdminAgentImport[]>([]);
  loading = signal(true);
  error = signal('');
  busyId = signal<number | null>(null);
  expandedId = signal<number | null>(null);

  statusFilter = '';
  agentIdFilter: number | null = null;

  page = signal(0);
  pageSize = 20;
  totalItems = signal(0);

  readonly statusOptions = IMPORT_STATUS_OPTIONS;
  readonly badgeClass = importStatusBadgeClass;
  readonly statusLabel = importStatusLabel;
  readonly bytes = formatBytes;
  readonly mapping = describeMapping;
  readonly rowErrors = parseErrorMessages;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    const req: any = { page: this.page(), size: this.pageSize };
    if (this.statusFilter) req.status = this.statusFilter;
    if (this.agentIdFilter != null) req.agentId = this.agentIdFilter;

    this.service.query(req).subscribe({
      next: res => {
        this.imports.set(res.body ?? []);
        this.totalItems.set(Number(res.headers.get('X-Total-Count') ?? 0));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load agent imports.');
        this.loading.set(false);
      },
    });
  }

  onFilterChange(): void {
    this.page.set(0);
    this.load();
  }

  toggleDetail(id: number): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }

  /**
   * The file is only reachable through the authenticated endpoint, so it arrives as a blob and
   * is handed to the browser via a temporary object URL rather than a direct link.
   */
  download(batch: IAdminAgentImport): void {
    this.busyId.set(batch.id);
    this.service.download(batch.id).subscribe({
      next: res => {
        const blob = res.body;
        if (!blob) {
          this.toast.error('Empty file returned');
          this.busyId.set(null);
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = batch.originalFileName || `agent-import-${batch.id}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        this.busyId.set(null);
      },
      error: () => {
        this.toast.error('Download failed — the stored file may be missing');
        this.busyId.set(null);
      },
    });
  }

  // ── Column mapping repair ──────────────────────────────────────────────
  //
  // The parser detects sheet, header row and columns on its own, but agents' spreadsheets have no
  // standard shape and some still land unmapped. This is where an admin corrects one: look at the
  // real cells, point each field at a column, dry-run it, then import.

  readonly mappableFields = MAPPABLE_FIELDS;
  readonly confidenceLabel = confidenceLabel;
  readonly confidenceNeedsCheck = confidenceNeedsCheck;

  mappingBatch: IAdminAgentImport | null = null;
  grid: AgentImportGrid | null = null;
  gridLoading = false;
  mappingSheetIndex = 0;
  mappingHeaderRow = 0;
  /** field name -> column index */
  fieldMapping: Record<string, number | null> = {};
  learnAliases = false;
  dryRun: any = null;
  mappingBusy = false;

  openMapping(batch: IAdminAgentImport): void {
    this.mappingBatch = batch;
    this.dryRun = null;
    this.fieldMapping = {};
    this.learnAliases = false;
    this.mappingSheetIndex = batch.sheetIndex ?? 0;
    this.mappingHeaderRow = batch.headerRowIndex ?? 0;
    // Seed from whatever the parser already worked out, so the admin corrects rather than starts
    // from a blank form — most of the time only one or two columns are actually wrong.
    try {
      const detected = batch.columnMapping ? JSON.parse(batch.columnMapping) : {};
      for (const [field, col] of Object.entries(detected)) {
        this.fieldMapping[field] = col as number;
      }
    } catch {
      /* a malformed stored mapping is not worth failing the screen over */
    }
    this.loadGrid();
  }

  closeMapping(): void {
    this.mappingBatch = null;
    this.grid = null;
    this.dryRun = null;
  }

  loadGrid(): void {
    if (!this.mappingBatch) return;
    this.gridLoading = true;
    this.service.grid(this.mappingBatch.id, this.mappingSheetIndex).subscribe({
      next: g => {
        this.grid = g;
        this.gridLoading = false;
      },
      error: () => {
        this.toast.error('Could not read the file');
        this.gridLoading = false;
      },
    });
  }

  onSheetChange(index: number): void {
    this.mappingSheetIndex = Number(index);
    // A different sheet means different columns; keeping the old mapping would point fields at
    // whatever happens to sit at those indexes.
    this.fieldMapping = {};
    this.dryRun = null;
    this.loadGrid();
  }

  setFieldColumn(field: string, value: string): void {
    const parsed = value === '' ? null : Number(value);
    this.fieldMapping[field] = parsed;
    this.dryRun = null;
  }

  /** Column index currently assigned to a field, as a string for the select. */
  columnFor(field: string): string {
    const v = this.fieldMapping[field];
    return v == null ? '' : String(v);
  }

  /** Header cell text for a column, falling back to a spreadsheet-style letter. */
  columnLabel(index: number): string {
    const header = this.grid?.rows?.[this.mappingHeaderRow]?.[index];
    const letter = this.columnLetter(index);
    return header && header.trim() ? `${letter} — ${header.trim()}` : letter;
  }

  columnLetter(index: number): string {
    let n = index;
    let out = '';
    do {
      out = String.fromCharCode(65 + (n % 26)) + out;
      n = Math.floor(n / 26) - 1;
    } while (n >= 0);
    return out;
  }

  get columnIndexes(): number[] {
    return Array.from({ length: this.grid?.columnCount ?? 0 }, (_, i) => i);
  }

  private buildRepair(): AgentImportRepair {
    const columnOverride: Record<string, number> = {};
    for (const [field, col] of Object.entries(this.fieldMapping)) {
      if (col != null && !Number.isNaN(col)) columnOverride[field] = col;
    }
    return {
      sheetIndex: this.mappingSheetIndex,
      headerRowIndex: this.mappingHeaderRow,
      columnOverride,
      learnAliases: this.learnAliases,
    };
  }

  runDryRun(): void {
    if (!this.mappingBatch) return;
    this.mappingBusy = true;
    this.service.reparse(this.mappingBatch.id, this.buildRepair()).subscribe({
      next: res => {
        this.dryRun = res.body;
        this.mappingBusy = false;
      },
      error: () => {
        this.toast.error('Reparse failed');
        this.mappingBusy = false;
      },
    });
  }

  applyImport(): void {
    if (!this.mappingBatch) return;
    this.mappingBusy = true;
    this.service.importRows(this.mappingBatch.id, this.buildRepair()).subscribe({
      next: res => {
        const imported = res.body?.imported ?? 0;
        this.toast.success(`Imported ${imported} trademark${imported === 1 ? '' : 's'} into the agent's portfolio`);
        this.mappingBusy = false;
        this.closeMapping();
        this.load();
      },
      error: () => {
        this.toast.error('Import failed');
        this.mappingBusy = false;
      },
    });
  }

  reparse(batch: IAdminAgentImport): void {
    this.busyId.set(batch.id);
    this.service.reparse(batch.id).subscribe({
      next: res => {
        const r = res.body;
        this.toast.success(`Reparsed: ${r?.importable ?? 0} importable of ${r?.totalRows ?? 0} rows`);
        this.busyId.set(null);
        this.load();
      },
      error: () => {
        this.toast.error('Reparse failed');
        this.busyId.set(null);
      },
    });
  }

  markReviewed(batch: IAdminAgentImport): void {
    this.busyId.set(batch.id);
    this.service.review(batch.id, 'REVIEWED', batch.adminNotes ?? '').subscribe({
      next: () => {
        this.toast.success('Marked reviewed');
        this.busyId.set(null);
        this.load();
      },
      error: () => {
        this.toast.error('Could not update');
        this.busyId.set(null);
      },
    });
  }

  /** A workbook with more than one sheet lost data: the parser only reads the first. */
  hasIgnoredSheets(batch: IAdminAgentImport): boolean {
    return (batch.sheetCount ?? 0) > 1;
  }

  /** Nothing importable is the clearest signal the parser did not understand the file. */
  parsedNothing(batch: IAdminAgentImport): boolean {
    return (batch.importable ?? 0) === 0;
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
