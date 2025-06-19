import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'https://api.gaalgui.sn/users';

  constructor(private http: HttpClient) {}

  getMarins(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
} 