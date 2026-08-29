import { Component } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ApplicationConfigService } from './core/config/application-config.service';
import { environment } from '../environments/environment';
import { ReferralAttributionService } from './shared/services/referral-attribution.service';
import { LoadingService } from './common/loading.service';
import { SeoService } from './shared/services/seo.service';

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
    private readonly referralAttributionService: ReferralAttributionService,
    private readonly loadingService: LoadingService,
    private readonly seo: SeoService
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

    // Canonical tags used to be set per-component, which meant a page had one only where somebody
    // remembered — /trademark-search, /blogs, /contact-us and /trademark-registration had none, and
    // every new page started out the same way. This applies a self-referencing canonical from the
    // route as the default; a component that calls seo.setCanonical() in ngOnInit still wins,
    // because ngOnInit runs before NavigationEnd. Registered here rather than in a route guard so
    // it covers every route, including the lazy-loaded ones.
    this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe(() => {
      this.seo.beginNavigation();
    });
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      let route = this.router.routerState.snapshot.root;
      while (route.firstChild) {
        route = route.firstChild;
      }
      // The 404/403 routes are the ones carrying a `code` in their route data. A canonical on a
      // dead URL tells a crawler the URL is real, which is the opposite of what a 404 is for.
      const isErrorPage = route.data['code'] !== undefined;
      this.seo.applyRouteCanonical(this.router.url, isErrorPage);
    });

    // Shows the global loading overlay for the duration of route navigation
    // (including lazy chunk fetch + guards/resolvers) so users don't see a
    // frozen screen while the next page loads.
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.loadingService.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.loadingService.hide();
      }
    });
  }
}
