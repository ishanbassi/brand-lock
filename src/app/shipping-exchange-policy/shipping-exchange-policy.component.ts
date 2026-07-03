import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { DefaultTopSectionComponent } from '../deafult-top-section/default-top-section.component';

@Component({
  selector: 'app-shipping-exchange-policy',
  imports: [NavbarComponent, FooterComponent, DefaultTopSectionComponent],
  templateUrl: './shipping-exchange-policy.component.html',
  styleUrl: './shipping-exchange-policy.component.scss'
})
export class ShippingExchangePolicyComponent {

}
