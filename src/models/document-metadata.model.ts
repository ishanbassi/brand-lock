export class DocumentMetaData{
    fileId?:string;
    fileSize?:string | null;
    isImage?:boolean;
    previewContent?:string | ArrayBuffer | null ;
    fileName?:string | null;
    fileSizeNumber?:number | null;

    constructor(fieldId?:string, fileSize?:string | null, isImage?:boolean ,fileName?:string|null, fileSizeNumber?:number|null){
        this.fileId = fieldId;
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.isImage = isImage;
        this.fileSizeNumber = fileSizeNumber;
        

    }

    

}