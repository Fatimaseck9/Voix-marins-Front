import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './pages/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      // Récupérer le token de l'authService
      const token = this.authService.getToken();

      // Cloner la requête pour y ajouter les headers d'autorisation
      let authReq = req;
      if (token) {
          authReq = req.clone({
              setHeaders: {
                  Authorization: `Bearer ${token}`
              }
          });
      }
      
      // Passer la requête modifiée au prochain handler
      return next.handle(authReq).pipe(
          catchError((error: HttpErrorResponse) => {
              console.error('Error intercepted:', error);

              // Gestion des erreurs spécifiques (par exemple, redirection si 401)
              if (error.status === 401) {
                  this.authService.logout(); // Déconnexion de l'utilisateur
                  this.router.navigate(['/pages/login']); // Redirection vers la page de login
              }

              // Relancer l'erreur pour la gestion locale si nécessaire
              return throwError(error);
          })
      );
  }
}