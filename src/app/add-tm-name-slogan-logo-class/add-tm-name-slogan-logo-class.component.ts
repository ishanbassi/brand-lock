import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/shared.module';
import { MatIcon } from '@angular/material/icon';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { TrademarkOnboardingBtnSectionComponent } from '../trademark-onboarding-btn-section/trademark-onboarding-btn-section.component';
import { ActivatedRoute, Router } from '@angular/router';





@Component({
  selector: 'app-add-tm-name-slogan-logo-class',
  imports: [ReactiveFormsModule, MatInputModule, SharedModule, MatIcon, NgxFileDropModule, TrademarkOnboardingBtnSectionComponent,MatError],
  templateUrl: './add-tm-name-slogan-logo-class.component.html',
  styleUrl: './add-tm-name-slogan-logo-class.component.scss'
})
export class AddTmNameSloganLogoClassComponent implements OnInit {

  onClickValidation: boolean = false;
  isSubmitting: boolean = false;
  public trademarkType: string | null = null;

  trademarkDetailsForm = new FormGroup({
    trademark: new FormControl<string | null>('', []), // will add Validators.required conditionally
    trademarkLogo: new FormControl<File | null>(null, []),
    trademarkSlogan: new FormControl<string | null>('', []),
  })

  selectedLogoFile: File | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router:Router
    ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.trademarkType = params['trademarkType'] || "all";
      if(!["brand-name", "brand-name-logo", "brand-logo","slogan", "all"].some(type => this.trademarkType == type)){
        this.trademarkType = "all"
      }
      // Set validators based on type
      const controls = this.trademarkDetailsForm.controls;
      if (this.trademarkType === 'brand-name' || this.trademarkType === 'brand-name-logo' || this.trademarkType === 'all') {
        controls['trademark'].setValidators([Validators.required]);
      } else {
        controls['trademark'].clearValidators();
      }
      if (this.trademarkType === 'brand-logo' || this.trademarkType === 'brand-name-logo' || this.trademarkType === 'all') {
        controls['trademarkLogo'].setValidators([Validators.required]);
      } else {
        controls['trademarkLogo'].clearValidators();
      }
      if (this.trademarkType === 'slogan' || this.trademarkType === 'all') {
        controls['trademarkSlogan'].setValidators([Validators.required]);
      } else {
        controls['trademarkSlogan'].clearValidators();
      }
      controls['trademark'].updateValueAndValidity();
      controls['trademarkLogo'].updateValueAndValidity();
      controls['trademarkSlogan'].updateValueAndValidity();
    });
  }

  submit() {
    this.onClickValidation = true;
    this.trademarkDetailsForm.markAllAsTouched();
    if (this.trademarkDetailsForm.invalid) {
      console.log(this.trademarkDetailsForm.get('trademark')?.hasError("required") && this.onClickValidation)
      return;
    }
    this.isSubmitting = true;
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
