import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ITrademark } from '../../../models/trademark.model';
import { AdminScrapedTrademarkService } from '../services/admin-scraped-trademark.service';
import { environment } from '../../../environments/environment';

const PAGE_SIZE = 30;

@Component({
  selector: 'app-admin-scraped-trademarks',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-scraped-trademarks.component.html',
  styleUrl: './admin-scraped-trademarks.component.scss',
})
export class AdminScrapedTrademarksComponent implements AfterViewInit, OnDestroy {
  private readonly adminScrapedTrademarkService = inject(AdminScrapedTrademarkService);

  @ViewChild('sentinel') sentinel?: ElementRef<HTMLElement>;
  private observer?: IntersectionObserver;

  records = signal<ITrademark[]>([]);
  loading = signal(false);
  error = signal('');
  noMore = signal(false);

  ocrOnly = false;

  private cursorId: number | null = null;
  private isSentinelVisible = false;
  private readonly baseUrl = environment.BaseApiUrl;

  ngAfterViewInit(): void {
    this.loadMore();

    if (this.sentinel) {
      this.observer = new IntersectionObserver(entries => {
        this.isSentinelVisible = entries[0]?.isIntersecting ?? false;
        if (this.isSentinelVisible) {
          this.loadMore();
        }
      });
      this.observer.observe(this.sentinel.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  /**
   * Also re-triggers itself when a short page still leaves the sentinel inside the
   * viewport (e.g. a filtered result set shorter than one screen) - otherwise no further
   * IntersectionObserver callback would ever fire since the intersection state never
   * actually changes once it's already visible.
   */
  loadMore(): void {
    if (this.loading() || this.noMore()) return;

    this.loading.set(true);
    this.adminScrapedTrademarkService
      .page({
        ocrExtracted: this.ocrOnly ? true : undefined,
        cursorId: this.cursorId ?? undefined,
        limit: PAGE_SIZE,
      })
      .subscribe({
        next: page => {
          this.records.update(existing => [...existing, ...page]);
          if (page.length > 0) {
            this.cursorId = page[page.length - 1].id;
          }
          if (page.length < PAGE_SIZE) {
            this.noMore.set(true);
          }
          this.loading.set(false);
          if (this.isSentinelVisible && !this.noMore()) {
            this.loadMore();
          }
        },
        error: () => {
          this.error.set('Failed to load trademarks.');
          this.loading.set(false);
        },
      });
  }

  onOcrToggleChange(): void {
    this.records.set([]);
    this.cursorId = null;
    this.noMore.set(false);
    this.error.set('');
    this.loadMore();
  }

  imgSrc(trademark: ITrademark): string {
    return trademark.imgUrl ? this.baseUrl + 'files/' + trademark.imgUrl : '/assets/images/trademark.png';
  }
}
