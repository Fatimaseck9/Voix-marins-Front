import { Component, OnInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AuthService } from 'src/app/servicesclient/auth.service';
import { PlainteService } from 'src/app/servicesclient/plainte.service';


interface Plainte {
  id: string;
  titre: string;
  categorie: string;
  description: string;
  date: string;
  dateCreation: string;
  statut: string;
  utilisateur: string;
  audioUrl?: string;
}

@Component({
  selector: 'app-suivre-mes-plaintes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './suivre-mes-plaintes.component.html',
  styleUrls: ['./suivre-mes-plaintes.component.css']
})
export class SuivreMesPlaintesComponent implements OnInit {
  menuActive = false;
  plaintes: Plainte[] = [];
  isBrowser: boolean;
  private apiUrl = 'https://api.gaalgui.sn/plaintes';
 // private apiUrl ='https://ce1e-154-124-68-191.ngrok-free.app/plaintes';
 // private apiUrl = 'http://10.100.200.20:3001/plaintes';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private plainteService: PlainteService,
    private authService: AuthService // Injection du service d'authentification
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.loadPlaintes();
    }
  }

  readonly backendBaseUrl = 'https://api.gaalgui.sn';
  
  //readonly backendBaseUrl = 'https://ce1e-154-124-68-191.ngrok-free.app';
   //readonly backendBaseUrl ='http://10.100.200.20:3001';

 async loadPlaintes() {
  try {
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      console.warn('Utilisateur non connecté. Veuillez vous connecter.');
      return;
    }

    // Récupérer le token (ou ID de l'utilisateur) pour charger les plaintes
    const token = await firstValueFrom(this.authService.getToken());
    if (!token) {
      console.error('Token invalide. Vérifiez votre connexion.');
      return;
    }

    // Décodons le token pour obtenir l'ID de l'utilisateur
    const user = this.authService.decodeToken(token);
    const userId = user.sub; // Assurez-vous que 'sub' contient bien l'ID de l'utilisateur

    // Configurez les en-têtes avec le token d'authentification
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      //'ngrok-skip-browser-warning': 'true'
    });


    // Utilisez l'endpoint /plaintes/user/:userId
    const response = await firstValueFrom(
      this.http.get<Plainte[]>(`${this.apiUrl}/user/${userId}`, { headers }) // Ajoutez l'en-tête ici
    );

    //this.plaintes = response;
    this.plaintes = response.map(p => {
  console.log('Plainte audio URL:', p.audioUrl); // 🔍 Ajout ici
  return {
    ...p,
    audioUrl: p.audioUrl ? `${this.backendBaseUrl.replace(/\/$/, '')}${p.audioUrl}` : undefined
  };
});


 
    
     console.log('Réponse du backend (list of plaintes):', response); // Ajou
  } catch (error) {
    console.error('Erreur lors du chargement des plaintes:', error);
    this.plaintes = [];
  }
}
  async annulerPlainte(plainte: Plainte) {
    if (confirm('Êtes-vous sûr de vouloir annuler cette plainte ?')) {
      try {
        // 1. Créer les en-têtes avec le token d'authentification
        const token = await firstValueFrom(this.authService.getToken());
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          //'ngrok-skip-browser-warning': 'true'
        });

        // 2. Utiliser l'endpoint /plaintes/:id avec DELETE et les en-têtes
        await firstValueFrom(
          this.http.delete(`${this.apiUrl}/${plainte.id}`, { headers })
        );

        // 3. Mettre à jour la liste locale
        this.plaintes = this.plaintes.filter(p => p.id !== plainte.id);
      } catch (error) {
        console.error('Erreur lors de l\'annulation de la plainte:', error);
        if (typeof error === 'object' && error !== null && 'status' in error && (error as any).status === 403) {
          alert('Vous n\'avez pas l\'autorisation d\'annuler cette plainte.');
        } else {
          alert('Erreur lors de l\'annulation de la plainte. Veuillez réessayer.');
        }
      }
    }
  }

  getCategoryLabel(key: string): string {
    const categories: { [key: string]: string } = {
      'harcelement': 'Harcèlement',
      'violence': 'Violence physique',
      'nourriture': 'Refus de nourriture',
      'paiement': 'Problème de paiement'
    };
    return categories[key] || key;
  }

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  logout() {
    this.authService.logout();
    // La redirection sera gérée par le service AuthService
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth > 768 && this.menuActive) {
      this.menuActive = false;
      document.body.style.overflow = '';
    }
  }

  getCategoryImage(categoryKey: string): string {
    return this.plainteService.getCategoryImage(categoryKey);
  }

  getStatusClass(statut: string): string {
    switch(statut) {
      case 'En attente': return 'bg-warning text-dark';
      case 'En traitement': return 'bg-primary text-white';
      case 'Résolu': return 'bg-success text-white';
      default: return 'bg-secondary text-white';
    }
  }

  // Détection d'iOS/Safari
  isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  }

  // Vérifie si le format audio est lisible sur l'appareil
  isAudioPlayable(audioUrl: string): boolean {
    if (!audioUrl) return false;
    if (this.isIOS()) {
      // Safari supporte mp3, m4a, aac, wav, mais pas webm/opus
      return (
        audioUrl.endsWith('.mp3') ||
        audioUrl.endsWith('.m4a') ||
        audioUrl.endsWith('.aac') ||
        audioUrl.endsWith('.wav')
      );
    }
    // Pour les autres navigateurs, on suppose que tout est lisible
    return true;
  }
}
