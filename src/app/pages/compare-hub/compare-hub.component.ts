import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { SeoService } from '../../shared/services/seo.service';
import { COMPARISON_DATA, ComparisonPage } from '../comparison-page/comparison-data';

interface ComparisonGroup {
  category: string;
  icon: string;
  pages: ComparisonPage[];
}

@Component({
  selector: 'app-compare-hub',
  imports: [RouterLink, SlicePipe],
  templateUrl: './compare-hub.component.html',
  styleUrl: './compare-hub.component.scss',
})
export class CompareHubComponent implements OnInit, OnDestroy {
  groups: ComparisonGroup[] = [];

  private readonly CATEGORY_ICONS: Record<string, string> = {
    'IP Rights': 'fas fa-balance-scale',
    'Trademark Basics': 'fas fa-trademark',
    'Trademark Filing Strategy': 'fas fa-chess',
    'Trademark Process': 'fas fa-tasks',
    'Trademark Classes': 'fas fa-list-ol',
    'Business Registration': 'fas fa-building',
    'Export-Import': 'fas fa-ship',
    'ISO Certification': 'fas fa-award',
  };

  constructor(
    private title: Title,
    private meta: Meta,
    private seo: SeoService,
  ) {}

  ngOnInit(): void {
    const pageTitle = 'IP & Legal Comparison Guides for Indian Businesses | Trademarx';
    const desc = 'Trademark vs copyright, TM vs ® symbol, MSME vs Udyam, ISO 9001 vs 14001 — clear, expert comparison guides for every common IP and legal question.';
    const pageUrl = 'https://trademarx.in/compare';

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:title', content: pageTitle });
    this.meta.updateTag({ property: 'og:description', content: desc });
    this.meta.updateTag({ property: 'og:url', content: pageUrl });
    this.seo.setCanonical(pageUrl);

    const grouped: Record<string, ComparisonPage[]> = {};
    for (const page of Object.values(COMPARISON_DATA)) {
      if (!grouped[page.category]) grouped[page.category] = [];
      grouped[page.category].push(page);
    }

    this.groups = Object.entries(grouped).map(([category, pages]) => ({
      category,
      icon: this.CATEGORY_ICONS[category] ?? 'fas fa-question-circle',
      pages,
    }));
  }

  ngOnDestroy(): void {
    this.seo.removeCanonical();
  }
}
