import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../modules/auth/services/auth.service';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, delay, exhaustMap, filter, finalize, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LoaderService } from '../services/loader.service';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  private refreshingToken = false;
  private tokenRefreshSubject = new BehaviorSubject<boolean>(false);

  constructor(private authService: AuthService, private router: Router, private loaderService: LoaderService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loaderService.loadingOn();

    const isAuthCall = req.url.includes('/auth/v1/login') || req.url.includes('/auth/v1/refresh-token');

    const clonedReq = req.clone({ withCredentials: true });

    return next.handle(clonedReq).pipe(
      delay(500),
      catchError((error: HttpErrorResponse) => {
        if (isAuthCall) {
          // Do NOT try to refresh on refresh call itself
          return throwError(() => error);
        }
        return this.handleError(error, clonedReq, next);
      }),
      finalize(() => this.loaderService.loadingOff()),
    );
  }

  private handleError(error: HttpErrorResponse, req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (error.status === 0 || error.error?.message?.includes('Connection refused')) {
      this.logoutAndRedirect();
    } else if (error.status === 401 && !this.refreshingToken) {
      return this.handle401Error(req, next);
    } else if (error.status === 403) {
      this.router.navigate(['/errors/403']);
    }

    return throwError(() => error);
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('🔄 Attempting token refresh');
    this.refreshingToken = true;
    this.tokenRefreshSubject.next(false);

    return this.authService.refreshToken().pipe(
      switchMap(() => {
        this.refreshingToken = false;
        this.tokenRefreshSubject.next(true);
        const retryReq = req.clone({ withCredentials: true });
        return next.handle(retryReq);
      }),
      catchError((error) => {
        console.error('Refresh failed, logging out...', error);
        this.refreshingToken = false;
        this.logoutAndRedirect();
        return throwError(() => error);
      }),
    );
  }

  private logoutAndRedirect(): void {
    this.authService.logout(); // Clear any UI-side state if needed
    this.router.navigate(['/auth/sign-in']);
  }
}
