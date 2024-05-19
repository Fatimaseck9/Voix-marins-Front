import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { ActionGroupService } from './actionGroup.service';

@Injectable()
export class AuthGuard implements CanActivate{
  
  
  constructor(private router: Router, private authService: AuthService /*, private actionGroupService: ActionGroupService*/) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Vérifie si l'utilisateur est connecté
    if (this.authService.isLoggedIn()) {
      const roles = route.data['roles'] as Array<string>;

      // Si des rôles sont définis dans les données de route
      if (roles) {
        // Vérifie si l'utilisateur a au moins un des rôles requis
        const userRoles = this.authService.getAccountRoles();
        const hasRole = roles.some(role => userRoles.includes(role));
        // console.log('User roles:', userRoles);
        // console.log('Required roles:', roles);
        // console.log('Has required role:', hasRole);
        if (hasRole) {
          return true;
        } else {
          // Redirige vers la page de login si l'utilisateur n'a pas les rôles requis
          this.router.navigate(['pages/login']);
          return false;
        }
      }
      
      // Si aucun rôle spécifique n'est requis, autorise l'accès
      return true;
    }

    // Redirige vers la page de login si l'utilisateur n'est pas connecté
    this.router.navigate(['pages/login']);
    return false;

    

  }

}
