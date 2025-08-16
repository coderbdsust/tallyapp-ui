import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';
import { Router } from '@angular/router';
import { PageResponse } from 'src/app/common/models/page-response';
import { ApiResponse } from '../models/auth.model';
import { Product, ProductStatistics, UnitType } from '../models/product.model';
import { Invoice } from '../../modules/invoice/invoice.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService extends CommonService {

  constructor(private http: HttpClient, private router: Router) {
    super();
  }

  public getProductByOrganization(organizationId: String, page: number, size: number, search: string, searchCriteria: string) {
    return this.http
      .get<PageResponse<Product>>(`${environment.tallyURL}/product/v1/${organizationId}?page=${page}&size=${size}&search=${search}&searchCriteria=${searchCriteria}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getProductByOrganizationAndNameOrCode(organizationId: string, page: number, size: number, search: string) {
    return this.http
      .get<PageResponse<Product>>(`${environment.tallyURL}/product/v1/${organizationId}/list?page=${page}&size=${size}&search=${search}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getProductStatistics(organizationId: string) {
    return this.http
      .get<ProductStatistics>(`${environment.tallyURL}/product/v1/${organizationId}/statistics`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public addProduct(employeeId: String, product: Product) {
    return this.http
      .post<Product>(`${environment.tallyURL}/product/v1/${employeeId}/add`, product)
      .pipe(catchError(this.mapErrorResponse));
  }

  public editProduct(productId: String, product: Product) {
    return this.http
      .put<Product>(`${environment.tallyURL}/product/v1/${productId}`, product)
      .pipe(catchError(this.mapErrorResponse));
  }

  public deleteProduct(productId: String) {
    return this.http
      .delete<ApiResponse>(`${environment.tallyURL}/product/v1/${productId}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public getProductUnitTypes(){
    return this.http
      .get<UnitType[]>(`${environment.tallyURL}/product/v1/unit-types`)
      .pipe(catchError(this.mapErrorResponse));
  }
  
}
