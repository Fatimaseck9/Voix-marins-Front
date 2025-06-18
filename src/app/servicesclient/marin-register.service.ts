import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarinRegisterService {
  private apiUrl = 'http://doscg4skk8wwsksk0k0c84gk.92.113.25.175.sslip.io/marins/register';

  constructor(private http: HttpClient) {}

  registerMarin(userData: { name: string; numero: string }): Observable<any> {
    return this.http.post(this.apiUrl, userData);
  }
} 