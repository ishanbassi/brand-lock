import { Component, inject, OnInit } from '@angular/core';
import { PartialUpdateTrademarkWithLogo, TrademarkService } from '../shared/services/trademark.service';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../common/loading.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ITrademark } from '../../models/trademark.model';
import { TrademarkFormService, TrademarkWithLogoFormGroup } from '../shared/services/trademark-form.service';
import { Form, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { SharedModule } from '../shared/shared.module';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { DocumentsFormService } from '../shared/services/documents-form.service';
import { IDocuments, NewFormDocument } from '../../models/documents.model';
import { DataUtils } from '../shared/services/data-util.service';
import { MatOption } from '@angular/material/autocomplete';
import { DocumentType, DocumentTypeValues } from '../enumerations/document-type.model';
import { MatSelect } from '@angular/material/select';
import { UploadDocumentComponent } from '../upload-document/upload-document.component';
import { TrademarkType } from '../enumerations/trademark-type.model';
import { SessionStorageService } from '../shared/services/session-storage.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { OrganizationTypeValues } from '../enumerations/organization-type.model';
import { NgxMaskDirective } from 'ngx-mask';
import { PhoneInputComponent } from '../phone-input/phone-input.component';

@Component({
  selector: 'app-trademark-edit-page',
  imports: [ReactiveFormsModule,MatFormField, SharedModule, MatInputModule, MatInputModule, MatIcon, MatIconModule ,MatOption,MatSelect,UploadDocumentComponent,MatButton,
    PhoneInputComponent,
    NgxMaskDirective],
  templateUrl: './trademark-edit-page.component.html',
  styleUrl: './trademark-edit-page.component.scss'
})
export class TrademarkEditPageComponent implements OnInit {

  onClickValidation: boolean = false;
  organizationType: any = OrganizationTypeValues;
  isSubmitting: boolean = false;
  TrademarkTypeEnum  = TrademarkType;
  

  constructor(
    private readonly trademarkService:TrademarkService,
  
    private readonly toastService:ToastrService,
    private readonly loadingService:LoadingService,
    private readonly route: ActivatedRoute,
    private readonly dataUtils: DataUtils,
    private readonly router:Router,
    private readonly sessionStorageService: SessionStorageService,  
    
    
    

  ){}
  trademark: ITrademark | null = null;
  document?: IDocuments | null;
  protected trademarkFormService = inject(TrademarkFormService);
  protected documentFormService = inject(DocumentsFormService);
      
  
  trademarkForm: TrademarkWithLogoFormGroup = this.trademarkFormService.createTrademarkFormGroupWithLogo();
  documentSubject =  new BehaviorSubject<IDocuments|null>(null);
    
  

    ngOnInit(): void {
    this.route.data.subscribe(({ trademarkWithLogo }) => {
      this.trademark = trademarkWithLogo.trademark;
      if (trademarkWithLogo.trademark) {
        this.updateForm(trademarkWithLogo.trademark);
      }
      if (trademarkWithLogo.document) {
        this.documentSubject.next(trademarkWithLogo.document);        
        this.updateFormFromDocument(trademarkWithLogo.document);
      }

    });
    this.addValidationsToFormAndValidate(this.trademarkForm);
  }

  
  protected updateForm(trademark:ITrademark): void {
    this.trademark = trademark;
    this.trademarkFormService.resetForm(this.trademarkForm.get('trademark') as FormGroup, trademark);
  }
  protected updateFormFromDocument(document:IDocuments): void {
    this.document = document;
    this.trademarkFormService.resetForm(this.trademarkForm.get('document') as FormGroup, this.document);
    this.downloadLogo();
  }

  downloadLogo() {
    const filePath = this.document?.fileUrl;
    if(filePath){
      this.dataUtils.downloadIcon(filePath)
      .subscribe({
        next:(val) => {
          this.trademarkForm.controls["file"].setValue(val)
        },
        error:() => {
          this.loadingService.hide();
        }
      });
    }
    
  }

  submit() {
      this.onClickValidation = true;
      this.isSubmitting = true;
      this.trademarkForm.markAllAsTouched();
      if (this.trademarkForm.invalid) {
        return;
      }
      const trademark  =this.trademarkFormService.getTrademark(this.trademarkForm.get('trademark') as FormGroup) as ITrademark;

      const phoneNumber:any = this.trademarkForm.get('trademark')?.get('phoneNumber')?.value || null;
      if(phoneNumber){
        trademark.phoneNumber = phoneNumber.number;
      }
      const document = this.documentFormService.getDocuments(this.trademarkForm.get('document') as FormGroup) as IDocuments;
      document.documentType = DocumentType.LOGO;
      document.trademark = trademark
      const trademarkDataWithLogo:PartialUpdateTrademarkWithLogo = {
        trademark,
        document,
        file:this.trademarkForm.get('file')?.value || null,
        trademarkSlogan:this.trademarkForm.get('trademarkSlogan')?.value || null
  
      }
      this.loadingService.show();
  
      
      this.trademarkService.partialUpdateWithLogo(trademarkDataWithLogo)
      .subscribe({
        next: (trademark) => {
          this.isSubmitting = false;
          this.loadingService.hide();
          this.toastService.success('Trademark updated successfully');
        },
        error: () => {
          this.isSubmitting = false;
          this.loadingService.hide();         
        }
      })
  
      
      
  
    }
    onDocumentUpload(newFormDocument: NewFormDocument) {
      const documentForm = this.trademarkForm.get('document') as FormGroup;
        documentForm?.patchValue({
          file: newFormDocument.file,
          fileContentType: newFormDocument.fileContentType,
          fileName: newFormDocument.fileName,
        });
        this.trademarkForm.patchValue({
          file: newFormDocument.file,
        })
      }
      
addValidationsToFormAndValidate(form: FormGroup<any>) {
        form.get('trademark')?.get('phoneNumber')?.setValidators([Validators.required]);
        form.get('trademark')?.get('phoneNumber')?.updateValueAndValidity();


    
      }

}
