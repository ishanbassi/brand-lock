import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { AuthService } from '../../models/auth.services';

@Component({
  selector: 'app-footer-v2',
  imports: [SharedModule],
  templateUrl: './footer-v2.component.html',
  styleUrl: './footer-v2.component.scss'
})
export class FooterV2Component {
  private readonly isBrowser: boolean;

  constructor(
    private readonly authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  get isLoggedIn(): boolean {
    return this.isBrowser && this.authService.hasValidToken();
  }
}
