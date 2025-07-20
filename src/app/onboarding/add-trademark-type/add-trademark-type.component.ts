import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TrademarkOnboardingBtnSectionComponent } from '../../trademark-onboarding-btn-section/trademark-onboarding-btn-section.component';
import { SharedModule } from '../../shared/shared.module';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-trademark-type',
  imports: [MatIconModule,MatButton, TrademarkOnboardingBtnSectionComponent,SharedModule, FormsModule],
  templateUrl: './add-trademark-type.component.html',
  styleUrl: './add-trademark-type.component.scss'
})
export class AddTrademarkTypeComponent {
  trademarkType = "brand-name";
  constructor(
    private readonly router:Router
  ){}

  isSubmitting = false;

  submit() {
    console.log(this.trademarkType)
    }

    skip(){
      this.router.navigateByUrl("trademark-registration/step-3")
    }

}
