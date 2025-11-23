import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DocumentsService } from '../shared/services/documents.service';
import { DataService } from '../shared/services/data.service';
import { LoadingService } from '../common/loading.service';
import { ToastrService } from 'ngx-toastr';
import { IDocuments } from '../../models/documents.model';
import { SharedModule } from '../shared/shared.module';
import { finalize, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-upload-document-table',
  imports: [SharedModule],
  templateUrl: './upload-document-table.component.html',
  styleUrl: './upload-document-table.component.scss'
})
export class UploadDocumentTableComponent implements OnInit{

  constructor(
      private readonly documentService: DocumentsService,
      private readonly dataService:DataService,
      private readonly loadingService: LoadingService,
      private readonly toastService:ToastrService
      
    ){
  
    }
  
  
  documents?: IDocuments[] | null = [];
  @Output()
  documentsChange:EventEmitter<IDocuments[]|null> = new EventEmitter();

  @Input()
  resetFormSubject?: Observable<boolean>;

  baseApiUrl = environment.BaseApiUrl;


  ngOnInit(): void {
    this.getDocumentsForCurrentUser();
    this.resetFormSubject?.subscribe(val => {
      if(val){
        this.getDocumentsForCurrentUser();
      }
    })
    
  }
  getDocumentsForCurrentUser() {
    this.loadingService.show();
    this.documentService.getDocumentsForCurrentUser()
    .pipe(
      finalize(() => this.loadingService.hide())
    )
    .subscribe({
      next:(res) => {
        this.documents =  res.body
        this.documentsChange.emit(this.documents);
      } 
    })
  }



}


