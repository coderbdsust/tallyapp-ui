import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Customer, CustomerDetail } from '../../modules/invoice/invoice.model';
import { PageResponse } from 'src/app/common/models/page-response';
import { environment } from 'src/environments/environment';
import { catchError, Observable } from 'rxjs';

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

  public getCustomerById(organizationId: string, customerId: string) {
    return this.http
      .get<Customer>(`${environment.tallyURL}/customer/v1/${organizationId}/${customerId}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public createCustomer(organizationId: string, customer: Partial<Customer>) {
    return this.http
      .post<Customer>(`${environment.tallyURL}/customer/v1/${organizationId}`, customer)
      .pipe(catchError(this.mapErrorResponse));
  }

  public editCustomer(organizationId: string, customerId: string, customer: Partial<Customer>) {
    return this.http
      .put<Customer>(`${environment.tallyURL}/customer/v1/${organizationId}/${customerId}`, customer)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getCustomerDetail(organizationId: string, customerId: string) {
    return this.http
      .get<CustomerDetail>(`${environment.tallyURL}/customer/v1/${organizationId}/${customerId}/detail`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public downloadCustomerReport(organizationId: string, customerId: string): Observable<Blob> {
    return this.http
      .get(`${environment.tallyURL}/pdf/v1/customer/${organizationId}/${customerId}/download`, { responseType: 'blob' })
      .pipe(catchError(this.mapErrorResponse));
  }

  public downloadAllCustomerReport(organizationId: string): Observable<Blob> {
    return this.http
      .get(`${environment.tallyURL}/pdf/v1/customer/${organizationId}/all/download`, { responseType: 'blob' })
      .pipe(catchError(this.mapErrorResponse));
  }

  public checkCustomerExists(organizationId: string, email: string, mobile: string): Observable<Customer> {
    const params: string[] = [];
    if (email) params.push(`email=${encodeURIComponent(email)}`);
    if (mobile) params.push(`mobile=${encodeURIComponent(mobile)}`);
    return this.http
      .get<Customer>(`${environment.tallyURL}/customer/v1/${organizationId}/exists?${params.join('&')}`)
      .pipe(catchError(this.mapErrorResponse));
  }
}
