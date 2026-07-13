import { HttpHeaders } from '@angular/common/http';

export const environment = {
  production: false,
  BaseApiUrl: 'https://admin.trademarx.in/',
BaseBlogUrl: 'https://cms.trademarx.in',
BaseUrl:"http://localhost:4200",
  AppHeaders: new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }),
  recaptchaSiteKey: '6LcTLeYrAAAAACoTM9NIteBSX7ucj0ZRqDmQJF82'

};
