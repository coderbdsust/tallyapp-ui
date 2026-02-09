import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';
import { CommonService } from './common.service';
import { environment } from 'src/environments/environment';
import { PageResponse } from 'src/app/common/models/page-response';
import { ApiResponse } from '../models/auth.model';
import { PurchaseOrder, PurchaseOrderListItem, PurchaseOrderPayment } from 'src/app/modules/supplier/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService extends CommonService {

  constructor(private http: HttpClient) {
    super();
  }

  public createPurchaseOrder(organizationId: string, po: any) {
    return this.http
      .post<PurchaseOrder>(`${environment.tallyURL}/purchase-order/v1/${organizationId}`, po)
      .pipe(catchError(this.mapErrorResponse));
  }

  public updatePurchaseOrder(organizationId: string, poId: string, po: any) {
    return this.http
      .put<PurchaseOrder>(`${environment.tallyURL}/purchase-order/v1/${organizationId}/${poId}`, po)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getPurchaseOrderById(organizationId: string, poId: string) {
    return this.http
      .get<PurchaseOrder>(`${environment.tallyURL}/purchase-order/v1/${organizationId}/${poId}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public listPurchaseOrders(organizationId: string, status: string, search: string, page: number, size: number) {
    let url = `${environment.tallyURL}/purchase-order/v1/${organizationId}?search=${search}&page=${page}&size=${size}`;
    if (status && status !== 'ALL') {
      url += `&status=${status}`;
    }
    return this.http
      .get<PageResponse<PurchaseOrderListItem>>(url)
      .pipe(catchError(this.mapErrorResponse));
  }

  public approvePurchaseOrder(organizationId: string, poId: string) {
    return this.http
      .put<PurchaseOrder>(`${environment.tallyURL}/purchase-order/v1/${organizationId}/${poId}/approve`, {})
      .pipe(catchError(this.mapErrorResponse));
  }

  public addPayment(organizationId: string, poId: string, payment: any) {
    return this.http
      .post<PurchaseOrderPayment>(`${environment.tallyURL}/purchase-order/v1/${organizationId}/${poId}/payment`, payment)
      .pipe(catchError(this.mapErrorResponse));
  }

  public deletePayment(organizationId: string, poId: string, paymentId: string) {
    return this.http
      .delete<ApiResponse>(`${environment.tallyURL}/purchase-order/v1/${organizationId}/${poId}/payment/${paymentId}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public cancelPurchaseOrder(organizationId: string, poId: string) {
    return this.http
      .put<ApiResponse>(`${environment.tallyURL}/purchase-order/v1/${organizationId}/${poId}/cancel`, {})
      .pipe(catchError(this.mapErrorResponse));
  }
}
