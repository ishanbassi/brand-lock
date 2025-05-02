import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";

@Injectable({providedIn:'root'})
export class LoadingService{
    private document:Document
    constructor(@Inject(DOCUMENT) document: Document) {
        this.document = document;
    }

    show(){
        let loadingElem =  this.document.getElementById('loader-container');
        if(!loadingElem) return;
        loadingElem.style.display  = 'flex'
    }
    
    hide(){
        let loadingElem =  this.document.getElementById('loader-container');
        if(!loadingElem) return;
        loadingElem.style.display  = 'none'
    }
}