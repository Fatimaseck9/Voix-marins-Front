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
    this.cookieService.set('currentAccount', JSON.stringify(account), undefined, '/');
  }

  getCurrentAccount(): Account | null {
    const accountString = this.cookieService.get('currentAccount');
    try {
      const account: Account = JSON.parse(accountString);
      if (account && account.id) {
        return account;
      } else {
        return null; // Retourne null si les données de compte ne sont pas valides
      }
    } catch (error) {
      console.error('Erreur lors de la lecture des données de compte depuis les cookies :', error);
      return null; // Retourne null en cas d'erreur de lecture des données de compte
    }
  }

  getRoleSectionView(idSection): boolean {
    const accountSectionsString = this.cookieService.get('accountSections');
    const accountSections = JSON.parse(accountSectionsString || '[]');
    return !accountSections.includes(idSection);
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
    // const accountRoles = JSON.parse(accountRolesString || '[]');
    // const accountSectionsString = this.cookieService.get('accountSections');
    // const accountSections = JSON.parse(accountSectionsString || '[]');
    // return { accountRoles, accountSections };
    return JSON.parse(accountRolesString || '[]');
  }

  accountHasRole(roles: string[]): boolean {
    let find = false;
    let i = 0;
    while (!find && i < roles.length) {
      find = this.getAccountRoles().includes(roles[i]);
      i++;
    }
    return find;
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
