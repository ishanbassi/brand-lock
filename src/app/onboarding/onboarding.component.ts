import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSidenavModule} from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { OnboardingStepperComponent } from '../onboarding-stepper/onboarding-stepper.component';
import { filter } from 'rxjs';


@Component({
  selector: 'app-onboarding',
  imports: [RouterModule, MatProgressBarModule, MatSidenavModule,OnboardingStepperComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss'
})
export class OnboardingComponent implements OnInit {
  matDrawerOpened: boolean = false;


  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly router:Router
  ){}
  
  ngOnInit() {
  this.breakpointObserver.observe([Breakpoints.Small, Breakpoints.Handset])
    .subscribe(result => {
      if(this.router.url.includes('select-plan') || this.router.url.includes('checkout')){
        this.matDrawerOpened = false;
        return;
      }
      if (result.matches) {
        this.matDrawerOpened = false;
        return;
      } 
      this.matDrawerOpened = true;
    });
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.router.url.includes('select-plan') || this.router.url.includes('checkout')) {
          this.matDrawerOpened = false;
          return;
        }
      });
  }
  
}
