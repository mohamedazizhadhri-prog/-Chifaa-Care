import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    try {
      const token = localStorage.getItem('auth_token');
      const isApi = req.url.startsWith(environment.apiUrl);
      if (token && isApi) {
        const authReq = req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        });
        return next.handle(authReq);
      }
    } catch {}
    return next.handle(req);
  }
}
