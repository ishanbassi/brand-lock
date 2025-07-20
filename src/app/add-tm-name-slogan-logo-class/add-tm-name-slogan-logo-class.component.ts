import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/shared.module';
import { MatIcon } from '@angular/material/icon';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { TrademarkOnboardingBtnSectionComponent } from '../trademark-onboarding-btn-section/trademark-onboarding-btn-section.component';






@Component({
  selector: 'app-add-tm-name-slogan-logo-class',
  imports: [ReactiveFormsModule, MatInputModule, SharedModule, MatIcon, NgxFileDropModule, TrademarkOnboardingBtnSectionComponent],
  templateUrl: './add-tm-name-slogan-logo-class.component.html',
  styleUrl: './add-tm-name-slogan-logo-class.component.scss'
})
export class AddTmNameSloganLogoClassComponent {

  onClickValidation: boolean = false;
  isSubmitting: boolean = false;
  trademarkDetailsForm = new FormGroup({
    trademark: new FormControl(''),
    trademarkClass: new FormControl(''),
    trademarkLogo: new FormControl(null),
    trademarkSlogan: new FormControl(''),

  })
  submit() {
  }

  onFileSelected($event: Event) {
  }
  
  
}
