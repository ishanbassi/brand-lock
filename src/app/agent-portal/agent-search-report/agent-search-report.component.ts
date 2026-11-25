import { CommonModule } from '@angular/common';
import { Component, DestroyRef, HostListener, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SearchReport, SearchReportRow, SearchReportType } from '../../../models/agent.model';
import { ITrademark } from '../../../models/trademark.model';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { ExportFormat, ExportMenuComponent } from '../ui/export-menu.component';
import { fileSlug, saveBlob } from '../ui/save-blob';
import { AgentApplicationNumberSearchComponent, ApplicationNumberLookup } from '../agent-application-number-search/agent-application-number-search.component';
import { AgentPageSkeletonComponent } from '../ui/agent-page-skeleton.component';

type SearchMode = 'name' | 'application-number';
type ResultsView = 'list' | 'grid';

/**
 * Availability search, previewed on screen and downloadable on the firm's letterhead.
 *
 * <p>The preview is the same result the PDF renders, not a summary of it. An agent is putting their
 * name on this and sending it to a client — they will not do that for a document they have not
 * seen first.
 */
@Component({
  selector: 'app-agent-search-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ExportMenuComponent, AgentApplicationNumberSearchComponent, AgentPageSkeletonComponent],
  templateUrl: './agent-search-report.component.html',
  styleUrl: './agent-search-report.component.scss',
})
export class AgentSearchReportComponent implements OnInit {
  private readonly agentData = inject(AgentDataService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private printFrame: HTMLIFrameElement | null = null;
  private readonly selectedRows = new Map<number, SearchReportRow>();
  private firmName = 'Trademarx';
  private companyName = '';
  private accentColor = '#1f4e79';
  private logoUrl: string | null = null;
  private brandingSnapshot = { firmDisplayName: '', reportAccentColor: '' };
  private stagedLogoUrl: string | null = null;
  private selectedLogoFile: File | null = null;
  private removeLogoRequested = false;
  private phoneticPollTimer?: ReturnType<typeof setTimeout>;

  query = '';
  searchType: SearchReportType = 'startswith';
  readonly matchRules: SearchReportType[] = ['startswith', 'contains', 'phonetic'];
  readonly statusBuckets = [
    { value: 'REGISTERED', label: 'Registered' },
    { value: 'OBJECTED_OR_OPPOSED', label: 'Objected / Opposed' },
    { value: 'UNDER_EXAMINATION_OR_ADVERTISED', label: 'Under Examination / Advertised' },
    { value: 'ABANDONED_WITHDRAWN_REJECTED', label: 'Abandoned / Withdrawn / Rejected' },
    { value: 'OTHER_UNKNOWN', label: 'Other / Unknown' },
  ];
  pageSize: 10 | 100 | 1000 = 100;
  currentPage = 0;
  readonly selectedIds = new Set<number>();
  readonly artworkUrls = signal<Record<number, string>>({});
  reportSearchType: SearchReportType = 'phonetic';
  readonly resultsView = signal<ResultsView>('list');
  readonly searchMode = signal<SearchMode>('name');
  /** Exact-number results use the same table, but are not a downloadable name-search report. */
  readonly isApplicationNumberReport = signal(false);

  /**
   * Optional classes to confine the search to. An empty selection searches all 45 classes.
   *
   * <p>A set rather than one class because a single mark is commonly filed in several — a clothing
   * brand in 25 and 35 — and running that as one report per class leaves the agent reconciling
   * three documents by hand.
   */
  readonly selectedClasses = signal<number[]>([]);
  readonly classPickerOpen = signal(false);
  readonly selectedStatusBuckets = signal<string[]>([]);
  readonly statusPickerOpen = signal(false);
  readonly matchRulePickerOpen = signal(false);

  readonly report = signal<SearchReport | null>(null);
  readonly loading = signal(false);
  /**
   * A phonetic run acknowledges its queue before it has scored a match. Keep the
   * result surface in its loading state through that empty acknowledgement, then
   * preserve the partial table between subsequent polling requests.
   */
  readonly awaitingInitialResult = signal(false);
  readonly exporting = signal<ExportFormat | null>(null);
  readonly error = signal('');

  /** Printable report is rendered in an isolated frame so the portal UI never appears on paper. */
  readonly printing = signal(false);
  readonly brandingModalOpen = signal(false);
  readonly brandingSaving = signal(false);
  readonly brandingSaved = signal(false);
  readonly brandingError = signal('');
  readonly brandingLogoPreview = signal<string | null>(null);
  branding = { firmDisplayName: '', reportAccentColor: '' };

  /** All 45 Nice classes. The user must choose at least one before searching. */
  readonly classes = Array.from({ length: 45 }, (_, i) => i + 1);
  readonly niceClasses = [
    'Chemicals', 'Paints & Coatings', 'Cosmetics & Cleaning', 'Fuels & Lubricants', 'Pharmaceuticals',
    'Common Metals', 'Machines & Motors', 'Hand Tools', 'Tech & Software', 'Medical Devices',
    'Lighting & HVAC', 'Vehicles', 'Firearms', 'Jewellery & Watches', 'Musical Instruments',
    'Paper & Print', 'Rubber & Plastics', 'Leather & Bags', 'Building Materials', 'Furniture',
    'Housewares & Glass', 'Ropes & Fibres', 'Yarns & Threads', 'Textiles', 'Clothing & Footwear',
    'Lace & Embroidery', 'Floor Coverings', 'Games & Toys', 'Meat & Dairy', 'Coffee & Bakery',
    'Agricultural', 'Beers & Beverages', 'Wines & Spirits', 'Tobacco & Vapes', 'Advertising & Business',
    'Finance & Real Estate', 'Construction & Repair', 'Telecommunications', 'Transport & Travel',
    'Material Treatment', 'Education & Media', 'SaaS & Science', 'Food & Hospitality', 'Medical & Beauty',
    'Legal & Security',
  ];
  classQuery = '';
  classGroup: 'all' | 'goods' | 'services' = 'all';

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.clearPhoneticPolling();
      this.clearArtwork();
      if (this.logoUrl) URL.revokeObjectURL(this.logoUrl);
      if (this.stagedLogoUrl && this.stagedLogoUrl !== this.logoUrl) URL.revokeObjectURL(this.stagedLogoUrl);
      this.printFrame?.remove();
    });
    this.agentData.getProfile().subscribe({
      next: profile => {
        this.brandingSnapshot = {
          firmDisplayName: profile.firmDisplayName ?? '',
          reportAccentColor: profile.reportAccentColor ?? '',
        };
        this.branding = { ...this.brandingSnapshot };
        this.companyName = profile.companyName ?? '';
        this.applyBranding(profile.companyName);
        if (!this.isBrandingConfigured(profile.hasLogo)) {
          this.openBrandingModal(true, profile.id);
        }
        this.agentData.getLogo().subscribe({
          next: blob => {
            if (this.logoUrl) URL.revokeObjectURL(this.logoUrl);
            this.logoUrl = URL.createObjectURL(blob);
            if (this.brandingModalOpen() && !this.stagedLogoUrl && !this.removeLogoRequested) {
              this.brandingLogoPreview.set(this.logoUrl);
            }
          },
        });
      },
    });
  }

  openBrandingModal(automatic = false, agentId?: number): void {
    const promptKey = this.brandingPromptKey(agentId);
    if (automatic && (typeof localStorage === 'undefined' || localStorage.getItem(promptKey))) {
      return;
    }
    if (automatic) localStorage.setItem(promptKey, '1');

    this.branding = { ...this.brandingSnapshot };
    this.selectedLogoFile = null;
    this.removeLogoRequested = false;
    this.clearStagedLogo();
    this.brandingLogoPreview.set(this.logoUrl);
    this.brandingSaved.set(false);
    this.brandingError.set('');
    this.brandingModalOpen.set(true);
  }

  closeBrandingModal(): void {
    if (this.brandingSaving()) return;
    this.branding = { ...this.brandingSnapshot };
    this.selectedLogoFile = null;
    this.removeLogoRequested = false;
    this.clearStagedLogo();
    this.brandingLogoPreview.set(this.logoUrl);
    this.brandingSaved.set(false);
    this.brandingError.set('');
    this.brandingModalOpen.set(false);
  }

  onBrandingLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.clearStagedLogo();
    this.stagedLogoUrl = URL.createObjectURL(file);
    this.selectedLogoFile = file;
    this.removeLogoRequested = false;
    this.brandingLogoPreview.set(this.stagedLogoUrl);
    this.brandingError.set('');
    (event.target as HTMLInputElement).value = '';
  }

  requestLogoRemoval(): void {
    this.clearStagedLogo();
    this.selectedLogoFile = null;
    this.removeLogoRequested = true;
    this.brandingLogoPreview.set(null);
    this.brandingError.set('');
  }

  saveBranding(): void {
    if (this.brandingSaving()) return;
    this.brandingSaving.set(true);
    this.brandingSaved.set(false);
    this.brandingError.set('');

    void this.persistBranding();
  }

  private async persistBranding(): Promise<void> {
    try {
      const saved = await firstValueFrom(this.agentData.updateBranding(this.branding));
      if (this.selectedLogoFile) {
        await firstValueFrom(this.agentData.uploadLogo(this.selectedLogoFile));
        if (this.logoUrl && this.logoUrl !== this.stagedLogoUrl) URL.revokeObjectURL(this.logoUrl);
        this.logoUrl = this.stagedLogoUrl;
        this.stagedLogoUrl = null;
      } else if (this.removeLogoRequested && this.logoUrl) {
        await firstValueFrom(this.agentData.removeLogo());
        URL.revokeObjectURL(this.logoUrl);
        this.logoUrl = null;
      }

      this.brandingSnapshot = {
        firmDisplayName: saved.firmDisplayName ?? '',
        reportAccentColor: saved.reportAccentColor ?? '',
      };
      this.branding = { ...this.brandingSnapshot };
      this.applyBranding();
      this.selectedLogoFile = null;
      this.removeLogoRequested = false;
      this.brandingLogoPreview.set(this.logoUrl);
      this.brandingSaving.set(false);
      this.brandingSaved.set(true);
      setTimeout(() => this.brandingSaved.set(false), 3000);
    } catch (error: any) {
      this.brandingSaving.set(false);
      this.brandingError.set(error?.error?.message || 'Could not save report branding. Please try again.');
    }
  }

  private applyBranding(companyName?: string): void {
    this.firmName = this.brandingSnapshot.firmDisplayName || companyName || this.companyName || 'Trademarx';
    if (/^#?[\da-f]{6}$/i.test(this.brandingSnapshot.reportAccentColor)) {
      this.accentColor = this.brandingSnapshot.reportAccentColor.startsWith('#')
        ? this.brandingSnapshot.reportAccentColor
        : `#${this.brandingSnapshot.reportAccentColor}`;
    }
  }

  private isBrandingConfigured(hasLogo?: boolean): boolean {
    return Boolean(hasLogo || this.brandingSnapshot.firmDisplayName.trim() || this.brandingSnapshot.reportAccentColor.trim());
  }

  private brandingPromptKey(agentId?: number): string {
    return `trademarx:report-branding-prompted:${agentId ?? 'current-agent'}`;
  }

  private clearStagedLogo(): void {
    if (this.stagedLogoUrl) URL.revokeObjectURL(this.stagedLogoUrl);
    this.stagedLogoUrl = null;
  }

  ngOnInit(): void {
    if (this.route.snapshot.data['searchMode'] === 'application-number') {
      this.searchMode.set('application-number');
    }

    const params = this.route.snapshot.queryParamMap;
    const query = params.get('q')?.trim() ?? '';
    const selectedClasses = (params.get('classes') ?? '').split(',')
      .map(value => Number(value))
      .filter(value => Number.isInteger(value) && value >= 1 && value <= 45);
    const selectedStatuses = (params.get('statuses') ?? '').split(',')
      .filter(value => this.statusBuckets.some(bucket => bucket.value === value));
    const searchType = params.get('searchType');
    const requestedPageSize = Number(params.get('pageSize'));

    if (searchType === 'startswith' || searchType === 'contains' || searchType === 'phonetic') this.searchType = searchType;
    if ([10, 100, 1000].includes(requestedPageSize)) this.pageSize = requestedPageSize as 10 | 100 | 1000;
    this.query = query;
    this.selectedClasses.set([...new Set(selectedClasses)].sort((a, b) => a - b));
    this.selectedStatusBuckets.set([...new Set(selectedStatuses)]);

    if (query) this.run();
  }

  setSearchMode(mode: SearchMode): void {
    if (this.searchMode() === mode) return;
    this.searchMode.set(mode);
    this.closePickers();
    this.clearPhoneticPolling();
    this.clearArtwork();
    this.report.set(null);
    this.awaitingInitialResult.set(false);
    this.error.set('');
    this.selectedIds.clear();
    this.selectedRows.clear();
    this.isApplicationNumberReport.set(false);
  }

  /** Keep filter menus transient, including when focus moves to another part of the page. */
  @HostListener('document:pointerdown', ['$event'])
  dismissPickersOutside(event: PointerEvent): void {
    const target = event.target;
    if (!(target instanceof Element) || !target.closest('.picker')) {
      this.closePickers();
    }
  }

  toggleClassPicker(): void {
    this.statusPickerOpen.set(false);
    this.matchRulePickerOpen.set(false);
    this.classPickerOpen.update(open => !open);
  }

  isClassSelected(c: number): boolean {
    return this.selectedClasses().includes(c);
  }

  toggleClass(c: number): void {
    // Kept sorted so the summary, the request and the report all read in the same order.
    this.selectedClasses.update(current =>
      current.includes(c) ? current.filter(x => x !== c) : [...current, c].sort((a, b) => a - b),
    );
    if (this.selectedClasses().length > 0 && this.error() === 'Select at least one class to search.') {
      this.error.set('');
    }
  }

  clearClasses(): void {
    this.selectedClasses.set([]);
  }

  toggleStatusPicker(): void {
    this.classPickerOpen.set(false);
    this.matchRulePickerOpen.set(false);
    this.statusPickerOpen.update(open => !open);
  }

  toggleMatchRulePicker(): void {
    this.classPickerOpen.set(false);
    this.statusPickerOpen.set(false);
    this.matchRulePickerOpen.update(open => !open);
  }

  closePickers(): void {
    this.classPickerOpen.set(false);
    this.statusPickerOpen.set(false);
    this.matchRulePickerOpen.set(false);
  }

  setSearchType(searchType: SearchReportType): void {
    this.searchType = searchType;
    this.matchRulePickerOpen.set(false);
    this.onSearchTypeChange();
  }

  searchTypeLabel(): string {
    return this.searchType === 'startswith' ? 'Starts with' : this.searchType === 'contains' ? 'Contains' : 'Phonetic';
  }

  searchTypeDescription(searchType: SearchReportType): string {
    return searchType === 'startswith' ? 'Matches marks beginning with your term'
      : searchType === 'contains' ? 'Matches your term anywhere in the mark'
        : 'Finds sound-alike variations';
  }

  clearQuery(): void {
    this.query = '';
  }

  isStatusBucketSelected(bucket: string): boolean {
    return this.selectedStatusBuckets().includes(bucket);
  }

  toggleStatusBucket(bucket: string): void {
    this.selectedStatusBuckets.update(current =>
      current.includes(bucket) ? current.filter(value => value !== bucket) : [...current, bucket],
    );
  }

  clearStatusBuckets(): void {
    this.selectedStatusBuckets.set([]);
  }

  selectAllStatusBuckets(): void {
    this.selectedStatusBuckets.set(this.statusBuckets.map(bucket => bucket.value));
  }

  statusSummary(): string {
    const selected = this.selectedStatusBuckets();
    if (selected.length === 0) return 'Any status';
    if (selected.length === 1) return this.statusBuckets.find(bucket => bucket.value === selected[0])?.label ?? '1 status';
    return `${selected.length} statuses`;
  }

  statusBucketLabel(value: string): string {
    return this.statusBuckets.find(bucket => bucket.value === value)?.label ?? value;
  }

  private statusBucketParam(): string {
    return this.selectedStatusBuckets().join(',');
  }

  /** What the closed picker reads as. Spelled out up to three, counted beyond that. */
  classSummary(): string {
    const selected = this.selectedClasses();
    if (selected.length === 0) return 'Select classes';
    if (selected.length === this.classes.length) return 'All classes (1–45)';
    if (selected.length <= 3) return selected.map(c => `Class ${c}`).join(', ');
    return `Classes ${selected.slice(0, 2).join(', ')} +${selected.length - 2}`;
  }

  className(c: number): string {
    return this.niceClasses[c - 1] ?? '';
  }

  filteredClasses(): number[] {
    const query = this.classQuery.trim().toLowerCase();
    return this.classes.filter(c => {
      const groupMatches = this.classGroup === 'all' || (this.classGroup === 'goods' ? c <= 34 : c >= 35);
      return groupMatches && (!query || String(c).includes(query) || this.className(c).toLowerCase().includes(query));
    });
  }

  classSelectionHint(): string {
    const count = this.selectedClasses().length;
    return count ? `${count} ${count === 1 ? 'class' : 'classes'} selected` : 'Select at least one class to search';
  }

  hasActiveFilters(): boolean {
    return this.searchType !== 'startswith' || this.selectedStatusBuckets().length > 0 || this.selectedClasses().length > 0;
  }

  resetFilters(): void {
    this.searchType = 'startswith';
    this.clearStatusBuckets();
    this.clearClasses();
    this.closePickers();
  }

  private searchClasses(): number[] {
    return this.selectedClasses();
  }

  /** The same phrasing the PDF uses, so screen and document agree. */
  classSentence(classes: number[]): string {
    if (classes.length === 1) return `class ${classes[0]}`;
    return `classes ${classes.slice(0, -1).join(', ')} and ${classes[classes.length - 1]}`;
  }

  run(): void {
    const term = this.query.trim();
    if (!term || this.loading()) {
      return;
    }
    if (this.selectedClasses().length === 0) {
      this.error.set('Select at least one class to search.');
      return;
    }
    if (this.searchType === 'phonetic' && this.selectedClasses().length === this.classes.length) {
      this.error.set('Phonetic search requires specific classes. Select one or more classes instead of all 45.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.closePickers();
    this.currentPage = 0;
    this.selectedIds.clear();
    this.selectedRows.clear();
    this.updateSearchUrl(term);

    this.clearPhoneticPolling();
    this.isApplicationNumberReport.set(false);
    this.report.set(null);
    this.awaitingInitialResult.set(true);
    this.loadPage(term, 0);
  }

  /**
   * The exact-number endpoint already returns complete trademark records. Translate them once into
   * report rows so this mode shares the same table, detail links and printable selection state.
   */
  receiveApplicationNumberResults(lookup: ApplicationNumberLookup): void {
    this.clearPhoneticPolling();
    this.clearArtwork();
    this.currentPage = 0;
    this.selectedIds.clear();
    this.selectedRows.clear();
    this.awaitingInitialResult.set(false);

    const rows = lookup.results.map(trademark => this.applicationResultRow(trademark));
    this.report.set({
      query: lookup.query,
      tmClasses: [],
      generatedOn: new Date().toISOString(),
      totalResults: rows.length,
      countsByRisk: { HIGH: 0, MEDIUM: 0, LOW: 0 },
      rows,
    });
    this.reportSearchType = 'startswith';
    this.isApplicationNumberReport.set(true);
    this.loadArtwork(rows);
  }

  private applicationResultRow(trademark: ITrademark): SearchReportRow {
    return {
      trademarkId: trademark.id,
      name: trademark.name ?? undefined,
      applicationNo: trademark.applicationNo ?? undefined,
      tmClass: trademark.tmClass ?? undefined,
      proprietorName: trademark.proprietorName ?? undefined,
      proprietorAddress: trademark.proprietorAddress ?? undefined,
      applicationDate: trademark.applicationDate?.format('YYYY-MM-DD'),
      renewalDate: trademark.renewalDate?.format('YYYY-MM-DD'),
      details: trademark.details ?? undefined,
      journalNo: trademark.journalNo ?? undefined,
      detailUrl: trademark.url ?? undefined,
      trademarkStatus: trademark.trademarkStatus ?? undefined,
      score: 0,
      riskBand: 'LOW',
      hasArtwork: Boolean(trademark.imgUrl),
    };
  }

  private loadPage(term: string, page: number): void {
    this.loading.set(true);
    this.error.set('');

    const activeRunId = this.searchType === 'phonetic' ? this.report()?.runId : undefined;
    const statusBuckets = this.statusBucketParam();
    if (this.searchType === 'phonetic') {
      const request = activeRunId
        ? this.agentData.getPhoneticSearchRun(activeRunId, page, this.pageSize, statusBuckets)
        : this.agentData.startPhoneticSearchRun(term, this.searchClasses(), page, this.pageSize, statusBuckets);
      request.subscribe({
        next: result => this.receivePhoneticResult(result, page),
        error: () => {
          this.error.set('Could not run that phonetic search. Please try again.');
          this.loading.set(false);
        },
      });
      return;
    }

    this.agentData.previewSearchReport(term, this.searchClasses(), this.searchType, page, this.pageSize, statusBuckets).subscribe({
      next: result => {
        this.clearArtwork();
        this.report.set(result);
        this.reportSearchType = this.searchType;
        this.currentPage = page;
        this.loadArtwork(result.rows);
        this.awaitingInitialResult.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not run that search. Please try again.');
        this.awaitingInitialResult.set(false);
        this.loading.set(false);
      },
    });
  }

  private receivePhoneticResult(result: SearchReport, requestedPage: number): void {
    this.clearArtwork();
    this.report.set(result);
    this.reportSearchType = 'phonetic';
    this.currentPage = requestedPage;
    this.loadArtwork(result.rows);
    if (result.rows.length > 0 || result.status === 'COMPLETED' || result.status === 'FAILED') {
      this.awaitingInitialResult.set(false);
    }
    this.loading.set(false);
    this.clearPhoneticPolling();
    if (this.isPhoneticProcessing()) {
      this.phoneticPollTimer = setTimeout(() => this.loadPage(result.query, this.currentPage), 1500);
    }
  }

  isPhoneticProcessing(): boolean {
    const status = this.report()?.status;
    return this.reportSearchType === 'phonetic' && (status === 'QUEUED' || status === 'RUNNING');
  }

  private clearPhoneticPolling(): void {
    if (this.phoneticPollTimer) clearTimeout(this.phoneticPollTimer);
    this.phoneticPollTimer = undefined;
  }

  onSearchTypeChange(): void {
    if (this.report() && this.query.trim()) this.run();
  }

  applyStatusFilter(): void {
    this.statusPickerOpen.set(false);
    if (!this.report() || !this.query.trim()) return;
    if (this.searchType === 'phonetic' && this.report()?.runId) {
      this.clearPhoneticPolling();
      this.loadPage(this.query.trim(), 0);
      return;
    }
    this.run();
  }

  onPageSizeChange(): void {
    if (this.isApplicationNumberReport()) return;
    if (!this.report() || !this.query.trim()) return;
    this.currentPage = 0;
    this.updateSearchUrl(this.query.trim());
    this.loadPage(this.query.trim(), 0);
  }

  openDetails(row: SearchReportRow): void {
    void this.router.navigate(['/agent-portal/trademarks', row.trademarkId]);
  }

  previousPage(): void {
    if (this.currentPage > 0 && !this.loading()) this.loadPage(this.report()!.query, this.currentPage - 1);
  }

  nextPage(): void {
    if (this.currentPage + 1 < this.totalPages && !this.loading()) this.loadPage(this.report()!.query, this.currentPage + 1);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil((this.report()?.totalResults ?? 0) / this.pageSize));
  }

  get firstResult(): number {
    return this.report()?.totalResults ? this.currentPage * this.pageSize + 1 : 0;
  }

  get lastResult(): number {
    return Math.min((this.currentPage + 1) * this.pageSize, this.report()?.totalResults ?? 0);
  }

  isPageSelected(): boolean {
    const rows = this.report()?.rows ?? [];
    return rows.length > 0 && rows.every(row => this.selectedIds.has(row.trademarkId));
  }

  togglePageSelection(): void {
    const rows = this.report()?.rows ?? [];
    const remove = this.isPageSelected();
    for (const row of rows) {
      if (remove) {
        this.selectedIds.delete(row.trademarkId);
        this.selectedRows.delete(row.trademarkId);
      } else {
        this.selectedIds.add(row.trademarkId);
        this.selectedRows.set(row.trademarkId, row);
      }
    }
  }

  toggleRowSelection(row: SearchReportRow): void {
    if (this.selectedIds.has(row.trademarkId)) {
      this.selectedIds.delete(row.trademarkId);
      this.selectedRows.delete(row.trademarkId);
    } else {
      this.selectedIds.add(row.trademarkId);
      this.selectedRows.set(row.trademarkId, row);
    }
  }

  setResultsView(view: ResultsView): void {
    this.resultsView.set(view);
  }

  markMonogram(row: SearchReportRow): string {
    const name = (row.name || 'TM').replace(/[^A-Za-z0-9 ]/g, '').trim();
    const words = name.split(/\s+/).filter(Boolean);
    return words.length > 1
      ? words.slice(0, 2).map(word => word[0]).join('').toUpperCase()
      : (words[0] || 'TM').slice(0, 2).toUpperCase();
  }

  artworkUrl(row: SearchReportRow): string | null {
    return this.artworkUrls()[row.trademarkId] ?? null;
  }

  private loadArtwork(rows: SearchReportRow[]): void {
    for (const row of rows.filter(item => item.hasArtwork)) {
      this.agentData.getSearchResultArtwork(row.trademarkId).subscribe({
        next: blob => this.artworkUrls.update(urls => ({ ...urls, [row.trademarkId]: URL.createObjectURL(blob) })),
      });
    }
  }

  private clearArtwork(): void {
    Object.values(this.artworkUrls()).forEach(url => URL.revokeObjectURL(url));
    this.artworkUrls.set({});
  }

  /** Excel remains a server export; PDF is printed in the browser from selected visible results. */
  export(format: ExportFormat): void {
    const current = this.report();
    if (!current || this.exporting() || this.printing()) {
      return;
    }
    if (this.selectedIds.size === 0) {
      this.error.set('Select at least one result to download.');
      return;
    }
    if (format === 'pdf') {
      this.printSelected(current);
      return;
    }

    this.exporting.set(format);
    const selected = [...this.selectedIds];
    const request = this.agentData.downloadSearchReportExcel(current.query, current.tmClasses, this.reportSearchType, selected);
    request.subscribe({
      next: blob => {
        saveBlob(blob, `search-report-${fileSlug(current.query, 'mark')}.xlsx`);
        this.exporting.set(null);
      },
      error: () => {
        this.error.set('Could not generate the Excel file.');
        this.exporting.set(null);
      },
    });
  }

  private async printSelected(current: SearchReport): Promise<void> {
    const selectedRows = [...this.selectedRows.values()];

    this.printing.set(true);
    await this.loadSelectedArtwork(selectedRows);
    const frame = this.ensurePrintFrame();
    const doc = frame.contentDocument;
    if (!doc) {
      this.printing.set(false);
      this.error.set('Could not prepare the print view. Please try again.');
      return;
    }

    const accent = this.accentColor;
    const firmName = this.firmName;
    const classes = current.tmClasses.length
      ? `Class${current.tmClasses.length === 1 ? '' : 'es'} ${current.tmClasses.join(', ')}`
      : 'All classes';
    const rows = this.printableResults(selectedRows);
    doc.open();
    doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Search report — ${this.escapeHtml(current.query)}</title>
      <style>
        @page { size: A4 landscape; margin: 14mm 12mm 16mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #202a36; font: 10pt Arial, sans-serif; }
        header { border-bottom: 3px solid ${accent}; padding-bottom: 9px; margin-bottom: 16px; display:flex; justify-content:space-between; align-items:center; }
        .firm { color:${accent}; font-size:16pt; font-weight:700; display:flex; align-items:center; gap:10px; }
        .logo { max-width:100px; max-height:45px; object-fit:contain; }
        .title { margin: 0 0 3px; font-size: 20pt; }
        .meta { color:#596575; font-size:9pt; line-height:1.5; }
        .result { display:grid; grid-template-columns:76px 1fr; gap:10px; padding:10px 0; border-bottom:1px solid #d8dde4; break-inside:avoid; page-break-inside:avoid; }
        .result:last-of-type { border-bottom:0; }
        .artwork { display:flex; align-items:flex-start; justify-content:center; color:#7a8491; padding-top:2px; }
        .artwork img { width:68px; height:54px; object-fit:contain; border:1px solid #d8dde4; }
        .register-fields { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:8px 12px; }
        .field { min-width:0; overflow-wrap:anywhere; }
        .field.wide { grid-column:span 2; }
        .field.full { grid-column:1 / -1; }
        .label { display:block; margin-bottom:2px; color:#667383; font-size:7pt; font-weight:700; letter-spacing:.03em; text-transform:uppercase; }
        .value { display:block; font-size:9pt; line-height:1.35; }
        .field:first-child .value { color:${accent}; font-size:10pt; font-weight:700; }
        .risk { font-weight:700; }
        .risk.high { color:#a12b2b; } .risk.medium { color:#895600; } .risk.low { color:#24643a; }
        footer { margin-top:12px; padding-top:7px; border-top:1px solid #d8dde4; color:#596575; font-size:8pt; }
        @media screen { body { padding:24px; } }
      </style></head><body>
      <header><div><h1 class="title">Trademark Search Report</h1><div class="meta">${this.escapeHtml(current.query)} · ${this.escapeHtml(this.reportSearchType)} search · ${this.escapeHtml(classes)}</div></div>
      <div class="firm">${this.logoUrl ? `<img class="logo" src="${this.escapeAttribute(this.logoUrl)}" alt="">` : ''}${this.escapeHtml(firmName)}</div></header>
      <main>${rows}</main>
      <footer>${selectedRows.length} selected result${selectedRows.length === 1 ? '' : 's'} · Generated ${this.escapeHtml(new Date().toLocaleDateString('en-IN'))}. This search is not an opinion on registrability. Verify status against the Registry before relying on it.</footer>
      </body></html>`);
    doc.close();

    const images = Array.from(doc.images);
    Promise.all(images.map(image => image.complete ? Promise.resolve() : new Promise<void>(resolve => {
      image.addEventListener('load', () => resolve(), { once: true });
      image.addEventListener('error', () => resolve(), { once: true });
    }))).then(() => {
      window.setTimeout(() => {
        this.printing.set(false);
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
      }, 50);
    });
  }

  private printableResults(selectedRows: SearchReportRow[]): string {
    return selectedRows.map(row => {
      const image = this.artworkUrl(row);
      return `<section class="result">
        <div class="artwork">${image ? `<img src="${this.escapeAttribute(image)}" alt="">` : '<span>—</span>'}</div>
        <div class="register-fields">
          ${this.printField('Name', row.name)}
          ${this.printField('Application', row.applicationNo)}
          ${this.printField('Class', row.tmClass)}
          ${this.printField('Proprietor', row.proprietorName, 'wide')}
          ${this.printField('Proprietor address', row.proprietorAddress, 'full')}
          ${this.printField('Status', this.statusLabel(row))}
          ${this.printField('Filed', this.formatDate(row.applicationDate))}
          ${this.printField('Renewal', this.formatDate(row.renewalDate))}
          ${this.printField('Journal no.', row.journalNo)}
          ${this.printField('Details', row.details, 'full')}
          ${this.reportSearchType === 'phonetic'
            ? this.printField('Similarity', `<span class="risk ${row.riskBand.toLowerCase()}">${this.bandLabel(row.riskBand)}</span>`, '', true)
            : ''}
        </div>
      </section>`;
    }).join('');
  }

  private ensurePrintFrame(): HTMLIFrameElement {
    if (!this.printFrame) {
      const frame = document.createElement('iframe');
      frame.setAttribute('aria-hidden', 'true');
      frame.title = 'Printable search report';
      Object.assign(frame.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
      document.body.appendChild(frame);
      this.printFrame = frame;
    }
    return this.printFrame;
  }

  private async loadSelectedArtwork(rows: SearchReportRow[]): Promise<void> {
    const missing = rows.filter(row => row.hasArtwork && !this.artworkUrl(row));
    await Promise.all(missing.map(async row => {
      try {
        const blob = await firstValueFrom(this.agentData.getSearchResultArtwork(row.trademarkId));
        this.artworkUrls.update(urls => ({ ...urls, [row.trademarkId]: URL.createObjectURL(blob) }));
      } catch {
        // The report remains printable if registry artwork is unavailable.
      }
    }));
  }

  private escapeHtml(value: unknown): string {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
  }

  private updateSearchUrl(query: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: query || null,
        classes: this.selectedClasses().length ? this.selectedClasses().join(',') : null,
        searchType: this.searchType,
        statuses: this.statusBucketParam() || null,
        pageSize: this.pageSize === 100 ? null : this.pageSize,
      },
      replaceUrl: true,
    });
  }

  private escapeAttribute(value: string): string {
    return this.escapeHtml(value);
  }

  private printField(label: string, value: unknown, className = '', trustedValue = false): string {
    const rendered = value === null || value === undefined || value === '' ? '—' : String(value);
    return `<div class="field${className ? ` ${className}` : ''}"><span class="label">${this.escapeHtml(label)}</span><span class="value">${trustedValue ? rendered : this.escapeHtml(rendered)}</span></div>`;
  }

  countFor(band: 'HIGH' | 'MEDIUM' | 'LOW'): number {
    return this.report()?.countsByRisk?.[band] ?? 0;
  }

  bandLabel(band: string): string {
    // Spelled out rather than left to colour alone — these reports get printed and photocopied.
    return band === 'HIGH' ? 'Close' : band === 'MEDIUM' ? 'Moderate' : 'Distant';
  }

  similarityLabel(band: string): string {
    return band === 'HIGH' ? 'High' : band === 'MEDIUM' ? 'Medium' : 'Distant';
  }

  statusLabel(row: SearchReportRow): string {
    const status = row.trademarkStatus;
    return !status || status.toUpperCase() === 'UNKNOWN' ? 'Not recorded' : status;
  }

  statusClass(row: SearchReportRow): string {
    const status = row.trademarkStatus?.toUpperCase() ?? '';
    if (status.includes('REGISTERED')) return 'status-registered';
    if (status.includes('OBJECTED') || status.includes('OPPOSED')) return 'status-contested';
    if (status.includes('EXAMINATION') || status.includes('ADVERTISED')) return 'status-pending';
    if (status.includes('ABANDONED') || status.includes('WITHDRAWN') || status.includes('REJECTED')) return 'status-closed';
    return 'status-unknown';
  }

  formatDate(iso?: string): string {
    if (!iso) return '—';
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
