import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppProperties } from '../app-properties.model';
import { catchError } from 'rxjs';
import { CommonService } from '../../../../auth/services/common.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppPropertiesService extends CommonService {
  constructor(private http: HttpClient) {
    super();
  }

  public getAppProperties() {
    return this.http
      .get<AppProperties[]>(`${environment.tallyURL}/app-property/v1/list`)
      .pipe(catchError(this.mapErrorResponse));
  }
}
