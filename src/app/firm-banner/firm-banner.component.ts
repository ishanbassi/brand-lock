import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-firm-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="banner" role="banner">

        <!-- Left: Badge -->
        <div class="badge">
          <svg class="shield" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
                  fill="currentColor" opacity=".15"/>
            <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z"
                  stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.5"
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="badge-text">Verified</span>
        </div>

        <!-- Center: Message -->
        <div class="message">
          <span class="brand">Trademarx.in</span>
          <span class="separator">is an initiative by</span>
          <a [href]="firmUrl" target="_blank" rel="noopener" class="firm-link">
            Bassi &amp; Associates
            <svg class="ext-icon" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.2"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
          <span class="separator">— Trademark Attorneys &amp; Advocates</span>
        </div>

        <!-- Right: Dismiss -->
        @if (dismissible) {
          <button class="dismiss" (click)="dismiss()" aria-label="Dismiss banner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        }

      </div>
    }
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=DM+Sans:wght@400;500&display=swap');

    :host {
      display: block;
      width: 100%;
    }

    .banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 10px 20px;
      background: #0f1923;
      border-bottom: 1px solid rgba(196, 160, 90, 0.25);
      position: relative;
      animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      flex-wrap: wrap;
    }

    @keyframes slideDown {
      from { transform: translateY(-100%); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    /* ── Badge ── */
    .badge {
      display: flex;
      align-items: center;
      gap: 5px;
      background: rgba(196, 160, 90, 0.12);
      border: 1px solid rgba(196, 160, 90, 0.35);
      border-radius: 20px;
      padding: 3px 10px 3px 7px;
      flex-shrink: 0;
    }

    .shield {
      width: 14px;
      height: 14px;
      color: #c4a05a;
    }

    .badge-text {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #c4a05a;
    }

    /* ── Message ── */
    .message {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .brand {
      font-family: 'Cormorant Garamond', serif;
      font-size: 16px;
      font-weight: 600;
      color: #f0e6cc;
      letter-spacing: 0.02em;
    }

    .separator {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      color: rgba(240, 230, 204, 0.5);
      font-weight: 400;
    }

    .firm-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-family: 'Cormorant Garamond', serif;
      font-size: 16px;
      font-weight: 600;
      color: #c4a05a;
      text-decoration: none;
      border-bottom: 1px solid rgba(196, 160, 90, 0.4);
      padding-bottom: 1px;
      transition: color 0.2s, border-color 0.2s;
    }

    .firm-link:hover {
      color: #d4b46a;
      border-color: #d4b46a;
    }

    .ext-icon {
      width: 11px;
      height: 11px;
      opacity: 0.7;
      flex-shrink: 0;
    }

    /* ── Dismiss ── */
    .dismiss {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(240, 230, 204, 0.4);
      transition: color 0.2s;
      border-radius: 4px;
    }

    .dismiss:hover { color: #f0e6cc; }

    .dismiss svg {
      width: 14px;
      height: 14px;
    }

    @media (max-width: 600px) {
      .separator:last-child { display: none; }
      .banner { gap: 10px; padding: 10px 40px 10px 16px; }
    }
  `]
})
export class FirmBannerComponent {

  /** URL to your main firm website */
  @Input() firmUrl = 'https://share.google/ZSxYZC1J917c6vaHz';

  /** Allow the user to close the banner */
  @Input() dismissible = true;

  visible = signal(true);

  dismiss() {
    this.visible.set(false);
  }
}