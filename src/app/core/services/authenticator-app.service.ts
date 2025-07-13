import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { catchError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse, AuthenticatorAppResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatorAppService extends CommonService{

  constructor(private http: HttpClient) {
    super();
  }

   authenticatorAppRegister() {
      return this.http
        .post<AuthenticatorAppResponse>(`${environment.tallyURL}/users/v1/authenticator/register`, {})
        .pipe(catchError(this.mapErrorResponse));
    }

    authenticatorAppTfaEnable(code:string) {
      return this.http
        .post<ApiResponse>(`${environment.tallyURL}/users/v1/authenticator/tfa-enable`, { code })
        .pipe(catchError(this.mapErrorResponse));
    }

    authenticatorAppTfaDisable(code:string) {
      return this.http
        .post<ApiResponse>(`${environment.tallyURL}/users/v1/authenticator/tfa-disable`, { code })
        .pipe(catchError(this.mapErrorResponse));
    }
}
