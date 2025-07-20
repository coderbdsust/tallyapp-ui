import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';
import { EmployeeEarningSummary, EmployeeExpense } from '../models/employee-expense.model';

@Injectable({
  providedIn: 'root'
})
export class EmployeeExpenseService extends CommonService {

  constructor(private http: HttpClient, private router: Router) {
    super();
  }

  public createExpense(expense: any) {
    return this.http
      .post<EmployeeExpense>(`${environment.tallyURL}/employee-expenses/v1/create`, expense)
      .pipe(catchError(this.mapErrorResponse));
  }

  public approveExpense(expenseId: string, approve: any) {
    return this.http
      .post<EmployeeExpense>(`${environment.tallyURL}/employee-expenses/v1/${expenseId}/approve`, approve)
      .pipe(catchError(this.mapErrorResponse));
  }

  public rejectExpense(expenseId: string, reject: any) {
    return this.http
      .post<EmployeeExpense>(`${environment.tallyURL}/employee-expenses/v1/${expenseId}/reject`, reject)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getOrganizationExpenses(organizationId: string) {
    return this.http
      .get<EmployeeExpense[]>(`${environment.tallyURL}/employee-expenses/v1/organization/${organizationId}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getEmployeeIncomeSummary(employeeId: string, fromDate: string, toDate: string) {
    return this.http
      .get<EmployeeEarningSummary>(`${environment.tallyURL}/employee-earnings/v1/${employeeId}`, {
        params: {
          fromDate,
          toDate
        }
      })
      .pipe(catchError(this.mapErrorResponse));
  }


  public getExpenseTypes() {
    return this.http
      .get<string[]>(`${environment.tallyURL}/employee-expenses/v1/expense-type`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getIncomeReports(employeeId:string, fromDate:string, toDate:string) {
      const url = `${environment.tallyURL}/pdf/v1/income/report/${employeeId}/${fromDate}/${toDate}/download`;
      return this.http
        .get(url, {responseType: 'blob'})
        .pipe(catchError(this.mapErrorResponse));
  }

}
