import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OnboardingNavbarComponent } from './onboarding-navbar/onboarding-navbar.component';

@Component({
  selector: 'app-onboarding',
  imports: [RouterModule,OnboardingNavbarComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss'
})
export class OnboardingComponent {

}
