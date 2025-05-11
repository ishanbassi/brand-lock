import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { DefaultTopSectionComponent } from '../deafult-top-section/default-top-section.component';

@Component({
  selector: 'app-terms-conditions',
  imports: [FooterComponent,NavbarComponent, DefaultTopSectionComponent],
  templateUrl: './terms-conditions.component.html',
  styleUrl: './terms-conditions.component.scss'
})
export class TermsConditionsComponent {

}
