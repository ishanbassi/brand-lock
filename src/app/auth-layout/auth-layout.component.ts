import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {
  /** Fraunces headline shown on the ink-navy brand panel (desktop only). */
  @Input() headline = 'Protect what\'s yours.';
  /** Short supporting line under the headline. */
  @Input() subline = 'India\'s trademark, ISO and business registration filings — handled end to end.';
  /** Seal-green checklist shown under the headline. */
  @Input() bullets: string[] = [
    'No hidden charges',
    'Instant filing',
    'Free consultation',
    '20+ years of experience',
  ];
}
