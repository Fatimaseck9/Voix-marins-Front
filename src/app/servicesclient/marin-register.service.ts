import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarinRegisterService {
  private apiUrl = 'voix-marins-backend-production.up.railway.app/marins/register';

  constructor(private http: HttpClient) {}

  registerMarin(userData: { name: string; numero: string }): Observable<any> {
    return this.http.post(this.apiUrl, userData);
  }
} 