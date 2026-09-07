import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';
import { IFirmFiling } from '../../models/firm-filing.model';
import { TrademarkService } from '../shared/services/trademark.service';

/**
 * "Our Recent Filings" — a moving strip of the logos this firm has actually filed with the
 * registry, drawn from our own data rather than a folder of stock client logos.
 */
@Component({
  selector: 'app-recent-filings-marquee',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recent-filings-marquee.component.html',
  styleUrl: './recent-filings-marquee.component.scss',
})
export class RecentFilingsMarqueeComponent implements OnInit {
  filings: IFirmFiling[] = [];
  loading = true;
  baseUrl = environment.BaseApiUrl;

  /** Two passes over the same filings, so the loop restarts on an identical frame. */
  marqueeRuns = [0, 1];

  /**
   * Below this the strip has too few tiles to fill the viewport and the loop reads as a stutter
   * rather than a marquee, so the whole section stays out of the page.
   */
  private readonly MIN_TILES = 6;

  private readonly SECONDS_PER_TILE = 4;

  constructor(private trademarkService: TrademarkService) {}

  ngOnInit(): void {
    this.trademarkService.firmRecentFilings(20).subscribe({
      next: filings => {
        this.filings = filings ?? [];
        this.loading = false;
      },
      // A marketing strip is not worth an error state — if the registry data is unavailable the
      // section simply does not render.
      error: () => {
        this.filings = [];
        this.loading = false;
      },
    });
  }

  get visible(): boolean {
    return this.filings.length >= this.MIN_TILES;
  }

  get marqueeDuration(): string {
    return `${this.filings.length * this.SECONDS_PER_TILE}s`;
  }

  /**
   * A handful of rows carry an img_url whose file is no longer on disk. Nothing in SQL can tell us
   * that, so the browser does: a tile whose logo 404s drops out rather than showing a broken image.
   * Hidden rather than spliced out, so both runs stay identical and the loop stays seamless.
   */
  private readonly missingLogos = new Set<string>();

  onLogoError(filing: IFirmFiling): void {
    if (filing.imgUrl) {
      this.missingLogos.add(filing.imgUrl);
    }
  }

  isMissing(filing: IFirmFiling): boolean {
    return !!filing.imgUrl && this.missingLogos.has(filing.imgUrl);
  }

  logoUrl(filing: IFirmFiling): string {
    return filing.imgUrl ? `${this.baseUrl}files/${filing.imgUrl}` : '/assets/images/trademark.png';
  }

  logoAlt(filing: IFirmFiling): string {
    const label = this.caption(filing);
    return label ? `${label} — trademark filed by Bassi & Associates` : 'Trademark filed by Bassi & Associates';
  }

  /**
   * The registry stores a device mark's name as a full description — "SRAJA with Device of Crown
   * contains Leaves". Only the wordmark in front of that is the brand, so the descriptive tail is
   * cut off; the endpoint already excludes rows with no name at all.
   */
  caption(filing: IFirmFiling): string {
    const name = filing.name?.trim() ?? '';
    const brand = name.split(/\s+(?:with|containing|contains)\s+/i)[0].trim();
    return brand || name || (filing.tmClass ? `Class ${filing.tmClass}` : `#${filing.applicationNo}`);
  }
}
