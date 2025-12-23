import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataService } from '../shared/services/data.service';
import { LoadingService } from '../common/loading.service';
import { ToastrService } from 'ngx-toastr';
import { IDocuments } from '../../models/documents.model';
import { DocumentsService } from '../shared/services/documents.service';

@Component({
  selector: 'app-delete-document-popup',
  templateUrl: './delete-document-popup.component.html',
  styleUrl: './delete-document-popup.component.scss',
  imports:[MatDialogContent,MatDialogClose]
})
export class DeleteDocumentPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<DeleteDocumentPopupComponent>,
    private readonly loadingService:LoadingService,
    private readonly toastService: ToastrService,
    private readonly   router:Router,
    private readonly documentService:DocumentsService,
    @Inject(MAT_DIALOG_DATA) public data: IDocuments,


  ){}

  delete() {
    this.loadingService.show();
    this.documentService.delete(this.data.id)
    .subscribe({
      next:() =>{
        this.loadingService.hide();
        this.dialogRef.close({refresh:true});
      },
      error:(err) => {
        this.loadingService.hide();
        this.toastService.error(err?.detail);
        this.dialogRef.close({refresh:false});
      },
    })
    
  }
}
