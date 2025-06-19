import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  private serverURL = environment.serverURLjambar;
  private defaultHeaders = new HttpHeaders({
    "Content-Type": "application/json"
  });

  constructor(
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.cookieService.get('access_token');
    if (!token) {
      return this.defaultHeaders;
    }
    return this.defaultHeaders.set('Authorization', `Bearer ${token}`);
  }

  post(url: string, auth: boolean, data: any, customHeaders?: HttpHeaders): Observable<any> {
    const fullUrl = this.serverURL + url;
    let headers = customHeaders || (auth ? this.getAuthHeaders() : this.defaultHeaders);

    if (!headers.has('Content-Type')) {
      headers = headers.set('Content-Type', 'application/json');
    }

    return this.http.post(encodeURI(fullUrl), data, { headers }).pipe(
      map((res: any) => res),
      catchError((error) => {
        console.error('Erreur HTTP:', error);
        if (error.status === 401) {
          this.cookieService.delete('access_token');
          window.location.href = '/login-admin';
        }
        return throwError(() => error);
      })
    );
  }

  get(url: string, auth: boolean): Observable<any> {
    const fullUrl = this.serverURL + url;
    const headers = auth ? this.getAuthHeaders() : this.defaultHeaders;

    return this.http.get(encodeURI(fullUrl), { headers }).pipe(
      map((res: any) => res),
      catchError((error) => {
        if (error.status === 401) {
          this.cookieService.delete('access_token');
          window.location.href = '/login-admin';
        }
        return throwError(() => error);
      })
    );
  }

  delete(url: string, auth: boolean): Observable<any> {
    const fullUrl = this.serverURL + url;
    const headers = auth ? this.getAuthHeaders() : this.defaultHeaders;

    return this.http.delete(encodeURI(fullUrl), { headers }).pipe(
      map((res: any) => res),
      catchError((error) => {
        if (error.status === 401) {
          this.cookieService.delete('access_token');
          window.location.href = '/login-admin';
        }
        return throwError(() => error);
      })
    );
  }

  put(url: string, auth: boolean, data: any): Observable<any> {
    const fullUrl = this.serverURL + url;
    const headers = auth ? this.getAuthHeaders() : this.defaultHeaders;

    return this.http.put(encodeURI(fullUrl), data, { headers }).pipe(
      map((res: any) => res),
      catchError((error) => {
        if (error.status === 401) {
          this.cookieService.delete('access_token');
          window.location.href = '/login-admin';
        }
        return throwError(() => error);
      })
    );
  }

  patch(url: string, auth: boolean, data: any): Observable<any> {
    const fullUrl = this.serverURL + url;
    const headers = auth ? this.getAuthHeaders() : this.defaultHeaders;

    return this.http.patch(encodeURI(fullUrl), data, { headers }).pipe(
      map((res: any) => res),
      catchError((error) => {
        if (error.status === 401) {
          this.cookieService.delete('access_token');
          window.location.href = '/login-admin';
        }
        return throwError(() => error);
      })
    );
  }

  getSites(url: string) {
    return this.get("/base" + encodeURI(url), false);
  }

  getFileRoute(url: string) {
    return this.serverURL + "fileContainers/NUREXPORT/download/" + encodeURI(url);
  }
}