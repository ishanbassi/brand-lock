import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatError, MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/shared.module';
import { MatIcon } from '@angular/material/icon';
import { NgxFileDropEntry, NgxFileDropModule } from 'ngx-file-drop';
import { TrademarkOnboardingBtnSectionComponent } from '../trademark-onboarding-btn-section/trademark-onboarding-btn-section.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TrademarkType, TrademarkTypeList } from '../enumerations/trademark-type.model';
import { PartialUpdateTrademarkWithLogo, TrademarkService } from '../shared/services/trademark.service';
import { LocalStorageService } from '../shared/services/local-storage.service';
import { ITrademark } from '../../models/trademark.model';
import { DataUtils, FileLoadError } from '../shared/services/data-util.service';
import { TrademarkFormGroup, TrademarkFormService, TrademarkWithLogoFormGroup } from '../shared/services/trademark-form.service';
import { ToastService } from '../shared/toast.service';
import { LoadingService } from '../common/loading.service';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { DocumentsFormService } from '../shared/services/documents-form.service';
import { IDocuments } from '../../models/documents.model';
import { DocumentType } from '../enumerations/document-type.model';





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
  trademark?:ITrademark|null;

  


  selectedLogoFile: File | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router:Router,
    private readonly trademarkService: TrademarkService,
    private readonly localStorageService: LocalStorageService,
    private readonly sessionStorageService: SessionStorageService,  
    private readonly dataUtils: DataUtils,
    private readonly toastService:ToastService,
    private readonly loadingService: LoadingService,
    ) {}
    protected trademarkFormService = inject(TrademarkFormService);
    protected documentFormService = inject(DocumentsFormService);

    trademarkDetailsForm: TrademarkWithLogoFormGroup = this.trademarkFormService.createTrademarkFormGroupWithLogo();


  ngOnInit(): void {
    if(this.sessionStorageService.getObject('trademark')?.id){
      this.trademarkService.find(this.sessionStorageService.getObject('trademark').id).subscribe({
        next: (response) => {
          this.trademark = response.body; 
          if(this.trademark) {
            this.updateForm(this.trademark);
          }
        }
      })
      return;
    } 
    this.router.navigate(['trademark-registration/step-2']);

    
      // Set validators based on type
      // const controls = this.trademarkDetailsForm.controls;
      // if (this.trademark?.type === TrademarkType.TRADEMARK || this.trademark?.type === TrademarkType.TRADEMARK_WITH_IMAGE || this.trademark?.type === TrademarkType.ALL) {
      //   controls['name'].setValidators([Validators.required]);
      // } else {
      //   controls['name'].clearValidators();
      // }
      // if (this.trademark?.type === TrademarkType.IMAGEMARK || this.trademark?.type === TrademarkType.TRADEMARK_WITH_IMAGE|| this.trademark?.type === TrademarkType.ALL) {
      //   controls['file'].setValidators([Validators.required]);
      //   console.log(controls['file'])
      // } else {
      //   console.log(this.trademark)

      //   controls['file'].clearValidators();
      // }
      // if (this.trademark?.type === TrademarkType.SLOGAN|| this.trademark?.type === TrademarkType.ALL) {
      //   controls['trademarkSlogan'].setValidators([Validators.required]);
      // } else {
      //   controls['trademarkSlogan'].clearValidators();
      // }
      // controls['name'].updateValueAndValidity();
      // controls['file'].updateValueAndValidity();
      // controls['trademarkSlogan'].updateValueAndValidity();
  }

  submit() {
    this.onClickValidation = true;
    this.isSubmitting = true;
    this.trademarkDetailsForm.markAllAsTouched();
    if (this.trademarkDetailsForm.invalid) {
      return;
    }
    const trademark  =this.trademarkFormService.getTrademark(this.trademarkDetailsForm.get('trademark') as FormGroup) as ITrademark;
    const document = this.documentFormService.getDocuments(this.trademarkDetailsForm.get('document') as FormGroup) as IDocuments;
    document.documentType = DocumentType.LOGO;
    document.trademark = trademark
    const trademarkDataWithLogo:PartialUpdateTrademarkWithLogo = {
      trademark,
      document,
      file:this.trademarkDetailsForm.get('file')?.value || null,
      trademarkSlogan:this.trademarkDetailsForm.get('trademarkSlogan')?.value || null

    }
    this.loadingService.show();
  
    this.trademarkService.partialUpdateWithLogo(trademarkDataWithLogo)
    .subscribe({
      next: (trademark) => {
        this.isSubmitting = false;
        this.loadingService.hide();
        this.sessionStorageService.setObject('trademark', trademark.body);
        this.router.navigate(['trademark-registration/step-4']);
      },
      error: () => {
        this.isSubmitting = false;
        this.loadingService.hide();         
      }
    })

    
    

  }

  skip() {
    this.router.navigate(['trademark-registration/step-4']);

    }
    

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.trademarkDetailsForm.get('document') as FormGroup, field, isImage, this.trademarkDetailsForm).subscribe({
      error: (err: FileLoadError) =>
        this.toastService.showError(`Error loading file: ${err.message}`),
    });
  }
  
  
  protected updateForm(trademark:ITrademark): void {
    this.trademark = trademark;
    this.trademarkFormService.resetForm(this.trademarkDetailsForm.get('trademark') as FormGroup, trademark);
  }
  
}
