import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { StatusWatchService } from '../shared/services/status-watch.service';

type Mode = 'confirm' | 'unsubscribe';
type ViewState = 'loading' | 'success' | 'error';

/**
 * Landing page for the links sent in status-watch emails — confirm a new
 * subscription, or unsubscribe from one. One component for both since they're
 * mirror-image "call an endpoint with ?key=, show the result" flows.
 */
@Component({
  selector: 'app-status-watch-landing',
  imports: [CommonModule, RouterModule],
  templateUrl: './status-watch-landing.component.html',
  styleUrl: './status-watch-landing.component.scss',
})
export class StatusWatchLandingComponent implements OnInit {
  mode: Mode = 'confirm';
  state: ViewState = 'loading';
  trademarkName: string | null = null;
  trademarkStatus: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly statusWatchService: StatusWatchService,
  ) {}

  ngOnInit(): void {
    this.mode = (this.route.snapshot.data['mode'] as Mode) || 'confirm';
    const key = this.route.snapshot.queryParamMap.get('key');
    if (!key) {
      this.state = 'error';
      return;
    }

    const request$ = this.mode === 'confirm' ? this.statusWatchService.confirm(key) : this.statusWatchService.unsubscribe(key);

    request$.subscribe({
      next: res => {
        this.trademarkName = res.body?.trademarkName ?? null;
        this.trademarkStatus = res.body?.trademarkStatus ?? null;
        this.state = 'success';
      },
      error: () => (this.state = 'error'),
    });
  }
}
