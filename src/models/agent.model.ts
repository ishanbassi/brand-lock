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

/** Server-side narrowing of the portfolio listing. Anything unset is "no filter". */
export interface AgentPortfolioQuery {
  search?: string;
  /** A status bucket key, never a raw registry status. */
  status?: string;
  tmClass?: number | null;
}

export interface AgentDashboardStats {
  totalTrademarks: number;
  activeTrademarks: number;
  expiringIn90Days: number;
  watchlistCount: number;
  /** Every bucket, zeroes included, summing to totalTrademarks. */
  statusBreakdown: AgentStatusCount[];
  recentAdditions: AgentPortfolioTrademark[];
  expiringSoon: AgentPortfolioTrademark[];
}

export interface TrademarkConflict {
  id?: number;
  name?: string;
  applicationNo?: number;
  proprietorName?: string;
  trademarkStatus?: string;
  tmClass?: number;
  score: number;
  similarityScore?: number;
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
  applicationDate?: string;
  /** Live registry status. The raw similarity search does not return this. */
  trademarkStatus?: string;
  type?: string;
  score: number;
  riskBand: 'HIGH' | 'MEDIUM' | 'LOW';
  hasArtwork: boolean;
}

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

  conflictingTrademarkId: number;
  conflictingTrademarkName?: string;
  conflictingApplicationNo?: number;
  conflictingTmClass?: number;
  conflictingProprietorName?: string;
  conflictingApplicationDate?: string;
  conflictingImgUrl?: string;
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


/** Outcome of adding a mark by application number. */
export interface AgentAddByNumberResult {
  /** ADDED = we already held it. FETCHING/QUEUE_BUSY = requested from the register. */
  state: 'ADDED' | 'FETCHING' | 'QUEUE_BUSY' | 'INVALID';
  trademarkId?: number;
  name?: string;
  message: string;
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
