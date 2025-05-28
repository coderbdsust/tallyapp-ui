import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { catchError, tap, BehaviorSubject, Observable, of } from 'rxjs';
import { CommonService } from './common.service';
import { Router } from '@angular/router';
import { ApiResponse, AuthUser, SignUpResponse } from './auth.model';
import { OrganizationService } from '../../organization/service/organization.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends CommonService {
  user = new BehaviorSubject<AuthUser | null | undefined>(undefined);
  user$ = this.user.asObservable();
  logoutTimer: any;

  constructor(private http: HttpClient, private router: Router, private organizationService: OrganizationService) {
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
        if (authUser != null && authUser.status === 'SUCCESS') {
          this.user.next(authUser);
        } else {
          this.user.next(null);
        }
      }),
    );
  }

   sendLoginOtp(sendLoginOtp: any) {
    return this.http.post<AuthUser>(`${environment.tallyURL}/auth/v1/send-login-otp`, sendLoginOtp).pipe(
      catchError(this.mapErrorResponse),
      tap((authUser) => {
        if (authUser != null && authUser.status === 'SUCCESS') {
          this.user.next(authUser);
        } else {
          this.user.next(null);
        }
      }),
    );
  }

  refreshToken() {    
    return this.http.post<AuthUser>(`${environment.tallyURL}/auth/v1/refresh-token`, {}).pipe(
      catchError(this.mapErrorResponse),
      tap((authUser) => {
        if (authUser != null) {
          this.user.next(authUser);
        } else {
          console.log('Invalid refreshed user');
          this.user.next(null);
        }
      }),
    );
  }


  autoLogin(): void {
    this.refreshToken().subscribe({
      next: (authUser) => {
        console.log('Session restored');
        this.user.next(authUser);
      },
      error: (err) => {
        console.warn('Refresh token invalid or expired, forcing logout');
        this.logout(); // Optional: clear state if needed
      },
    });
  }
  
  
  
  getGenderList() {
    return this.http
      .get<String[]>(`${environment.tallyURL}/auth/v1/gender-list`)
      .pipe(catchError(this.mapErrorResponse));
  }

  verifyUserAccount(verifyData: any) {
    return this.http.post(`${environment.tallyURL}/auth/v1/account-verify`, verifyData).pipe(catchError(this.mapErrorResponse));
  }

  verifyLoginOtp(verifyData: any) {
    return this.http.post<AuthUser>(`${environment.tallyURL}/auth/v1/verify-login-otp`, verifyData)
    .pipe(
      catchError(this.mapErrorResponse),
      tap((authUser) => {
        if (authUser != null && authUser.status === 'SUCCESS') {
          this.user.next(authUser);
        } else {
          this.user.next(null);
        }
      }),
    );
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
    this.organizationService.clearOrganization(); // Clear organization state if needed
    // Optionally call a backend endpoint to invalidate server-side sessions
    this.http.post(`${environment.tallyURL}/auth/v1/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {},
      error: () => {},
      complete: () => {
        this.router.navigate(['/auth/sign-in']);
      }
    });
  }
  
  private mapToAuthUser(parsedData: any): AuthUser {
    return {
      ...parsedData,
      expireTime: new Date(parsedData.expireTime),
    };
  }
}
