import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlainteService {
 // private apiUrl = 'https://ce1e-154-124-68-191.ngrok-free.app/plaintes';
   private apiUrl = 'https://api.gaalgui.sn/plaintes';
  
  //private apiUrl = 'https://voix-marins-backend-production.up.railway.app/plaintes';
  
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
      //'ngrok-skip-browser-warning': 'true' 
    });
  }

  // Nouvelle méthode pour soumettre une plainte avec ou sans audio
  submitPlainte(plainteData: any, audioFile?: File): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // Ne pas mettre Content-Type ici, il sera géré automatiquement par FormData
    });
    const formData = new FormData();
    Object.keys(plainteData).forEach(key => {
      formData.append(key, plainteData[key]);
    });
    if (audioFile) {
      formData.append('audio', audioFile, audioFile.name);
    }
    return this.http.post(`${this.apiUrl}/create`, formData, { headers });
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
      //'ngrok-skip-browser-warning': 'true' 
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
