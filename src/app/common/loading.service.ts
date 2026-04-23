import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private isBrowser = false;
  constructor(
  @Inject(PLATFORM_ID) private platformId: Object
  ){
    this.isBrowser = isPlatformBrowser(platformId);
  }

  show() {
    if(!this.isBrowser) return;
    const body = document.getElementsByTagName("body")[0];
    body.style.overflow = "hidden";
    const loading = document.getElementById("loading");
    if (!loading) {
      return;
    }
    loading.style.display = 'flex';
  }

  hide() {
    if(!this.isBrowser) return;
    const body = document.getElementsByTagName("body")[0];
    body.style.overflow = "auto";
    const loading = document.getElementById("loading");
    if (!loading) {
      return;
    }
    loading.style.display = 'none';
  }
}
