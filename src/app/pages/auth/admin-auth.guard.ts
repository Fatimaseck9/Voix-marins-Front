import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root' // ✅ Ajouté pour résoudre l'erreur d'injection
})
export class AdminAuthGuard implements CanActivate {
  
  constructor(private router: Router, private authService: AuthService /*, private actionGroupService: ActionGroupService*/) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AdminAuthGuard - Vérification de l\'accès à:', state.url);
    
    // Vérifie si l'utilisateur est connecté
    if (this.authService.isLoggedIn()) {
      console.log('Utilisateur connecté, vérification du token...');
      const token = this.authService.getToken();
      try {
        const decodedToken: any = jwtDecode(token);
        console.log('Token décodé:', decodedToken);
        
        // Vérifie si le compte est actif
        if (!decodedToken.isActive) {
          console.log('Compte inactif, redirection vers change-password');
          this.router.navigate(['/change-password']);
          return false;
        }

        console.log('Compte actif, vérification des rôles...');
        const roles = route.data['roles'] as Array<string>;

        // Si des rôles sont définis dans les données de route
        if (roles) {
          // Vérifie si l'utilisateur a au moins un des rôles requis
          const userRoles = this.authService.getAccountRoles();
          const hasRole = roles.some(role => userRoles.includes(role));
          console.log('User roles:', userRoles);
          console.log('Required roles:', roles);
          console.log('Has required role:', hasRole);
          if (hasRole) {
            console.log('Accès autorisé');
            return true;
          } else {
            console.log('Rôles insuffisants, redirection vers login-admin');
            this.router.navigate(['/login-admin']);
            return false;
          }
        }
        
        // Si aucun rôle spécifique n'est requis, autorise l'accès
        console.log('Aucun rôle requis, accès autorisé');
        return true;
      } catch (error) {
        console.error('Erreur de décodage du token:', error);
        this.authService.logout();
        this.router.navigate(['/login-admin']);
        return false;
      }
    }

    console.log('Non connecté, redirection vers login-admin');
    this.router.navigate(['/login-admin']);
    return false;
  }
}
