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

  form: Partial<AgentProfile> = {};

  constructor(private readonly agentDataService: AgentDataService) {}

  ngOnInit(): void {
    this.agentDataService.getProfile().subscribe({
      next: (p) => {
        this.profile.set(p);
        this.form = { ...p };
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load your profile.');
        this.loading.set(false);
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
