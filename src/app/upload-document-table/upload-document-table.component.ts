import { Component, EventEmitter, Input, OnInit, output, Output } from '@angular/core';
import { DocumentsService } from '../shared/services/documents.service';
import { DataService } from '../shared/services/data.service';
import { LoadingService } from '../common/loading.service';
import { ToastrService } from 'ngx-toastr';
import { IDocuments } from '../../models/documents.model';
import { SharedModule } from '../shared/shared.module';
import { finalize, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { DeleteDocumentPopupComponent } from '../delete-document-popup/delete-document-popup.component';
import { MatDialog } from '@angular/material/dialog';

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
      private readonly toastService:ToastrService,
      private readonly router:Router,
      public readonly dialog: MatDialog

      
    ){
  
    }
  
  
  documents?: IDocuments[] | null = [];

  baseApiUrl = environment.BaseApiUrl;
  @Input()
  documentSubject?: Observable<IDocuments[]|null>;

  @Output()
  onDocumentDeleted: EventEmitter<boolean> = new EventEmitter();


  ngOnInit(): void {
       this.documentSubject?.subscribe(val => {
      if(val){
        this.documents = val;
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
      } 
    })
  }

  deleteDocument(document: IDocuments) {
    let dialogRef = this.dialog.open(DeleteDocumentPopupComponent,
          {
            closeOnNavigation: true,
            data:document
          });
    dialogRef.afterClosed().subscribe(result => {
        console.log(result)

      if(result?.refresh){
        this.onDocumentDeleted.emit(true);
      }
      
    })
  };






}


