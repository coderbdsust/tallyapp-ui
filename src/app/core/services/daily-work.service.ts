import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from './common.service';
import { DailyWork } from '../models/daily-work.model';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';
import { ApiResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class DailyWorkService extends CommonService {

  constructor(private http: HttpClient, private router: Router) {
    super();
  }

  public createDailyWorkEntry(orgId: string, entryDate:string) {
      return this.http
        .post<DailyWork>(`${environment.tallyURL}/employee/daily-work/v1/${orgId}/${entryDate}/create`,{})
        .pipe(catchError(this.mapErrorResponse));
   }

   public editDailyWorkEntry(dailyWorkId: string, dailyWork:DailyWork) {
      return this.http
        .put<DailyWork>(`${environment.tallyURL}/employee/daily-work/v1/${dailyWorkId}/edit`, dailyWork)
        .pipe(catchError(this.mapErrorResponse));
   }

   public approveDailyWorkEntry(dailyWorkId: string, dailyWork: DailyWork) {
      return this.http
        .post<DailyWork>(`${environment.tallyURL}/employee/daily-work/v1/${dailyWorkId}/approve`,dailyWork)
        .pipe(catchError(this.mapErrorResponse));
   }

   public removeDailyWorkEntry(dailyWorkId: string) {
      return this.http
        .post<ApiResponse>(`${environment.tallyURL}/employee/daily-work/v1/${dailyWorkId}/remove`,{})
        .pipe(catchError(this.mapErrorResponse));
   }

    public getPendingDailyWorkEntries(orgId: string) {
      return this.http
        .get<DailyWork[]>(`${environment.tallyURL}/employee/daily-work/v1/${orgId}/pending`)
        .pipe(catchError(this.mapErrorResponse));
   }

}
