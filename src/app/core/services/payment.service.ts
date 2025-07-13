import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Payment } from '../../modules/invoice/invoice.model';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';
import { ApiResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService extends CommonService {

  constructor(private http: HttpClient, private router: Router) {
    super();
  }

   public addPayment(invoiceId: string, payment:Payment) {
        return this.http
          .post<Payment>(`${environment.tallyURL}/payment/v1/${invoiceId}/add`,payment)
          .pipe(catchError(this.mapErrorResponse));
    }

    public deletePayment(invoiceId:string, paymentId: string) {
        return this.http
          .delete<ApiResponse>(`${environment.tallyURL}/payment/v1/${invoiceId}/${paymentId}`)
          .pipe(catchError(this.mapErrorResponse));
    }
}
