import { HttpHeaders } from '@angular/common/http';

export const environment = {
  production: false,
  BaseApiUrl: 'https://admin-test.trademarx.in',
  TrademarkImageBaseUrl: 'https://admin-test.trademarx.in/files/',
  AppHeaders: new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }),
  googleClientId: ''
};
