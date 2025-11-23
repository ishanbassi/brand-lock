import { Component, inject, OnInit } from '@angular/core';
import { UploadDocumentComponent } from '../upload-document/upload-document.component';
import { IDocuments, NewDocuments, NewFormDocument } from '../../models/documents.model';
import { DocumentsService } from '../shared/services/documents.service';
import { DataService } from '../shared/services/data.service';
import { LoadingService } from '../common/loading.service';
import { ToastrService } from 'ngx-toastr';
import { SharedModule } from '../shared/shared.module';
import { UploadDocumentTableComponent } from '../upload-document-table/upload-document-table.component';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { DocumentsFormService } from '../shared/services/documents-form.service';
import { ReactiveFormsModule } from '@angular/forms';
import { DataUtils } from '../shared/services/data-util.service';
import { TrademarkWithLogoFormGroup } from '../shared/services/trademark-form.service';
import { ITrademark } from '../../models/trademark.model';
import { finalize, Observable, of, Subject } from 'rxjs';
import { DocumentTypeValues } from '../enumerations/document-type.model';
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-upload-document-page',
  imports: [UploadDocumentComponent, SharedModule, UploadDocumentTableComponent, MatFormField, MatOption, MatLabel, MatSelectModule, ReactiveFormsModule,MatIcon],
  templateUrl: './upload-document-page.component.html',
  styleUrl: './upload-document-page.component.scss'
})
export class UploadDocumentPageComponent implements OnInit {

  

  file: any;
  documentType: any;

  documents?: IDocuments[] | null
  applications?: ITrademark[] | null
  documentTypeValues = DocumentTypeValues;
  protected documentFormService = inject(DocumentsFormService);
  documentForm = this.documentFormService.createDocumentsFormGroup();
  resetFormSubject =  new Subject<boolean>();

  constructor(
    private readonly documentService: DocumentsService,
    private readonly dataService: DataService,
    private readonly loadingService: LoadingService,
    private readonly toastService: ToastrService,


  ) {

  }
  ngOnInit(): void {
    this.loadingService.show();
    this.dataService.getTrademarkForCurrentUser(true)
      .pipe(
        finalize(() => this.loadingService.hide())
      )
      .subscribe({
        next: (res) => {
          this.applications = res.body      
          this.setDefaultApplication(); 
        } 
      })
      this.documentFormService.addValidationsToFormAndValidate(this.documentForm);
      
  }


  onDocumentUpload(newFormDocument: NewFormDocument) {
    this.documentForm.patchValue({
      file: newFormDocument.file,
      fileContentType: newFormDocument.fileContentType,
      fileName: newFormDocument.fileName,
    })
  }

  submit() {
    this.loadingService.show();
    
    const document = this.documentFormService.getDocuments(this.documentForm) as NewDocuments;
    this.documentService.createAndSaveFile(document)
    .pipe(finalize(() => this.resetForm()))
    .subscribe({
      next:(res) => {
        this.toastService.info("Document Uploaded Successfully!");
      },
      error:(err) =>{
        this.toastService.show(err);
      }
    })
  }
  resetForm(): void {
    this.loadingService.hide();
    this.documentForm.reset();
    Object.keys(this.documentForm.controls).forEach(key => {
    const control = this.documentForm.get(key);
    control?.setErrors(null);        
    control?.markAsPristine();
    control?.markAsUntouched();
    this.resetFormSubject.next(true);
    this.documentTypeValues = DocumentTypeValues;
  });

  this.documentFormService.addValidationsToFormAndValidate(this.documentForm);
  }

  onDocumentListChange($event: IDocuments[]|null) {
    this.documents =  $event; 
    this.setDefaultApplication();
   
    
  }
  updateDocumentTypeValues() {
    this.documentTypeValues = this.documentTypeValues.map(d => {
      
      if(this.documents?.filter(d => d.trademark?.id == this.documentForm.controls.trademark.value?.id)?.some(document => document.documentType != 'OTHERS'  && document.documentType == d.value)){
        return {...d,disabled:true};
      }
      return {...d,disabled:false};
      })
  }

  setDefaultApplication(){
 if(this.applications && this.applications.length > 0){
      this.documentForm.patchValue({
        trademark:this.applications[0]
      })
        this.updateDocumentTypeValues();
    }
  }







}

