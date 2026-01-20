import { HttpHeaders } from '@angular/common/http';

export const environment = {
  production: true,
  BaseApiUrl: 'https://admin.trademarx.in/',
  BaseBlogUrl: 'https://cms.trademarx.in/',
  AppHeaders: new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }),
  recaptchaSiteKey: '6LcTLeYrAAAAACoTM9NIteBSX7ucj0ZRqDmQJF82'

};
