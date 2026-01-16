import { HttpHeaders } from '@angular/common/http';

export const environment = {
  production: true,
  BaseApiUrl: 'https://admin.trademarx.in/',
  BaseBlogUrl: 'http://localhost:1337',
  AppHeaders: new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }),
  recaptchaSiteKey: '6LcTLeYrAAAAACoTM9NIteBSX7ucj0ZRqDmQJF82'

};
