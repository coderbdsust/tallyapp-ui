import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';
import { CashType } from '../models/cashtype.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CashtypeService extends CommonService {
  constructor(private http: HttpClient) {
    super();
  }

  // ==================== CASH-IN ====================

  public getAllCashInTypes(orgId: string) {
    return this.http
      .get<CashType[]>(`${environment.tallyURL}/cash/type/v1/${orgId}/cash-in`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public createCashInType(orgId: string, payload: any) {
    return this.http
      .post<CashType>(`${environment.tallyURL}/cash/type/v1/${orgId}/cash-in`, payload)
      .pipe(catchError(this.mapErrorResponse));
  }

  public updateCashInType(id: string, payload: any) {
    return this.http
      .put<CashType>(`${environment.tallyURL}/cash/type/v1/cash-in/${id}`, payload)
      .pipe(catchError(this.mapErrorResponse));
  }

  // ==================== CASH-OUT ====================

  public getAllCashOutTypes(orgId: string) {
    return this.http
      .get<CashType[]>(`${environment.tallyURL}/cash/type/v1/${orgId}/cash-out`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public createCashOutType(orgId: string, payload: any) {
    return this.http
      .post<CashType>(`${environment.tallyURL}/cash/type/v1/${orgId}/cash-out`, payload)
      .pipe(catchError(this.mapErrorResponse));
  }

  public updateCashOutType(id: string, payload: any) {
    return this.http
      .put<CashType>(`${environment.tallyURL}/cash/type/v1/cash-out/${id}`, payload)
      .pipe(catchError(this.mapErrorResponse));
  }

  // ==================== INITIALIZE DEFAULT TYPES ====================

  public initializeDefaultTypes(orgId: string) {
    return this.http
      .post(`${environment.tallyURL}/cash/type/v1/${orgId}/initialize`, null)
      .pipe(catchError(this.mapErrorResponse));
  }
}
