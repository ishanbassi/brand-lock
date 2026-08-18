import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Single skeleton placeholder shape (line/block/circle). Compose several of these
 * to build a page-specific skeleton layout, the same way the app already hand-built
 * skeleton-card markup in trademark-search-result — this just makes that pattern reusable
 * instead of re-declaring the shimmer keyframes and colors in every component's scss.
 */
@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
  imports: [CommonModule],
  standalone: true,
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '12px';
  @Input() radius = 'var(--radius-sm, 4px)';
  @Input() circle = false;
  /** Extra bottom margin for stacking lines without a wrapper. */
  @Input() marginBottom = '0';
}
