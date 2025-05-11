import { HttpHeaders } from '@angular/common/http';

export const environment = {
  production: true,
  BaseApiUrl: 'https://admin.trademarx.in',
  AppHeaders: new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json'
  })
};
