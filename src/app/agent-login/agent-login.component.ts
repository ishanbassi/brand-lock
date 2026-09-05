import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../models/auth.services';
import { Login } from '../../models/login';
import { LoadingService } from '../common/loading.service';
import { DataService } from '../shared/services/data.service';
import { HostContextService } from '../shared/services/host-context.service';
import { LocalStorageService } from '../shared/services/local-storage.service';

/**
 * Sign-in for the agent portal, on its own subdomain.
 *
 * <p><b>Why this is not the main login.</b> `/login` lives inside the public layout, which wraps
 * every child in the marketing navbar, top header and footer. An IP practitioner arriving at
 * agent.trademarx.in was being shown the trademark-registration site's chrome — pricing, service
 * menus, a "Register your trademark" call to action — none of which is their product. They
 * represent other people's marks; they are not a customer filing their own.
 *
 * <p>So this is a sibling of the public layout rather than a child of it: no navbar, no footer, no
 * top header. It carries the portal's own palette so signing in and the portal itself read as one
 * product.
 *
 * <p>Deliberately not placed under `/agent-portal/**` either — that whole branch is guarded by
 * `AuthGuard` with `roles: ['ROLE_AGENT']`, so a login page inside it would be unreachable by the
 * very people who need it.
 */
@Component({
  selector: 'app-agent-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './agent-login.component.html',
  styleUrl: './agent-login.component.scss',
})
export class AgentLoginComponent implements OnInit {
  private readonly dataService = inject(DataService);
  private readonly authService = inject(AuthService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly loadingService = inject(LoadingService);
  private readonly hostContext = inject(HostContextService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  data: Login = new Login();
  showValidation = false;
  passwordFieldType: 'password' | 'text' = 'password';

  readonly error = signal('');
  readonly submitting = signal(false);

  private returnUrl = '/agent-portal/dashboard';

  ngOnInit(): void {
    this.data = new Login();

    const requested = this.route.snapshot.queryParams['returnUrl'];
    // Only ever return inside the portal. A returnUrl is attacker-controllable, and following one
    // that points elsewhere is an open redirect.
    if (typeof requested === 'string' && requested.startsWith('/agent-portal')) {
      this.returnUrl = requested;
    }

    this.title.setTitle('Agent Sign In | Trademarx');
    // The portal is private; there is nothing here for a crawler and no reason to have this page
    // competing with the public login in search results.
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  togglePassword(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  login(form: any): void {
    this.showValidation = !form.valid;
    if (!form.valid || !this.data.isValidLoginRequest(form) || this.submitting()) {
      return;
    }

    this.error.set('');
    this.submitting.set(true);
    this.loadingService.show();

    this.dataService.login(this.data.forRequest()).subscribe({
      next: response => {
        const idToken = response.body!.id_token;
        this.localStorageService.storeAuthenticationToken(idToken);
        const { id, authorities } = this.authService.decodeToken(idToken);
        this.localStorageService.setObject('user', { id, authorities });

        this.loadingService.hide();
        this.submitting.set(false);

        if (this.authService.hasRole(['ROLE_AGENT'])) {
          void this.router.navigateByUrl(this.returnUrl);
          return;
        }

        // A valid account, but not an agent one. Say so rather than bouncing them somewhere
        // confusing - a client or an admin who lands here has simply used the wrong address, and
        // silently redirecting looks like the login failed.
        this.error.set('This is the agent portal. Your account signs in on the main Trademarx site.');
      },
      error: (err: any) => {
        this.loadingService.hide();
        this.submitting.set(false);
        this.error.set(
          err?.error?.detail?.includes('Bad Credentials')
            ? 'Incorrect email or password.'
            : err?.error?.detail || 'Could not sign you in. Please try again.'
        );
      },
    });
  }

  /** Absolute link across to the main site, since a router link cannot cross an origin. */
  mainSiteUrl(path: string): string {
    return this.hostContext.urlOnMainHost(path);
  }
}
