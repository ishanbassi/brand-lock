import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import {MatMenuModule} from '@angular/material/menu';
import { SharedModule } from '../shared/shared.module';
import { AuthService } from '../../models/auth.services';
import { IUser } from '../../models/user.model';
import { IUserProfile } from '../../models/user-profile.model';


@Component({
  selector: 'app-dashboard-header',
    imports: [MatToolbarModule, MatButtonModule, MatIconModule,RouterModule,MatExpansionModule, MatMenuModule,SharedModule],
  templateUrl: './dashboard-header.component.html',
  styleUrl: './dashboard-header.component.scss'
})
export class DashboardHeaderComponent implements OnInit {

  userProfile?:IUser|null;
  isAuthorizedUser: any;


  constructor(
    private readonly router:Router,
    private readonly authService:AuthService

  ){}
  
  ngOnInit(): void {
    this.isAuthorizedUser = this.authService.isAuthorizedUser(['ROLE_USER', 'ROLE_ADMIN']).hasRoleAccess;
    if(this.isAuthorizedUser){  
      this.userProfile = this.authService.getUser();
    }

  }


  panelOpenState = false;

  toggle() {
    this.panelOpenState = !this.panelOpenState;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);

  }

}
