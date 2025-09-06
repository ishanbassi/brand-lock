import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSidenavModule} from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { OnboardingStepperComponent } from '../onboarding-stepper/onboarding-stepper.component';


@Component({
  selector: 'app-onboarding',
  imports: [RouterModule, MatProgressBarModule, MatSidenavModule,OnboardingStepperComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss'
})
export class OnboardingComponent implements OnInit {
  matDrawerOpened: boolean = false;


  constructor(
    private readonly breakpointObserver: BreakpointObserver
  ){}
  
  ngOnInit() {
  this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.Handset])
    .subscribe(result => {
      if (result.matches) {
        this.matDrawerOpened = false;
        return;
      } 
      this.matDrawerOpened = true;
    });
}
}
