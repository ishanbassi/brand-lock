import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * The portal's icon set.
 *
 * <p>Twelve hand-picked glyphs inlined as SVG rather than an icon library. The portal needs a dozen
 * icons; pulling in a package to get them would ship a few thousand and still leave every screen
 * looking like every other product using the same set.
 *
 * <p>It replaces the emoji the sidebar used to carry. Emoji render differently on every platform,
 * cannot inherit colour or stroke weight, and read as informal on a screen that tracks statutory
 * deadlines.
 *
 * <p>All glyphs are on a 24 unit grid with a 1.6 stroke and no fill, so they sit at the same weight
 * as the surrounding text at any size.
 */
@Component({
  selector: 'ap-icon',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="ap-icon" [style.width.px]="size" [style.height.px]="size" [innerHTML]="svg()"></span>`,
  styles: [
    `
      .ap-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .ap-icon ::ng-deep svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
  ],
})
export class IconComponent {
  @Input({ required: true }) name!: IconName;
  @Input() size = 18;

  constructor(private readonly sanitizer: DomSanitizer) {}

  svg(): SafeHtml {
    const path = ICONS[this.name] ?? ICONS['dot'];
    return this.sanitizer.bypassSecurityTrustHtml(
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`
    );
  }
}

export type IconName =
  | 'dashboard'
  | 'portfolio'
  | 'watch'
  | 'journal'
  | 'search'
  | 'documents'
  | 'calendar'
  | 'bell'
  | 'user'
  | 'upload'
  | 'plus'
  | 'download'
  | 'chevron'
  | 'close'
  | 'check'
  | 'alert'
  | 'signout'
  | 'lock'
  | 'edit'
  | 'refresh'
  | 'eye'
  | 'clock'
  | 'building'
  | 'globe'
  | 'scales'
  | 'dot';

/** Paths only; the wrapper supplies the svg element so stroke and sizing stay uniform. */
const ICONS: Record<string, string> = {
  dashboard: '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
  // A stack of records, which is what a portfolio is here.
  portfolio: '<path d="M3 7l9-4 9 4-9 4-9-4z"/><path d="M3 12l9 4 9-4"/><path d="M3 17l9 4 9-4"/>',
  watch: '<path d="M12 3l7.5 3v5.5c0 4.3-3 8.2-7.5 9.5-4.5-1.3-7.5-5.2-7.5-9.5V6L12 3z"/><path d="M9.5 12l1.8 1.8 3.4-3.6"/>',
  journal: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z"/><path d="M5 17a3 3 0 0 1 3-3h11"/><path d="M9 8h6"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-3.6-3.6"/>',
  documents: '<path d="M4 4h8l2.5 2.5H20v13H4V4z"/><path d="M8 12h8"/><path d="M8 15.5h5"/>',
  // A leaf torn from a docket book: a date block above ruled lines.
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="1.5"/><path d="M3.5 10h17"/><path d="M8 3.5v3"/><path d="M16 3.5v3"/><path d="M7.5 14h4"/>',
  bell: '<path d="M18 8.5a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16s-2-1.5-2-6.5z"/><path d="M10.3 19a2 2 0 0 0 3.4 0"/>',
  user: '<circle cx="12" cy="8.5" r="3.75"/><path d="M4.5 20c.9-3.6 3.9-5.5 7.5-5.5s6.6 1.9 7.5 5.5"/>',
  upload: '<path d="M12 16V4"/><path d="M7.5 8.5L12 4l4.5 4.5"/><path d="M4 16v3.5h16V16"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  download: '<path d="M12 4v12"/><path d="M7.5 11.5L12 16l4.5-4.5"/><path d="M4 16v3.5h16V16"/>',
  chevron: '<path d="M9 6l6 6-6 6"/>',
  close: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  alert: '<path d="M12 4.5L21 19.5H3L12 4.5z"/><path d="M12 10v4"/><path d="M12 16.8v.2"/>',
  signout: '<path d="M9 20H5V4h4"/><path d="M15.5 16l4-4-4-4"/><path d="M19.5 12H9"/>',
  lock: '<rect x="4.5" y="10.5" width="15" height="9.5" rx="1.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
  edit: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3z"/><path d="M14.5 6.5l3 3"/>',
  refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.5h-4.5"/>',
  eye: '<path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.75"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/>',
  building: '<path d="M4 20V5.5A1.5 1.5 0 0 1 5.5 4h7A1.5 1.5 0 0 1 14 5.5V20"/><path d="M14 10h4.5A1.5 1.5 0 0 1 20 11.5V20"/><path d="M7 8h4"/><path d="M7 12h4"/><path d="M2.5 20h19"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.2 2.4 3.4 5.4 3.4 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.4-5.4-3.4-8.5S9.8 5.9 12 3.5z"/>',
  scales: '<path d="M12 4v16"/><path d="M6 8h12"/><path d="M3 15l3-7 3 7a3 3 0 0 1-6 0z"/><path d="M15 15l3-7 3 7a3 3 0 0 1-6 0z"/>',
  dot: '<circle cx="12" cy="12" r="3"/>',
};
