import { Component, ElementRef, EventEmitter, HostListener, Input, Output, inject, signal } from '@angular/core';
import { IconComponent } from './icon.component';

export type ExportFormat = 'excel' | 'pdf';

/**
 * The one download control used across the portal: a single button that opens a choice of Excel
 * or PDF.
 *
 * <p>One control rather than two side-by-side buttons so every screen that offers data carries the
 * same affordance in the same place, and a header already holding "Add trademark" and "Import"
 * does not grow a row of near-identical buttons.
 *
 * <p>It only announces the choice. The host does the fetch and passes the format back in as
 * {@link busy} while it runs, so the button can say "Preparing…" and refuse a second click.
 */
@Component({
  selector: 'ap-export-menu',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="export-menu">
      <button
        type="button"
        class="export-trigger"
        [disabled]="disabled || busy !== null"
        (click)="toggle()"
        aria-haspopup="menu"
        [attr.aria-expanded]="open()"
      >
        <ap-icon name="download" [size]="16" />
        <span>{{ busy ? 'Preparing ' + (busy === 'excel' ? 'Excel' : 'PDF') + '…' : label }}</span>
        <span class="caret" aria-hidden="true">▾</span>
      </button>

      @if (open()) {
        <div class="export-panel" role="menu">
          <button type="button" role="menuitem" class="export-option" (click)="choose('excel')">
            <span class="format-badge format-xlsx" aria-hidden="true">XLSX</span>
            <span class="option-text">
              <strong>Excel</strong>
              <small>Spreadsheet, every column</small>
            </span>
          </button>
          <button type="button" role="menuitem" class="export-option" (click)="choose('pdf')">
            <span class="format-badge format-pdf" aria-hidden="true">PDF</span>
            <span class="option-text">
              <strong>PDF</strong>
              <small>On your firm's letterhead</small>
            </span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host { display: inline-block; }
      .export-menu { position: relative; }

      .export-trigger {
        display: inline-flex;
        align-items: center;
        gap: var(--ap-space-2);
        padding: var(--ap-space-2) var(--ap-space-4);
        background: #fff;
        color: var(--ap-ink-muted);
        border: 1.5px solid var(--ap-rule);
        border-radius: 8px;
        font: inherit;
        font-size: 0.875rem;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        transition: border-color 0.15s, color 0.15s;
      }
      .export-trigger:hover:not(:disabled) { border-color: var(--ap-accent); color: var(--ap-accent); }
      .export-trigger:disabled { opacity: 0.5; cursor: not-allowed; }
      .caret { font-size: 0.7rem; opacity: 0.7; }

      .export-panel {
        position: absolute;
        right: 0;
        top: calc(100% + 6px);
        z-index: 30;
        min-width: 15rem;
        padding: var(--ap-space-1);
        background: #fff;
        border: 1px solid var(--ap-rule);
        border-radius: 10px;
        box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
      }

      .export-option {
        display: flex;
        align-items: center;
        gap: var(--ap-space-3);
        width: 100%;
        padding: var(--ap-space-2) var(--ap-space-3);
        background: none;
        border: none;
        border-radius: 7px;
        font: inherit;
        text-align: left;
        color: var(--ap-ink);
        cursor: pointer;
      }
      .export-option:hover, .export-option:focus-visible { background: var(--ap-accent-soft); outline: none; }

      .format-badge {
        flex-shrink: 0;
        width: 2.6rem;
        padding: 3px 0;
        border-radius: 5px;
        font-size: 0.625rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-align: center;
        color: #fff;
      }
      .format-xlsx { background: #1d6f42; }
      .format-pdf { background: #b3261e; }

      .option-text { display: flex; flex-direction: column; line-height: 1.25; }
      .option-text strong { font-size: 0.875rem; font-weight: 600; }
      .option-text small { font-size: 0.75rem; color: var(--ap-ink-muted); }
    `,
  ],
})
export class ExportMenuComponent {
  /** Button text at rest. */
  @Input() label = 'Download';
  @Input() disabled = false;
  /** The format the host is currently fetching, or null when idle. */
  @Input() busy: ExportFormat | null = null;
  @Output() readonly selected = new EventEmitter<ExportFormat>();

  readonly open = signal(false);
  private readonly host = inject(ElementRef<HTMLElement>);

  toggle(): void {
    this.open.update(o => !o);
  }

  choose(format: ExportFormat): void {
    this.open.set(false);
    this.selected.emit(format);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }
}
