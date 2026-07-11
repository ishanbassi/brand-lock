import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TrademarkService } from '../shared/services/trademark.service';

interface JournalSummary {
  journalNo: number;
  count: number;
  publishedDate: string;
}

@Component({
  selector: 'app-latest-journals',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './latest-journals.component.html',
  styleUrls: ['./latest-journals.component.scss'],
})
export class LatestJournalsComponent implements OnInit {
  journals: JournalSummary[] = [];

  constructor(private trademarkService: TrademarkService) {}

  ngOnInit(): void {
    this.trademarkService.getJournalSummaries({ page: 0, size: 4 }).subscribe({
      next: res => {
        this.journals = res.body ?? [];
      },
      error: () => {
        this.journals = [];
      },
    });
  }
}
