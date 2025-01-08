import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { environment } from 'src/environments/environment';
import { catchError } from 'rxjs';
import { UserProfile } from '../../user/profile/profile.model';

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
}
