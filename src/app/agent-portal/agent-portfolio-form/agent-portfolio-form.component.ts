import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentPortfolioTrademark } from '../../../models/agent.model';

@Component({
  selector: 'app-agent-portfolio-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './agent-portfolio-form.component.html',
  styleUrl: './agent-portfolio-form.component.scss',
})
export class AgentPortfolioFormComponent implements OnInit {
  isEdit = false;
  editId: number | null = null;
  loading = signal(false);
  saving = signal(false);
  error = signal('');

  form: Partial<AgentPortfolioTrademark> = {
    name: '',
    applicationNo: undefined,
    tmClass: undefined,
    proprietorName: '',
    trademarkStatus: '',
    type: '',
    details: '',
    applicationDate: undefined,
    renewalDate: undefined,
  };

  readonly STATUS_OPTIONS = [
    'Registered', 'Objected', 'Opposed', 'Abandoned', 'Refused', 'Advertised', 'Filed', 'Pending'
  ];

  readonly TYPE_OPTIONS = [
    { value: 'TRADEMARK', label: 'Word Mark' },
    { value: 'IMAGEMARK', label: 'Image / Device Mark' },
    { value: 'TRADEMARK_WITH_IMAGE', label: 'Word + Image' },
    { value: 'SOUNDMARK', label: 'Sound Mark' },
    { value: 'SLOGAN', label: 'Slogan' },
  ];

  readonly CLASS_OPTIONS = Array.from({ length: 45 }, (_, i) => i + 1);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly agentDataService: AgentDataService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.editId = parseInt(id, 10);
      this.loadItem(this.editId);
    }
  }

  loadItem(id: number): void {
    this.loading.set(true);
    this.agentDataService.getPortfolioItem(id).subscribe({
      next: (tm) => {
        this.form = { ...tm };
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load trademark details.');
        this.loading.set(false);
      },
    });
  }

  save(): void {
    if (!this.form.name?.trim()) {
      this.error.set('Trademark name is required.');
      return;
    }
    this.error.set('');
    this.saving.set(true);

    const obs = this.isEdit
      ? this.agentDataService.updatePortfolioItem(this.editId!, this.form)
      : this.agentDataService.addPortfolioItem(this.form);

    obs.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/agent-portal/portfolio']);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to save. Please try again.');
        this.saving.set(false);
      },
    });
  }
}
