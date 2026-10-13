import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Keeps pre-address-scope portfolio links usable without serving the former, unsafe name-only
 * aggregate. The search page can show the visitor the distinct applicant records to choose from.
 */
@Component({
  selector: 'app-legacy-proprietor-portfolio-redirect',
  standalone: true,
  template: '',
})
export class LegacyProprietorPortfolioRedirectComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const name = (this.route.snapshot.paramMap.get('slug') ?? '').replace(/-/g, ' ');
    void this.router.navigate(['/trademark-search-by-company'], {
      queryParams: name ? { name } : undefined,
      replaceUrl: true,
    });
  }
}
