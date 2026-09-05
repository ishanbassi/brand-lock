import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentProfile } from '../../../models/agent.model';

@Component({
  selector: 'app-agent-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './agent-profile.component.html',
  styleUrl: './agent-profile.component.scss',
})
export class AgentProfileComponent implements OnInit {
  profile = signal<AgentProfile | null>(null);
  loading = signal(true);
  saving = signal(false);
  saved = signal(false);
  error = signal('');

  // ── Report branding ──────────────────────────────────────────────────────
  // Applied to every generated document — search reports, the portfolio schedule, watch reports.
  branding = { firmDisplayName: '', reportAccentColor: '', reportFooterText: '' };
  logoPreview = signal<string | null>(null);
  brandingSaving = signal(false);
  brandingSaved = signal(false);
  logoError = signal('');

  form: Partial<AgentProfile> = {};

  constructor(private readonly agentDataService: AgentDataService) {}

  ngOnInit(): void {
    this.agentDataService.getProfile().subscribe({
      next: (p) => {
        this.profile.set(p);
        this.form = { ...p };
        this.branding = {
          firmDisplayName: (p as any).firmDisplayName ?? '',
          reportAccentColor: (p as any).reportAccentColor ?? '',
          reportFooterText: (p as any).reportFooterText ?? '',
        };
        this.loading.set(false);
        this.loadLogo();
      },
      error: () => {
        this.error.set('Could not load your profile.');
        this.loading.set(false);
      },
    });
  }

  // ── Report branding ──────────────────────────────────────────────────────

  /**
   * Fetches the stored logo for the preview.
   *
   * <p>Through the API, not an <img src>: the file is deliberately kept outside every web-served
   * root, so there is no URL that reaches it.
   */
  loadLogo(): void {
    this.agentDataService.getLogo().subscribe({
      next: blob => this.logoPreview.set(URL.createObjectURL(blob)),
      // 404 simply means no logo has been uploaded, which is the normal state.
      error: () => this.logoPreview.set(null),
    });
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.logoError.set('');

    this.agentDataService.uploadLogo(file).subscribe({
      next: () => this.loadLogo(),
      error: err => this.logoError.set(err?.error?.message || err?.error?.title || 'That file could not be used as a logo.'),
    });
    input.value = '';
  }

  removeLogo(): void {
    this.agentDataService.removeLogo().subscribe({
      next: () => this.logoPreview.set(null),
      error: () => this.logoError.set('Could not remove the logo.'),
    });
  }

  saveBranding(): void {
    this.brandingSaving.set(true);
    this.brandingSaved.set(false);
    this.logoError.set('');

    this.agentDataService.updateBranding(this.branding).subscribe({
      next: () => {
        this.brandingSaving.set(false);
        this.brandingSaved.set(true);
        setTimeout(() => this.brandingSaved.set(false), 3000);
      },
      error: err => {
        this.brandingSaving.set(false);
        this.logoError.set(err?.error?.message || 'Could not save your report settings.');
      },
    });
  }

  save(): void {
    this.error.set('');
    this.saved.set(false);
    this.saving.set(true);
    this.agentDataService.updateProfile(this.form).subscribe({
      next: (updated) => {
        this.profile.set(updated);
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to update profile.');
        this.saving.set(false);
      },
    });
  }

  get initials(): string {
    const p = this.profile();
    if (!p) return '?';
    const parts = [p.firstName, p.lastName].filter(Boolean);
    return parts.map(n => n![0].toUpperCase()).join('') || '?';
  }
}
