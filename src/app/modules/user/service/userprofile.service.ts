import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from '../../auth/services/common.service';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';
import { UserProfile } from '../profile/profile.model';
import { ApiResponse } from '../../auth/services/auth.model';

@Injectable({
  providedIn: 'root'
})
export class UserprofileService extends CommonService{

  constructor(private http: HttpClient) {
    super();
   }

   getUserProfile() {
      return this.http
          .get<UserProfile>(`${environment.tallyURL}/users/v1/profile`)
          .pipe(catchError(this.mapErrorResponse));
   }

   changeUserPassword(changePassword: any) {
    return this.http
      .post<ApiResponse>(`${environment.tallyURL}/users/v1/change-password`, changePassword)
      .pipe(catchError(this.mapErrorResponse));
  }
}
