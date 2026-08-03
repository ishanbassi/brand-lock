import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { PulseService } from '../shared/services/pulse.service';

type Mode = 'confirm' | 'unsubscribe';
type ViewState = 'loading' | 'success' | 'error';

/** Landing page for the links sent in Trademark Pulse digest emails — confirm or unsubscribe. */
@Component({
  selector: 'app-pulse-landing',
  imports: [CommonModule, RouterModule],
  templateUrl: './pulse-landing.component.html',
  styleUrl: './pulse-landing.component.scss',
})
export class PulseLandingComponent implements OnInit {
  mode: Mode = 'confirm';
  state: ViewState = 'loading';
  tmClass: number | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly pulseService: PulseService,
  ) {}

  ngOnInit(): void {
    this.mode = (this.route.snapshot.data['mode'] as Mode) || 'confirm';
    const key = this.route.snapshot.queryParamMap.get('key');
    if (!key) {
      this.state = 'error';
      return;
    }

    const request$ = this.mode === 'confirm' ? this.pulseService.confirm(key) : this.pulseService.unsubscribe(key);

    request$.subscribe({
      next: res => {
        this.tmClass = res.body?.tmClass ?? null;
        this.state = 'success';
      },
      error: () => (this.state = 'error'),
    });
  }
}
