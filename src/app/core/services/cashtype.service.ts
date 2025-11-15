import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';
import { CashType, CashTypeName } from '../models/cashtype.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CashtypeService extends CommonService {
  constructor(private http: HttpClient) {
    super();
  }

  public getAllCashTypeByType(orgId: string, cashType: CashTypeName) {
    return this.http
      .get<CashType[]>(`${environment.tallyURL}/cash/type/v1/${orgId}/${cashType}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public createCashType(orgId: string, payload: any) {
    return this.http
      .post<CashType>(`${environment.tallyURL}/cash/type/v1/${orgId}`, payload)
      .pipe(catchError(this.mapErrorResponse));
  }

  public updateCashType(id: string, payload: any) {
    return this.http
      .put<CashType>(`${environment.tallyURL}/cash/type/v1/${id}`, payload)
      .pipe(catchError(this.mapErrorResponse));
  }

  // ==================== INITIALIZE DEFAULT TYPES ====================

  public initializeDefaultTypes(orgId: string) {
    return this.http
      .post(`${environment.tallyURL}/cash/type/v1/${orgId}/initialize`, null)
      .pipe(catchError(this.mapErrorResponse));
  }
}
