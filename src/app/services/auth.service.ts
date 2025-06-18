import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'auth_token';
  private currentUserKey = 'current_user';

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<any>('https://api.gaalgui.sn/auth/login', credentials).pipe(
      tap(response => {
        if (response.access_token) {
          // Supprimer l'ancien token et les données utilisateur
          this.logout();
          
          // Stocker le nouveau token
          localStorage.setItem(this.tokenKey, response.access_token);
          
          // Décoder et stocker les informations de l'utilisateur
          const decodedToken = jwtDecode(response.access_token);
          localStorage.setItem(this.currentUserKey, JSON.stringify(decodedToken));
        }
      })
    );
  }

  logout(): void {
    // Supprimer le token et les données utilisateur
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.currentUserKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // Vérifier si le token est expiré
      if (decodedToken.exp < currentTime) {
        this.logout(); // Déconnecter si le token est expiré
        return false;
      }
      
      return true;
    } catch {
      this.logout(); // Déconnecter si le token est invalide
      return false;
    }
  }

  getCurrentUser(): any {
    const userStr = localStorage.getItem(this.currentUserKey);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      this.logout(); // Déconnecter si les données utilisateur sont corrompues
      return null;
    }
  }
} 