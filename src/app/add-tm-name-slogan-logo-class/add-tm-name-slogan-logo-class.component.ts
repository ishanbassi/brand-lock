import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/shared.module';
import { MatIcon } from '@angular/material/icon';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { TrademarkOnboardingBtnSectionComponent } from '../trademark-onboarding-btn-section/trademark-onboarding-btn-section.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TrademarkType, TrademarkTypeList } from '../enumerations/trademark-type.model';
import { TrademarkService } from '../shared/services/trademark.service';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { ITrademark } from '../../models/trademark.model';





@Component({
  selector: 'app-add-tm-name-slogan-logo-class',
  imports: [ReactiveFormsModule, MatInputModule, SharedModule, MatIcon, NgxFileDropModule, TrademarkOnboardingBtnSectionComponent,MatError],
  templateUrl: './add-tm-name-slogan-logo-class.component.html',
  styleUrl: './add-tm-name-slogan-logo-class.component.scss'
})
export class AddTmNameSloganLogoClassComponent implements OnInit {

  onClickValidation: boolean = false;
  isSubmitting: boolean = false;
  TrademarkTypeEnum  = TrademarkType;
  trademark?:ITrademark;

  trademarkDetailsForm = new FormGroup({
    trademark: new FormControl<string | null>('', []), // will add Validators.required conditionally
    trademarkLogo: new FormControl<File | null>(null, []),
    trademarkSlogan: new FormControl<string | null>('', []),
  })

  selectedLogoFile: File | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router:Router,
    private readonly trademarkService: TrademarkService,
    private readonly localStorageService: LocalStorageService,
    ) {}

  ngOnInit(): void {
    this.trademark =  this.localStorageService.getObject('trademark');
    if(!this.trademark){
      this.router.navigate(['trademark-registration/step-2']);
    }
    
      // Set validators based on type
      const controls = this.trademarkDetailsForm.controls;
      if (this.trademark?.type === TrademarkType.TRADEMARK || this.trademark?.type === TrademarkType.TRADEMARK_WITH_IMAGE || this.trademark?.type === TrademarkType.ALL) {
        controls['trademark'].setValidators([Validators.required]);
      } else {
        controls['trademark'].clearValidators();
      }
      if (this.trademark?.type === TrademarkType.IMAGEMARK || this.trademark?.type === TrademarkType.TRADEMARK_WITH_IMAGE|| this.trademark?.type === TrademarkType.ALL) {
        controls['trademarkLogo'].setValidators([Validators.required]);
      } else {
        controls['trademarkLogo'].clearValidators();
      }
      if (this.trademark?.type === TrademarkType.SLOGAN|| this.trademark?.type === TrademarkType.ALL) {
        controls['trademarkSlogan'].setValidators([Validators.required]);
      } else {
        controls['trademarkSlogan'].clearValidators();
      }
      controls['trademark'].updateValueAndValidity();
      controls['trademarkLogo'].updateValueAndValidity();
      controls['trademarkSlogan'].updateValueAndValidity();
  }

  submit() {
    this.onClickValidation = true;
    this.isSubmitting = true;
    this.trademarkDetailsForm.markAllAsTouched();
    if (this.trademarkDetailsForm.invalid) {
      return;
    }
    const trademarkData = this.trademarkDetailsForm.value;
    this.trademarkService.partialUpdate()
    const formValue = this.trademarkDetailsForm.value;
    const formData = new FormData();
    formData.append('trademark', formValue.trademark || '');
    formData.append('trademarkSlogan', formValue.trademarkSlogan || '');
    if (this.selectedLogoFile) {
      formData.append('trademarkLogo', this.selectedLogoFile);
    }
    // TODO: send formData to backend
    this.isSubmitting = false;
  }

  skip() {
    this.router.navigate(['trademark-registration/step-4']);

    }
    

  onFileSelected($event: Event) {
    const input = $event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedLogoFile = input.files[0];
      this.trademarkDetailsForm.patchValue({ trademarkLogo: this.selectedLogoFile });
      this.trademarkDetailsForm.get('trademarkLogo')?.updateValueAndValidity();
    }
  }
  
  
}
