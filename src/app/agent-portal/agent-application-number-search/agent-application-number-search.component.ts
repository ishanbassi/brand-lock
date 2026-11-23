import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { TrademarkService } from '../../shared/services/trademark.service';
import { ITrademark } from '../../../models/trademark.model';

type LookupMode = 'single' | 'batch';

/** The complete registry records returned from an exact application-number lookup. */
export interface ApplicationNumberLookup {
  query: string;
  results: ITrademark[];
}
@Component({
  selector: 'app-agent-application-number-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-application-number-search.component.html',
  styleUrl: './agent-application-number-search.component.scss',
})
export class AgentApplicationNumberSearchComponent {
  private readonly trademarkService = inject(TrademarkService);

  /** Removes the duplicate page title when this lookup is shown inside Search report. */
  @Input() embedded = false;
  /** Lets Search report render exact-match records in its existing report table. */
  @Output() resultsFound = new EventEmitter<ApplicationNumberLookup>();

  mode = signal<LookupMode>('single');
  loading = signal(false);
  error = signal('');
  feedback = signal('');

  applicationNumber = '';
  batchNumbers = '';

  get batchCount(): number {
    return this.parseBatchNumbers(this.batchNumbers).length;
  }

  setMode(mode: LookupMode): void {
    this.mode.set(mode);
    this.clearMessages();
  }

  clearApplicationNumber(): void {
    this.applicationNumber = '';
    this.clearMessages();
  }

  lookup(): void {
    this.clearMessages();

    const values = this.mode() === 'single'
      ? [this.applicationNumber.trim()]
      : this.parseBatchNumbers(this.batchNumbers);

    if (!values[0]) {
      this.error.set(this.mode() === 'single'
        ? 'Enter an application number to look up.'
        : 'Paste at least one application number to run a batch lookup.');
      return;
    }
    if (values.length > 10) {
      this.error.set(`Batch lookup supports up to 10 numbers at once (currently ${values.length}).`);
      return;
    }

    const normalized = values.map(value => this.normalize(value));
    if (normalized.some(value => !/^[A-Z0-9]{5,18}$/.test(value))) {
      this.error.set('Enter a valid alphanumeric application number (5–18 characters).');
      return;
    }

    this.loading.set(true);
    forkJoin(normalized.map(value => this.trademarkService.searchByApplicationNumber(value))).subscribe({
      next: responses => {
        const results = responses.flatMap(response => response.body ?? []);
        const matches = results.length;
        const plural = values.length === 1 ? 'filing' : 'filings';
        this.feedback.set(matches
          ? `Found ${matches} matching ${plural} for ${normalized.map(value => `#${value}`).join(', ')}.`
          : `No matching ${plural} found for ${normalized.map(value => `#${value}`).join(', ')}.`);
        this.resultsFound.emit({ query: normalized.join(', '), results });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('We could not complete that lookup. Check the filing number and try again.');
        this.loading.set(false);
      },
    });
  }

  private parseBatchNumbers(raw: string): string[] {
    return raw.split(/[\n,;]+/).map(value => value.trim()).filter(Boolean);
  }

  private normalize(value: string): string {
    return value.replace(/[\s/,\-]+/g, '').toUpperCase();
  }

  clearMessages(): void {
    this.error.set('');
    this.feedback.set('');
  }
}
