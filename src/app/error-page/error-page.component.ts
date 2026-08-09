import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../models/auth.services';
import { SsrStatusService } from '../shared/services/ssr-status.service';

export type ErrorPageCode = 403 | 404;

/**
 * Shared shell for the two dead-end routes — /not-found and /403. Both are the same
 * card with different copy and exits, so the route supplies the code via `data.code`
 * (same pattern as the guide and status-watch pages).
 */
@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.scss',
})
export class ErrorPageComponent implements OnInit, OnDestroy {
  private readonly ssrStatus = inject(SsrStatusService);

  code: ErrorPageCode = 404;

  /** The signed-in visitor's own portal, or null when signed out. */
  portalRoute: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly meta: Meta,
    private readonly title: Title,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.code = (this.route.snapshot.data['code'] as ErrorPageCode) ?? 404;
    // Send the real HTTP status, not a 200 with a "not found" card. Every dead URL on the
    // site funnels through this component (the ** route redirects here, and the trends
    // pages navigate here when their API 404s), so this one line is what stops Google
    // classifying the whole set as soft 404s.
    this.ssrStatus.setStatus(this.code);
    // A 403 always means somebody is signed in but in the wrong portal, so offer the
    // portal their role does own rather than a generic "go home".
    this.portalRoute = this.authService.hasValidToken() ? `/${this.authService.homeRoute()}` : null;

    this.title.setTitle(this.isForbidden ? 'Access denied | Trademarx' : 'Page not found | Trademarx');
    // Neither page should ever be indexed, but the links on them are worth following.
    this.meta.updateTag({ name: 'robots', content: 'noindex, follow' });
  }

  ngOnDestroy(): void {
    // Scoped to this route only — leaving it set would deindex the next page rendered.
    this.meta.removeTag("name='robots'");
  }

  get isForbidden(): boolean {
    return this.code === 403;
  }
}
