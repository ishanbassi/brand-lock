import { Component } from '@angular/core';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';
import { FaqComponent } from '../faq/faq.component';

@Component({
  selector: 'app-faq-page',
  imports: [DashboardHeaderComponent,FaqComponent],
  templateUrl: './faq-page.component.html',
  styleUrl: './faq-page.component.scss'
})
export class FaqPageComponent {

}
