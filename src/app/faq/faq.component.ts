import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelDescription, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { trademarkFaqs } from '../enums/faqList';
import { DashboardHeaderComponent } from '../dashboard-header/dashboard-header.component';

@Component({
  selector: 'app-faq',
  imports: [MatAccordion,MatExpansionPanel,MatExpansionPanelHeader,CommonModule,MatExpansionPanelTitle, DashboardHeaderComponent],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  trademarkFaqs = trademarkFaqs;
  constructor(){
  }

}
