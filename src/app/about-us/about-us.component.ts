import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { DefaultTopSectionComponent } from '../deafult-top-section/default-top-section.component';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';

@Component({
  selector: 'app-about-us',
  imports: [NavbarComponent,FooterComponent,DefaultTopSectionComponent, DashboardHeaderComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {

}
