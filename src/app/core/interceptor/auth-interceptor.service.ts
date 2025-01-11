import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../modules/auth/services/auth.service';
import { take, exhaustMap, catchError, switchMap, filter } from 'rxjs/operators';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
  private refreshingToken: boolean = false;
  private tokenRefreshSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.authService.user.pipe(
      take(1),
      exhaustMap((user) => {
        if (!user) {
          return next.handle(req);
        }

        const modifiedReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${user.accessToken}`),
        });

        return next.handle(modifiedReq).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status === 0 || error.error?.message?.includes('Connection refused')) {
              this.authService.logout();
            } else if (error.status === 401) {
              return this.handle401Error(req, next);
            } else if (error.status === 403) {
              console.error('Permission denied:', error);
              this.router.navigate(['/errors/403']);
            }
            return throwError(() => error);
          }),
        );
      }),
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.refreshingToken) {
      this.refreshingToken = true;
      this.tokenRefreshSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((authUser) => {
          this.refreshingToken = false;
          this.tokenRefreshSubject.next(authUser.accessToken);

          // Update the original request with the new token
          const modifiedReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${authUser.accessToken}`),
          });
          console.log(`Your token is refreshed`);
          return next.handle(modifiedReq);
        }),
        catchError((error) => {
          this.refreshingToken = false;
          this.authService.logout();
          this.router.navigate(['/auth/sign-in']);
          return throwError(() => error);
        }),
      );
    } else {
      // Wait until the token is refreshed
      return this.tokenRefreshSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => {
          const modifiedReq = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`),
          });
          return next.handle(modifiedReq);
        }),
      );
    }
  }
}
