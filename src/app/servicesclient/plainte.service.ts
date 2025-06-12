import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlainteService {
  private apiUrl = 'https://ce1e-154-124-68-191.ngrok-free.app/plaintes';
  
 // private apiUrl = 'http://localhost:3001/plaintes';
  
  categories = [
    { key: 'harcelement', label: 'Harcèlement', image: 'Harcélement.jpeg' },
    { key: 'violence', label: 'Violence physique', image: 'Violence physique.jpeg' },
    { key: 'nourriture', label: 'Refus de nourriture', image: 'Refus nourriture.jpeg' },
    { key: 'paiement', label: 'Problème de paiement', image: 'Refus de paiement.jpeg' }
  ];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}


    // Helper pour générer les headers avec le token
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // on suppose que ton AuthService a une méthode getToken()
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true' 
    });
  }

  // CORRECTION : Utiliser l'API au lieu du localStorage
  submitPlainte(plainteData: any): Observable<any> {

    // L'intercepteur ajoutera automatiquement le token
     const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/form`, plainteData, { headers });
   
  }

  getPlaintes(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}`, { headers });

  }
  supprimerPlainte(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  getCategories(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/categories`, { headers });
  }

  // Méthode temporaire pour tester sans authentification
  getCategoriesPublic(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true' 
    });
    return this.http.get(`${this.apiUrl}/categories`, { headers });
  }

  getCategoryImage(categoryKey: string): string {
    return `assets/img/${categoryKey}.jpeg`; 
  }
   decodeToken(token: string): any {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      console.error('Erreur lors du décodage du token', error);
      return null;
    }
  }

}
