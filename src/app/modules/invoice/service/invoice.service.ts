import { Injectable } from '@angular/core';
import { CommonService } from '../../auth/services/common.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Invoice } from '../invoice.model';
import { PageResponse } from 'src/app/common/models/page-response';
import { catchError } from 'rxjs';
import { ApiResponse } from '../../auth/services/auth.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService extends CommonService {

  constructor(private http: HttpClient, private router: Router) {
    super();
  }

  public getInvoiceByOrganization(organizationId: string, page: number, size: number, search: string, searchCriteria: string) {
      return this.http
        .get<PageResponse<Invoice>>(`${environment.tallyURL}/invoice/v1/${organizationId}?page=${page}&size=${size}&search=${search}&searchCriteria=${searchCriteria}`)
        .pipe(catchError(this.mapErrorResponse));
  }

   public getInvoiceById(organizationId: string, invoiceId:string) {
      return this.http
        .get<Invoice>(`${environment.tallyURL}/invoice/v1/${organizationId}/${invoiceId}`)
        .pipe(catchError(this.mapErrorResponse));
  }

   public createInvoice(organizationId: string) {
      return this.http
        .post<Invoice>(`${environment.tallyURL}/invoice/v1/${organizationId}/create`,"")
        .pipe(catchError(this.mapErrorResponse));
  }

  public updateInvoice(invoiceId: string, invoice:any) {
      return this.http
        .put<Invoice>(`${environment.tallyURL}/invoice/v1/${invoiceId}`,invoice)
        .pipe(catchError(this.mapErrorResponse));
  }

   public deleteInvoice(invoiceId: string) {
      return this.http
        .delete<ApiResponse>(`${environment.tallyURL}/invoice/v1/${invoiceId}`)
        .pipe(catchError(this.mapErrorResponse));
  }


}
