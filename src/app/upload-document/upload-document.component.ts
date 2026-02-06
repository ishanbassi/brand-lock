import { AfterViewInit, Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DocumentMetaData } from '../../models/document-metadata.model';
import { FormControl, ReactiveFormsModule, ɵInternalFormsSharedModule } from '@angular/forms';
import { DataUtils, FileLoadError } from '../shared/services/data-util.service';
import { DocumentsFormService } from '../shared/services/documents-form.service';
import { ToastrService } from 'ngx-toastr';
import { IDocuments, NewDocuments, NewFormDocument } from '../../models/documents.model';
import { NewRestDocuments } from '../shared/services/documents.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-upload-document',
  imports: [SharedModule, ReactiveFormsModule],
  templateUrl: './upload-document.component.html',
  styleUrl: './upload-document.component.scss'
})
export class UploadDocumentComponent implements AfterViewInit, OnInit {
  

  constructor(
    private readonly dataUtils: DataUtils,
    private readonly toastService: ToastrService,
  ) { }


  @ViewChild('fileInputEl') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('filePreviews') filePreviews!: ElementRef<HTMLDivElement>;
  @ViewChild('notification')  notification!: ElementRef<HTMLDivElement>;
  @ViewChild('uploadStats') uploadStats!: ElementRef<HTMLDivElement>;
  @ViewChild('fileCountEl') fileCountEl!: ElementRef<HTMLSpanElement>;
  @ViewChild('totalSizeEl') totalSizeEl!: ElementRef<HTMLSpanElement>;
  @ViewChild('progressFill') progressFill!: ElementRef<HTMLDivElement>;

  fileCount = 0;
  totalSize = 0;
  documentMetaData?: DocumentMetaData | null;
  protected documentFormService = inject(DocumentsFormService);
  documentForm = this.documentFormService.createDocumentsFormGroup();
  uploaded  = false;

  @Output()
  private onDocumentUpload: EventEmitter<NewFormDocument> = new EventEmitter();

  
  @Input()
  documentSubject?: BehaviorSubject<IDocuments | null>;
  
  @Input()
  resetFormSubject?: Observable<boolean>;





  allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'image/svg+xml', ''];
  maxSize = 5 * 1024 * 1024; // 5 MB
  maxFile = 1;

  ngAfterViewInit() {
  }
    ngOnInit(): void {
      
      this.documentSubject?.subscribe(doc => {
        if(doc){
          const fileId = `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          this.documentMetaData =  new DocumentMetaData(fileId,null,doc.fileContentType?.includes("image"),doc.fileName, null);
          this.downloadLogo(doc);

        }
      });
       this.resetFormSubject?.subscribe(val => {
        if(val){
          this.removeFile(this.documentMetaData!.fileId!, this.documentMetaData!.fileSizeNumber)
        }
       });
    }



  handleFiles(files: FileList) {
    this.uploaded = true;

    let validFiles = 0;
    let invalidFiles = 0;

    Array.from(files).forEach(file => {


      if (file.size > this.maxSize) {
        this.showNotification(`${file.name} is too large. Maximum file size is 5 MB.`, 'error');
        invalidFiles++;
        return;
      }

      this.displayFilePreview(file);
      validFiles++;
    });

    if (validFiles > 0) {
      this.showNotification(`${validFiles} file${validFiles !== 1 ? 's' : ''} added successfully.`, 'success');
    }

    if (invalidFiles > 0) {
      this.showNotification(`${invalidFiles} file${invalidFiles !== 1 ? 's' : ''} not added due to errors.`, 'error');
    }
  }

  displayFilePreview(file: File) {
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {

      const fileId = `file-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const fileSize = this.formatFileSize(file.size);
      const isImage = file.type.startsWith('image/');
      const previewContent = isImage ? event.target?.result : '📄';
      const fileName = file.name;

      this.documentMetaData = new DocumentMetaData(fileId, fileSize, isImage, fileName, file.size);
      this.documentMetaData.previewContent = previewContent;
      this.fileCount = 1;
      this.totalSize = file.size;
    };

    reader.readAsDataURL(file);
  }

  removeFile(fileId: string, size?: number|null) {
    this.uploaded = false;
    const fileElement = document.getElementById(fileId);
    if (fileElement) {
      fileElement.style.opacity = '0';
      fileElement.style.transform = 'scale(0.9)';

      setTimeout(() => {
        fileElement.remove();
        this.fileCount--;
        this.totalSize -= size ?? 0;
        this.documentMetaData = null;
        this.showNotification('File removed', 'success');
      }, 300);
    }

    this.documentForm.patchValue({
      file: null,
      fileContentType: null,
      fileName: null,
    })
    this.onDocumentUpload.emit(this.documentForm.value)
  }

  updateDisplay() {
    this.fileCountEl.nativeElement.textContent = this.fileCount.toString();
    this.totalSizeEl.nativeElement.textContent = this.formatFileSize(this.totalSize);

    const uploadStats = this.uploadStats.nativeElement;
    const progressFill = this.progressFill.nativeElement;

    if (this.fileCount > 0) {
      uploadStats.style.display = 'block';
      progressFill.style.width = '100%';
    } else {
      uploadStats.style.display = 'none';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  showNotification(message: string, type: 'success' | 'error') {
    const notification = this.notification.nativeElement;
    const textEl = notification.querySelector('#notificationText')!;
    const progressBar = notification.querySelector('.notification-progress') as HTMLElement;

    clearTimeout((notification as any).timeout);
    notification.classList.remove('show', 'success', 'error');
    textEl.textContent = message;
    notification.classList.add('show', type);

    progressBar.style.transition = 'none';
    progressBar.style.transform = 'scaleX(0)';
    notification.offsetWidth; // reflow
    progressBar.style.transition = 'transform 3s linear';
    progressBar.style.transform = 'scaleX(1)';

    (notification as any).timeout = setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  simulateUpload(fileCount: number) {
    const progressFill = this.progressFill.nativeElement;
    progressFill.style.width = '0%';

    setTimeout(() => {
      progressFill.style.width = '30%';
      setTimeout(() => {
        progressFill.style.width = '60%';
        setTimeout(() => {
          progressFill.style.width = '100%';
        }, 200);
      }, 200);
    }, 100);
  }

  resetFileInput() {
    this.fileInput.nativeElement.value = '';
  }

  openFilePicker(e: Event) {
    e.stopPropagation();
    this.fileInput.nativeElement.click();
  }

  onDrop(e: DragEvent, dropbox: HTMLDivElement) {
    e.preventDefault();
    dropbox.classList.remove('dragover');
    const files = e?.dataTransfer?.files;
    if (files) this.handleFiles(files);

  }
  onDragLeave(e: DragEvent, dropbox: HTMLDivElement) {
    dropbox.classList.remove('dragover');
  }
  onDragOver(e: DragEvent, dropbox: HTMLDivElement) {
    e.preventDefault();
    dropbox.classList.add('dragover')

  }
  handleFileInput(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) this.handleFiles(input.files);
    this.setFileData(event, 'file', false);
    this.uploaded = true;

  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.documentForm, field, isImage).subscribe({

      next: () => this.onDocumentUpload.emit(this.documentForm.value),
      error: (err: FileLoadError) =>
        this.toastService.error(`Error loading file: ${err.message}`),
    });
  }

  downloadLogo(document:IDocuments): void {
    const filePath = document?.fileUrl;
    if(filePath){
      this.dataUtils.downloadIcon(filePath)
      .subscribe({
        next:(val) => {
          this.uploaded = true;
          this.documentForm.controls["file"].setValue(val);
          this.documentMetaData!.previewContent = `data:${document.fileContentType};base64,${val}`;

        },
        error:() => {
        }
      });
    }
    
  }




}
