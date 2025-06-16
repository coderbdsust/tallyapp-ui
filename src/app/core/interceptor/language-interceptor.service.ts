import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class LanguageInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const lang = localStorage.getItem('app-language') || 'en';

    const modifiedReq = req.clone({
      setHeaders: {
        'Accept-Language': lang
      }
    });

    return next.handle(modifiedReq);
  }
}
