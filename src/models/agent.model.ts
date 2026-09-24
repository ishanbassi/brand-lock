export interface AgentProfile {
  id?: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  companyName?: string;
  address?: string;
  agentCode?: string;
  barRegNo?: string;
  website?: string;
  profileStatus?: 'PENDING_REVIEW' | 'ACTIVE' | 'SUSPENDED';
  userId?: number;
}

export interface AgentRegistration {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  phoneNumber?: string;
  companyName?: string;
  address?: string;
  barRegNo?: string;
  website?: string;
  captchaResponse: string;
}

export interface AgentPortfolioTrademark {
  id?: number;
  name?: string;
  applicationNo?: number;
  applicationDate?: string;
  filingDate?: string | Date;
  renewalDate?: string | Date;
  proprietorName?: string;
  proprietorAddress?: string;
  attorneyName?: string;
  tmClass?: number;
  trademarkStatus?: string;
  type?: string;
  description?: string;
  source?: string;
  details?: string;
  phoneNumber?: string;
  email?: string;
  state?: string;
  filingMode?: string;

  /**
   * Whether the agent may edit the mark's own fields.
   *
   * False for anything the register backs — either a mark claimed from our data, or one the agent
   * entered that the registry has since answered for. Editing those would be silently overwritten
   * by the next refresh and would present the agent's values as registry fact.
   */
  editable?: boolean;

  /** When the registry last confirmed this row. Null means we still only have the agent's word. */
  registrySyncedDate?: string | null;

  /** Agent-private annotation. Lives on the portfolio link, so it is always editable. */
  agentNotes?: string;
  clientReference?: string;

  /**
   * The firm's own spreadsheet columns for this mark, keyed by AgentCustomField.fieldKey.
   *
   * Sits on the agent-private portfolio link, so unlike the mark's own fields these stay editable
   * after the registry verifies it — the register has no opinion on a firm's receipt numbers.
   * Only present on agent-scoped responses, never on discovery or public profile payloads.
   */
  customFields?: Record<string, string>;

  /**
   * Stored artwork filename; present only when the mark has an image. Treat it as a flag — many
   * are JPEG 2000, which browsers cannot draw, so fetch the image via getTrademarkArtwork.
   */
  imgUrl?: string | null;
}

export interface AgentImportResult {
  totalRows: number;
  importable: number;
  imported: number;
  skipped: number;
  errors: number;
  errorMessages?: string[];
  previewRows: AgentPortfolioTrademark[];
  /** Sheets in the workbook. The parser reads only the first, so >1 means data was ignored. */
  sheetCount?: number;
  /** Field name to zero-based column index, as resolved from the header row. */
  detectedColumns?: Record<string, number>;
  /** Identifies the retained upload, so confirm updates the preview's record. */
  batchId?: number;
  /** Columns no trademark field claimed, offered to keep as the agent's own fields. */
  extraColumns?: ExcelExtraColumn[];
  /**
   * Fields whose header match was thrown out because the column's data disproved it.
   *
   * Shown so a released claim reads as "we found this and rejected it" rather than as a field we
   * simply failed to locate.
   */
  releasedColumns?: Record<string, string>;
}

/** One column of an uploaded workbook that our trademark model has no home for. */
export interface ExcelExtraColumn {
  columnIndex: number;
  /** The heading as it appeared in the sheet. */
  header?: string;
  /** Derived storage key — becomes AgentCustomField.fieldKey on confirm. */
  fieldKey: string;
  /** How many of the file's rows carry a value. Empty-everywhere columns are already dropped. */
  nonEmptyCount: number;
  samples?: string[];
  suggestedType?: string;
  /** True when this agent already has a field under this key, from an earlier upload. */
  alreadyKnown?: boolean;
}

/**
 * One column of the agent's own portfolio schema.
 *
 * Every firm's set is different — two firms both having a `remarks` field does not make them the
 * same field — so these are only ever read and rendered for the signed-in agent.
 */
export interface AgentCustomField {
  id: number;
  /** Immutable. Values are stored under this key, so a rename never touches it. */
  fieldKey: string;
  label: string;
  sourceHeader?: string;
  dataType?: 'TEXT' | 'NUMBER' | 'DATE' | 'BOOL';
  source?: 'IMPORTED' | 'MANUAL';
  displayOrder?: number;
  /** Whether this field is also shown as a column in the portfolio grid. */
  showInList?: boolean;
}

/** One status bucket of the agent's portfolio, as counted by the server. */
export interface AgentStatusCount {
  /** Stable bucket identifier — colours and ordering key off this, never the label. */
  key: 'REGISTERED' | 'OBJECTED_OR_OPPOSED' | 'UNDER_EXAMINATION_OR_ADVERTISED' | 'ABANDONED_WITHDRAWN_REJECTED' | 'OTHER_UNKNOWN';
  label: string;
  count: number;
}

/**
 * The portfolio filter dropdowns, as the server sees them.
 *
 * Sent rather than hard-coded because a fixed list of 45 classes and seven guessed status words was
 * mostly dead options: picking one emptied the table with no explanation. Every option here is
 * backed by at least one mark the agent holds.
 */
export interface AgentPortfolioFilterOptions {
  total: number;
  statuses: AgentStatusCount[];
  classes: { tmClass: number; count: number }[];
}

/** The field the portfolio search box matches against. */
export type PortfolioSearchField = 'NAME' | 'APPLICATION_NO' | 'PROPRIETOR';

/** Portfolio columns the server can sort by — the DTO property names, whitelisted server-side. */
export type PortfolioSortField =
  | 'name'
  | 'applicationNo'
  | 'tmClass'
  | 'proprietorName'
  | 'trademarkStatus'
  | 'applicationDate'
  | 'renewalDate';

/** Server-side narrowing of the portfolio listing. Anything unset is "no filter". */
export interface AgentPortfolioQuery {
  search?: string;
  /** Which field `search` matches. Unset searches name, number and proprietor together. */
  searchBy?: PortfolioSearchField;
  /** A status bucket key, never a raw registry status. */
  status?: string;
  tmClass?: number | null;
  /** Unset keeps the default order: most recently added to the portfolio first. */
  sort?: { field: PortfolioSortField; dir: 'asc' | 'desc' } | null;
}

export interface AgentDashboardStats {
  totalTrademarks: number;
  activeTrademarks: number;
  expiringIn90Days: number;
  watchlistCount: number;
  /** Every bucket, zeroes included, summing to totalTrademarks. */
  statusBreakdown: AgentStatusCount[];
  /** Newest application date first; marks not yet filed are excluded. */
  recentFilings: AgentPortfolioTrademark[];
  expiringSoon: AgentPortfolioTrademark[];
}

export interface WatchConflictHistory {
  id?: number;
  trademarkId?: number;
  trademarkName?: string;
  tmAgentId?: number;
  checkDate?: string;
  conflictingTrademarkId?: number;
  conflictingTrademarkName?: string;
  similarityScore?: number;
  riskLevel?: 'HIGH' | 'MEDIUM' | 'LOW';
  isNewConflict?: boolean;
  /** Where the agent has taken this row in triage. Legacy rows read as OPEN. */
  status?: 'OPEN' | 'OPPOSING' | 'DISMISSED';
  /**
   * Journal issue the conflicting mark was advertised in — the opposition window runs from it.
   * Null when the hit came from the new-filings watch (early awareness, no statutory deadline).
   */
  journalNo?: number;
  conflictingApplicationNo?: number;
  conflictingTmClass?: number;
  conflictingProprietorName?: string;
  /** The conflicting mark's current registry status — an abandoned/refused mark is a weak threat. */
  conflictingStatus?: string;
}

export interface AgentPublicProfile {
  id?: number;
  fullName?: string;
  companyName?: string;
  agentCode?: string;
  website?: string;
  profileStatus?: string;
  portfolioCount?: number;
}

/**
 * One agent name in the discovery directory.
 *
 * Sourced from the aggregate of `trademark.agent_name`, which is free-text registry data — the
 * same firm appears under several spellings, so an agent may need to claim more than one entry.
 */
export interface AgentDirectoryEntry {
  nameNormalized: string;
  displayName: string;
  markCount: number;
  latestFilingDate?: string;
  /** Most common agent address filed under this name. Absent when the registry records none. */
  primaryAddress?: string;
  /** Distinct addresses on file under this name; > 1 means two firms may share the name. */
  addressCount?: number;
}

/** A proprietor spelling found in the trademark register. */
export interface ProprietorDirectoryEntry {
  nameNormalized: string;
  displayName: string;
  markCount: number;
  latestFilingDate?: string;
}

export interface AgentClaimRequest {
  agentName: string;
  trademarkIds?: number[];
  /** Claim every mark under the name instead of listing ids, for large firms. */
  claimAllUnderName?: boolean;
}

export interface AgentClaimResult {
  claimed: number;
  alreadyHeld: number;
  rejected: number;
  autoVerified: number;
  portfolioTotal: number;
}

/** One of the caller's own portfolio uploads, as shown on the portfolio page. */
export interface AgentImportSummary {
  id: number;
  originalFileName?: string;
  status?: string;
  totalRows?: number;
  importable?: number;
  imported?: number;
  createdDate?: string;
  /** Still awaiting an admin or the agent's own confirmation. */
  pending?: boolean;
}


/**
 * A file the agent has attached to one mark.
 *
 * Note there is no path or URL here: documents are stored outside every web-served directory and
 * only leave through the ownership-checked download endpoint, so the client never holds a location.
 */
export interface AgentDocument {
  id: number;
  agentPortfolioItemId?: number;
  documentType?: string;
  originalFileName?: string;
  fileContentType?: string;
  fileSizeBytes?: number;
  notes?: string;
  /** The date on the document itself, not when it was uploaded. */
  documentDate?: string;
  uploadedBy?: string;
  uploadedDate?: string;
}

/** One document in the portfolio-wide library, carrying the mark it belongs to. */
export interface AgentLibraryDocument extends AgentDocument {
  trademarkId?: number;
  trademarkName?: string;
  applicationNo?: number;
  tmClass?: number;
  clientReference?: string;
}

export interface AgentDocumentLibraryPage {
  items: AgentLibraryDocument[];
  totalElements: number;
  totalPages: number;
  page: number;
}

export interface AgentDocumentStorage {
  usedBytes: number;
  quotaBytes: number;
  percentUsed: number;
}

export interface AgentDocumentLibrarySummary {
  countsByType: Record<string, number>;
  clientReferences: string[];
  storage: AgentDocumentStorage;
}

/** Per-file outcome of a bulk upload — partial success is normal, not an error. */
export interface AgentBulkUploadResult {
  uploaded: AgentDocument[];
  failures: { fileName: string; reason: string }[];
  uploadedCount: number;
  failureCount: number;
  bytesStored: number;
}

/** One conflicting mark in an availability search report. */
export interface SearchReportRow {
  trademarkId: number;
  name?: string;
  applicationNo?: number;
  tmClass?: number;
  proprietorName?: string;
  proprietorAddress?: string;
  applicationDate?: string;
  renewalDate?: string;
  details?: string;
  journalNo?: number;
  /** Live registry status. The raw similarity search does not return this. */
  trademarkStatus?: string;
  type?: string;
  score: number;
  riskBand: 'HIGH' | 'MEDIUM' | 'LOW';
  hasArtwork: boolean;
}

export type SearchReportType = 'startswith' | 'contains' | 'phonetic';

export interface SearchReport {
  query: string;
  /** Classes the search was confined to, ascending. Empty means every class was searched. */
  tmClasses: number[];
  generatedOn: string;
  totalResults: number;
  countsByRisk: Record<'HIGH' | 'MEDIUM' | 'LOW', number>;
  rows: SearchReportRow[];
}

/** Letterhead settings applied to every generated document. */
export interface AgentBranding {
  firmDisplayName?: string | null;
  reportAccentColor?: string | null;
  reportFooterText?: string | null;
  hasLogo?: boolean;
}

/** One dated item on the agent's calendar - a renewal, a listed hearing, or one they added. */
export interface Deadline {
  id?: number | null;
  /** Present on computed entries, which have no row until the agent acts on them. */
  derivedKey?: string | null;
  deadlineType: 'RENEWAL' | 'OPPOSITION_WINDOW' | 'HEARING' | 'EXAM_REPLY' | 'COUNTER_STATEMENT' | 'EVIDENCE' | 'OTHER';
  dueDate: string;
  status: 'OPEN' | 'DONE' | 'WAIVED' | 'MISSED';
  source: 'DERIVED' | 'AGENT' | 'REGISTRY';
  title?: string | null;
  notes?: string | null;
  statutoryRef?: string | null;
  trademarkId?: number | null;
  trademarkName?: string | null;
  applicationNo?: number | null;
  tmClass?: number | null;
  /** Negative when overdue. Computed server-side so every client agrees on "today". */
  daysUntilDue: number;
}

/** Document kinds an agent actually files against a mark. */
export const AGENT_DOCUMENT_TYPES: { value: string; label: string }[] = [
  { value: 'EXAMINATION_REPORT', label: 'Examination report' },
  { value: 'REPLY_FILED', label: 'Reply filed' },
  { value: 'HEARING_NOTICE', label: 'Hearing notice' },
  { value: 'OPPOSITION_NOTICE', label: 'Opposition notice' },
  { value: 'COUNTER_STATEMENT', label: 'Counter statement' },
  { value: 'EVIDENCE_AFFIDAVIT', label: 'Evidence / affidavit' },
  { value: 'REGISTRATION_CERTIFICATE', label: 'Registration certificate' },
  { value: 'RENEWAL_RECEIPT', label: 'Renewal receipt' },
  { value: 'POA', label: 'Power of attorney' },
  { value: 'CLIENT_CORRESPONDENCE', label: 'Client correspondence' },
  { value: 'OTHER', label: 'Other' },
];

/** One conflicting mark found in a journal against a mark in the portfolio. */
export interface AgentJournalConflict {
  journalNo: number;
  score: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';

  portfolioTrademarkId: number;
  portfolioTrademarkName?: string;
  portfolioApplicationNo?: number;
  portfolioTmClass?: number;
  /** Goods / services of the agent's mark. */
  portfolioDetails?: string;

  conflictingTrademarkId: number;
  conflictingTrademarkName?: string;
  conflictingApplicationNo?: number;
  conflictingTmClass?: number;
  conflictingProprietorName?: string;
  conflictingApplicationDate?: string;
  conflictingImgUrl?: string;
  /** Goods / services of the advertised mark — what tells a similar name apart from a real clash. */
  conflictingDetails?: string;
  /** Public detail page for the advertised mark. Absent when it has no application number. */
  conflictingDetailUrl?: string;
}

export interface AgentJournalWatchResult {
  journalNo: number;
  /** Candidate pairs actually scored — distinguishes "no conflicts" from "nothing comparable". */
  pairsScored: number;
  conflicts: AgentJournalConflict[];
  /** True when the result cap was hit, so the list is not exhaustive. */
  truncated: boolean;
  durationMs: number;
}


/**
 * A rival firm on the agent's watch list.
 *
 * `markCountAtAdd` is the register's count when the watch was created, not a live figure - it says
 * how big the firm is. `filingsFound` is what has appeared since. Zero on a new watch is the
 * correct answer, not a failure: the watch only ever looks forward.
 */
export interface CompetitorWatch {
  id: number;
  displayName: string;
  nameNormalized: string;
  markCountAtAdd?: number;
  filingsFound: number;
  addedDate?: string;
}

/** One filing detected under a watched firm's name. */
export interface CompetitorFiling {
  id: number;
  competitorWatchId: number;
  agentName: string;
  foundDate?: string;
  seen: boolean;
  trademarkId?: number;
  trademarkName?: string;
  applicationNo?: number;
  tmClass?: number;
  applicationDate?: string;
  proprietorName?: string;
  trademarkStatus?: string;
  /** Public detail page, e.g. /trademarks/acme-class-9-1234567. Built server-side from SlugUtil. */
  detailUrl?: string;
}

export interface CompetitorFeedPage {
  items: CompetitorFiling[];
  totalElements: number;
  totalPages: number;
  page: number;
  unseen: number;
}

/** Names that could not be watched are reported individually, so a partial add still succeeds. */
export interface CompetitorAddResult {
  added: CompetitorWatch[];
  rejected: Record<string, string>;
}
