import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CustomerPayment } from '../../modules/invoice/invoice.model';
import { ApiResponse } from '../models/auth.model';
import { PageResponse } from 'src/app/common/models/page-response';

@Injectable({
  providedIn: 'root'
})
export class CustomerPaymentService extends CommonService {

  constructor(private http: HttpClient) {
    super();
  }

  receivePayment(orgId: string, customerId: string, payment: any): Observable<CustomerPayment> {
    return this.http
      .post<CustomerPayment>(`${environment.tallyURL}/customer-payment/v1/${orgId}/${customerId}/receive`, payment)
      .pipe(catchError(this.mapErrorResponse));
  }

  deletePayment(orgId: string, paymentId: string, reason: string): Observable<ApiResponse> {
    return this.http
      .delete<ApiResponse>(`${environment.tallyURL}/customer-payment/v1/${orgId}/${paymentId}?reason=${encodeURIComponent(reason)}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  getPaymentHistory(orgId: string, customerId: string, page: number, size: number): Observable<PageResponse<CustomerPayment>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http
      .get<PageResponse<CustomerPayment>>(`${environment.tallyURL}/customer-payment/v1/${orgId}/${customerId}/history`, { params })
      .pipe(catchError(this.mapErrorResponse));
  }
}
