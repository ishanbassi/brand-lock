import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AdminAgentService } from '../services/admin-agent.service';
import { IAdminAgent } from '../shared/admin-agent.model';
import {
  AdminIsoCertificateAccessService,
  IIsoCertificateAccessGrant,
} from '../services/admin-iso-certificate-access.service';

@Component({
  selector: 'app-admin-iso-certificate-access',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-iso-certificate-access.component.html',
  styleUrl: './admin-iso-certificate-access.component.scss',
})
export class AdminIsoCertificateAccessComponent implements OnInit {
  private readonly access = inject(AdminIsoCertificateAccessService);
  private readonly agentsApi = inject(AdminAgentService);
  private readonly toast = inject(ToastrService);

  readonly grants = signal<IIsoCertificateAccessGrant[]>([]);
  readonly agents = signal<IAdminAgent[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly revokingId = signal<number | null>(null);
  readonly error = signal('');
  email = '';
  selectedAgentId: number | null = null;

  ngOnInit(): void {
    this.load();
    // A selection is a convenience, not a security decision. The server resolves its email again.
    this.agentsApi.query({ page: 0, size: 1000, sort: 'fullName,asc' }).subscribe({
      next: response => this.agents.set(response.body ?? []),
    });
  }

  load(): void {
    this.loading.set(true);
    this.access.list().subscribe({
      next: grants => {
        this.grants.set(grants);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('The ISO access list could not be loaded. Try again.');
        this.loading.set(false);
      },
    });
  }

  grantEmail(): void {
    const email = this.email.trim();
    if (!email) return;
    this.save({ email }, 'Email added to ISO access.');
  }

  grantAgent(): void {
    if (!this.selectedAgentId) return;
    this.save({ agentId: this.selectedAgentId }, 'Agent added to ISO access.');
  }

  revoke(grant: IIsoCertificateAccessGrant): void {
    this.revokingId.set(grant.id);
    this.access.revoke(grant.id).subscribe({
      next: () => {
        this.grants.update(entries => entries.filter(entry => entry.id !== grant.id));
        this.revokingId.set(null);
        this.toast.success('ISO access removed.');
      },
      error: () => {
        this.revokingId.set(null);
        this.toast.error('Could not remove ISO access.');
      },
    });
  }

  agentLabel(agent: IAdminAgent): string {
    return `${agent.fullName || agent.companyName || 'Unnamed agent'} — ${agent.email || 'No email'}`;
  }

  private save(input: { email?: string; agentId?: number }, message: string): void {
    this.saving.set(true);
    this.error.set('');
    this.access.grant(input).subscribe({
      next: grant => {
        this.grants.update(entries => [...entries.filter(entry => entry.id !== grant.id), grant].sort((a, b) => a.email.localeCompare(b.email)));
        this.email = '';
        this.selectedAgentId = null;
        this.saving.set(false);
        this.toast.success(message);
      },
      error: response => {
        this.saving.set(false);
        this.error.set(response.error?.detail || response.error?.message || 'Could not save ISO access.');
      },
    });
  }
}
