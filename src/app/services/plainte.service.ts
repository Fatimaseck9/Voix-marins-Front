import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of, forkJoin } from 'rxjs';
import { tap, switchMap, map, catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';

// Interface pour typer la plainte
interface Plainte {
  id: number;
  statut: string;
  categorie: string;
  detailsplainte: string;
  pvUrl: string;
  resolvedBy: number;
  dateResolution: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlainteService {
  private apiUrl = 'https://api.gaalgui.sn/plaintes';
  //private baseUrl = 'https://521a-154-124-68-191.ngrok-free.app/auth';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  getAllPlaintes(): Observable<any[]> {
    console.log('=== getAllPlaintes appelé ===');
    const headers = this.getAuthHeaders();
    console.log('Headers créés:', headers);
    
    return this.http.get<any[]>(this.apiUrl, { headers }).pipe(
      tap({
        next: (plaintes) => {
          console.log('Plaintes reçues du serveur:', plaintes);
          // Suppression de la mise à jour automatique de resolvedBy
        },
        error: (error) => {
          console.error('Erreur lors de la récupération des plaintes:', error);
        }
      })
    );
  }

  getFullAudioUrl(audioUrl: string): string {
    if (!audioUrl) return '';
    if (audioUrl.startsWith('http')) {
      return audioUrl;
    }
    return this.apiUrl + audioUrl;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.cookieService.get('access_token');
    console.log('Token récupéré dans getAuthHeaders:', token ? 'Token présent' : 'Token absent');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getCurrentAdmin(): any {
    const token = this.cookieService.get('access_token');
    console.log('Token stocké:', token);
    
    if (!token) {
      console.log('Aucun token trouvé');
      return null;
    }
    
    try {
      const decodedToken = jwtDecode(token);
      console.log('Token décodé:', decodedToken);
      
      if (decodedToken && typeof decodedToken === 'object') {
        const admin = {
          sub: decodedToken['sub'],
          name: decodedToken['name'],
          email: decodedToken['email'],
          role: decodedToken['role']
        };
        console.log('Admin extrait:', admin);
        return admin;
      }
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
    }
    return null;
  }

  getPlainteById(id: string): Observable<Plainte> {
    const headers = this.getAuthHeaders();
    return this.http.get<Plainte>(`${this.apiUrl}/${id}`, { headers });
  }

  getPlaintesResolues(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any[]>(this.apiUrl, { headers }).pipe(
      map(plaintes => {
        // Filtrer uniquement les plaintes résolues
        return plaintes
          .filter(plainte => plainte.statut === 'Resolue')
          .map(plainte => {
            // Si la plainte a un resolvedBy, on garde l'ID original
            if (plainte.resolvedBy) {
              // On garde l'ID original de l'admin qui a résolu la plainte
              const originalResolvedById = plainte.resolvedBy;
              console.log('ID original de l\'admin qui a résolu:', originalResolvedById);
              
              // Récupérer les informations de l'admin qui a résolu la plainte
              this.http.get<any>(`${this.apiUrl}/admin/${originalResolvedById}`, { headers }).subscribe({
                next: (adminInfo) => {
                  console.log('Informations de l\'admin récupérées:', adminInfo);
                  // On garde l'ID original et on ajoute les informations de l'admin
                  plainte.resolvedBy = {
                    id: originalResolvedById,  // Garder l'ID original
                    name: adminInfo.name,
                    email: adminInfo.email,
                    role: adminInfo.role
                  };
                },
                error: (error) => {
                  console.error('Erreur lors de la récupération des informations de l\'admin:', error);
                  // En cas d'erreur, on garde juste l'ID original
                  plainte.resolvedBy = {
                    id: originalResolvedById
                  };
                }
              });
            }
            return plainte;
          });
      })
    );
  }

  updatePlainte(id: number, plainte: any): Observable<any> {
    const headers = this.getAuthHeaders();
    console.log('Mise à jour de la plainte:', { id, plainte });
    
    // S'assurer que resolvedBy reste l'ID original
    if (plainte.resolvedBy) {
      // Si resolvedBy est un objet, on garde son ID
      if (typeof plainte.resolvedBy === 'object') {
        plainte.resolvedBy = plainte.resolvedBy.id;
      }
      // Si c'est déjà un ID, on le garde tel quel
    }
    
    // Ne pas changer l'ID de l'admin qui a résolu la plainte
    const plainteToUpdate = {
      ...plainte,
      resolvedBy: plainte.resolvedBy // Garder l'ID original
    };
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, plainteToUpdate, { headers }).pipe(
      tap(response => console.log('Réponse de mise à jour:', response)),
      catchError(error => {
        console.error('Erreur lors de la mise à jour:', error);
        return throwError(() => error);
      })
    );
  }

  uploadPV(plainteId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/${plainteId}/pv`, formData);
  }

  deletePV(plainteId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    console.log('Tentative de suppression du PV pour la plainte:', plainteId);
    return this.http.delete(`${this.apiUrl}/${plainteId}/pv`, { headers }).pipe(
      tap({
        next: (response) => {
          console.log('PV supprimé avec succès:', response);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du PV:', error);
        }
      })
    );
  }

  // Soumission d'une plainte par un admin pour un marin
  submitPlainte(plainteData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    // On suppose que plainteData contient marinId, titre, categorie, description
    return this.http.post(`${this.apiUrl}/create`, plainteData, { headers });
  }
}



