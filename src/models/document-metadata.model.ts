export class DocumentMetaData{
    fileId:string;
    fileSize:string;
    isImage:boolean;
    previewContent?:string | ArrayBuffer | null ;
    fileName:string;
    fileSizeNumber:number;

    constructor(fieldId:string, fileSize:string, isImage:boolean ,fileName:string, fileSizeNumber:number){
        this.fileId = fieldId;
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.isImage = isImage;
        this.fileSizeNumber = fileSizeNumber;
        

    }

    

}