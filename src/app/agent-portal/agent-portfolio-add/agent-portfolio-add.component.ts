import { Component, signal } from '@angular/core';
import { IconComponent } from '../ui/icon.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgentDataService } from '../../shared/services/agent-data.service';
import { AgentAddByNumberResult } from '../../../models/agent.model';

/**
 * Adds a mark to the portfolio by application number alone.
 *
 * Previously this was a full form — name, class, proprietor, status, dates. That asked the agent to
 * retype data the register already holds, and every field they filled became one we then had to
 * lock the moment the register answered, or leave sitting in contradiction to it. The application
 * number is the only thing the agent genuinely knows that we might not.
 *
 * The fetch never blocks: if we already hold the mark it is linked immediately, otherwise it is
 * queued with the register and appears once it lands.
 */
@Component({
  selector: 'app-agent-portfolio-add',
  standalone: true,
  imports: [IconComponent, CommonModule, FormsModule, RouterModule],
  templateUrl: './agent-portfolio-add.component.html',
  styleUrl: './agent-portfolio-add.component.scss',
})
export class AgentPortfolioAddComponent {
  applicationNo = '';
  clientReference = '';

  submitting = signal(false);
  error = signal('');

  /** Marks added this session, so an agent adding several sees them accumulate. */
  results = signal<AgentAddByNumberResult[]>([]);

  constructor(
    private readonly agentDataService: AgentDataService,
    private readonly router: Router,
  ) {}

  get canSubmit(): boolean {
    return this.applicationNo.replace(/[^0-9]/g, '').length > 0 && !this.submitting();
  }

  submit(): void {
    if (!this.canSubmit) return;
    this.submitting.set(true);
    this.error.set('');

    this.agentDataService.addByApplicationNo(this.applicationNo, this.clientReference || undefined).subscribe({
      next: res => {
        this.results.set([res, ...this.results()]);
        this.submitting.set(false);
        // Cleared so the agent can key the next number straight away — adding several in a row is
        // the normal case, and making them re-navigate for each would be tedious.
        this.applicationNo = '';
        this.clientReference = '';
      },
      error: err => {
        this.submitting.set(false);
        this.error.set(err?.error?.message || 'Could not add that application number. Please check it and try again.');
      },
    });
  }

  goToPortfolio(): void {
    this.router.navigate(['/agent-portal/portfolio']);
  }

  openMark(result: AgentAddByNumberResult): void {
    if (result.trademarkId) {
      this.router.navigate(['/agent-portal/portfolio', result.trademarkId]);
    }
  }
}
