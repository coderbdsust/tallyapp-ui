import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs';
import { CommonService } from './common.service';
import { environment } from 'src/environments/environment';
import { PageResponse } from 'src/app/common/models/page-response';
import { Supplier } from 'src/app/modules/supplier/supplier.model';

@Injectable({
  providedIn: 'root'
})
export class SupplierService extends CommonService {

  constructor(private http: HttpClient) {
    super();
  }

  public createOrUpdateSupplier(organizationId: string, supplier: Partial<Supplier>) {
    return this.http
      .post<Supplier>(`${environment.tallyURL}/supplier/v1/${organizationId}`, supplier)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getSupplierById(organizationId: string, supplierId: string) {
    return this.http
      .get<Supplier>(`${environment.tallyURL}/supplier/v1/${organizationId}/${supplierId}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public searchSuppliers(organizationId: string, search: string, page: number, size: number) {
    return this.http
      .get<PageResponse<Supplier>>(`${environment.tallyURL}/supplier/v1/${organizationId}?search=${search}&page=${page}&size=${size}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public downloadReport(organizationId: string, supplierId:string){
    return this.http.get(
      `${environment.tallyURL}/pdf/v1/supplier/${organizationId}/${supplierId}/download`,
      { responseType: 'blob' }
    ).pipe(catchError(this.mapErrorResponse));
  }
}
