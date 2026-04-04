import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { PageResponse } from 'src/app/common/models/page-response';
import { catchError } from 'rxjs';
import { ApiResponse } from '../models/auth.model';
import { CreateReturnRequest, AddReturnItemRequest, ProductReturnResponse } from '../../modules/invoice/product-return.model';

@Injectable({
  providedIn: 'root'
})
export class ProductReturnService extends CommonService {

  private baseUrl = `${environment.tallyURL}/sale-return/v1`;

  constructor(private http: HttpClient) {
    super();
  }

  public createDraftReturn(organizationId: string, customerId: string, request: CreateReturnRequest) {
    return this.http
      .post<ProductReturnResponse>(`${this.baseUrl}/${organizationId}/${customerId}`, request)
      .pipe(catchError(this.mapErrorResponse));
  }

  public addItem(organizationId: string, returnId: string, request: AddReturnItemRequest) {
    return this.http
      .post<ProductReturnResponse>(`${this.baseUrl}/${organizationId}/${returnId}/add-item`, request)
      .pipe(catchError(this.mapErrorResponse));
  }

  public removeItem(organizationId: string, returnId: string, itemId: string) {
    return this.http
      .delete<ProductReturnResponse>(`${this.baseUrl}/${organizationId}/${returnId}/remove-item/${itemId}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public approveReturn(organizationId: string, returnId: string) {
    return this.http
      .put<ProductReturnResponse>(`${this.baseUrl}/${organizationId}/${returnId}/approve`, {})
      .pipe(catchError(this.mapErrorResponse));
  }

  public deleteReturn(organizationId: string, returnId: string, reason: string) {
    return this.http
      .delete<ApiResponse>(`${this.baseUrl}/${organizationId}/${returnId}?reason=${encodeURIComponent(reason)}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getReturnsByCustomer(organizationId: string, customerId: string, page: number, size: number) {
    return this.http
      .get<PageResponse<ProductReturnResponse>>(`${this.baseUrl}/${organizationId}/${customerId}/returns?page=${page}&size=${size}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getReturnsByOrganization(organizationId: string, page: number, size: number) {
    return this.http
      .get<PageResponse<ProductReturnResponse>>(`${this.baseUrl}/${organizationId}?page=${page}&size=${size}`)
      .pipe(catchError(this.mapErrorResponse));
  }
}
