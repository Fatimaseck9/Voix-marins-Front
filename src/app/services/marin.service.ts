import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class MarinService {
  //private apiUrl = 'https://api.gaalgui.sn/marins';
  
   private apiUrl = `${environment.apiUrl}/marins`;
  
  constructor(private http: HttpClient) {}
  getMarins(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
} 