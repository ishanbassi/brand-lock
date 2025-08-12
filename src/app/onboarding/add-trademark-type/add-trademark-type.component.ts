import { Component, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TrademarkOnboardingBtnSectionComponent } from '../../trademark-onboarding-btn-section/trademark-onboarding-btn-section.component';
import { SharedModule } from '../../shared/shared.module';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TrademarkType } from '../../enumerations/trademark-type.model';
import { TrademarkService } from '../../shared/services/trademark.service';
import { LocalStorageService } from '../../shared/services/local-storage.service';
import { ILead } from '../../../models/lead.model';

@Component({
  selector: 'app-add-trademark-type',
  imports: [MatIconModule,MatButton, TrademarkOnboardingBtnSectionComponent,SharedModule, FormsModule],
  templateUrl: './add-trademark-type.component.html',
  styleUrl: './add-trademark-type.component.scss'
})
export class AddTrademarkTypeComponent implements OnInit{

  trademarkType:keyof typeof TrademarkType = TrademarkType.TRADEMARK;
  lead?:ILead
  constructor(
    private readonly router:Router,
    private readonly trademarkService: TrademarkService,
    private readonly localStorageService: LocalStorageService
  ){}
  
  ngOnInit(): void {
    this.lead = this.localStorageService.getObject('lead');
    if(!this.lead){
      this.router.navigate(['trademark-registration/step-1']);
      return
    }
    this.trademarkType = this.localStorageService.getObject('trademark')?.type || TrademarkType.TRADEMARK;
  }

  isSubmitting = false;

  submit() {
    this.isSubmitting = true;
    this.trademarkService.create({ type: this.trademarkType, lead:this.lead, id: null }).subscribe({
      next: (response) => {
        this.isSubmitting = false;
          this.router.navigate(['trademark-registration/step-3']);
          this.localStorageService.setObject('trademark', response.body);
      }})

    }

  skip() {
    this.submit();
  }


}
