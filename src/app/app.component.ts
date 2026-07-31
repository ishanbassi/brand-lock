import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ApplicationConfigService } from './core/config/application-config.service';
import { environment } from '../environments/environment';
import { ReferralAttributionService } from './shared/services/referral-attribution.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'trademarx';
  constructor(
    private readonly applicationConfigService:ApplicationConfigService,
    private readonly router: Router,
    private readonly referralAttributionService: ReferralAttributionService
  ){
    this.applicationConfigService.setEndpointPrefix(environment.BaseApiUrl)

    // Captures ?ref=CODE on every navigation regardless of which lazy-loaded
    // route matched, so a partner link can land on any page (homepage, a
    // service landing page, a blog post) and still be attributed.
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const refCode = this.router.routerState.snapshot.root.queryParamMap.get('ref');
      if (refCode) {
        this.referralAttributionService.captureFromUrl(refCode, this.router.url);
      }
    });
  }
}
