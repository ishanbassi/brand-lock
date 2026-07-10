import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../shared/services/data.service';
import { DashboardStats, ServiceOrderDTO } from '../../models/dashboard-stats.model';
import { TrademarkStatusPipe } from '../shared/pipe/trademark-status-translate.pipe';
import { LoadingService } from '../common/loading.service';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { OnboardingStateService } from '../shared/services/onboarding-state.service';
import { AuthService } from '../../models/auth.services';
import { ITrademark } from '../../models/trademark.model';

interface DiscoverService {
  title: string;
  blurb: string;
  price: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TrademarkStatusPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  dashboardStats?: DashboardStats | null;
  loaded = false;

  // 'UNKNOWN' (a null/legacy status) is treated as active/in-progress rather than a
  // failure — a just-started draft should never visually read as "abandoned".
  activeStatuses = ['DRAFT', 'FILED', 'UNDER_EXAMINATION', 'PUBLISHED', 'UNKNOWN'];
  inProcessStatuses = ['OBJECTED', 'EXAMINATION_REPLY_FILED', 'ACCEPTED_AND_ADVERTISED', 'OPPOSED', 'HEARING'];
  failureStatuses = ['ABANDONED', 'WITHDRAWN', 'REJECTED', 'EXPIRED'];
  protectedStatuses = ['REGISTERED', 'RENEWED'];

  progressStages = ['Filed', 'Examination', 'Published', 'Registered'];

  // Services the user can add — shown as discovery when they have none active.
  discoverServices: DiscoverService[] = [
    { title: 'Trademark Watch', blurb: 'We alert you if anyone files a mark like yours.', price: '₹1,499/yr', route: '/trademark-watch' },
    { title: 'MSME / Udyam Registration', blurb: 'Get your Udyam certificate and unlock govt. benefits.', price: '₹499', route: '/msme-registration' },
    { title: 'ISO 9001:2015', blurb: 'Quality-management certification for your business.', price: '₹1,499', route: '/iso/iso-9001-2015' },
    { title: 'IEC (Import Export Code)', blurb: 'Required to import or export from India.', price: '₹1,499', route: '/iec-registration' },
  ];

  showAllTasks = false;
  maxVisibleTasks = 3;

  showAllFilings = false;
  maxVisibleFilings = 5;

  constructor(
    private readonly dataService: DataService,
    private readonly router: Router,
    private readonly loadingService: LoadingService,
    private readonly toastService: ToastrService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly onboardingStateService: OnboardingStateService,
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Clear any half-finished onboarding state once we reach the dashboard.
    this.sessionStorageService.remove('trademark');
    this.sessionStorageService.remove('initial-onboarding');
    this.sessionStorageService.remove('payment_id');
    this.onboardingStateService.clear();

    this.loadingService.show();
    this.dataService.getDashboardStats()
      .pipe(finalize(() => { this.loadingService.hide(); this.loaded = true; }))
      .subscribe({
        next: (response) => {
          this.dashboardStats = response.body;
          this.processPendingTasksLinks(this.dashboardStats);
        },
        error: () => {
          this.toastService.error('We could not load your dashboard. Please try again or contact support.');
        },
      });
  }

  // ── Greeting ───────────────────────────────────────────────────────────
  get firstName(): string {
    return this.dashboardStats?.userSummary?.firstName?.trim()
      || this.authService.getUser()?.firstName?.trim()
      || 'there';
  }

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  // ── Portfolio ledger ───────────────────────────────────────────────────
  private countByStatuses(statuses: string[]): number {
    return (this.dashboardStats?.stats ?? [])
      .filter(s => statuses.includes(s.trademarkStatus))
      .reduce((sum, s) => sum + (s.count || 0), 0);
  }

  get totalFilings(): number {
    return (this.dashboardStats?.stats ?? []).reduce((sum, s) => sum + (s.count || 0), 0);
  }

  get protectedCount(): number { return this.countByStatuses(this.protectedStatuses); }
  get inProgressCount(): number {
    return this.countByStatuses([...this.activeStatuses, ...this.inProcessStatuses]);
  }
  get actionCount(): number { return this.dashboardStats?.pendingTasks?.length ?? 0; }

  get hasApplications(): boolean {
    return (this.dashboardStats?.recentApplications?.length ?? 0) > 0;
  }

  // ── Status styling ─────────────────────────────────────────────────────
  statusClass(status: string | null | undefined): string {
    if (this.protectedStatuses.includes(status!)) return 'registered';
    if (this.inProcessStatuses.includes(status!)) return 'in-process';
    if (this.failureStatuses.includes(status!)) return 'failure';
    if (this.activeStatuses.includes(status!)) return 'active';
    return 'failure';
  }

  // ── Featured application journey ───────────────────────────────────────
  get featuredApplication(): ITrademark | null {
    const apps = this.dashboardStats?.recentApplications ?? [];
    // Prefer the first mark that is still on the registry track.
    return apps.find(a => this.progressStageIndex(a.trademarkStatus) >= 0) ?? apps[0] ?? null;
  }

  /** Index within progressStages the given status maps to (-1 = off-track). */
  progressStageIndex(status: string | null | undefined): number {
    switch (status) {
      case 'DRAFT':
      case 'FILED':
        return 0;
      case 'UNDER_EXAMINATION':
      case 'OBJECTED':
      case 'EXAMINATION_REPLY_FILED':
        return 1;
      case 'PUBLISHED':
      case 'ACCEPTED_AND_ADVERTISED':
      case 'OPPOSED':
      case 'HEARING':
        return 2;
      case 'REGISTERED':
      case 'RENEWED':
        return 3;
      default:
        return -1;
    }
  }

  get featuredStageIndex(): number {
    return this.progressStageIndex(this.featuredApplication?.trademarkStatus);
  }

  get featuredIsRegistered(): boolean {
    return this.protectedStatuses.includes(this.featuredApplication?.trademarkStatus ?? '');
  }

  get featuredStageNote(): string {
    switch (this.featuredApplication?.trademarkStatus) {
      case 'DRAFT':
        return 'Payment received — our attorneys are preparing your filing. It reaches the Registry within 24 hours.';
      case 'FILED':
        return 'Filed with the Registry and waiting in the examination queue.';
      case 'UNDER_EXAMINATION':
        return 'The Registry is examining your application.';
      case 'OBJECTED':
        return 'The Registry raised an objection — our team is drafting the reply.';
      case 'EXAMINATION_REPLY_FILED':
        return 'Our reply to the examination report has been filed.';
      case 'ACCEPTED_AND_ADVERTISED':
      case 'PUBLISHED':
        return 'Accepted and published in the Trademark Journal — the 4-month opposition window has begun.';
      case 'OPPOSED':
        return 'An opposition was filed — our team is handling the proceedings.';
      case 'HEARING':
        return 'A hearing is scheduled with the Registry.';
      case 'REGISTERED':
        return 'Registered and protected for 10 years. You can now use the ® symbol.';
      case 'RENEWED':
        return 'Renewed — your protection continues for another 10 years.';
      default:
        return 'We are reviewing this application. Your attorney will reach out with the next step.';
    }
  }

  // ── Services ───────────────────────────────────────────────────────────
  get services(): ServiceOrderDTO[] {
    return this.dashboardStats?.services ?? [];
  }
  get hasServices(): boolean { return this.services.length > 0; }

  // ── Pending tasks ──────────────────────────────────────────────────────
  processPendingTasksLinks(dashboardStats?: DashboardStats | null): void {
    if (!dashboardStats?.pendingTasks) return;
    this.dashboardStats!.pendingTasks = this.dashboardStats!.pendingTasks.map(task => {
      switch (task.type) {
        case 'DOCUMENT_UPLOAD':
          task.link = `portal/trademark/edit/${task.applicationId}`;
          break;
        case 'PAYMENT_PENDING':
          task.link = `trademark-registration/checkout?order_id=${task.applicationId}`;
          break;
        case 'PLAN_PENDING':
          task.link = `trademark-registration/select-plan?application=${task.applicationId}`;
          break;
        default:
          task.link = `portal/trademark/edit/${task.applicationId}`;
      }
      return task;
    });
  }

  taskIcon(type: string): string {
    switch (type) {
      case 'DOCUMENT_UPLOAD': return 'M11 14V5m0 0-3 3m3-3 3 3M5 15v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2';
      case 'PAYMENT_PENDING': return 'M4 7h14M4 11h14M8 15h3M6 4h10a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z';
      case 'PLAN_PENDING': return 'M11 4v9m0 3v.5';
      default: return 'M11 7v5m0 3v.2M11 3.5 3 17.5h16L11 3.5Z';
    }
  }

  getDisplayedTasks() {
    const tasks = this.dashboardStats?.pendingTasks ?? [];
    return this.showAllTasks ? tasks : tasks.slice(0, this.maxVisibleTasks);
  }

  toggleShowAll(): void {
    this.showAllTasks = !this.showAllTasks;
  }

  // The backend now returns every application (no server-side cap), so the same
  // "show N, then expand" pattern used for pending tasks applies here too.
  getDisplayedFilings(): ITrademark[] {
    const filings = this.dashboardStats?.recentApplications ?? [];
    return this.showAllFilings ? filings : filings.slice(0, this.maxVisibleFilings);
  }

  toggleShowAllFilings(): void {
    this.showAllFilings = !this.showAllFilings;
  }

  openPendingTask(link: string): void {
    this.router.navigateByUrl(link);
  }
}
