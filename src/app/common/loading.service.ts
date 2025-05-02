import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {

  show() {
    const body = document.getElementsByTagName("body")[0];
    body.style.overflow = "hidden";
    const loading = document.getElementById("loading");
    if (!loading) {
      return;
    }
    loading.style.display = 'flex';
  }

  hide() {
    const body = document.getElementsByTagName("body")[0];
    body.style.overflow = "auto";
    const loading = document.getElementById("loading");
    if (!loading) {
      return;
    }
    loading.style.display = 'none';
  }
}
