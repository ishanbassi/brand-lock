import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-onboarding-navbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule,RouterModule,MatExpansionModule],
  templateUrl: './onboarding-navbar.component.html',
  styleUrl: './onboarding-navbar.component.scss'
})
export class OnboardingNavbarComponent {
panelOpenState = false;

  toggle() {
    this.panelOpenState = !this.panelOpenState;
  }


}
