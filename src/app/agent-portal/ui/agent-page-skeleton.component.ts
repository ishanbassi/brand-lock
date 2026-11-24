import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type AgentPageSkeletonVariant = 'search-report' | 'journal-watch' | 'renewals' | 'hearings';

/**
 * Shared, layout-aware loading placeholder for data-heavy agent portal pages.
 *
 * The shapes intentionally mirror the information architecture of the destination page, so
 * loading does not make the portal jump from a generic spinner into a dense working screen.
 */
@Component({
  selector: 'app-agent-page-skeleton',
  standalone: true,
  templateUrl: './agent-page-skeleton.component.html',
  styleUrl: './agent-page-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentPageSkeletonComponent {
  @Input({ required: true }) variant!: AgentPageSkeletonVariant;
  @Input() compact = false;
  @Input() label = 'Loading page content';

  readonly cards = [1, 2, 3, 4];
  readonly rows = [1, 2, 3, 4, 5];
}
