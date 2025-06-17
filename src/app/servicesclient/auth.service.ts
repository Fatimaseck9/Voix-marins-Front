import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
//private baseUrl = 'https://ce1e-154-124-68-191.ngrok-free.app/auth';
  //private baseUrl = 'http://10.100.200.20:3001/auth';
    private baseUrl = 'voix-marins-backend-production.up.railway.app/auth'
  //private baseUrl = 'http://localhost:3001/auth';
  private currentUserSubject = new BehaviorSubject<any>(null);
  private refreshInProgress = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (this.isBrowser()) {
      this.initializeUser();
      this.startAutoRefresh();
    }
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private initializeUser(): void {
    const token = this.getStoredToken();
    if (token && !this.isTokenExpired(token)) {
      const user = this.decodeToken(token);
      this.currentUserSubject.next(user);
      console.log('Utilisateur initialisé:', user);
    } else {
      this.currentUserSubject.next(null);
    }
  }

  public decodeToken(token: string): any {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch {
      return null;
    }
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true; // Pas de payload signifie qu'il est considéré comme expiré
    const now = Math.floor(Date.now() / 1000); // Temps actuel en secondes depuis l'époque Unix
    return payload.exp <= now; // Vérifie si le moment d'expiration est passé
}

  isLoggedIn(): boolean {
    const token = this.getStoredToken();
    if (!token) return false;

    const payload = this.decodeToken(token);
    if (!payload) return false;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = payload.exp - now;

    console.log(`Token expire dans ${timeUntilExpiry} secondes`);

    if (timeUntilExpiry < 300 && timeUntilExpiry > 0) {
      this.attemptTokenRefresh();
    }

    return timeUntilExpiry > 0;
  }




  getStoredToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('access_token');
  }

  getToken(): Observable<string | null> {
    const token = this.getStoredToken();
    if (!token || this.isTokenExpired(token)) {
        // Si le token est expiré, tenter un rafraîchissement
        return this.refreshToken().pipe(
            // Si le rafraîchissement réussit, renvoyer le nouveau token
            tap(() => {
                // Dans le cas où le refresh est un succès, on pourrait avoir une logique pour ajuster l'état
            }),
            map(() => this.getStoredToken()),  // On renvoie le nouveau token après rafraîchissement
            catchError(err => {
                console.error('Erreur lors de la récupération du token :', err);
                return of(null); // Si le rafraîchissement échoue, retourne null
            })
        );
    }
    return of(token); // Sinon, retourne le token existant
}


  saveTokens(accessToken: string, refreshToken: string, userId: number, role?: string): void {
    if (!this.isBrowser()) return;

    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('userId', userId.toString());
    if (role) localStorage.setItem('role', role);

    const user = this.decodeToken(accessToken);
    this.currentUserSubject.next(user);
  }

  logout(): void {
    if (!this.isBrowser()) return;

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    this.currentUserSubject.next(null);
    console.log('Déconnexion effectuée');
    this.router.navigate(['/login-marin']); // Redirige vers la page de login après déconnexion
  }

  requestLogin(numero: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/request-login`, { numero });
  }

  verifyCode(numero: string, code: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify-code`, { numero, code }).pipe(
      tap((response: any) => {
        if (response.access_token && response.refresh_token) {
          this.saveTokens(response.access_token, response.refresh_token, response.userId, response.role);
        }
      })
    );
  }

  refreshToken(): Observable<string> {
    if (!this.isBrowser()) return throwError('Not running in browser');
    if (this.refreshInProgress) return throwError('Refresh already in progress');

    const userId = localStorage.getItem('userId');
    const refresh_token = localStorage.getItem('refresh_token');

    if (!userId || !refresh_token) return throwError('No refresh token available');

    this.refreshInProgress = true;

    return this.http.post<any>(`${this.baseUrl}/refresh`, {
      userId: parseInt(userId, 10),
      refreshToken: refresh_token,
    }).pipe(
      tap((response: any) => {
        console.log('Token renouvelé :', response);
        if (response.access_token && response.refresh_token) {
          this.saveTokens(response.access_token, response.refresh_token, parseInt(userId, 10), response.role);
        }
      }),
      catchError((error) => {
        console.error('Erreur lors du renouvellement:', error);
        this.logout();
        return throwError(error);
      }),
      finalize(() => {
        this.refreshInProgress = false;
        console.log('Processus de renouvellement terminé');
      })
    );
  }

  private attemptTokenRefresh(): void {
    this.refreshToken().pipe(
      catchError(err => {
        console.error('Impossible de renouveler le token silencieusement', err);
        this.logout(); 
        return throwError(err);
      })
    ).subscribe(); // Souscrit pour exécuter l'Observable
  }

  private startAutoRefresh(): void {
    setInterval(() => {
      const token = this.getStoredToken();
      if (!token) return;

      const payload = this.decodeToken(token);
      if (!payload) return;

      const now = Math.floor(Date.now() / 1000);
      const expiresIn = payload.exp - now;

      if (expiresIn < 300 && expiresIn > 0) {
        this.attemptTokenRefresh();
      }
    }, 60000); // toutes les 60 secondes
  }

  getRole(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('role');
  }

  logTokenInfo(): void {
    const token = this.getStoredToken();
    if (!token) {
      console.log('Aucun token trouvé');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = payload.exp - now;

      console.log('=== INFO TOKEN ===');
      console.log('Utilisateur:', payload);
      console.log('Expire dans:', expiresIn, 'secondes');
      console.log('Date expiration:', new Date(payload.exp * 1000));
      console.log('==================');
    } catch (error) {
      console.error('Erreur lors du décodage du token', error);
    }
  }

  getUserId(): number | null {
  const user = this.currentUserSubject.value;
  if (!user) return null;
  return user.sub || user.id || user.userId || null;
}




}
