import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { catchError, tap, BehaviorSubject, Observable } from 'rxjs';
import { CommonService } from './common.service';
import { Router } from '@angular/router';
import { ApiResponse, AuthUser, SignUpResponse } from './auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends CommonService {
  user = new BehaviorSubject<AuthUser | null>(null);
  user$ = this.user.asObservable();
  logoutTimer: any;

  constructor(private http: HttpClient, private router: Router) {
    super();
  }

  signUp(signUpData: any) {
    return this.http
      .post<SignUpResponse>(`${environment.tallyURL}/auth/v1/register`, signUpData)
      .pipe(catchError(this.mapErrorResponse));
  }

  signIn(signInData: any) {
    return this.http.post<AuthUser>(`${environment.tallyURL}/auth/v1/login`, signInData).pipe(
      catchError(this.mapErrorResponse),
      tap((authUser) => {
        const payload = this.decodeToken(authUser.accessToken);
        if (payload != null) {
          authUser.expireTime = new Date(payload.exp * 1000);
          authUser.fullName = payload.fullName || '';
          authUser.username = payload.sub || '';
          authUser.email = payload.email || '';
          authUser.role = payload?.authorities?.[0] || '';
          localStorage.setItem(environment.TALLY_APP, JSON.stringify(authUser));
          
          let expireDuration = authUser.expireTime.getTime()-new Date().getTime();
          //this.autoLogout(expireDuration);
          this.user.next(authUser);
        } else {
          this.user.next(null);
        }
      }),
    );
  }

  refreshToken() {
    const userData = localStorage.getItem(environment.TALLY_APP);
    let refreshToken;
    if (!userData) {
      refreshToken = {};
    }else{
      const cachedAuthUser: AuthUser = this.mapToAuthUser(JSON.parse(userData));
      refreshToken = {refreshToken: cachedAuthUser.refreshToken};
    }
    
    return this.http.post<AuthUser>(`${environment.tallyURL}/auth/v1/refresh-token`, refreshToken).pipe(
      catchError(this.mapErrorResponse),
      tap((authUser) => {
        const payload = this.decodeToken(authUser.accessToken);
        if (payload != null) {
          authUser.expireTime = new Date(payload.exp * 1000);
          authUser.fullName = payload.fullName || '';
          authUser.username = payload.sub || '';
          authUser.email = payload.email || '';
          authUser.role = payload?.authorities?.[0] || '';
          localStorage.setItem(environment.TALLY_APP, JSON.stringify(authUser));
          
          let expireDuration = authUser.expireTime.getTime()-new Date().getTime();
          //this.autoLogout(expireDuration);
          this.user.next(authUser);
        } else {
          console.log('invalid refreshed user');
          this.user.next(null);
        }
      }),
    );
  }

  verifyUser(verifyData: any) {
    return this.http.post(`${environment.tallyURL}/auth/v1/verify`, verifyData).pipe(catchError(this.mapErrorResponse));
  }

  resendAccountVerificationOTP(username:any) {
    return this.http
    .post<ApiResponse>(`${environment.tallyURL}/auth/v1/resend-account-verification-otp`, username)
    .pipe(catchError(this.mapErrorResponse));
  }

  forgotPasswordByEmail(email:any) {
    return this.http
    .post<ApiResponse>(`${environment.tallyURL}/auth/v1/forgot-password-by-email`, email)
    .pipe(catchError(this.mapErrorResponse));
  }

  forgotPasswordOTPValidityByEmail(emailWIthOTP:any) {
    return this.http
    .post<ApiResponse>(`${environment.tallyURL}/auth/v1/forgot-password-otp-validity`, emailWIthOTP)
    .pipe(catchError(this.mapErrorResponse));
  }

  resetPasswordWithEmail(resetPassword:any) {
    return this.http
    .post<ApiResponse>(`${environment.tallyURL}/auth/v1/reset-password`, resetPassword)
    .pipe(catchError(this.mapErrorResponse));
  }

  logout() {
    this.user.next(null);
    localStorage.removeItem(environment.TALLY_APP);
    location.reload();
    this.showToastSuccess('Logout successfully');
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    this.logoutTimer = null;
  }

  autoLogin() {
    const userData = localStorage.getItem(environment.TALLY_APP);
    if (!userData) return;
    const cachedAuthUser: AuthUser = this.mapToAuthUser(JSON.parse(userData));
    let expireDuration = cachedAuthUser.expireTime.getTime()-new Date().getTime();
   // this.autoLogout(expireDuration);
    this.user.next(cachedAuthUser);
  }

  // autoLogout(duration: number) {
  //   this.logoutTimer = setTimeout(() => {
  //     this.logout();
  //   }, duration);
  // }

  private mapToAuthUser(parsedData: any): AuthUser {
    return {
      ...parsedData,
      expireTime: new Date(parsedData.expireTime),
    };
  }
}
