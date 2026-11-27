import { HttpHeaders } from '@angular/common/http';

export const environment = {
  production: true,
  BaseApiUrl: 'https://admin.trademarx.in/',
  TrademarkImageBaseUrl: 'https://s3.eu-central-003.backblazeb2.com/trademarx-images/',
  BaseBlogUrl: 'https://cms.trademarx.in',
  BaseUrl:"https://trademarx.in",
  AppHeaders: new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }),
  recaptchaSiteKey: '6LcTLeYrAAAAACoTM9NIteBSX7ucj0ZRqDmQJF82',
  googleClientId: ''

};
