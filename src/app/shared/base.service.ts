import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { AuthService } from "../pages/auth/auth.service";


@Injectable()
export class BaseService {

  // serverURL = "http://10.137.16.131:3001/api/";
  serverURL = "http://localhost:3001/api/";
  headers = new HttpHeaders({
    "content-type": "application/json",
  });

  constructor(private http: HttpClient, private authService: AuthService) {}

  updateHeaders() {
    this.headers = this.headers.delete("Authorization");
    this.headers = this.headers.append("Authorization", this.authService.getToken());
  }
  
  basicHeader() {
    this.headers = this.headers.delete("username");
    this.headers = this.headers.append("username", this.authService.getCurrentAccount().username);
  }

  getJSTAPI(): Observable<any> {
    return this.http.get("https://jstmagal22.herokuapp.com/api/jsts").pipe(
      map((res: any) => res),
      catchError((err) => {
        throw new Error(err);
      })
    );
  }

  // post(url, auth, data): Observable<any> {
  //   url = this.serverURL + url;
    
  //   // Ajouter un log pour afficher l'URL complète
  //   console.log('URL de la requête :', url);
  
  //   if (this.authService.getCurrentAccount()) {
  //       this.basicHeader();
  //       // Ajouter un log pour indiquer que les en-têtes de base sont configurés
  //       console.log('En-têtes de base configurés.');
  //   }
    
  //   if (auth) {
  //       this.updateHeaders();
  //       // Ajouter un log pour indiquer que les en-têtes sont mis à jour
  //       console.log('En-têtes mis à jour.');
  //   }
  
  //   // Ajouter un log pour afficher les données envoyées
  //   console.log('Données envoyées :', data);
  
  //   return this.http.post(url, data, { headers: this.headers }).pipe(
  //       map((res: any) => {
  //           // Ajouter un log pour afficher la réponse
  //           console.log('Réponse de la requête :', res);
  //           return res; // Retourner la réponse de la requête
  //       }),
  //       catchError((err) => {
  //           // Ajouter un log pour afficher les erreurs
  //           console.error('Erreur dans la requête HTTP :', err);
  //           throw new Error(err);
  //       })
  //   );
  // }

  post(url, auth, data): Observable<any> {
    url = this.serverURL + url;
    
    // console.log('URL de la requête :', url);
  
    if (this.authService.getCurrentAccount()) {
        this.basicHeader();
        // console.log('En-têtes de base configurés.');
    }
    
    if (auth) {
        this.updateHeaders();
        // console.log('En-têtes mis à jour.');
    }
  
    // Log the data before sending the request
    // console.log('Données envoyées :', data);
    
    // Vérifier si principalId est défini et n'est pas NaN
    if (!data.principalId) {
      // console.error('Erreur: principalId est null ou undefined');
    }
  
    return this.http.post(url, data, { headers: this.headers }).pipe(
        map((res: any) => {
            // Log the response
            // console.log('Réponse de la requête :', res);
            return res;
        }),
        catchError((err) => {
            // Log the errors
            console.error('Erreur dans la requête HTTP :', err);
            throw new Error(err);
        })
    );
}

  



  get(url, auth): Observable<any> {
    url = this.serverURL + url;
    this.basicHeader();
    if (auth) {
      this.updateHeaders();
    }
    return this.http.get(url, { headers: this.headers }).pipe(
      map((res: any) => res),
      catchError((err) => {
         throw new Error(err);
      })
    );
  }

  delete(url, auth): Observable<any> {
    url = this.serverURL + url;
    this.basicHeader();
    if (auth) {
      this.updateHeaders();
    }
    return this.http.delete(url, { headers: this.headers }).pipe(
      map((res: any) => res),
      catchError((err) => {
         throw new Error(err);
      })
    );
  }

  put(url, auth, data): Observable<any> {
    url = this.serverURL + url;
    this.basicHeader();
    if (auth) {
      this.updateHeaders();
    }
    return this.http.put(url, data, { headers: this.headers }).pipe(
      map((res: any) => res),
      catchError((err) => {
         throw new Error(err);
      })
    );
  }

  patch(url, auth, data): Observable<any> {
    url = this.serverURL + url;
    this.basicHeader();
    if (auth) {
      this.updateHeaders();
    }
    return this.http.patch(url, data, { headers: this.headers }).pipe(
      map((res: any) => res),
      catchError((err) => {
         throw new Error(err);
      })
    );
  }

  getFileRoute(url) {
    return this.serverURL + "fileContainers/NUREXPORT/download/" + url;
  }
}
