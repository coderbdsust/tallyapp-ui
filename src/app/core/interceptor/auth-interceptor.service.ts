import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../modules/auth/services/auth.service';
import { take, exhaustMap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {
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

        return next.handle(modifiedReq).pipe (
          catchError((error: HttpErrorResponse) => {
            if (error.status === 0 || error.error?.message?.includes('Connection refused')) {
              // Handle connection refused or network error
              console.error('Connection refused or network error:', error);
              this.authService.logout();
              // this.router.navigate(['/auth/sign-in']); // Redirect to login page
            } else if (error.status === 401) {
              // Handle unauthorized access (e.g., token expired)
              console.error('Unauthorized access:', error);
              this.router.navigate(['/auth/sign-in']); // Redirect to login page
            }
            return throwError(() => error);
          })
        );
      }),
    );
  }
}
