import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  imports: [SharedModule,MatProgressBarModule, MatSidenavModule,DashboardHeaderComponent],
  templateUrl: './trademark-portal.component.html',
  styleUrl: './trademark-portal.component.scss'
})
export class TrademarkPortalComponent implements OnInit{

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
        }
      });
  }

}
