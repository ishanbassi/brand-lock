import { Component } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ApplicationConfigService } from './core/config/application-config.service';
import { environment } from '../environments/environment';
import { ReferralAttributionService } from './shared/services/referral-attribution.service';
import { LoadingService } from './common/loading.service';
import { SeoService } from './shared/services/seo.service';
import { HostContextService } from './shared/services/host-context.service';

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
    private readonly seo: SeoService,
    private readonly hostContext: HostContextService
  ){
    this.applicationConfigService.setEndpointPrefix(environment.BaseApiUrl)

    // The agent portal has its own subdomain and the two products are deliberately separate: the
    // main site sells registration to mark owners, the portal serves practitioners managing other
    // people's marks. Without this, agent.trademarx.in would also serve the marketing pages, the
    // registration flow and the member portal — the whole site duplicated on a second host, which
    // muddles the separation and gives search engines two hosts with identical content.
    //
    // Done here rather than as a guard on every public route because that list grows, and a route
    // added later would silently be served on both hosts. One check covers all of them.
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      if (!this.hostContext.isAgentHost) {
        return;
      }
      const url = this.router.url.split('?')[0];
      // Everything an agent legitimately needs on this host: the portal itself and the sign-in
      // page in front of it. Anything else belongs to the main site.
      //
      // /agent-login has to be here. It is where both mainHostGuard (bare root on this host) and
      // AuthGuard (expired session inside the portal) send an agent, and it is the one route the
      // main host actively pushes back over here via agentHostGuard. Leaving it out made those two
      // guards fight: this bounced /agent-login to trademarx.in, agentHostGuard bounced it
      // straight back, and the browser ping-ponged between the hosts forever.
      //
      // The sign-up and password routes are deliberately absent. They are children of the ''
      // route, so mainHostGuard already moves them to the main site before this ever runs, and
      // agent-login.component.html links to them there by absolute URL. Listing them here only
      // suggested they worked on this host.
      const allowed = ['/agent-portal', '/agent-login'];
      if (allowed.some(prefix => url === prefix || url.startsWith(prefix + '/'))) {
        return;
      }
      // Cross-origin, so the router cannot do it — this has to be a full page load.
      if (typeof window !== 'undefined') {
        window.location.href = this.hostContext.urlOnMainHost(window.location.pathname + window.location.search);
      }
    });

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
