import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
import { Deadline } from '../../../models/agent.model';
import { AgentDataService } from '../../shared/services/agent-data.service';

type HearingState = 'all' | 'live' | 'upcoming';
type HearingSort = 'date' | 'application' | 'category';

/**
 * Registry hearing board and same-day cause-list workspace.
 *
 * <p>Kept separate from renewals because hearings are a live docket: the schedule, room link and
 * Registry category are the things an agent needs to scan, rather than a statutory due-date task.
 */
@Component({
  selector: 'app-agent-hearings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agent-hearings.component.html',
  styleUrl: './agent-hearings.component.scss',
})
export class AgentHearingsComponent implements OnInit {
  private readonly agentData = inject(AgentDataService);
  private readonly router = inject(Router);

  readonly hearings = signal<Deadline[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly search = signal('');
  readonly category = signal('all');
  readonly slot = signal('all');
  readonly state = signal<HearingState>('all');
  readonly sort = signal<HearingSort>('date');
  readonly page = signal(1);
  readonly pageSize = 5;
  readonly now = signal(dayjs());
  readonly dayjs = dayjs;

  readonly today = computed(() => this.now().format('YYYY-MM-DD'));
  readonly categories = computed(() => [...new Set(this.hearings().map(item => item.hearingCategory).filter((item): item is string => !!item))]);
  readonly slots = computed(() => [...new Set(this.hearings().map(item => item.hearingSlot).filter((item): item is string => !!item))]);
  readonly liveHearings = computed(() => this.filtered().filter(item => item.dueDate === this.today()));
  readonly hasUnlockedLiveHearing = computed(() => this.liveHearings().some(item => this.unlocked(item)));
  readonly upcomingHearings = computed(() => this.filtered().filter(item => item.dueDate > this.today()));
  readonly nextSeven = computed(() => this.hearings().filter(item => item.daysUntilDue >= 0 && item.daysUntilDue <= 7).length);
  readonly boardPipeline = computed(() => this.hearings().filter(item => item.daysUntilDue >= 0).length);

  readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const category = this.category();
    const slot = this.slot();
    const state = this.state();
    return this.hearings().filter(item => {
      const haystack = [item.trademarkName, item.applicationNo, item.tmClass, item.title, item.notes, item.hearingCategory, item.registryCaseNo]
        .filter(value => value !== null && value !== undefined)
        .join(' ')
        .toLowerCase();
      if (term && !haystack.includes(term)) return false;
      if (category !== 'all' && item.hearingCategory !== category) return false;
      if (slot !== 'all' && item.hearingSlot !== slot) return false;
      if (state === 'live' && item.dueDate !== this.today()) return false;
      if (state === 'upcoming' && item.dueDate <= this.today()) return false;
      return true;
    }).sort((a, b) => {
      if (this.sort() === 'application') return (a.applicationNo ?? 0) - (b.applicationNo ?? 0);
      if (this.sort() === 'category') return this.categoryLabel(a).localeCompare(this.categoryLabel(b));
      return a.dueDate.localeCompare(b.dueDate) || (a.applicationNo ?? 0) - (b.applicationNo ?? 0);
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  readonly paged = computed(() => {
    const page = Math.min(this.page(), this.totalPages());
    return this.filtered().slice((page - 1) * this.pageSize, page * this.pageSize);
  });
  readonly pageNumbers = computed(() => Array.from({ length: Math.min(this.totalPages(), 3) }, (_, index) => index + 1));
  readonly displayedRange = computed(() => {
    if (!this.filtered().length) return '0–0';
    const start = (Math.min(this.page(), this.totalPages()) - 1) * this.pageSize + 1;
    return `${start}–${Math.min(start + this.pageSize - 1, this.filtered().length)}`;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.now.set(dayjs());
    this.agentData.getDeadlines(dayjs().subtract(1, 'day').format('YYYY-MM-DD'), dayjs().add(365, 'day').format('YYYY-MM-DD')).subscribe({
      next: rows => {
        this.hearings.set((rows ?? []).filter(item => item.deadlineType === 'HEARING'));
        this.loading.set(false);
        this.clampPage();
      },
      error: () => {
        this.error.set('Could not load the Registry hearing board. Retry, or reload the page.');
        this.loading.set(false);
      },
    });
  }

  setState(state: HearingState): void { this.state.set(state); this.resetPage(); }
  setCategory(category: string): void { this.category.set(category); this.resetPage(); }
  setSlot(slot: string): void { this.slot.set(slot); this.resetPage(); }
  setSort(sort: HearingSort): void { this.sort.set(sort); this.resetPage(); }
  resetPage(): void { this.page.set(1); }
  clearSearch(): void { this.search.set(''); this.resetPage(); }
  goToPage(page: number): void { if (page >= 1 && page <= this.totalPages()) this.page.set(page); }

  selectQuickState(state: HearingState): void {
    this.setState(state);
    if (state !== 'all') this.category.set('all');
  }

  openMark(item: Deadline): void {
    if (item.trademarkId) void this.router.navigate(['/agent-portal/portfolio', item.trademarkId]);
  }

  share(item: Deadline): void {
    const text = `${item.trademarkName || 'Trademark'} — hearing ${this.dateLabel(item.dueDate)}${item.hearingUrl ? `\n${item.hearingUrl}` : ''}`;
    if (navigator.share) {
      void navigator.share({ title: 'Trademark hearing', text });
    } else if (navigator.clipboard) {
      void navigator.clipboard.writeText(text);
    }
  }

  exportCauseList(): void {
    const escape = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const csv = [
      ['Application number', 'Trademark', 'Category', 'Hearing date', 'Hearing slot', 'Registry case', 'Webex room'].map(escape).join(','),
      ...this.filtered().map(item => [item.applicationNo, item.trademarkName, this.categoryLabel(item), item.dueDate, item.title, item.registryCaseNo, item.hearingUrl].map(escape).join(',')),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'trademark-hearing-cause-list.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  categoryLabel(item: Deadline): string {
    return this.categoryName(item.hearingCategory);
  }

  categoryName(category?: string | null): string {
    return ({
      TLA: 'Trade Marks Show Cause',
      SECTION_19_57: 'Section 19 / 57',
      OPPOSITION_RECTIFICATION: 'Opposition / Rectification',
      POST_REGISTRATION: 'Post Registration',
      FORMALITY_CHECK: 'Formality Check',
    } as Record<string, string>)[category ?? ''] ?? 'Registry Hearing';
  }

  sourceLabel(item: Deadline): string {
    return item.hearingUrl ? 'Cause list published' : 'Board listed';
  }

  relative(item: Deadline): string {
    if (item.daysUntilDue === 0) return 'Today';
    if (item.daysUntilDue === 1) return 'Tomorrow';
    return item.daysUntilDue < 0 ? `${Math.abs(item.daysUntilDue)} days ago` : `In ${item.daysUntilDue} days`;
  }

  dateLabel(date: string): string { return dayjs(date).format('DD MMM YYYY'); }
  dateDay(date: string): string { return dayjs(date).format('DD'); }
  dateMonthDay(date: string): string { return dayjs(date).format('MMM • ddd'); }
  unlocked(item: Deadline): boolean { return item.dueDate === this.today() && !!item.hearingUrl; }
  keyOf(item: Deadline): string { return item.id ? `id:${item.id}` : item.derivedKey ?? `${item.dueDate}-${item.applicationNo ?? item.registryCaseNo ?? ''}`; }

  private clampPage(): void { if (this.page() > this.totalPages()) this.page.set(this.totalPages()); }
}
