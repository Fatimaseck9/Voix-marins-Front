import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './pages/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      const token = this.authService.getToken();

      let authReq = req;
      if (token) {
          authReq = req.clone({
              setHeaders: {
                  Authorization: `Bearer ${token}`
              }
          });
      }
      
      return next.handle(authReq).pipe(
          catchError((error: HttpErrorResponse) => {
              console.error('Error intercepted:', error);

              if (error.status === 401) {
                  this.authService.logout();
                  this.router.navigate(['/login-admin']);
              }

              return throwError(error);
          })
      );
  }
}