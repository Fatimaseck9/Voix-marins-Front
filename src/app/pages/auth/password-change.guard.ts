// password-change.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class PasswordChangeGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    const account = this.auth.getCurrentAccount();
    
    // Autoriser l'accès seulement si le compte est inactif
    if (account && !account.isActive) {
      return true;
    }
    
    // Rediriger vers le dashboard si déjà actif
    this.router.navigate(['/dashboard']);
    return false;
  }
}