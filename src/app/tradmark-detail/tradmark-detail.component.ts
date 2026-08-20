import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { ActivatedRoute, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { TrademarkService } from '../shared/services/trademark.service';
import { ITrademark } from '../../models/trademark.model';
import { ToastrService } from 'ngx-toastr';
import { Subscription, switchMap, take, tap, timer } from 'rxjs';
import dayjs from 'dayjs/esm';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { MobileBottomNavbarComponent } from '../mobile-bottom-navbar/mobile-bottom-navbar.component';
import { SearchCtaSectionComponent } from '../search-cta-section/search-cta-section.component';
import { TrademarkStatusActionComponent } from '../trademark-status-action/trademark-status-action.component';
import { StatusWatchSignupComponent } from '../status-watch-signup/status-watch-signup.component';
import { DataUtils } from '../shared/services/data-util.service';
import { proprietorUrl } from '../shared/utils/proprietor-slug.util';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';
import { EmbedWidgetComponent } from '../embed-widget/embed-widget.component';


@Component({
  selector: 'app-tradmark-detail',
  imports: [SharedModule,MobileBottomNavbarComponent, SearchCtaSectionComponent, TrademarkStatusActionComponent, StatusWatchSignupComponent, SkeletonComponent, EmbedWidgetComponent],
  templateUrl: './tradmark-detail.component.html',
  styleUrl: './tradmark-detail.component.scss'
})
export class TradmarkDetailComponent implements OnInit, OnDestroy {
  trademark?: ITrademark | null;
  private isBrowser = false;

  /**
   * The applicant's own portfolio page, or the company-search hub when the recorded name is
   * unusable as a slug. Deliberately a real /trademarks-by/ URL rather than a pre-filled
   * search: it is a crawlable destination with its own content, so this link passes
   * something on instead of pointing at a query string.
   */
  get applicantPortfolioUrl(): string {
    return proprietorUrl(this.trademark?.proprietorName) ?? '/trademark-search-by-company';
  }

  baseUrl = environment.BaseApiUrl;
  whatsappQuery:string = '';
  private faqSchemaScript!: HTMLScriptElement;
  private refreshPollSub?: Subscription;
  /** Poll every 5s for up to 5 minutes — a fresh automation session needs to log in (OTP) first. */
  private static readonly POLL_INTERVAL_MS = 5000;
  private static readonly MAX_POLLS = 60;

  constructor(
    private route: ActivatedRoute,
    private title: Title,
    private meta: Meta,
    private trademarkService: TrademarkService,
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
    const url = this.route.snapshot.paramMap.get('url')!;
    this.trademarkService.findBySlug(url)
      .pipe(
        tap(res => {
          this.setSeoTags(res.body);
          this.whatsappQuery = `Application Number: ${res.body?.applicationNo?.toString()}`
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

  /**
   * Kicks off a background registry fetch when the status is unknown or the record is older
   * than a day. Nothing about it is shown to the visitor — if it lands, the status updates.
   */
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

    this.trademarkService.requestLiveRefresh(applicationNo).subscribe({
      next: res => {
        // Anything else — FRESH (someone just refreshed it) or BUSY (queue full) — leaves the
        // status we already have on screen, which is the point: the page never says it is
        // waiting on anything.
        if (res.state === 'QUEUED') {
          this.pollLiveRefresh(applicationNo);
        }
      },
      error: () => {
        // Nothing to report to the visitor; the stored status stays as it is.
      },
    });
  }

  /**
   * Polls until the priority scrape lands, then swaps the fresher registry data in. Silent by
   * design: the visitor keeps reading the stored status until there is a newer one to show,
   * and a failed or abandoned fetch simply leaves that status in place.
   */
  private pollLiveRefresh(applicationNo: number): void {
    this.refreshPollSub = timer(TradmarkDetailComponent.POLL_INTERVAL_MS, TradmarkDetailComponent.POLL_INTERVAL_MS)
      .pipe(
        take(TradmarkDetailComponent.MAX_POLLS),
        switchMap(() => this.trademarkService.getLiveRefreshStatus(applicationNo))
      )
      .subscribe(res => {
        if (res.state === 'COMPLETED') {
          if (res.trademark) {
            // Keep page-only fields (faqs, slug, schema) and overlay the refreshed registry data.
            this.trademark = { ...this.trademark, ...this.trademarkService.convertDateFromServer(res.trademark) };
          }
          this.refreshPollSub?.unsubscribe();
        } else if (res.state === 'FAILED' || res.state === 'NOT_FOUND' || res.state === 'NONE') {
          this.refreshPollSub?.unsubscribe();
        }
      });
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
