import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';


@Injectable({
  providedIn: 'root'
})
export class  MarinAuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot, 
    state: RouterStateSnapshot
  ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if (this.authService.isLoggedIn()) {
      return true;  // Utilisateur connecté, accès autorisé
    } else {
      // Redirection vers la page de login avec un paramètre pour revenir à la page demandée
      return this.router.createUrlTree(['/login-marin'], { queryParams: { returnUrl: state.url } });
    }
  }
  isLoggedIn(): boolean {
  return !!localStorage.getItem('token');
}
}
