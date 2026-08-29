/**
 * Shape of a retained agent portfolio upload as returned by /api/admin/agent-imports.
 * This is the AgentImportBatch entity directly.
 */
export interface IAdminAgentImport {
  id: number;
  tmAgentId?: number | null;
  originalFileName?: string | null;
  storedPath?: string | null;
  fileContentType?: string | null;
  fileSizeBytes?: number | null;
  sheetCount?: number | null;
  totalRows?: number | null;
  importable?: number | null;
  imported?: number | null;
  skipped?: number | null;
  errors?: number | null;
  /** JSON array of per-row parse errors. */
  errorMessages?: string | null;
  /** JSON object of field name to zero-based column index. */
  columnMapping?: string | null;
  /** Admin-supplied mapping, once an import has been repaired. */
  columnMappingOverride?: string | null;
  sheetIndex?: number | null;
  headerRowIndex?: number | null;
  status?: string | null;
  adminNotes?: string | null;
  reviewedBy?: string | null;
  reviewedDate?: string | null;
  createdDate?: string | null;
}

export const IMPORT_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'PARSED', label: 'Parsed, not confirmed' },
  { value: 'IMPORTED', label: 'Imported' },
  { value: 'PARTIAL', label: 'Partial' },
  { value: 'FAILED', label: 'Failed' },
  // Parsed to zero importable rows — ours to fix, not the agent's. The agent has already been
  // moved on to their portfolio, so nothing happens for them until an admin actions this.
  { value: 'NEEDS_ADMIN_REVIEW', label: 'Needs review' },
  { value: 'REVIEWED', label: 'Reviewed' },
];

export function importStatusBadgeClass(status: string | null | undefined): string {
  switch (status) {
    case 'IMPORTED':
      return 'badge--success';
    case 'FAILED':
    case 'NEEDS_ADMIN_REVIEW':
      return 'badge--danger';
    case 'PARTIAL':
    case 'PARSED':
      return 'badge--warning';
    default:
      return 'badge--muted';
  }
}

export function importStatusLabel(status: string | null | undefined): string {
  if (!status) return 'Unknown';
  const match = IMPORT_STATUS_OPTIONS.find(o => o.value === status);
  return match ? match.label : status.replace(/_/g, ' ');
}

/** Renders the parser's column map as "applicationNo → col B" style text. */
export function describeMapping(columnMapping: string | null | undefined): string[] {
  if (!columnMapping) return [];
  try {
    const parsed = JSON.parse(columnMapping) as Record<string, number>;
    return Object.entries(parsed).map(([field, idx]) => `${field} → col ${columnLetter(idx)}`);
  } catch {
    return [];
  }
}

export function parseErrorMessages(errorMessages: string | null | undefined): string[] {
  if (!errorMessages) return [];
  try {
    const parsed = JSON.parse(errorMessages);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function columnLetter(index: number): string {
  let n = index;
  let out = '';
  do {
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}


/** An admin's correction to how one retained workbook should be read. */
export interface AgentImportRepair {
  sheetIndex?: number | null;
  headerRowIndex?: number | null;
  /** Field name -> zero-based column index. */
  columnOverride: Record<string, number>;
  /** Remember these header strings so future uploads of this format parse on their own. */
  learnAliases?: boolean;
}

/** Raw cell grid returned for the mapping screen. */
export interface AgentImportGrid {
  fileUnreadable: boolean;
  sheetNames: string[];
  sheetIndex: number;
  columnCount: number;
  rows: string[][];
}

export interface ExcelHeaderAlias {
  id: number;
  headerText: string;
  fieldName: string;
  timesApplied?: number;
  createdBy?: string;
}

/** Fields the parser can populate, in the order they read best in the mapping UI. */
export const MAPPABLE_FIELDS: { value: string; label: string }[] = [
  { value: 'name', label: 'Trademark name' },
  { value: 'applicationNo', label: 'Application no.' },
  { value: 'tmClass', label: 'Class' },
  { value: 'trademarkStatus', label: 'Status' },
  { value: 'proprietorName', label: 'Proprietor' },
  { value: 'applicationDate', label: 'Filing date' },
  { value: 'renewalDate', label: 'Renewal date' },
  { value: 'type', label: 'Type' },
];

/**
 * How a column was resolved. Anything below "exact" is a guess and is surfaced to the admin —
 * a fuzzy or inferred mapping passing as a clean read is how a portfolio lands in the wrong fields.
 */
export function confidenceLabel(how: string | null | undefined): string {
  switch (how) {
    case 'override':
      return 'Set by admin';
    case 'alias':
      return 'Learned header';
    case 'exact':
      return 'Exact match';
    case 'token':
      return 'Word match';
    case 'fuzzy':
      return 'Fuzzy — check this';
    case 'inferred':
      return 'Guessed from data — check this';
    default:
      return 'Unmapped';
  }
}

export function confidenceNeedsCheck(how: string | null | undefined): boolean {
  return how === 'fuzzy' || how === 'inferred';
}
