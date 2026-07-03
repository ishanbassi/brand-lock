import { Component } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { FooterComponent } from '../footer/footer.component';
import { DefaultTopSectionComponent } from '../deafult-top-section/default-top-section.component';

@Component({
  selector: 'app-cancellation-refund-policy',
  imports: [NavbarComponent, FooterComponent, DefaultTopSectionComponent],
  templateUrl: './cancellation-refund-policy.component.html',
  styleUrl: './cancellation-refund-policy.component.scss'
})
export class CancellationRefundPolicyComponent {

}
