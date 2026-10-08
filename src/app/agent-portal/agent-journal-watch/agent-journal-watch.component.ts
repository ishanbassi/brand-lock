import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentJournalConflict, AgentJournalWatchResult } from '../../../models/agent.model';
import { ExportFormat, ExportMenuComponent } from '../ui/export-menu.component';
import { saveBlob } from '../ui/save-blob';
import { printReport } from '../ui/print-report';
import { IconComponent } from '../ui/icon.component';
import { TrademarkService } from '../../shared/services/trademark.service';
import { ITrademark } from '../../../models/trademark.model';
import { Subject, Subscription, debounceTime } from 'rxjs';

type JournalSearchField = 'name' | 'agentName' | 'proprietorName' | 'applicationNo';
type SuggestionField = Exclude<JournalSearchField, 'applicationNo'>;

/** Descriptions longer than this are clamped until the agent asks for the rest. */
const DESCRIPTION_PREVIEW_CHARS = 160;

/**
 * Trademark Watch — checks the agent's portfolio against a published journal issue.
 *
 * Every issue of the Trade Marks Journal advertises marks that are open to opposition for four
 * months. This screen is how a firm finds anything close to a client's mark inside that window,
 * which is the whole reason the opposition period exists.
 */
@Component({
  selector: 'app-agent-journal-watch',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ExportMenuComponent, IconComponent],
  templateUrl: './agent-journal-watch.component.html',
  styleUrl: './agent-journal-watch.component.scss',
})
export class AgentJournalWatchComponent implements OnInit, OnDestroy {
  journals = signal<number[]>([]);
  loadingJournals = signal(true);
  selectedJournal = signal<number | null>(null);

  readonly searchFields: { value: JournalSearchField; label: string; placeholder: string }[] = [
    { value: 'name', label: 'Trademark', placeholder: 'Search trademark name' },
    { value: 'agentName', label: 'Agent', placeholder: 'Search agent name' },
    { value: 'proprietorName', label: 'Party', placeholder: 'Search party name' },
    { value: 'applicationNo', label: 'Application no.', placeholder: 'Enter application number' },
  ];
  searchField = signal<JournalSearchField>('name');
  searchTerm = '';
  selectedFilters = signal<Record<SuggestionField, string[]>>({ name: [], agentName: [], proprietorName: [] });
  suggestions = signal<string[]>([]);
  suggestionsLoading = signal(false);
  suggestionsOpen = signal(false);
  portfolioOnly = signal(false);
  portfolioLinks = signal<Record<string, number>>({});
  journalMarks = signal<ITrademark[]>([]);
  browsing = signal(false);
  browseError = signal('');
  browsePage = signal(1);
  browseTotal = signal(0);
  readonly browsePageSize = 20;
  private readonly searchChanges = new Subject<void>();
  private searchSubscription?: Subscription;

  /** All 45 Nice classes. None selected means every class — the default. */
  readonly allClasses = Array.from({ length: 45 }, (_, i) => i + 1);
  selectedClasses = signal<number[]>([]);
  classPickerOpen = signal(false);

  running = signal(false);
  exporting = signal<ExportFormat | null>(null);
  printing = signal(false);
  readonly selectedConflicts = new Set<string>();
  private firmName = 'Trademarx';
  private accentColor = '#1f4e79';
  private logoUrl: string | null = null;

  /** Cards whose goods/services text is shown in full. */
  private expanded = signal<Set<string>>(new Set());
  result = signal<AgentJournalWatchResult | null>(null);
  error = signal('');

  /** The classes the shown result was actually run with — so the PDF matches the list on screen. */
  private ranWithClasses: number[] = [];

  /** Risk filter. Empty shows everything. */
  riskFilter = signal<'' | 'HIGH' | 'MEDIUM' | 'LOW'>('');

  constructor(
    private readonly agentDataService: AgentDataService,
    private readonly route: ActivatedRoute,
    private readonly trademarkService: TrademarkService,
  ) {}

  ngOnDestroy(): void {
    if (this.logoUrl) URL.revokeObjectURL(this.logoUrl);
    this.searchSubscription?.unsubscribe();
  }

  ngOnInit(): void {
    this.agentDataService.getProfile().subscribe({
      next: profile => {
        const branding = profile as typeof profile & { firmDisplayName?: string; reportAccentColor?: string };
        this.firmName = branding.firmDisplayName || profile.companyName || 'Trademarx';
        if (branding.reportAccentColor && /^#?[\da-f]{6}$/i.test(branding.reportAccentColor)) {
          this.accentColor = branding.reportAccentColor.startsWith('#') ? branding.reportAccentColor : `#${branding.reportAccentColor}`;
        }
        this.agentDataService.getLogo().subscribe({ next: blob => this.logoUrl = URL.createObjectURL(blob) });
      },
    });
    // The watch alert email links straight to the issue it is about, so arriving with a journalNo
    // means the agent has already chosen — select it and run without a second click.
    const requested = Number(this.route.snapshot.queryParamMap.get('journalNo'));
    const deepLinked = Number.isFinite(requested) && requested > 0 ? requested : null;

    this.searchSubscription = this.searchChanges.pipe(debounceTime(300)).subscribe(() => this.handleSearchInput());

    this.agentDataService.getWatchJournals().subscribe({
      next: list => {
        this.journals.set(list);
        // Newest issue is the one with an opposition window still open, so it is the default.
        if (deepLinked != null && list.includes(deepLinked)) {
          this.selectedJournal.set(deepLinked);
          this.loadingJournals.set(false);
          this.loadJournalEntries();
          this.run();
          return;
        }
        this.loadingJournals.set(false);
      },
      error: () => {
        this.error.set('Could not load journal issues.');
        this.loadingJournals.set(false);
      },
    });
  }

  visibleConflicts = computed<AgentJournalConflict[]>(() => {
    const all = this.result()?.conflicts ?? [];
    const filter = this.riskFilter();
    return filter ? all.filter(c => c.riskLevel === filter) : all;
  });

  searchPlaceholder = computed(() =>
    this.searchFields.find(field => field.value === this.searchField())?.placeholder ?? 'Search this journal',
  );
  searchFieldLabel = computed(() =>
    this.searchFields.find(field => field.value === this.searchField())?.label ?? 'value',
  );

  browsePages = computed(() => Math.max(1, Math.ceil(this.browseTotal() / this.browsePageSize)));

  selectJournal(journalNo: number): void {
    if (this.running()) return;
    this.selectedJournal.set(journalNo);
    this.result.set(null);
    this.riskFilter.set('');
    this.browsePage.set(1);
    this.loadJournalEntries();
  }

  backToJournals(): void {
    this.selectedJournal.set(null);
    this.result.set(null);
    this.journalMarks.set([]);
    this.browseTotal.set(0);
    this.browsePage.set(1);
    this.searchTerm = '';
    this.searchField.set('name');
    this.selectedFilters.set({ name: [], agentName: [], proprietorName: [] });
    this.suggestions.set([]);
    this.suggestionsOpen.set(false);
    this.portfolioOnly.set(false);
    this.browseError.set('');
    this.error.set('');
    this.classPickerOpen.set(false);
  }

  setSearchField(field: JournalSearchField): void {
    this.searchField.set(field);
    this.searchTerm = '';
    this.suggestions.set([]);
    this.suggestionsOpen.set(false);
    this.portfolioOnly.set(false);
    this.browsePage.set(1);
    this.loadJournalEntries();
  }

  onSearchChange(): void {
    this.searchChanges.next();
  }

  findMyPublishedMarks(): void {
    this.portfolioOnly.set(true);
    this.searchTerm = '';
    this.selectedFilters.set({ name: [], agentName: [], proprietorName: [] });
    this.suggestions.set([]);
    this.suggestionsOpen.set(false);
    this.browsePage.set(1);
    this.loadJournalEntries();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.suggestions.set([]);
    this.suggestionsOpen.set(false);
    this.browsePage.set(1);
    if (this.searchField() === 'applicationNo') this.loadJournalEntries();
  }

  selectedFilterEntries = computed(() => {
    const selected = this.selectedFilters();
    return (Object.keys(selected) as SuggestionField[]).flatMap(field =>
      selected[field].map(value => ({ field, value, label: this.searchFields.find(item => item.value === field)?.label ?? field })),
    );
  });

  isSuggestionSelected(value: string): boolean {
    const field = this.searchField();
    return field !== 'applicationNo' && this.selectedFilters()[field].includes(value);
  }

  toggleSuggestion(value: string): void {
    const field = this.searchField();
    if (field === 'applicationNo') return;
    this.portfolioOnly.set(false);
    this.selectedFilters.update(current => {
      const values = current[field];
      return {
        ...current,
        [field]: values.includes(value) ? values.filter(item => item !== value) : [...values, value],
      };
    });
    this.browsePage.set(1);
    this.loadJournalEntries();
  }

  markRoute(mark: ITrademark): (string | number)[] {
    const portfolioId = mark.applicationNo ? this.portfolioLinks()[String(mark.applicationNo)] : undefined;
    return portfolioId
      ? ['/agent-portal/portfolio', portfolioId]
      : ['/agent-portal/watch/journal/marks', mark.id!];
  }

  removeFilter(field: SuggestionField, value: string): void {
    this.portfolioOnly.set(false);
    this.selectedFilters.update(current => ({ ...current, [field]: current[field].filter(item => item !== value) }));
    this.browsePage.set(1);
    this.loadJournalEntries();
  }

  clearAllFilters(): void {
    this.portfolioOnly.set(false);
    this.searchTerm = '';
    this.selectedFilters.set({ name: [], agentName: [], proprietorName: [] });
    this.suggestions.set([]);
    this.suggestionsOpen.set(false);
    this.browsePage.set(1);
    this.loadJournalEntries();
  }

  goToBrowsePage(page: number): void {
    if (page < 1 || page > this.browsePages() || page === this.browsePage()) return;
    this.browsePage.set(page);
    this.loadJournalEntries();
  }

  private loadJournalEntries(): void {
    const journalNo = this.selectedJournal();
    if (journalNo == null) return;
    this.browsing.set(true);
    this.browseError.set('');
    if (this.portfolioOnly()) {
      this.agentDataService.getPortfolioPublications(journalNo, this.browsePage() - 1, this.browsePageSize).subscribe({
        next: response => {
          const marks = response.body ?? [];
          this.journalMarks.set(marks);
          this.resolvePortfolioLinks(marks, () => this.browsing.set(false));
          this.browseTotal.set(Number(response.headers.get('X-Total-Count')) || 0);
        },
        error: () => {
          this.journalMarks.set([]);
          this.browseError.set('Could not find portfolio marks in this journal. Please try again.');
          this.browsing.set(false);
        },
      });
      return;
    }

    const req: Record<string, string | number | string[]> = {
      page: this.browsePage() - 1,
      size: this.browsePageSize,
      sort: 'applicationNo,desc',
    };
    const selected = this.selectedFilters();
    for (const field of Object.keys(selected) as SuggestionField[]) {
      if (selected[field].length) req[`${field}.in`] = selected[field];
    }
    const term = this.searchTerm.trim();
    if (term) {
      if (this.searchField() === 'applicationNo') {
        if (!/^\d+$/.test(term)) {
          this.journalMarks.set([]);
          this.browseTotal.set(0);
          this.browseError.set('Application number must contain digits only.');
          this.browsing.set(false);
          return;
        }
        req['applicationNo.equals'] = term;
      } else {
        // Text entry for name fields drives suggestions; only checked values filter the journal.
      }
    }
    this.trademarkService.queryByJournal(journalNo, req).subscribe({
      next: response => {
        const marks = response.body ?? [];
        this.journalMarks.set(marks);
        this.resolvePortfolioLinks(marks, () => this.browsing.set(false));
        this.browseTotal.set(Number(response.headers.get('X-Total-Count')) || 0);
      },
      error: () => {
        this.journalMarks.set([]);
        this.browseError.set('Could not load this journal. Please try again.');
        this.browsing.set(false);
      },
    });
  }

  private resolvePortfolioLinks(marks: ITrademark[], settled: () => void): void {
    const applicationNos = [...new Set(marks.map(mark => mark.applicationNo).filter((value): value is number => value != null))];
    if (!applicationNos.length) {
      this.portfolioLinks.set({});
      settled();
      return;
    }
    this.agentDataService.getPortfolioLinks(applicationNos).subscribe({
      next: links => {
        this.portfolioLinks.set(links);
        settled();
      },
      error: () => {
        this.portfolioLinks.set({});
        settled();
      },
    });
  }

  private handleSearchInput(): void {
    const term = this.searchTerm.trim();
    if (this.searchField() === 'applicationNo') {
      this.portfolioOnly.set(false);
      this.browsePage.set(1);
      this.loadJournalEntries();
      return;
    }
    if (term.length < 2) {
      this.suggestions.set([]);
      this.suggestionsOpen.set(false);
      return;
    }
    this.loadSuggestions(term, this.searchField() as SuggestionField);
  }

  private loadSuggestions(term: string, field: SuggestionField): void {
    const journalNo = this.selectedJournal();
    if (journalNo == null) return;
    this.suggestionsLoading.set(true);
    this.suggestionsOpen.set(true);
    this.trademarkService.queryByJournal(journalNo, {
      page: 0,
      size: 30,
      sort: `${field},asc`,
      [`${field}.contains`]: term,
    }).subscribe({
      next: response => {
        const values = (response.body ?? [])
          .map(mark => String(mark[field] ?? '').trim())
          .filter(Boolean);
        this.suggestions.set([...new Set(values)].slice(0, 12));
        this.suggestionsLoading.set(false);
      },
      error: () => {
        this.suggestions.set([]);
        this.suggestionsLoading.set(false);
      },
    });
  }

  counts = computed(() => {
    const all = this.result()?.conflicts ?? [];
    return {
      total: all.length,
      high: all.filter(c => c.riskLevel === 'HIGH').length,
      medium: all.filter(c => c.riskLevel === 'MEDIUM').length,
      low: all.filter(c => c.riskLevel === 'LOW').length,
    };
  });

  classSummary = computed(() => {
    const n = this.selectedClasses().length;
    if (n === 0) return 'All classes';
    if (n === 1) return `Class ${this.selectedClasses()[0]}`;
    return `${n} classes`;
  });

  toggleClass(n: number): void {
    this.selectedClasses.update(list =>
      list.includes(n) ? list.filter(c => c !== n) : [...list, n].sort((a, b) => a - b),
    );
  }

  clearClasses(): void {
    this.selectedClasses.set([]);
  }

  run(): void {
    const journal = this.selectedJournal();
    if (journal == null || this.running()) return;
    this.running.set(true);
    this.classPickerOpen.set(false);
    this.error.set('');
    this.result.set(null);
    this.selectedConflicts.clear();
    const classes = [...this.selectedClasses()];
    this.agentDataService.runJournalWatch(journal, classes).subscribe({
      next: res => {
        this.result.set(res);
        this.ranWithClasses = classes;
        this.running.set(false);
      },
      error: () => {
        this.error.set('The check could not be completed. Please try again.');
        this.running.set(false);
      },
    });
  }

  /** Downloads the run on screen — same issue, same classes — as Excel or PDF. */
  export(format: ExportFormat): void {
    const journal = this.result()?.journalNo;
    if (journal == null || this.exporting() || this.printing()) return;
    if (format === 'pdf') {
      const selected = (this.result()?.conflicts ?? []).filter(conflict => this.selectedConflicts.has(this.cardKey(conflict)));
      if (!selected.length) {
        this.error.set('Select at least one conflict to print.');
        return;
      }
      this.printing.set(true);
      printReport(this.printHtml(journal, selected)).catch(() => this.error.set('Could not prepare the print view. Please try again.'))
        .finally(() => this.printing.set(false));
      return;
    }

    this.exporting.set(format);
    const request = this.agentDataService.downloadWatchReportExcel(journal, this.ranWithClasses);
    request.subscribe({
      next: blob => {
        saveBlob(blob, `watch-report-journal-${journal}.xlsx`);
        this.exporting.set(null);
      },
      error: () => {
        this.error.set('Could not generate the Excel file.');
        this.exporting.set(null);
      },
    });
  }

  isConflictSelected(conflict: AgentJournalConflict): boolean {
    return this.selectedConflicts.has(this.cardKey(conflict));
  }

  toggleConflictSelection(conflict: AgentJournalConflict): void {
    const key = this.cardKey(conflict);
    this.selectedConflicts.has(key) ? this.selectedConflicts.delete(key) : this.selectedConflicts.add(key);
  }

  private printHtml(journal: number, conflicts: AgentJournalConflict[]): string {
    const esc = (value: unknown) => String(value ?? '—').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
    const cards = conflicts.map(c => `<article class="conflict risk-${c.riskLevel.toLowerCase()}">
      <div class="score"><strong>${Math.round(c.score * 100)}%</strong><span>${esc(c.riskLevel)} risk</span></div>
      <section><small>Your mark</small><h2>${esc(c.portfolioTrademarkName)}</h2><p>Application ${esc(c.portfolioApplicationNo)} · Class ${esc(c.portfolioTmClass)}</p><h3>Goods / services</h3><p>${esc(c.portfolioDetails || 'No description on record.')}</p></section>
      <section><small>Advertised in Journal ${journal}</small><h2>${esc(c.conflictingTrademarkName)}</h2><p>Application ${esc(c.conflictingApplicationNo)} · Class ${esc(c.conflictingTmClass)} · ${esc(c.conflictingProprietorName)}</p><h3>Goods / services</h3><p>${esc(c.conflictingDetails || 'No description on record.')}</p></section>
      ${c.conflictingImgUrl ? `<img class="mark-image" src="${esc(c.conflictingImgUrl)}" alt="">` : ''}</article>`).join('');
    return `<!doctype html><html><head><meta charset="utf-8"><title>Journal ${journal} watch report</title><style>
      @page{size:A4 portrait;margin:14mm 12mm}*{box-sizing:border-box}body{font:10pt Arial,sans-serif;color:#202a36;margin:0}
      header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid ${this.accentColor};padding-bottom:10px;margin-bottom:18px}
      h1{font-size:20pt;margin:0 0 4px}.firm{color:${this.accentColor};font-size:15pt;font-weight:bold;display:flex;align-items:center;gap:10px}.logo{max-width:100px;max-height:44px;object-fit:contain}
      .conflict{display:grid;grid-template-columns:55px 1fr 1fr;gap:12px;border:1px solid #d8dde4;border-left:4px solid #87909d;padding:12px;margin-bottom:12px;break-inside:avoid;page-break-inside:avoid}
      .risk-high{border-left-color:#a12b2b}.risk-medium{border-left-color:#895600}.score{display:flex;flex-direction:column;align-items:center;justify-content:center}.score strong{font-size:14pt}.score span,small{font-size:8pt;color:#596575}
      h2{font-size:12pt;margin:4px 0}h3{font-size:8pt;text-transform:uppercase;margin:10px 0 3px;color:#596575}p{margin:3px 0;line-height:1.45;overflow-wrap:anywhere}.mark-image{grid-column:2 / 4;max-width:90px;max-height:60px;object-fit:contain}
      footer{margin-top:12px;border-top:1px solid #d8dde4;padding-top:7px;color:#596575;font-size:8pt}
      </style></head><body><header><div><h1>Trademark Watch Report</h1><div>Journal ${journal} · ${conflicts.length} selected conflict${conflicts.length===1?'':'s'}${this.ranWithClasses.length?` · Classes ${this.ranWithClasses.join(', ')}`:' · All classes'}</div></div><div class="firm">${this.logoUrl?`<img class="logo" src="${esc(this.logoUrl)}" alt="">`:''}${esc(this.firmName)}</div></header>
      ${cards}<footer>Generated ${esc(new Date().toLocaleDateString('en-IN'))}. Review the journal and Registry record before taking action.</footer></body></html>`;
  }

  // ── Goods / services descriptions ────────────────────────────────────────

  private cardKey(c: AgentJournalConflict): string {
    return `${c.portfolioTrademarkId}-${c.conflictingTrademarkId}`;
  }

  isLong(text: string | undefined): boolean {
    return (text?.length ?? 0) > DESCRIPTION_PREVIEW_CHARS;
  }

  isExpanded(c: AgentJournalConflict): boolean {
    return this.expanded().has(this.cardKey(c));
  }

  /** One toggle per card opens both descriptions together — they are read side by side. */
  toggleExpanded(c: AgentJournalConflict): void {
    const key = this.cardKey(c);
    this.expanded.update(set => {
      const next = new Set(set);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  setRiskFilter(level: '' | 'HIGH' | 'MEDIUM' | 'LOW'): void {
    this.riskFilter.set(level);
  }

  scorePercent(score: number): number {
    return Math.round(score * 100);
  }
}
