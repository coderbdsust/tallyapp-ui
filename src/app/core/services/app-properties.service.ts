import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PageResponse } from 'src/app/common/models/page-response';
import { CommonService } from 'src/app/core/services/common.service';
import { AppProperties } from 'src/app/modules/admin/pages/app-properties/app-properties.model';

@Injectable({
  providedIn: 'root',
})
export class AppPropertiesService extends CommonService {
  constructor(private http: HttpClient) {
    super();
  }

  public getAppProperties(page:number, size:number, search:string ) {
    return this.http
      .get<PageResponse<AppProperties>>(`${environment.tallyURL}/app-property/v1/list?page=${page}&size=${size}&search=${search}`)
      .pipe(catchError(this.mapErrorResponse));
  }

  public editAppProperties(appProperty: AppProperties){
    return this.http
    .put<AppProperties>(`${environment.tallyURL}/app-property/v1/edit`, appProperty)
    .pipe(catchError(this.mapErrorResponse));
  }
}
