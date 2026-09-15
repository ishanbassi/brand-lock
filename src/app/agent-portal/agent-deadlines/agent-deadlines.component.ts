import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import dayjs from 'dayjs';
import { Deadline } from '../../../models/agent.model';
import { AgentDataService, OVERDUE_RENEWAL_LOOKBACK_DAYS } from '../../shared/services/agent-data.service';
import { IconComponent } from '../ui/icon.component';

/** One cell of the month grid. */
interface MonthCell {
  date: string;
  dayOfMonth: number;
  inMonth: boolean;
  today: boolean;
  items: Deadline[];
}

/** A day's worth of deadlines, which is how the page is read. */
interface DayGroup {
  date: string;
  label: string;
  weekday: string;
  relative: string;
  past: boolean;
  today: boolean;
  items: Deadline[];
}

/** Which slice of the calendar a screen shows. Set per route in agent-portal.routes.ts. */
type DeadlineScope = 'all' | 'renewals-upcoming' | 'renewals-overdue' | 'hearings-upcoming';

interface DeadlineRange {
  key: string;
  label: string;
  back: number;
  forward: number;
}

interface ScopeConfig {
  title: string;
  subtitle: string;
  ranges: DeadlineRange[];
  /** Which fetched rows belong on this screen. The server fetches by date only; kind is decided here. */
  includes: (d: Deadline) => boolean;
  /** Month view answers "how is the quarter shaped" - a question about the whole calendar, not one kind of entry. */
  monthView: boolean;
  /** False where every row is record-only (see isRecordOnly), so there is nothing to complete. */
  completable: boolean;
  empty: string;
  emptyAction?: { label: string; rangeKey: string };
}

const SCOPES: Record<DeadlineScope, ScopeConfig> = {
  all: {
    title: 'Deadline calendar',
    subtitle: 'Renewals the Registry has confirmed, and hearings as they are listed. Grouped by the day they fall.',
    /**
     * Symmetric back and forward on purpose. They used to differ (a fixed 14-30 day lookback
     * regardless of how far forward the range reached), which is what let a renewal overdue by more
     * than a month quietly vanish from every range on this page while still being reachable in month
     * view by paging back far enough - the two views were reading different windows of the same data
     * and had no reason to agree. A renewal overdue by 89 days is exactly as real as one due in 89
     * days, so the same number bounds both directions.
     */
    ranges: [
      { key: '90', label: 'Next 90 days', back: 90, forward: 90 },
      { key: '30', label: 'Next 30 days', back: 30, forward: 30 },
      { key: '365', label: 'Next 12 months', back: 365, forward: 365 },
    ],
    includes: () => true,
    monthView: true,
    completable: true,
    empty:
      'Nothing falls due in this window. Renewals appear here once the Registry confirms a renewal date on a mark, and hearings appear on the day they are listed.',
    emptyAction: { label: 'Look ahead 12 months', rangeKey: '365' },
  },
  'renewals-upcoming': {
    title: 'Upcoming renewals',
    subtitle: 'Marks whose Registry renewal date is still ahead, soonest first.',
    // Forward only: anything already past its date belongs on the overdue screen, not mixed in here.
    ranges: [
      { key: '180', label: 'Next 6 months', back: 0, forward: 180 },
      { key: '90', label: 'Next 90 days', back: 0, forward: 90 },
      { key: '365', label: 'Next 12 months', back: 0, forward: 365 },
    ],
    includes: d => d.deadlineType === 'RENEWAL' && d.daysUntilDue >= 0,
    monthView: false,
    completable: true,
    empty: 'No renewals fall due in this window. A renewal appears once the Registry records a renewal date on a mark.',
    emptyAction: { label: 'Look ahead 12 months', rangeKey: '365' },
  },
  'renewals-overdue': {
    title: 'Overdue renewals',
    subtitle:
      'Past their renewal date and not yet marked done. Within six months of expiry a mark can still be renewed with a surcharge; within a year, restored.',
    // The widest range comes first and equals the sidenav badge's window, so the badge count and
    // the list it opens agree.
    ranges: [
      { key: '365', label: 'Last 12 months', back: OVERDUE_RENEWAL_LOOKBACK_DAYS, forward: 0 },
      { key: '180', label: 'Last 6 months', back: 180, forward: 0 },
    ],
    includes: d => d.deadlineType === 'RENEWAL' && d.daysUntilDue < 0,
    monthView: false,
    completable: true,
    empty: 'Nothing overdue. Every renewal in this window is either done or not yet due.',
  },
  'hearings-upcoming': {
    title: 'Upcoming hearings',
    subtitle:
      "Hearings listed on your marks from today on. The Registry's hearing board runs about five weeks ahead; a hearing known only from the cause list appears on the day.",
    // One range: the board never publishes further out than this, so a wider choice would only
    // ever return the same rows.
    ranges: [{ key: '45', label: 'Next 6 weeks', back: 0, forward: 45 }],
    includes: d => d.deadlineType === 'HEARING' && d.daysUntilDue >= 0,
    monthView: false,
    completable: false,
    empty: 'No hearings are listed on your marks in the next six weeks.',
  },
};

/**
 * What needs the firm's attention, and when.
 *
 * <p>Grouped by date rather than listed flat: an agent's question is "what is happening on the
 * 14th", not "show me row 37". The date is the organising fact, so it gets the left rail and the
 * rows hang off it - a docket book, which is the artefact this replaces.
 *
 * <p>Two kinds of entry arrive and they are not equally actionable. A renewal is a real forward
 * deadline. A hearing comes from the Registry's cause list, which publishes the day's hearings and
 * holds them, so it lands on the morning at best. The page says which is which rather than
 * flattening both into "deadlines" and implying warning it cannot give.
 */
@Component({
  selector: 'app-agent-deadlines',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './agent-deadlines.component.html',
  styleUrl: './agent-deadlines.component.scss',
})
export class AgentDeadlinesComponent implements OnInit {
  private readonly agentData = inject(AgentDataService);
  private readonly router = inject(Router);

  /**
   * The calendar in full, or one worklist cut from it. Read once: navigating between scopes goes
   * through different route configs, so Angular builds a fresh component rather than reusing this one.
   */
  readonly scope: ScopeConfig = SCOPES[(inject(ActivatedRoute).snapshot.data['scope'] as DeadlineScope) ?? 'all'] ?? SCOPES.all;

  readonly deadlines = signal<Deadline[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  /** Set while a row's status is in flight, so the row can show it registered the click. */
  readonly saving = signal<string | null>(null);

  /**
   * Ranges the agent actually asks for, with the default first. Shared by both views - see the
   * class comment on {@link view}. Each scope sets its own; see SCOPES.
   */
  readonly ranges = this.scope.ranges;
  readonly activeRange = signal(this.ranges[0]);

  readonly showDone = signal(false);

  // ── View mode ────────────────────────────────────────────────────────────
  //
  // Two readings of the same data, and it has to be the same data: the range chips above set one
  // fetch window and both views page within it, month view a month at a time. The list answers
  // "what is next"; the month answers "how is the quarter shaped". Neither is the better default
  // for everyone, so the choice is the agent's - the window they're both reading is not.

  readonly view = signal<'list' | 'month'>('list');
  /** First day of the month on screen. */
  readonly monthCursor = signal(dayjs().startOf('month'));

  readonly monthLabel = computed(() => this.monthCursor().format('MMMM YYYY'));
  readonly weekdayHeadings = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  /** The active range's edges, as whole months - what month view is allowed to page across. */
  readonly rangeStart = computed(() => dayjs().subtract(this.activeRange().back, 'day').startOf('month'));
  readonly rangeEnd = computed(() => dayjs().add(this.activeRange().forward, 'day').startOf('month'));

  readonly canStepBack = computed(() => this.monthCursor().isAfter(this.rangeStart(), 'month'));
  readonly canStepForward = computed(() => this.monthCursor().isBefore(this.rangeEnd(), 'month'));

  setView(mode: 'list' | 'month'): void {
    if (this.view() === mode) {
      return;
    }
    this.view.set(mode);
    this.selectedDay.set(null);
    if (mode === 'month') {
      // The range may have changed while the agent was in list view; the cursor wasn't touched, so
      // it can be sitting outside what the (possibly narrower) active range now allows.
      this.clampMonthCursor();
    }
    this.load();
  }

  stepMonth(delta: number): void {
    if (delta < 0 && !this.canStepBack()) {
      return;
    }
    if (delta > 0 && !this.canStepForward()) {
      return;
    }
    this.monthCursor.set(this.monthCursor().add(delta, 'month'));
    this.selectedDay.set(null);
    this.load();
  }

  goToThisMonth(): void {
    this.monthCursor.set(dayjs().startOf('month'));
    this.selectedDay.set(null);
    this.load();
  }

  private clampMonthCursor(): void {
    const start = this.rangeStart();
    const end = this.rangeEnd();
    if (this.monthCursor().isBefore(start, 'month')) {
      this.monthCursor.set(start);
    } else if (this.monthCursor().isAfter(end, 'month')) {
      this.monthCursor.set(end);
    }
  }

  /**
   * Six weeks from the Monday on or before the 1st.
   *
   * <p>Always six rows rather than five or six depending on the month: a grid that changes height
   * as you page through it makes the controls jump under the cursor.
   */
  readonly monthGrid = computed<MonthCell[]>(() => {
    const start = this.monthCursor().startOf('month');
    // dayjs weeks start on Sunday; a working week does not.
    const offset = (start.day() + 6) % 7;
    const first = start.subtract(offset, 'day');

    const byDate = new Map<string, Deadline[]>();
    for (const item of this.visible()) {
      const list = byDate.get(item.dueDate) ?? [];
      list.push(item);
      byDate.set(item.dueDate, list);
    }

    const today = dayjs().format('YYYY-MM-DD');
    const cells: MonthCell[] = [];
    for (let i = 0; i < 42; i++) {
      const d = first.add(i, 'day');
      const key = d.format('YYYY-MM-DD');
      cells.push({
        date: key,
        dayOfMonth: d.date(),
        inMonth: d.month() === start.month(),
        today: key === today,
        items: byDate.get(key) ?? [],
      });
    }
    return cells;
  });

  /** The day the agent clicked, listed in full beneath the grid. */
  readonly selectedDay = signal<string | null>(null);

  readonly selectedItems = computed(() => {
    const day = this.selectedDay();
    return day ? this.visible().filter(d => d.dueDate === day) : [];
  });

  /**
   * A day with exactly one item goes straight to the application - that is what "clickable" means
   * to an agent looking at a single hearing. A day with several stays a click-to-expand, because a
   * single click on the cell can't say which of several applications the agent meant.
   */
  selectDay(cell: MonthCell): void {
    if (cell.items.length === 0) {
      return;
    }
    if (cell.items.length === 1 && cell.items[0].trademarkId) {
      this.openMark(cell.items[0]);
      return;
    }
    this.selectedDay.set(this.selectedDay() === cell.date ? null : cell.date);
  }

  selectedDayLabel(): string {
    const day = this.selectedDay();
    return day ? dayjs(day).format('D MMMM YYYY') : '';
  }

  /**
   * What a marker means, as a class.
   *
   * <p>The four states worth telling apart at a glance. Colour is never the only channel - the
   * marker shape differs too and the legend spells each out - because these are read on projectors,
   * in print, and by people who cannot separate the hues.
   */
  markerClass(item: Deadline): string {
    if (item.deadlineType === 'HEARING') {
      if (item.daysUntilDue === 0) return 'marker marker--hearing-today';
      return item.daysUntilDue < 0 ? 'marker marker--hearing-past' : 'marker marker--hearing-upcoming';
    }
    if (item.status === 'DONE') return 'marker marker--done';
    return item.daysUntilDue < 0 ? 'marker marker--renewal-overdue' : 'marker marker--renewal';
  }

  ngOnInit(): void {
    this.load();
  }

  /**
   * One fetch window for both views - the active range, full stop. Month view used to fetch only a
   * fortnight either side of whichever month was on screen, which is what let it show a renewal
   * list view's own ranges couldn't reach: the two views were reading different data and had no
   * reason to agree on what counted as overdue. Now the range chips are the single source of that
   * window and month view pages within it rather than around itself.
   */
  load(): void {
    this.loading.set(true);
    this.error.set('');

    const range = this.activeRange();
    const from = this.iso(-range.back);
    const to = this.iso(range.forward);

    this.agentData.getDeadlines(from, to).subscribe({
      next: rows => {
        this.deadlines.set(rows ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your deadlines. Retry, or reload the page.');
        this.loading.set(false);
      },
    });
  }

  selectRange(key: string): void {
    const range = this.ranges.find(r => r.key === key);
    if (range && range !== this.activeRange()) {
      this.activeRange.set(range);
      // A narrower range can leave the month on screen outside the new bounds.
      this.clampMonthCursor();
      this.load();
    }
  }

  toggleDone(): void {
    this.showDone.set(!this.showDone());
  }

  // ── Grouping ─────────────────────────────────────────────────────────────

  readonly visible = computed(() => {
    const rows = this.deadlines().filter(this.scope.includes);
    return this.showDone() ? rows : rows.filter(d => d.status === 'OPEN' || d.status === 'MISSED');
  });

  /**
   * Overdue counts renewals and agent deadlines that have passed unactioned — not hearings.
   *
   * <p>A hearing is a record of a listing, not a task the agent owes: it is known only on or after
   * the day it happens, so once it is past there was never a window to miss. Flagging "1 overdue"
   * for yesterday's hearing reads as a failure where there is none. Hearings show as "Listed"
   * regardless of date.
   */
  readonly overdueCount = computed(
    () => this.visible().filter(d => d.daysUntilDue < 0 && d.status === 'OPEN' && !this.isRecordOnly(d)).length,
  );
  readonly next7Count = computed(() => this.visible().filter(d => d.daysUntilDue >= 0 && d.daysUntilDue <= 7).length);

  /**
   * Whether today has anything on it, in the window currently loaded.
   *
   * <p>A day this far down a long, date-sorted list is easy to scroll past - especially a hearing,
   * which reads quiet on purpose so it doesn't look like an overdue task. This is what "Jump to
   * today" below checks before offering itself.
   */
  readonly hasTodayGroup = computed(() => this.groups().some(g => g.today));

  scrollToToday(): void {
    document.getElementById('deadline-day-today')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Groups in date order, soonest first, with the day itself carrying the context. */
  readonly groups = computed<DayGroup[]>(() => {
    const byDate = new Map<string, Deadline[]>();
    for (const item of this.visible()) {
      const list = byDate.get(item.dueDate) ?? [];
      list.push(item);
      byDate.set(item.dueDate, list);
    }

    return Array.from(byDate.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, items]) => {
        const d = new Date(date + 'T00:00:00');
        const days = items[0]?.daysUntilDue ?? 0;
        return {
          date,
          label: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
          weekday: d.toLocaleDateString('en-IN', { weekday: 'short' }),
          relative: this.relativeLabel(days),
          past: days < 0,
          today: days === 0,
          items,
        };
      });
  });

  private relativeLabel(days: number): string {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    if (days < 0) return `${Math.abs(days)} days ago`;
    if (days < 14) return `In ${days} days`;
    if (days < 60) return `In ${Math.round(days / 7)} weeks`;
    return `In ${Math.round(days / 30)} months`;
  }

  // ── Row presentation ─────────────────────────────────────────────────────

  typeLabel(item: Deadline): string {
    switch (item.deadlineType) {
      case 'RENEWAL':
        return 'Renewal';
      case 'HEARING':
        return 'Hearing';
      case 'OPPOSITION_WINDOW':
        return 'Opposition window';
      case 'EXAM_REPLY':
        return 'Examination reply';
      case 'COUNTER_STATEMENT':
        return 'Counter statement';
      case 'EVIDENCE':
        return 'Evidence';
      default:
        return 'Deadline';
    }
  }

  /**
   * Hearings are stated as a record rather than a warning.
   *
   * <p>The cause list publishes the day's hearings and holds them, so by the time one is on this
   * page the hearing is that morning or already past. Calling it "due in 0 days" alongside a
   * renewal would imply the agent still has room to act.
   */
  isRecordOnly(item: Deadline): boolean {
    return item.deadlineType === 'HEARING';
  }

  chipClass(item: Deadline): string {
    if (item.status === 'DONE') return 'ap-chip ap-chip--done';
    // A hearing is never overdue — it is a listing, not a task. Today's hearing keeps the "due"
    // emphasis; a past or upcoming one is neutral, matching its "Listed" label.
    if (this.isRecordOnly(item)) {
      return item.daysUntilDue === 0 ? 'ap-chip ap-chip--due' : 'ap-chip ap-chip--neutral';
    }
    if (item.status === 'MISSED') return 'ap-chip ap-chip--overdue';
    if (item.daysUntilDue < 0) return 'ap-chip ap-chip--overdue';
    if (item.daysUntilDue <= 14) return 'ap-chip ap-chip--due';
    return 'ap-chip ap-chip--neutral';
  }

  chipLabel(item: Deadline): string {
    if (item.status === 'DONE') return 'Done';
    if (item.status === 'WAIVED') return 'Waived';
    // "Listed" rather than a countdown: a hearing is known on the day, so a number would imply
    // there is still time to act on it.
    if (this.isRecordOnly(item)) return 'Listed';
    if (item.daysUntilDue < 0) return `${Math.abs(item.daysUntilDue)}d overdue`;
    if (item.daysUntilDue === 0) return 'Today';
    return `${item.daysUntilDue}d left`;
  }

  // ── Actions ──────────────────────────────────────────────────────────────

  private keyOf(item: Deadline): string {
    return item.id ? `id:${item.id}` : `key:${item.derivedKey}`;
  }

  isSaving(item: Deadline): boolean {
    return this.saving() === this.keyOf(item);
  }

  /**
   * Marks a deadline done.
   *
   * <p>Updated locally first so the click registers immediately, then reconciled with the server.
   * A failure puts the row back and says so rather than leaving a row that looks saved.
   */
  markDone(item: Deadline, event: MouseEvent): void {
    event.stopPropagation();
    if (this.isSaving(item)) {
      return;
    }
    const previous = item.status;
    this.saving.set(this.keyOf(item));
    this.patchLocal(item, 'DONE');

    this.agentData.setDeadlineStatus({ id: item.id, derivedKey: item.derivedKey }, 'DONE').subscribe({
      next: saved => {
        this.patchLocal(item, 'DONE', saved.id);
        this.saving.set(null);
        // The sidenav badges count open items; a renewal just closed should leave them.
        this.agentData.refreshDeadlineCounts();
      },
      error: () => {
        this.patchLocal(item, previous);
        this.saving.set(null);
        this.error.set('That change did not save. Try again.');
      },
    });
  }

  undo(item: Deadline, event: MouseEvent): void {
    event.stopPropagation();
    const previous = item.status;
    this.saving.set(this.keyOf(item));
    this.patchLocal(item, 'OPEN');

    this.agentData.setDeadlineStatus({ id: item.id, derivedKey: item.derivedKey }, 'OPEN').subscribe({
      next: () => {
        this.saving.set(null);
        this.agentData.refreshDeadlineCounts();
      },
      error: () => {
        this.patchLocal(item, previous);
        this.saving.set(null);
        this.error.set('That change did not save. Try again.');
      },
    });
  }

  private patchLocal(item: Deadline, status: Deadline['status'], id?: number | null): void {
    this.deadlines.update(rows =>
      rows.map(r => (r === item || (r.derivedKey && r.derivedKey === item.derivedKey) ? { ...r, status, id: id ?? r.id } : r)),
    );
  }

  openMark(item: Deadline): void {
    if (item.trademarkId) {
      void this.router.navigate(['/agent-portal/portfolio', item.trademarkId]);
    }
  }

  private iso(offsetDays: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10);
  }
}
