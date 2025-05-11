import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { DefaultTopSectionComponent } from '../deafult-top-section/default-top-section.component';

@Component({
  selector: 'app-privacy-policy',
  imports: [NavbarComponent,FooterComponent,DefaultTopSectionComponent],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent {

}
