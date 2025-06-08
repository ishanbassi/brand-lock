import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { DefaultTopSectionComponent } from '../deafult-top-section/default-top-section.component';

@Component({
  selector: 'app-about-us',
  imports: [NavbarComponent,FooterComponent,DefaultTopSectionComponent],
  templateUrl: './about-us.component.html',
  styleUrl: './about-us.component.scss'
})
export class AboutUsComponent {

}
