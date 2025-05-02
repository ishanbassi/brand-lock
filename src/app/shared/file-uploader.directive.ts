import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Directive({
  selector: '[appFileUploader]',
  standalone: true
})
export class FileUploaderDirective {
  private _dragging?:boolean;  
  @Output()
  draggingChange  = new EventEmitter();

  @Input()
  get dragging():boolean | undefined{
    return this._dragging;
  }

  set dragging(dragging:boolean){
    this._dragging = dragging;
    this.draggingChange.emit(dragging)
  }

  @Output()
  fileChange = new EventEmitter<FileList>();

  @HostListener('dragover',['$event'])
  onDragOver(event: DragEvent): void {
    if(!this.isFile(event)) return;
    event.preventDefault();
    event.stopPropagation();
    this.dragging = true;
  
  }
  isFile(evt:DragEvent) {
    let dt = evt.dataTransfer;
    if(!dt) return false;

    for (const element of dt.types) {
        if (element === "Files") {
            return true;
        }
    }
    return false;
  }

  @HostListener('dragleave',['$event'])
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = false;
    
    
  }

  @HostListener('drop',['$event'])
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragging = false;
    this.fileChange.emit(event.dataTransfer?.files)
    
  }
  


}
