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

  /** True when the register backs this mark, so its own fields are read-only. */
  locked = signal(false);
  registrySyncedDate = signal<string | null>(null);

  /**
   * Agent-private annotation. Held on the portfolio link rather than the mark, so it stays editable
   * even when everything above it is locked — this is the agent's own material and cannot
   * contradict the register.
   */
  notes: { agentNotes: string; clientReference: string } = { agentNotes: '', clientReference: '' };
  savingNotes = signal(false);
  notesSaved = signal(false);

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
        // A mark the register backs is read-only: either it was claimed from our data, or the
        // agent entered it and the register has since answered. Editing it would be reverted by
        // the next refresh and would present the agent's values as registry fact meanwhile.
        this.locked.set(tm.editable === false);
        this.registrySyncedDate.set(tm.registrySyncedDate ?? null);
        this.notes.agentNotes = tm.agentNotes ?? '';
        this.notes.clientReference = tm.clientReference ?? '';
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load trademark details.');
        this.loading.set(false);
      },
    });
  }

  /** Saves the agent's private notes. Independent of the mark, so it works on locked marks too. */
  saveNotes(): void {
    if (!this.editId) return;
    this.savingNotes.set(true);
    this.notesSaved.set(false);
    this.agentDataService
      .updatePortfolioLink(this.editId, {
        agentNotes: this.notes.agentNotes,
        clientReference: this.notes.clientReference,
      })
      .subscribe({
        next: () => {
          this.savingNotes.set(false);
          this.notesSaved.set(true);
        },
        error: () => {
          this.error.set('Could not save your notes. Please try again.');
          this.savingNotes.set(false);
        },
      });
  }

  save(): void {
    // Guarded here as well as in the template: the backend rejects it regardless, and a clear
    // message beats a 400 the agent has to interpret.
    if (this.locked()) {
      this.error.set('This mark comes from the public register and cannot be edited. Add a note instead.');
      return;
    }
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
