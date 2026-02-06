import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { DefaultTopSectionComponent } from '../deafult-top-section/default-top-section.component';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { FooterV2Component } from '../footer-v2/footer-v2.component';
import { TopHeaderComponent } from '../top-header/top-header.component';
import { NavbarV2Component } from '../navbar-v2/navbar-v2.component';

@Component({
  selector: 'app-about-us',
  imports: [DefaultTopSectionComponent,NavbarV2Component, TopHeaderComponent, FooterV2Component],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {

}
