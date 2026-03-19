import { Injectable } from "@angular/core";

// script-loader.service.ts
@Injectable({ providedIn: 'root' })
export class ScriptLoaderService {

  private loaded = new Set<string>();

  load(src: string): Promise<void> {
    if (this.loaded.has(src)) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.defer = true;
      script.onload = () => {
        this.loaded.add(src);
        resolve();
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }
}