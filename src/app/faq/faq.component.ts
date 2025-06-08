import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelDescription, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { trademarkFaqs } from '../enums/faqList';

@Component({
  selector: 'app-faq',
  imports: [MatAccordion,MatExpansionPanel,MatExpansionPanelHeader,CommonModule,MatExpansionPanelTitle],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss'
})
export class FaqComponent {
  trademarkFaqs = trademarkFaqs;
  constructor(){
  }

}
