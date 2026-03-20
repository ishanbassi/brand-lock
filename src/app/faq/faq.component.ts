import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { trademarkFaqs } from '../enums/faqList';

@Component({
  selector: 'app-faq',
  imports: [MatAccordion,MatExpansionPanel,MatExpansionPanelHeader,CommonModule,MatExpansionPanelTitle],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  @Input()
  faqs = trademarkFaqs;
  constructor(){
  }

}
