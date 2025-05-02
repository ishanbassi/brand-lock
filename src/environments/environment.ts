import { HttpHeaders } from '@angular/common/http';

export const environment = {
  production: false,
  BaseApiUrl: 'http://localhost:8080',
  AppHeaders: new HttpHeaders({
    'Content-Type': 'application/json',
    Accept: 'application/json'
  })
};
