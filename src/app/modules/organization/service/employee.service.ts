import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../auth/services/common.service';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';
import { Router } from '@angular/router';
import { PageResponse } from 'src/app/common/models/page-response';
import { Employee } from './model/employee.model';
import { ApiResponse } from '../../auth/services/auth.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService extends CommonService {

  constructor(private http: HttpClient, private router: Router) {
    super();
  }

  public getEmployeesByOrganization(organizationId: String, page: number, size: number, search: string) {
    return this.http
      .get<PageResponse<Employee>>(`${environment.tallyURL}/employee/v1/${organizationId}/all-employee-by-page?page=${page}&size=${size}&search=${search}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getAllEmployeesByOrganization(organizationId: String) {
    return this.http
      .get<Employee[]>(`${environment.tallyURL}/employee/v1/${organizationId}/all-employee`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getEmployeeTypes() {
    return this.http
      .get<String[]>(`${environment.tallyURL}/employee/v1/employee-type`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getEmployeeBillingTypes() {
    return this.http
      .get<String[]>(`${environment.tallyURL}/employee/v1/employee-billing-type`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getEmployeeStatus() {
    return this.http
      .get<String[]>(`${environment.tallyURL}/employee/v1/employee-status-list`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public addEmployeeToOrganization(orgId: String, employee: Employee) {
    return this.http
      .post<Employee>(`${environment.tallyURL}/employee/v1/${orgId}/add`, employee)
      .pipe(catchError(this.mapErrorResponse));
  }

  public deleteEmployee(employeeId: String) {
    return this.http
      .delete<ApiResponse>(`${environment.tallyURL}/employee/v1/${employeeId}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getExpenseTypes() {
    return this.http
      .get<string[]>(`${environment.tallyURL}/employee-expenses/v1/expense-type`)
      .pipe(catchError(this.mapErrorResponse));
  }

  
}
