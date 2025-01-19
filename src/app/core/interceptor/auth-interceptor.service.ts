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
  private tokenRefreshSubject = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService, private router: Router, private loaderService: LoaderService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loaderService.loadingOn();
    return this.authService.user.pipe(
      take(1),
      exhaustMap((user) => {
        if (!user) {
          return next.handle(req).pipe(
            delay(1000),
            finalize(() => {
              this.loaderService.loadingOff();
            }),
          );
        }

        const modifiedReq = this.addAuthorizationHeader(req, user.accessToken);
        return next.handle(modifiedReq).pipe(
          delay(1000),
          catchError((error: HttpErrorResponse) => this.handleError(error, req, next)),
          finalize(() => {
            this.loaderService.loadingOff();
          }),
        );
      }),
    );
  }

  private addAuthorizationHeader(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  private handleError(error: HttpErrorResponse, req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (error.status === 0 || error.error?.message?.includes('Connection refused')) {
      // console.error('Connection refused, logging out...');
      this.logoutAndRedirect();
    } else if (error.status === 401 && !this.refreshingToken) {
      return this.handle401Error(req, next);
    } else if (error.status === 403) {
      // console.error('Permission denied, navigating to 403 page...');
      this.router.navigate(['/errors/403']);
    }

    return throwError(() => {
      // console.log('got error');
      // console.log(error);
      return error;
    });
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Refreshing token');
    this.refreshingToken = true;
    this.tokenRefreshSubject.next(null);

    return this.authService.refreshToken().pipe(
      switchMap((authUser) => {
        this.refreshingToken = false;
        this.tokenRefreshSubject.next(authUser.accessToken);
        console.info('Token refreshed successfully.');
        const modifiedReq = this.addAuthorizationHeader(req, authUser.accessToken);
        return next.handle(modifiedReq);
      }),
      catchError((error) => {
        console.error('Error while refreshing token, logging out...', error);
        this.refreshingToken = false;
        this.logoutAndRedirect();
        return throwError(() => error);
      }),
    );
  }

  private waitForTokenAndRetry(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.tokenRefreshSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => {
        // console.info('Retrying request with refreshed token.');
        const modifiedReq = this.addAuthorizationHeader(req, token!);
        return next.handle(modifiedReq);
      }),
      catchError((error) => {
        // console.error('Token refresh failed or timed out.', error);
        this.logoutAndRedirect();
        return throwError(() => error);
      }),
    );
  }

  private logoutAndRedirect(): void {
    this.authService.logout();
    this.router.navigate(['/auth/sign-in']);
  }
}
