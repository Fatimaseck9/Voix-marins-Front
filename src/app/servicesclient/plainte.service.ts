import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlainteService {
  private apiUrl = 'http://localhost:3001/plaintes';
  
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

  // CORRECTION : Utiliser l'API au lieu du localStorage
  submitPlainte(plainteData: any): Observable<any> {
    // L'intercepteur ajoutera automatiquement le token
    return this.http.post(`${this.apiUrl}/form`, plainteData);
  }

  getPlaintes(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  supprimerPlainte(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
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
