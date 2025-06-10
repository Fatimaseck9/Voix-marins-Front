import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlainteService {
  private apiUrl = 'http://localhost:3001/plaintes';

  constructor(private http: HttpClient) {}

  getAllPlaintes(): Observable<any[]> {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Token manquant, accès refusé");
      throw new Error('Token JWT manquant');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any[]>(this.apiUrl, { headers });
  }

  getFullAudioUrl(audioUrl: string): string {
    if (!audioUrl) return '';
    if (audioUrl.startsWith('http')) {
      return audioUrl;
    }
    return this.apiUrl + audioUrl;
  }


  private getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Token JWT manquant');
  }
  return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
}

updatePlainte(id: string, updateData: { statut?: string; categorie?: string; detailsplainte?: string }): Observable<any> {
  const headers = this.getAuthHeaders();
  return this.http.put(`${this.apiUrl}/${id}`, updateData, { headers });
}

}



