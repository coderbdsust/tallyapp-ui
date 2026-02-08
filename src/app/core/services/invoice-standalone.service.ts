// src/app/core/services/invoice-standalone.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import {  
  InvoiceStandalone,
  InvoiceStandaloneTableResponse,
  CreateInvoiceRequest,
  UpdateCustomerRequest,
  AddProductRequest,
  UpdateProductRequest,
  RemoveProductRequest,
  AddPaymentRequest,
  UpdatePricingRequest,
  InvoiceType,
  InvoiceStatus 
} from 'src/app/modules/invoice-standalone/invoice-standalone.model';
import { PageResponse } from 'src/app/common/models/page-response';
import { ApiResponse } from '../models/auth.model';
import { CommonService } from './common.service';
import { UnitType } from '../models/product.model';


@Injectable({
  providedIn: 'root'
})
export class InvoiceStandaloneService  extends CommonService {
  private readonly apiUrl = `${environment.tallyURL}/invoice-standalone/v1`;

  constructor(
    private http: HttpClient
  ) {
    super();
  }

  // Create Invoice
  createInvoice(request: CreateInvoiceRequest): Observable<InvoiceStandalone> {
    return this.http.post<InvoiceStandalone>(`${this.apiUrl}/create`, request)
    .pipe(catchError(this.mapErrorResponse));
  }

  // Get Invoices with pagination
  getInvoices(
    organizationId: string,
    page: number = 0,
    size: number = 10,
    search?: string,
    invoiceType?: InvoiceType
  ): Observable<PageResponse<InvoiceStandalone>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (invoiceType) {
      params = params.set('invoiceType', invoiceType);
    }

    return this.http.get<PageResponse<InvoiceStandalone>>(
      `${this.apiUrl}/${organizationId}`,
      { params }
    ).pipe(catchError(this.mapErrorResponse));
  }

  // Get Invoices for Table View
  getInvoicesForTable(
    organizationId: string,
    page: number = 0,
    size: number = 10,
    search?: string,
    invoiceType?: InvoiceType
  ): Observable<PageResponse<InvoiceStandaloneTableResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search) {
      params = params.set('search', search);
    }
    if (invoiceType) {
      params = params.set('invoiceType', invoiceType);
    }

    return this.http.get<PageResponse<InvoiceStandaloneTableResponse>>(
      `${this.apiUrl}/${organizationId}/list`,
      { params }
    ).pipe(catchError(this.mapErrorResponse));
  }

  // Get single invoice
  getInvoiceById(organizationId: string, invoiceId: string): Observable<InvoiceStandalone> {
    return this.http.get<InvoiceStandalone>(
      `${this.apiUrl}/${organizationId}/${invoiceId}`
    ).pipe(catchError(this.mapErrorResponse));
  }

  //Unit Types
  getUnitTypes(): Observable<UnitType[]> {
    return this.http.get<UnitType[]>(
      `${this.apiUrl}/unit-types`
    ).pipe(catchError(this.mapErrorResponse));
  }

  // Update Customer
  updateCustomer(invoiceId: string, request: UpdateCustomerRequest): Observable<InvoiceStandalone> {
    return this.http.put<InvoiceStandalone>(
      `${this.apiUrl}/${invoiceId}/customer`,
      request
    ).pipe(catchError(this.mapErrorResponse));
  }

  // Add Product
  addProduct(invoiceId: string, request: AddProductRequest): Observable<InvoiceStandalone> {
    return this.http.post<InvoiceStandalone>(
      `${this.apiUrl}/${invoiceId}/product`,
      request
    ).pipe(catchError(this.mapErrorResponse));
  }

  // Update Product
  updateProduct(invoiceId: string, request: UpdateProductRequest): Observable<InvoiceStandalone> {
    return this.http.put<InvoiceStandalone>(
      `${this.apiUrl}/${invoiceId}/product`,
      request
    ).pipe(catchError(this.mapErrorResponse));
  }

  // Remove Product
  removeProduct(invoiceId: string, request: RemoveProductRequest): Observable<InvoiceStandalone> {
    return this.http.request<InvoiceStandalone>(
      'delete',
      `${this.apiUrl}/${invoiceId}/product`,
      { body: request }
    ).pipe(catchError(this.mapErrorResponse));
  }

  // Add Payment
  addPayment(invoiceId: string, request: AddPaymentRequest): Observable<InvoiceStandalone> {
    return this.http.post<InvoiceStandalone>(
      `${this.apiUrl}/${invoiceId}/payment`,
      request
    ).pipe(catchError(this.mapErrorResponse));
  }

  // Remove Payment
  removePayment(invoiceId: string, paymentId: string): Observable<InvoiceStandalone> {
    return this.http.delete<InvoiceStandalone>(
      `${this.apiUrl}/${invoiceId}/payment/${paymentId}`
    ).pipe(catchError(this.mapErrorResponse));
  }

  // Update Pricing
  updatePricing(invoiceId: string, request: UpdatePricingRequest): Observable<InvoiceStandalone> {
    return this.http.put<InvoiceStandalone>(
      `${this.apiUrl}/${invoiceId}/pricing`,
      request
    ).pipe(catchError(this.mapErrorResponse));
  }

  // Convert Quotation to Bill
  convertQuotationToBill(quotationId: string): Observable<InvoiceStandalone> {
    return this.http.post<InvoiceStandalone>(
      `${this.apiUrl}/${quotationId}/convert-to-bill`,
      {}
    ).pipe(catchError(this.mapErrorResponse));
  }

  // Delete Invoice
  deleteInvoice(invoiceId: string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/${invoiceId}`)
    .pipe(catchError(this.mapErrorResponse));;
  }

  // Advanced Search
  advancedSearch(
    organizationId: string,
    customerName?: string,
    customerMobile?: string,
    productName?: string,
    invoiceType?: InvoiceType,
    invoiceStatus?: InvoiceStatus,
    fromDate?: string,
    toDate?: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<InvoiceStandalone>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (customerName) params = params.set('customerName', customerName);
    if (customerMobile) params = params.set('customerMobile', customerMobile);
    if (productName) params = params.set('productName', productName);
    if (invoiceType) params = params.set('invoiceType', invoiceType);
    if (invoiceStatus) params = params.set('invoiceStatus', invoiceStatus);
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);

    return this.http.get<PageResponse<InvoiceStandalone>>(
      `${this.apiUrl}/${organizationId}/search`,
      { params }
    ).pipe(catchError(this.mapErrorResponse));
  }

  // Download Invoice PDF
  downloadInvoice(organizationId: string, invoiceId: string): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${organizationId}/${invoiceId}/pdf/download`,
      { responseType: 'blob' }
    ).pipe(catchError(this.mapErrorResponse));
  }

}