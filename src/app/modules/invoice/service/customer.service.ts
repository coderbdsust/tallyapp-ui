import { Injectable } from '@angular/core';
import { CommonService } from '../../auth/services/common.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Customer } from '../invoice.model';
import { PageResponse } from 'src/app/common/models/page-response';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService extends CommonService {

  constructor(private http: HttpClient, private router: Router) {
    super();
  }

  public getCustomerByOrganization(organizationId: string, page: number, size: number, search: string) {
        return this.http
          .get<PageResponse<Customer>>(`${environment.tallyURL}/customer/v1/${organizationId}?page=${page}&size=${size}&search=${search}`)
          .pipe(catchError(this.mapErrorResponse));
    }
}
