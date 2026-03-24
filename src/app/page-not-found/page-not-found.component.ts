import { Component } from '@angular/core';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-page-not-found',
  imports: [NavbarComponent],
  templateUrl: './page-not-found.component.html',
  styleUrl: './page-not-found.component.scss'
})
export class PageNotFoundComponent {

}
