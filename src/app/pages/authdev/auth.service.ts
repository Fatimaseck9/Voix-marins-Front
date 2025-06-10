import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Account } from "../../models/account";
import { CookieService } from 'ngx-cookie-service';

@Injectable()
export class AuthService {

  constructor(private router: Router, private cookieService: CookieService) {}

  isLoggedIn(): boolean {
    const token: string = this.getToken();
    return token && token.length > 0;
  }
setAccount(account: Account) {
  if (account && account.id) {
    this.cookieService.set('currentAccount', JSON.stringify(account), undefined, '/');
  } else {
    console.warn("Tentative d'enregistrement d'un compte invalide dans les cookies : ", account);
  }
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
    this.cookieService.set('accessToken', token, undefined, '/');
  }

  getToken(): string {
    return this.cookieService.get('accessToken');
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
      r.sections.forEach((s) => {
        accountSections.push(s.idSection);
      });
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
    this.router.navigate(['/dashboard']);
  }

  logout() {
    this.cookieService.delete('currentAccount', '/');
    this.cookieService.delete('accessToken', '/');
    this.cookieService.delete('tmpToken', '/');
    this.cookieService.delete('accountRoles', '/');
    this.cookieService.delete('accountSections', '/');
  }

  getDe() {
    const currentAccount = this.getCurrentAccount();
    return `${currentAccount.prenom} ${currentAccount.nom} <${currentAccount.email}>`;
  }
}
