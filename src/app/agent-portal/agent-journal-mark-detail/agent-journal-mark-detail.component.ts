import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription, switchMap, take, timer } from 'rxjs';
import { ITrademark } from '../../../models/trademark.model';
import { environment } from '../../../environments/environment';
import { TrademarkService } from '../../shared/services/trademark.service';
import { IconComponent } from '../ui/icon.component';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { ExportFormat, ExportMenuComponent } from '../ui/export-menu.component';
import { fileSlug, saveBlob } from '../ui/save-blob';

type RefreshState = 'idle' | 'fetching' | 'updated' | 'fresh' | 'busy' | 'failed';

@Component({
  selector: 'app-agent-journal-mark-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, ExportMenuComponent],
  templateUrl: './agent-journal-mark-detail.component.html',
  styleUrls: [
    '../agent-trademark-detail/agent-trademark-detail.component.scss',
    './agent-journal-mark-detail.component.scss',
  ],
})
export class AgentJournalMarkDetailComponent implements OnInit, OnDestroy {
  trademarkId!: number;
  trademark = signal<ITrademark | null>(null);
  loading = signal(true);
  error = signal('');
  refreshState = signal<RefreshState>('idle');
  refreshMessage = signal('');
  exporting = signal<ExportFormat | null>(null);
  readonly baseUrl = environment.BaseApiUrl;
  private refreshPoll?: Subscription;
  private readonly pollIntervalMs = 5000;
  private readonly maxPolls = 60;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly trademarkService: TrademarkService,
    private readonly agentDataService: AgentDataService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('No journal trademark was specified.');
      this.loading.set(false);
      return;
    }
    this.trademarkId = id;
    this.trademarkService.find(id).subscribe({
      next: response => {
        this.trademark.set(response.body);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load this trademark.');
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    this.refreshPoll?.unsubscribe();
  }

  imageUrl(): string {
    return this.trademark()?.imgUrl
      ? `${this.baseUrl}files/${this.trademark()!.imgUrl}`
      : '/assets/images/trademark.png';
  }

  export(format: ExportFormat): void {
    if (this.exporting()) return;
    this.exporting.set(format);
    const tm = this.trademark();
    const key = tm?.applicationNo ? String(tm.applicationNo) : fileSlug(tm?.name, 'journal-mark');
    const request = format === 'excel'
      ? this.agentDataService.exportJournalTrademarkExcel(this.trademarkId)
      : this.agentDataService.exportJournalTrademarkPdf(this.trademarkId);
    request.subscribe({
      next: blob => {
        saveBlob(blob, `journal-mark-${key}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
        this.exporting.set(null);
      },
      error: () => {
        this.error.set(`Could not generate the ${format === 'excel' ? 'Excel file' : 'PDF'}.`);
        this.exporting.set(null);
      },
    });
  }

  refresh(): void {
    const applicationNo = this.trademark()?.applicationNo;
    if (!applicationNo || this.refreshState() === 'fetching') return;
    this.refreshPoll?.unsubscribe();
    this.refreshState.set('fetching');
    this.refreshMessage.set('Checking the trademark registry — this can take a couple of minutes.');
    this.trademarkService.requestLiveRefresh(applicationNo).subscribe({
      next: response => {
        if (response.state === 'QUEUED' || response.state === 'FETCHING') this.poll(applicationNo);
        else if (response.state === 'FRESH') this.finish('fresh', 'Already up to date — checked in the last 24 hours.');
        else if (response.state === 'BUSY') this.finish('busy', 'The registry queue is full. Please try again in a few minutes.');
        else this.fail();
      },
      error: () => this.fail(),
    });
  }

  private poll(applicationNo: number): void {
    let settled = false;
    this.refreshPoll = timer(this.pollIntervalMs, this.pollIntervalMs)
      .pipe(take(this.maxPolls), switchMap(() => this.trademarkService.getLiveRefreshStatus(applicationNo)))
      .subscribe({
        next: response => {
          if (response.state === 'COMPLETED') {
            settled = true;
            if (response.trademark) {
              this.trademark.set({ ...this.trademark(), ...this.trademarkService.convertDateFromServer(response.trademark) });
            }
            this.finish('updated', 'Updated with the latest details from the trademark registry.');
            this.refreshPoll?.unsubscribe();
          } else if (['FAILED', 'NOT_FOUND', 'NONE'].includes(response.state)) {
            settled = true;
            this.fail();
            this.refreshPoll?.unsubscribe();
          }
        },
        error: () => {
          settled = true;
          this.fail();
        },
        complete: () => {
          if (!settled) this.finish('failed', 'The registry is taking longer than usual. Please try again later.');
        },
      });
  }

  private finish(state: RefreshState, message: string): void {
    this.refreshState.set(state);
    this.refreshMessage.set(message);
  }

  private fail(): void {
    this.finish('failed', 'Could not reach the trademark registry. Please try again in a few minutes.');
  }
}
