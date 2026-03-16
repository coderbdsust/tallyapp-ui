import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { CommonService } from './common.service';
import { environment } from 'src/environments/environment';
import { ArAgingReport, CashFlowStatementReport, ProfitAndLossReport, SalesByCustomerReport, TaxVatReport, TrialBalanceReport } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService extends CommonService {

  constructor(private http: HttpClient) {
    super();
  }

  // --- Data APIs ---

  public getProfitAndLoss(orgId: string, startDate: string, endDate: string) {
    return this.http
      .get<ProfitAndLossReport>(`${environment.tallyURL}/reports/v1/${orgId}/profit-and-loss`, {
        params: { startDate, endDate }
      })
      .pipe(catchError(this.mapErrorResponse));
  }

  public getTrialBalance(orgId: string, startDate: string, endDate: string) {
    return this.http
      .get<TrialBalanceReport>(`${environment.tallyURL}/reports/v1/${orgId}/trial-balance`, {
        params: { startDate, endDate }
      })
      .pipe(catchError(this.mapErrorResponse));
  }

  public getTaxVat(orgId: string, startDate: string, endDate: string) {
    return this.http
      .get<TaxVatReport>(`${environment.tallyURL}/reports/v1/${orgId}/tax-vat`, {
        params: { startDate, endDate }
      })
      .pipe(catchError(this.mapErrorResponse));
  }

  public getArAging(orgId: string) {
    return this.http
      .get<ArAgingReport>(`${environment.tallyURL}/reports/v1/${orgId}/ar-aging`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getCashFlowStatement(orgId: string, startDate: string, endDate: string) {
    return this.http
      .get<CashFlowStatementReport>(`${environment.tallyURL}/reports/v1/${orgId}/cash-flow-statement`, {
        params: { startDate, endDate }
      })
      .pipe(catchError(this.mapErrorResponse));
  }

  public getSalesByCustomer(orgId: string, startDate: string, endDate: string) {
    return this.http
      .get<SalesByCustomerReport>(`${environment.tallyURL}/reports/v1/${orgId}/sales-by-customer`, {
        params: { startDate, endDate }
      })
      .pipe(catchError(this.mapErrorResponse));
  }

  // --- PDF Download APIs ---

  public downloadProfitAndLoss(orgId: string, startDate: string, endDate: string): Observable<Blob> {
    return this.http
      .get(`${environment.tallyURL}/pdf/v1/report/${orgId}/profit-and-loss/download`, {
        params: { startDate, endDate },
        responseType: 'blob'
      })
      .pipe(catchError(this.mapErrorResponse));
  }

  public downloadTrialBalance(orgId: string, startDate: string, endDate: string): Observable<Blob> {
    return this.http
      .get(`${environment.tallyURL}/pdf/v1/report/${orgId}/trial-balance/download`, {
        params: { startDate, endDate },
        responseType: 'blob'
      })
      .pipe(catchError(this.mapErrorResponse));
  }

  public downloadTaxVat(orgId: string, startDate: string, endDate: string): Observable<Blob> {
    return this.http
      .get(`${environment.tallyURL}/pdf/v1/report/${orgId}/tax-vat/download`, {
        params: { startDate, endDate },
        responseType: 'blob'
      })
      .pipe(catchError(this.mapErrorResponse));
  }

  public downloadArAging(orgId: string): Observable<Blob> {
    return this.http
      .get(`${environment.tallyURL}/pdf/v1/report/${orgId}/ar-aging/download`, {
        responseType: 'blob'
      })
      .pipe(catchError(this.mapErrorResponse));
  }

  public downloadCashFlowStatement(orgId: string, startDate: string, endDate: string): Observable<Blob> {
    return this.http
      .get(`${environment.tallyURL}/pdf/v1/report/${orgId}/cash-flow-statement/download`, {
        params: { startDate, endDate },
        responseType: 'blob'
      })
      .pipe(catchError(this.mapErrorResponse));
  }

  public downloadSalesByCustomer(orgId: string, startDate: string, endDate: string): Observable<Blob> {
    return this.http
      .get(`${environment.tallyURL}/pdf/v1/report/${orgId}/sales-by-customer/download`, {
        params: { startDate, endDate },
        responseType: 'blob'
      })
      .pipe(catchError(this.mapErrorResponse));
  }
}
