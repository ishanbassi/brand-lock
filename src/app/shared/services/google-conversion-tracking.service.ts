import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

declare let gtag: Function;

@Injectable({
  providedIn: 'root'
})
export class GoogleConversionTrackingService {
    constructor(
        private readonly router: Router,
    ){

    }

  reportSignupConversion(redirectUrl?: string): void {
    const callback = () => {
      if (redirectUrl) {
        this.router.navigateByUrl(redirectUrl);
      }
    };

    gtag('event', 'conversion', {
      send_to: 'AW-17846624059/jL2bCI7E_dsbELu-971C',
      event_callback: callback
    });

    // Fallback in case callback doesn't fire
    setTimeout(callback, 2000);
  }

  reportPurchaseConversion(
    transactionId: string,
    amount?: number,
    redirectUrl?: string
  ): void {

    let navigated = false;

    const navigate = () => {
      if (navigated) return;
      navigated = true;
      if (redirectUrl) {
        this.router.navigateByUrl(redirectUrl);
      }
    };

    gtag('event', 'conversion', {
      send_to: 'AW-17846624059/zLHtCLXC59obELu-971C',
      value: amount,
      currency: 'INR',
      transaction_id: transactionId,
      event_callback: navigate
    });

    // Fallback in case callback doesn't fire
    setTimeout(navigate, 2000);
    }

  reportClickToCall(): void {
    gtag('event', 'conversion', {
      send_to: 'AW-17846624059/AazSCNHZ0twbELu-971C'
    });
  }

}
