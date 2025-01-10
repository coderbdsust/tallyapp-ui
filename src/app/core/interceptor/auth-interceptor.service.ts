import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../modules/auth/services/auth.service';
import { take, exhaustMap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

  private refreshingToken : boolean = false;
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
              this.authService.logout();
            } else if (error.status === 401 && !this.refreshingToken) {
              this.refreshingToken=true;
              this.authService.refreshToken().subscribe({
                next:(authUser)=>{
                  this.refreshingToken=false;
                  this.authService.showToastSuccess(`Your token refreshed again`);
                },
                error:(error)=>{
                  this.refreshingToken=false;
                  this.authService.logout();
                  this.router.navigate(['/auth/sign-in']); 
                }
              })
            }else if (error.status === 403) {
              console.error('Permission denied:', error);
              this.router.navigate(['/errors/403']);
            }
            return throwError(() => error);
          })
        );
      }),
    );
  }
}
