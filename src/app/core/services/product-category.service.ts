import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';
import { ProductCategory } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductCategoryService extends CommonService {

  constructor(private http: HttpClient, private router: Router) {
    super();
  }

  public getProductCagegoriesByOrganization(organizationId: string) {
    return this.http
      .get<ProductCategory[]>(`${environment.tallyURL}/product/category/v1/${organizationId}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public addProductCategoryByOrganization(organizationId: string, productCategory: ProductCategory) {
    return this.http
      .post<ProductCategory>(`${environment.tallyURL}/product/category/v1/${organizationId}/add`, productCategory)
      .pipe(catchError(this.mapErrorResponse));
  }
}
