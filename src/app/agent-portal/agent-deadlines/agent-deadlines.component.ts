import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
import { Deadline } from '../../../models/agent.model';
import { AgentDataService } from '../../shared/services/agent-data.service';
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

  readonly deadlines = signal<Deadline[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  /** Set while a row's status is in flight, so the row can show it registered the click. */
  readonly saving = signal<string | null>(null);

  /**
   * Ranges the agent actually asks for, with the default first.
   *
   * <p>Every range reaches into the past. Hearings are only ever known on or after the day, so a
   * strictly forward window would show an empty page to someone who had a hearing this morning.
   */
  readonly ranges = [
    { key: '90', label: 'Next 90 days', back: 30, forward: 90 },
    { key: '30', label: 'Next 30 days', back: 14, forward: 30 },
    { key: '365', label: 'Next 12 months', back: 30, forward: 365 },
  ];
  readonly activeRange = signal(this.ranges[0]);

  readonly showDone = signal(false);

  // ── View mode ────────────────────────────────────────────────────────────
  //
  // Two readings of the same data. The list answers "what is next"; the month answers "how is the
  // quarter shaped". Neither is the better default for everyone, so the choice is the agent's.

  readonly view = signal<'list' | 'month'>('list');
  /** First day of the month on screen. */
  readonly monthCursor = signal(dayjs().startOf('month'));

  readonly monthLabel = computed(() => this.monthCursor().format('MMMM YYYY'));
  readonly weekdayHeadings = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  setView(mode: 'list' | 'month'): void {
    if (this.view() === mode) {
      return;
    }
    this.view.set(mode);
    this.selectedDay.set(null);
    this.load();
  }

  stepMonth(delta: number): void {
    this.monthCursor.set(this.monthCursor().add(delta, 'month'));
    this.selectedDay.set(null);
    this.load();
  }

  goToThisMonth(): void {
    this.monthCursor.set(dayjs().startOf('month'));
    this.selectedDay.set(null);
    this.load();
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

  selectDay(cell: MonthCell): void {
    if (cell.items.length === 0) {
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

  load(): void {
    this.loading.set(true);
    this.error.set('');

    let from: string;
    let to: string;
    if (this.view() === 'month') {
      // A fortnight either side so the leading and trailing cells of the grid are populated too.
      from = this.monthCursor().subtract(14, 'day').format('YYYY-MM-DD');
      to = this.monthCursor().endOf('month').add(14, 'day').format('YYYY-MM-DD');
    } else {
      const range = this.activeRange();
      from = this.iso(-range.back);
      to = this.iso(range.forward);
    }

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
      this.load();
    }
  }

  toggleDone(): void {
    this.showDone.set(!this.showDone());
  }

  // ── Grouping ─────────────────────────────────────────────────────────────

  readonly visible = computed(() => {
    const rows = this.deadlines();
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
      next: () => this.saving.set(null),
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
