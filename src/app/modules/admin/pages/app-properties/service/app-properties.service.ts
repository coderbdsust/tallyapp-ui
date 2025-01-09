import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppProperties } from '../app-properties.model';
import { catchError } from 'rxjs';
import { CommonService } from '../../../../auth/services/common.service';
import { environment } from 'src/environments/environment';
import { PageResponse } from 'src/app/common/models/page-response';

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
}
