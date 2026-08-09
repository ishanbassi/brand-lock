import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ScrapeStage, TrademarkService } from '../shared/services/trademark.service';
import { ITrademark } from '../../models/trademark.model';
import { LoadingService } from '../common/loading.service';
import { ToastrService } from 'ngx-toastr';
import { Subscription, finalize, switchMap, take, tap, timer } from 'rxjs';
import dayjs from 'dayjs/esm';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { MobileBottomNavbarComponent } from '../mobile-bottom-navbar/mobile-bottom-navbar.component';
import { SearchCtaSectionComponent } from '../search-cta-section/search-cta-section.component';
import { TrademarkStatusActionComponent } from '../trademark-status-action/trademark-status-action.component';
import { StatusWatchSignupComponent } from '../status-watch-signup/status-watch-signup.component';
import { DataUtils } from '../shared/services/data-util.service';


@Component({
  selector: 'app-tradmark-detail',
  imports: [SharedModule,MobileBottomNavbarComponent, SearchCtaSectionComponent, TrademarkStatusActionComponent, StatusWatchSignupComponent],
  templateUrl: './tradmark-detail.component.html',
  styleUrl: './tradmark-detail.component.scss'
})
export class TradmarkDetailComponent implements OnInit, OnDestroy {
  trademark?: ITrademark | null;
  private isBrowser = false;
  baseUrl = environment.BaseApiUrl;
  whatsappQuery:string = '';
  private faqSchemaScript!: HTMLScriptElement;
  /** State of the live registry fetch shown next to the trademark status. */
  liveStatus: 'idle' | 'fetching' | 'updated' | 'failed' = 'idle';

  /** Where the shared scraping session is, so the wait is explained rather than just spun. */
  liveStage: ScrapeStage | null = null;
  /** 0 = being fetched now, >0 = that many places back in the queue. */
  queuePosition: number | null = null;

  /**
   * The status as it stood before the refresh. Held separately from trademark.trademarkStatus
   * because that field is overwritten when the fetch lands — this is what lets the page show
   * "was Advertised → now Registered" instead of silently swapping the value.
   */
  previousStatus: string | null = null;
  /** True once a refresh has landed and it actually moved the status. */
  statusChanged = false;

  private refreshPollSub?: Subscription;
  /** Poll every 5s for up to 5 minutes — a fresh automation session needs to log in (OTP) first. */
  private static readonly POLL_INTERVAL_MS = 5000;
  private static readonly MAX_POLLS = 60;

  /**
   * Copy and progress phase per stage. Four phases rather than ten steps: the bar has to stay
   * legible on a phone, and the visitor only cares about connecting → security → sign-in →
   * fetch, not each Selenium hop.
   */
  private static readonly STAGE_INFO: Record<ScrapeStage, { label: string; phase: number }> = {
    IDLE: { label: 'Waiting for a registry session to start…', phase: 1 },
    STARTING: { label: 'Starting a secure session with the registry…', phase: 1 },
    OPENING_PORTAL: { label: 'Connecting to the IP India portal…', phase: 1 },
    SOLVING_CAPTCHA: { label: "Solving the registry's security check…", phase: 2 },
    OTP_SENT: { label: 'Security check passed — registry has sent a one-time password…', phase: 3 },
    OTP_RECEIVED: { label: 'One-time password received, signing in…', phase: 3 },
    SIGNED_IN: { label: 'Signed in to the registry…', phase: 3 },
    SEARCHING: { label: 'Looking up this application number…', phase: 4 },
    READING_RECORD: { label: 'Reading the current registry record…', phase: 4 },
    SAVING: { label: 'Saving the updated details…', phase: 4 },
  };

  readonly livePhases = [1, 2, 3, 4];



  constructor(
    private route: ActivatedRoute,
    private title: Title,
    private meta: Meta,
    private trademarkService: TrademarkService,
    private loadingService: LoadingService,
    private toastService: ToastrService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object,
    private dataUtils:DataUtils

  ) {
    this.isBrowser = isPlatformBrowser(platformId);

  }
  ngOnDestroy(): void {
    if(this.isBrowser && this.faqSchemaScript){
      document.head.removeChild(this.faqSchemaScript);
    }
    this.refreshPollSub?.unsubscribe();
  }
  ngOnInit(): void {
    if(this.isBrowser){
      this.loadingService.show();
    }
    const url = this.route.snapshot.paramMap.get('url')!;
    this.trademarkService.findBySlug(url)
      .pipe(
        tap(res => {
          this.setSeoTags(res.body);
          this.whatsappQuery = `Application Number: ${res.body?.applicationNo?.toString()}`
        }),
        finalize(() => {
          if(this.isBrowser){
            this.loadingService.hide();
          }
        })
      )
      .subscribe(res => {
         this.trademark = res.body;
         if(this.isBrowser && this.trademark?.faqs){
          this.faqSchemaScript = document.createElement('script');
          this.faqSchemaScript.type = 'application/ld+json';
          this.faqSchemaScript.text = JSON.stringify(this.dataUtils.generateFaqSchema(this.trademark.faqs));
          document.head.appendChild(this.faqSchemaScript);
         }
         this.maybeStartLiveRefresh();
        })
  }

  /** Kicks off a live registry fetch when the status is unknown or the record is older than a day. */
  private maybeStartLiveRefresh(): void {
    const applicationNo = this.trademark?.applicationNo;
    if (!this.isBrowser || !applicationNo) {
      return;
    }
    const stale =
      !this.trademark?.trademarkStatus ||
      !this.trademark?.modifiedDate ||
      this.trademark.modifiedDate.isBefore(dayjs().subtract(24, 'hour'));
    if (!stale) {
      return;
    }

    // Snapshot before anything can overwrite it, so the page can show what the status was
    // as well as what it becomes.
    this.previousStatus = this.trademark?.trademarkStatus?.trim() || null;
    this.liveStatus = 'fetching';
    this.trademarkService.requestLiveRefresh(applicationNo).subscribe({
      next: res => {
        if (res.state === 'QUEUED') {
          this.applyProgress(res.stage, res.queuePosition);
          this.pollLiveRefresh(applicationNo);
        } else {
          // FRESH (someone just refreshed it) or BUSY (queue full) — keep what we have.
          this.liveStatus = 'idle';
        }
      },
      error: () => {
        this.liveStatus = 'failed';
      },
    });
  }

  private pollLiveRefresh(applicationNo: number): void {
    this.refreshPollSub = timer(TradmarkDetailComponent.POLL_INTERVAL_MS, TradmarkDetailComponent.POLL_INTERVAL_MS)
      .pipe(
        take(TradmarkDetailComponent.MAX_POLLS),
        switchMap(() => this.trademarkService.getLiveRefreshStatus(applicationNo)),
        finalize(() => {
          if (this.liveStatus === 'fetching') {
            this.liveStatus = 'failed';
          }
        })
      )
      .subscribe(res => {
        this.applyProgress(res.stage, res.queuePosition);
        if (res.state === 'COMPLETED') {
          if (res.trademark) {
            // Keep page-only fields (faqs, slug, schema) and overlay the refreshed registry data.
            this.trademark = { ...this.trademark, ...this.trademarkService.convertDateFromServer(res.trademark) };
          }
          const fresh = this.trademark?.trademarkStatus?.trim() || null;
          this.statusChanged = !!this.previousStatus && !!fresh && this.previousStatus !== fresh;
          this.liveStatus = 'updated';
          this.liveStage = null;
          this.queuePosition = null;
          this.refreshPollSub?.unsubscribe();
        } else if (res.state === 'FAILED' || res.state === 'NOT_FOUND' || res.state === 'NONE') {
          this.liveStatus = 'failed';
          this.liveStage = null;
          this.queuePosition = null;
          this.refreshPollSub?.unsubscribe();
        }
      });
  }

  private applyProgress(stage: ScrapeStage | null | undefined, queuePosition: number | null | undefined): void {
    this.liveStage = stage ?? null;
    this.queuePosition = queuePosition ?? null;
  }

  // ── Live-progress view helpers ────────────────────────────────────────────

  /**
   * What the visitor is actually waiting on. While the session is still logging in, that is
   * the login step — it blocks everyone in the queue. Once it is signed in and working
   * through other requests, the honest answer is the queue position, not whichever record
   * it happens to be reading for somebody else.
   */
  get liveStageLabel(): string {
    const stage = this.liveStage ?? 'IDLE';
    const isLoginPhase = TradmarkDetailComponent.STAGE_INFO[stage].phase < 4;
    if (!isLoginPhase && this.queuePosition !== null && this.queuePosition > 0) {
      return this.queuePosition === 1
        ? 'Signed in — one request ahead of yours…'
        : `Signed in — ${this.queuePosition} requests ahead of yours…`;
    }
    return TradmarkDetailComponent.STAGE_INFO[stage].label;
  }

  /** 1–4, for the progress bar. Queued-behind-others stays at the sign-in phase. */
  get livePhase(): number {
    const stage = this.liveStage ?? 'IDLE';
    const phase = TradmarkDetailComponent.STAGE_INFO[stage].phase;
    if (phase === 4 && this.queuePosition !== null && this.queuePosition > 0) {
      return 3;
    }
    return phase;
  }

  /** Status to display while a refresh is in flight — the last known one, never a blank. */
  get lastKnownStatus(): string | null {
    return this.previousStatus ?? this.trademark?.trademarkStatus?.trim() ?? null;
  }
  setSeoTags(tm: ITrademark | null) {
    if(!tm) return;
      this.title.setTitle(`${tm.name || ''} Trademark Status, Class ${tm.tmClass} & Application Details`);
      this.meta.updateTag({ name: 'description', 
        content: `Check ${tm.name} trademark status, class, application number (${tm.applicationNo}), and proprietor details in India. Verify availability before filing.` });
      this.meta.updateTag({
        property: 'og:title',
        content: tm.name || `Check Trademark Status for application number: ${tm.applicationNo}`
      });

      this.meta.updateTag({
        property: 'og:description',
        content: `Check ${tm.name} trademark status, class, application number (${tm.applicationNo}), and proprietor details in India. Verify availability before filing.`
      });
      
      this.meta.updateTag({
        property: 'og:image',
        content: tm.imgUrl ? this.baseUrl + 'files/files/' + tm?.imgUrl : '/assets/images/trademark.png'
      });

      if (isPlatformBrowser(this.platformId)){
          const url = this.document.location.href;
          this.meta.updateTag({
          property: 'og:url',
          content: url
        });

      };
  }



  toggleFaq(index: number) {
    this.trademark!.faqs![index].opened = !this.trademark!.faqs![index].opened;
  }


}
