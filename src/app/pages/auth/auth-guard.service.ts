import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { ActionGroupService } from './actionGroup.service';

@Injectable()
export class AuthGuard implements CanActivate{
  
  
  constructor(private router: Router, private authService: AuthService /*, private actionGroupService: ActionGroupService*/) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    if (this.authService.isLoggedIn()){
      let roles = route.data["roles"] as Array<string>;
      if (roles != null){
        let i = 0;
        let find = false;
        while (!find && i< roles.length){
          find = this.authService.getAccountRoles().includes(roles[i]);
          i++;
        }
        if (find) {
          return true;
        }else {          
          this.router.navigate(['pages/login']);
          return false;
        }
      }
      return true;
    }

    this.router.navigate(['pages/login']);
    return false;
 
    // if (this.authService.isLoggedIn()) {
    //   return true; // L'utilisateur est connecté, donc autorisé à accéder au chemin
    // } else {
    //   // L'utilisateur n'est pas connecté, redirigez-le vers la page de connexion
      
    //    this.router.navigate(['pages/login']);
    //   //this.router.navigateByUrl('/test');
    //   return false; // Bloque la navigation
    // }
  }

}
