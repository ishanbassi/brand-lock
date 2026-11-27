import { HttpHeaders } from '@angular/common/http';

export const environment = {
  production: false,
  BaseApiUrl: 'http://localhost:8082/',
  // Bare trademark image keys are joined to this origin. Switch only this value to the B2
  // public endpoint now, then to images.trademarx.in when Cloudflare is introduced.
  TrademarkImageBaseUrl: 'http://localhost:8082/files/',
  BaseBlogUrl: 'https://cms.trademarx.in',
  BaseUrl:"http://localhost:4200/",
  AppHeaders: new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }),
  recaptchaSiteKey: '6LcTLeYrAAAAACoTM9NIteBSX7ucj0ZRqDmQJF82',
  // Public OAuth web-client ID. This flow does not use a Google client secret.
  googleClientId: ''
};
