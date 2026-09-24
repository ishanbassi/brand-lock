import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize, forkJoin, Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { ReCaptchaV3Service } from 'ng-recaptcha-2';
import { AgentDataService } from '../shared/services/agent-data.service';
import { AgentDirectoryEntry, AgentRegistration, ProprietorDirectoryEntry } from '../../models/agent.model';
import { DataService } from '../shared/services/data.service';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { LoadingService } from '../common/loading.service';
import { Login } from '../../models/login';
import { AuthService } from '../../models/auth.services';

type AccountType = 'ATTORNEY_AGENT' | 'BUSINESS';
type DirectoryEntry = AgentDirectoryEntry | ProprietorDirectoryEntry;

@Component({ selector: 'app-create-agent-account', standalone: true, imports: [CommonModule, FormsModule, RouterModule], templateUrl: './create-agent-account.component.html', styleUrl: './create-agent-account.component.scss' })
export class CreateAgentAccountComponent {
  step = signal(1); readonly totalSteps = 2; accountType: AccountType = 'ATTORNEY_AGENT';
  formData: AgentRegistration = { firstName: '', lastName: '', email: '', password: '', captchaResponse: '' };
  passwordVisible = false; confirmPassword = ''; confirmPasswordVisible = false; onClickValidation = false; submitting = false;
  searching = signal(false); searched = signal(false); query = ''; entries = signal<DirectoryEntry[]>([]); selected = signal<DirectoryEntry[]>([]);
  private readonly search$ = new Subject<string>();

  constructor(private readonly agentData: AgentDataService, private readonly dataService: DataService, private readonly storage: LocalStorageService, private readonly loading: LoadingService, private readonly toastr: ToastrService, private readonly router: Router, private readonly recaptcha: ReCaptchaV3Service, private readonly auth: AuthService) {
    this.search$.pipe(debounceTime(300), distinctUntilChanged(), switchMap(q => { this.searching.set(true); return this.accountType === 'ATTORNEY_AGENT' ? this.agentData.searchAgents(q) : this.agentData.searchProprietors(q); })).subscribe({ next: entries => { this.entries.set(entries); this.searched.set(true); this.searching.set(false); }, error: () => { this.searching.set(false); this.toastr.error('Could not search the trademark register.'); } });
  }
  get progressPercent(): number { return ((this.step() - 1) / (this.totalSteps - 1)) * 100; }
  get searchLabel(): string { return this.accountType === 'ATTORNEY_AGENT' ? 'agent or attorney name' : 'proprietor name'; }
  get selectedCount(): number { return this.selected().length; }
  setAccountType(type: AccountType): void { this.accountType = type; this.query = ''; this.entries.set([]); this.selected.set([]); this.searched.set(false); }
  nextStep(): void {
    this.onClickValidation = true;
    if (!this.formData.email || !this.formData.password || !this.confirmPassword) return;
    if (this.formData.password.length < 6) { this.toastr.error('Password must be at least 6 characters.'); return; }
    if (this.formData.password !== this.confirmPassword) { this.toastr.error('Passwords do not match.'); return; }
    this.onClickValidation = false; this.registerAndSignIn();
  }
  onQueryChange(value: string): void { this.query = value; if (value.trim().length < 2) { this.entries.set([]); this.searched.set(false); return; } this.search$.next(value.trim()); }
  toggle(entry: DirectoryEntry): void { const selected = this.selected(); this.selected.set(selected.some(x => x.nameNormalized === entry.nameNormalized) ? selected.filter(x => x.nameNormalized !== entry.nameNormalized) : [...selected, entry]); }
  isSelected(entry: DirectoryEntry): boolean { return this.selected().some(x => x.nameNormalized === entry.nameNormalized); }
  finish(): void {
    const claims = this.selected().map(entry => this.accountType === 'ATTORNEY_AGENT' ? this.agentData.claimTrademarks({ agentName: entry.nameNormalized, claimAllUnderName: true }) : this.agentData.claimProprietorTrademarks({ agentName: entry.nameNormalized, claimAllUnderName: true }));
    if (!claims.length) { this.goToDashboard(); return; }
    this.submitting = true; forkJoin(claims).pipe(finalize(() => this.submitting = false)).subscribe({ next: () => this.goToDashboard(), error: () => this.toastr.error('Your account is ready, but we could not add those trademarks. You can retry from your portfolio.') });
  }
  private registerAndSignIn(): void {
    this.formData.firstName = this.formData.email.trim().split('@')[0] || 'Account';
    this.submitting = true; this.loading.show(); this.recaptcha.execute('agent_register').subscribe({ next: token => { this.formData.captchaResponse = token; this.agentData.registerAgent(this.formData).pipe(finalize(() => this.loading.hide())).subscribe({ next: () => this.doLogin(), error: err => { this.submitting = false; this.toastr.error(err?.error?.detail || 'Registration failed. Please try again.'); } }); }, error: () => { this.submitting = false; this.loading.hide(); this.toastr.error('CAPTCHA verification failed. Please try again.'); } });
  }
  private doLogin(): void {
    const input = new Login(); input.username = this.formData.email; input.password = this.formData.password;
    this.dataService.login(input.forRequest()).subscribe({ next: response => { const token = response.body!.id_token; this.storage.storeAuthenticationToken(token); const { id, authorities } = this.auth.decodeToken(token); this.storage.setObject('user', { id, authorities }); this.submitting = false; this.step.set(2); }, error: () => { this.submitting = false; this.toastr.error('Account created, but sign-in failed. Please sign in to continue.'); this.router.navigate(['/agent-login']); } });
  }
  goToDashboard(): void { this.router.navigate(['/agent-portal/dashboard']); }
}
