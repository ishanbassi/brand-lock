import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IEmployee } from '../../../models/employee.model';
import { ApplicationConfigService } from '../../core/config/application-config.service';

/** Read-only employee list for admin "assign to" dropdowns. */
@Injectable({ providedIn: 'root' })
export class AdminEmployeeService {
  private readonly http = inject(HttpClient);
  private readonly applicationConfigService = inject(ApplicationConfigService);

  private readonly resourceUrl = this.applicationConfigService.getEndpointFor('api/admin/employees');

  query(): Observable<HttpResponse<IEmployee[]>> {
    return this.http.get<IEmployee[]>(this.resourceUrl, { observe: 'response' });
  }
}
