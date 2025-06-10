import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Account } from "../../models/account";
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router, private cookieService: CookieService) {}

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        console.log('Token expiré, déconnexion');
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la vérification du token:', error);
      this.logout();
      return false;
    }
  }

  setAccount(account) {
    this.cookieService.set('currentAccount', JSON.stringify(account), undefined, '/');
  }

  getCurrentAccount(): Account | null {
    const accountString = this.cookieService.get('currentAccount');
    
    // Vérification plus robuste
    if (!accountString || accountString.trim() === '' || accountString === 'undefined' || accountString === 'null') {
      return null;
    }

    try {
      const account: Account = JSON.parse(accountString);
      
      if (account && account.id) {
        return account;
      } else {
        console.warn('Compte trouvé dans les cookies mais données invalides:', account);
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la lecture des données de compte depuis les cookies :', error);
      // Nettoie le cookie corrompu
      this.cookieService.delete('currentAccount', '/');
      return null;
    }
  }

  setActionGroups(actionGroup) {
    localStorage.setItem("actionGroups",JSON.stringify(actionGroup));
    // this.cookieService.set('actionGroups', JSON.stringify(actionGroup), undefined, '/');
  }

  getActionGroups(): any {
    // const actionGroups = this.cookieService.get('actionGroups');
    const actionGroups = localStorage.getItem('actionGroups');
    return JSON.parse(actionGroups || '[]');
  }

  getRoleSectionView(idSection): boolean {
    const accountSectionsString = this.cookieService.get('accountSections');
    
    // Vérification avant JSON.parse
    if (!accountSectionsString || accountSectionsString.trim() === '') {
      return true; // ou false selon ta logique métier
    }
    
    try {
      const accountSections = JSON.parse(accountSectionsString);
      return !accountSections.includes(idSection);
    } catch (error) {
      console.error('Erreur parsing accountSections:', error);
      return true; // ou false selon ta logique métier
    }
  }

  setToken(token: string) {
    this.cookieService.set('access_token', token, undefined, '/');
  }

  getToken(): string {
    return this.cookieService.get('access_token');
  }

  setRefreshToken(refreshToken: string) {
    this.cookieService.set('refresh_token', refreshToken, undefined, '/');
  }

  getRefreshToken(): string {
    return this.cookieService.get('refresh_token');
  }

  setTmpToken(token: string) {
    this.cookieService.set('tmpToken', token, undefined, '/');
  }

  getTmpToken(): string {
    return this.cookieService.get('tmpToken');
  }

  setAccountRoles(role) {
    let accountRoles = [];
    let accountSections = [];

    role.forEach((r) => {
      accountRoles.push(r.name);
      // r.sections.forEach((s) => {
      //   accountSections.push(s.idSection);
      // });
    });

    this.cookieService.set('accountRoles', JSON.stringify(accountRoles), undefined, '/');
    this.cookieService.set('accountSections', JSON.stringify(accountSections), undefined, '/');
  }

  getAccountRoles(): any {
    const accountRolesString = this.cookieService.get('accountRoles');
    
    // Vérification avant JSON.parse
    if (!accountRolesString || accountRolesString.trim() === '') {
      return [];
    }
    
    try {
      return JSON.parse(accountRolesString);
    } catch (error) {
      console.error('Erreur parsing accountRoles:', error);
      return [];
    }
  }

  redirect() {
    this.router.navigate(['/metric/indicateurs']);
  }

  logout() {
    this.cookieService.delete('currentAccount', '/');
    this.cookieService.delete('access_token', '/');
    this.cookieService.delete('refresh_token', '/');
    this.cookieService.delete('tmpToken', '/');
    this.cookieService.delete('accountRoles', '/');
    this.cookieService.delete('accountSections', '/');
    this.router.navigate(['/login-admin']);
  }

  getDe() {
    const currentAccount = this.getCurrentAccount();
    return `${currentAccount.prenom} ${currentAccount.nom} <${currentAccount.email}>`;
  }
}
