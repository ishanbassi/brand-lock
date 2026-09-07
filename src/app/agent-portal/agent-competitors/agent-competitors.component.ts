import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import dayjs from 'dayjs';
import {
  AgentDirectoryEntry,
  CompetitorFiling,
  CompetitorWatch,
} from '../../../models/agent.model';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { IconComponent } from '../ui/icon.component';

/** A day's detections, which is how the feed is read. */
interface FeedDay {
  key: string;
  label: string;
  items: CompetitorFiling[];
}

/**
 * What rival firms are filing.
 *
 * <p>The watched party is an agent of record, so the firms are picked from the same directory
 * onboarding uses. That directory is built from free-text registry data where one firm appears
 * under several spellings, which is why the search is multi-select: watching only the spelling the
 * agent happened to click would quietly miss the rest of the firm's filings. The mark count beside
 * each name is what lets them tell a firm's main entry from its variants.
 *
 * <p>Adding a firm is the only way this page ever fills up, so the search is the page's centre of
 * gravity rather than a sidebar: on first run it is the whole screen, and afterwards it is one
 * primary button in the head that opens the same panel in place. The watch list is then a rail of
 * firms above the feed - it filters, and it is where a firm is dropped - and the feed gets the
 * full width, which is what an agent actually came to read.
 *
 * <p>Grouped by the day we detected a filing rather than the day it was filed. Those are usually a
 * day or two apart and conflating them would misreport the register. The filing date is on the row
 * itself, where it belongs, as a datum.
 */
@Component({
  selector: 'app-agent-competitors',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './agent-competitors.component.html',
  styleUrl: './agent-competitors.component.scss',
})
export class AgentCompetitorsComponent implements OnInit {
  private readonly agentData = inject(AgentDataService);

  readonly watches = signal<CompetitorWatch[]>([]);
  readonly filings = signal<CompetitorFiling[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  /** Set while a watch is being added, so the control shows it registered the click. */
  readonly saving = signal(false);

  // ── Search ───────────────────────────────────────────────────────────────

  private readonly searchBox = viewChild<ElementRef<HTMLInputElement>>('searchBox');

  /**
   * Whether the add panel is open by request. With nothing watched yet it is open regardless -
   * an empty page whose one useful action is hidden behind a button is a page that explains
   * nothing.
   */
  readonly addOpen = signal(false);
  readonly showAdder = computed(() => this.addOpen() || this.watches().length === 0);

  query = '';
  readonly results = signal<AgentDirectoryEntry[]>([]);
  readonly searching = signal(false);
  readonly searched = signal(false);
  /** Names ticked but not yet watched. Held by normalised name, which is the key the server takes. */
  readonly picked = signal<Set<string>>(new Set());
  readonly pickedCount = computed(() => this.picked().size);

  /** Names the server refused, kept beside the search so the agent sees which of their ticks failed. */
  readonly rejected = signal<{ name: string; reason: string }[]>([]);

  private readonly search$ = new Subject<string>();

  // ── Filter ───────────────────────────────────────────────────────────────
  //
  // Once a few firms are watched the feed mixes them. Filtering to one answers "what has this firm
  // been doing", which is the second question every agent asks after "what is new".

  readonly filterWatchId = signal<number | null>(null);

  // ── Removal ──────────────────────────────────────────────────────────────
  //
  // Dropping a firm also drops the filings already found for it, and the watch cannot be restarted
  // retrospectively - re-adding it only picks up what is filed from that day on. That is not
  // recoverable by the agent, so it is asked before it is done.

  readonly pendingRemoval = signal<CompetitorWatch | null>(null);
  readonly removingId = signal<number | null>(null);

  /** Filings that would go with the firm awaiting confirmation, so the prompt can say how many. */
  readonly pendingRemovalFilings = computed(() => {
    const watch = this.pendingRemoval();
    return watch === null ? 0 : this.filings().filter(f => f.competitorWatchId === watch.id).length;
  });

  readonly visibleFilings = computed(() => {
    const id = this.filterWatchId();
    return id === null ? this.filings() : this.filings().filter(f => f.competitorWatchId === id);
  });

  readonly unseenCount = computed(() => this.filings().filter(f => !f.seen).length);

  /** Watched names already on the list, so the search can mark them rather than offer them again. */
  private readonly watchedNames = computed(() => new Set(this.watches().map(w => w.nameNormalized)));

  readonly days = computed<FeedDay[]>(() => {
    const groups = new Map<string, CompetitorFiling[]>();
    for (const filing of this.visibleFilings()) {
      const key = filing.foundDate ? dayjs(filing.foundDate).format('YYYY-MM-DD') : 'unknown';
      const bucket = groups.get(key);
      if (bucket) {
        bucket.push(filing);
      } else {
        groups.set(key, [filing]);
      }
    }
    return [...groups.entries()].map(([key, items]) => ({ key, label: this.dayLabel(key), items }));
  });

  constructor() {
    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(q => {
          this.searching.set(true);
          return this.agentData.searchAgents(q, 15);
        }),
      )
      .subscribe({
        next: rows => {
          this.results.set(rows);
          this.searched.set(true);
          this.searching.set(false);
        },
        error: () => {
          this.results.set([]);
          this.searching.set(false);
        },
      });
  }

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.agentData.getCompetitorWatches().subscribe({
      next: rows => {
        this.watches.set(rows);
        this.loadFeed();
      },
      error: () => {
        this.error.set('Could not load your competitor list. Reload the page to try again.');
        this.loading.set(false);
      },
    });
  }

  private loadFeed(): void {
    this.agentData.getCompetitorFeed(0, 100).subscribe({
      next: page => {
        this.filings.set(page.items);
        this.loading.set(false);
        // Cleared on the server once read. The markers already rendered stay for this visit, so
        // the agent can still see what was new when they arrived.
        if (page.unseen > 0) {
          this.agentData.markCompetitorFeedSeen().subscribe({ error: () => undefined });
        }
      },
      error: () => {
        this.error.set('Could not load the filing feed.');
        this.loading.set(false);
      },
    });
  }

  // ── Search and add ───────────────────────────────────────────────────────

  openAdd(): void {
    this.addOpen.set(true);
    this.pendingRemoval.set(null);
    // The panel exists to be typed into; landing the caret there saves the agent a click.
    queueMicrotask(() => this.searchBox()?.nativeElement.focus());
  }

  closeAdd(): void {
    this.addOpen.set(false);
    this.resetSearch();
  }

  private resetSearch(): void {
    this.query = '';
    this.results.set([]);
    this.searched.set(false);
    this.picked.set(new Set());
    this.rejected.set([]);
  }

  onQueryChange(value: string): void {
    this.query = value;
    if (value.trim().length < 2) {
      this.results.set([]);
      this.searched.set(false);
      return;
    }
    this.search$.next(value.trim());
  }

  isWatched(entry: AgentDirectoryEntry): boolean {
    return this.watchedNames().has(entry.nameNormalized);
  }

  isPicked(entry: AgentDirectoryEntry): boolean {
    return this.picked().has(entry.nameNormalized);
  }

  togglePick(entry: AgentDirectoryEntry): void {
    if (this.isWatched(entry)) {
      return;
    }
    const next = new Set(this.picked());
    if (next.has(entry.nameNormalized)) {
      next.delete(entry.nameNormalized);
    } else {
      next.add(entry.nameNormalized);
    }
    this.picked.set(next);
  }

  addPicked(): void {
    const names = [...this.picked()];
    if (names.length === 0 || this.saving()) {
      return;
    }
    this.saving.set(true);
    this.rejected.set([]);

    this.agentData.addCompetitorWatches(names).subscribe({
      next: result => {
        this.watches.set([...this.watches(), ...result.added].sort((a, b) => a.displayName.localeCompare(b.displayName)));
        const rejected = Object.entries(result.rejected ?? {}).map(([name, reason]) => ({ name, reason }));
        this.resetSearch();
        this.rejected.set(rejected);
        this.saving.set(false);
        // Close on a clean run so the feed comes forward. If anything was refused the panel stays,
        // because the reason is only useful next to the search that produced it.
        if (rejected.length === 0) {
          this.addOpen.set(false);
        }
      },
      error: () => {
        this.error.set('Could not add those firms. Try again.');
        this.saving.set(false);
      },
    });
  }

  // ── Remove ───────────────────────────────────────────────────────────────

  askRemove(watch: CompetitorWatch): void {
    this.pendingRemoval.set(watch);
  }

  cancelRemove(): void {
    this.pendingRemoval.set(null);
  }

  confirmRemove(): void {
    const watch = this.pendingRemoval();
    if (watch === null || this.removingId() !== null) {
      return;
    }
    this.removingId.set(watch.id);
    this.agentData.removeCompetitorWatch(watch.id).subscribe({
      next: () => {
        this.watches.set(this.watches().filter(w => w.id !== watch.id));
        this.filings.set(this.filings().filter(f => f.competitorWatchId !== watch.id));
        if (this.filterWatchId() === watch.id) {
          this.filterWatchId.set(null);
        }
        this.removingId.set(null);
        this.pendingRemoval.set(null);
      },
      error: () => {
        this.error.set('Could not remove that firm.');
        this.removingId.set(null);
        this.pendingRemoval.set(null);
      },
    });
  }

  filterBy(watchId: number | null): void {
    this.filterWatchId.set(this.filterWatchId() === watchId ? null : watchId);
  }

  // ── Formatting ───────────────────────────────────────────────────────────

  private dayLabel(key: string): string {
    if (key === 'unknown') {
      return 'Date unknown';
    }
    const day = dayjs(key);
    const today = dayjs().startOf('day');
    if (day.isSame(today, 'day')) {
      return 'Today';
    }
    if (day.isSame(today.subtract(1, 'day'), 'day')) {
      return 'Yesterday';
    }
    return day.format(day.year() === today.year() ? 'D MMMM' : 'D MMMM YYYY');
  }

  filedOn(filing: CompetitorFiling): string {
    return filing.applicationDate ? dayjs(filing.applicationDate).format('DD MMM YYYY') : '—';
  }

  /** The register's own words, trimmed to something a row can carry. */
  statusLabel(filing: CompetitorFiling): string {
    const status = (filing.trademarkStatus ?? '').trim();
    if (!status || status.toUpperCase() === 'UNKNOWN' || status.toUpperCase() === 'DRAFT') {
      // Most freshly scraped rows have not been reconciled with the registry yet. Saying so is
      // better than showing a status we do not have.
      return 'Awaiting registry';
    }
    return status;
  }


}
