import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';
import { CashFlowBalanceSummary, CashFlowReport, OrganizationBalance, PageCashFlowReport, Transaction } from '../models/organization-balance.model';
import { ApiResponse } from '../models/auth.model';
import { PageResponse } from 'src/app/common/models/page-response';
import { FinancialData } from '../models/journal.model';


@Injectable({
  providedIn: 'root',
})
export class AccountingService extends CommonService {
  constructor(private http: HttpClient) {
    super();
  }

  public getOrganizationBalance(organizationId: string, transactionType: string) {
    return this.http
      .get<OrganizationBalance>(`${environment.tallyURL}/accounting/v1/balance/${organizationId}`, {
        params: {
          transactionType,
        },
      })
      .pipe(catchError(this.mapErrorResponse));
  }

  public getPageCashFlowReport(
    organizationId: string,
    startDate: string | null,
    endDate: string | null,
    search: string | null,
    page: number,
    size: number,
  ) {
    let params: any = {
      page: page.toString(),
      size: size.toString(),
    };

    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (search) params.search = search;

    return this.http
      .get<PageCashFlowReport>(`${environment.tallyURL}/cash/v1/cash-flow/pageable/${organizationId}`, { params })
      .pipe(catchError(this.mapErrorResponse));
  }

  public getExpenseType() {
    return this.http
      .get<string[]>(`${environment.tallyURL}/cash/v1/expense-type`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getTransactionType() {
    return this.http
      .get<string[]>(`${environment.tallyURL}/accounting/v1/transactions/transaction-type`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public recordCashIn(cashIn: any) {
    return this.http
      .post<ApiResponse>(`${environment.tallyURL}/cash/v1/cash-in`, cashIn)
      .pipe(catchError(this.mapErrorResponse));
  }

  public recordCashOut(cashOut: any) {
    return this.http
      .post<ApiResponse>(`${environment.tallyURL}/cash/v1/cash-out`, cashOut)
      .pipe(catchError(this.mapErrorResponse));
  }

  public recordExpense(expense: any) {
    return this.http
      .post<ApiResponse>(`${environment.tallyURL}/cash/v1/expense`, expense)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getCashFlowBalanceSummary(organizationId: string) {
    return this.http
      .get<CashFlowBalanceSummary>(`${environment.tallyURL}/cash/v1/cash-flow/balance/${organizationId}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getJournalEntries(organizationId: string) {
    return this.http
      .get<FinancialData>(`${environment.tallyURL}/accounting/v1/journal/${organizationId}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getTransactionSummaryByPage(
    orgId: string,
    transactionType: string,
    startDate: string | null,
    endDate: string | null,
    page: number,
    size: number,
  ) {
    return this.http
      .get<PageResponse<Transaction>>(`${environment.tallyURL}/accounting/v1/transactions/${orgId}`, {
        params: {
          transactionType,
          startDate: startDate ? startDate : '',
          endDate: endDate ? endDate : '',
          page: page.toString(),
          size: size.toString(),
        },
      })
      .pipe(catchError(this.mapErrorResponse));
  }
}