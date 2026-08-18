import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { SharedModule } from '../shared/shared.module';
import { TrademarkService } from '../shared/services/trademark.service';
import { SkeletonComponent } from '../shared/skeleton/skeleton.component';

interface JournalSummary {
  journalNo: number;
  count: number;
  publishedDate: string;
}

@Component({
  selector: 'app-trademark-journal-list',
  imports: [SharedModule, SkeletonComponent],
  templateUrl: './trademark-journal-list.component.html',
  styleUrl: './trademark-journal-list.component.scss',
})
export class TrademarkJournalListComponent implements OnInit {
  journals: JournalSummary[] = [];
  loading = true;
  error = false;
  currentPage = 1;
  pageSize = 20;
  totalItems = 0;
  totalPages = 0;
  pages: number[] = [];

  constructor(
    private trademarkService: TrademarkService,
    private title: Title,
    private meta: Meta,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const page = params['page'] ? +params['page'] : 1;
      this.loadJournals(page);
    });

    this.title.setTitle('Trademark Journal | Latest India Trademark Registry Publications');
    this.meta.updateTag({
      name: 'description',
      content: 'Browse the latest Trademark Registry journals published in India. View trademarks accepted and advertised for opposition in each journal.',
    });
    this.meta.updateTag({
      property: 'og:title',
      content: 'Trademark Journal | Latest India Trademark Registry Publications',
    });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Browse the latest Trademark Registry journals published in India. View trademarks accepted and advertised for opposition in each journal.',
    });
  }

  loadJournals(page: number): void {
    this.loading = true;
    this.error = false;
    this.trademarkService.getJournalSummaries({ page: page - 1, size: this.pageSize }).subscribe({
      next: res => {
        this.journals = res.body ?? [];
        this.totalItems = Number(res.headers.get('X-Total-Count')) || 0;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        this.currentPage = page;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }
}
