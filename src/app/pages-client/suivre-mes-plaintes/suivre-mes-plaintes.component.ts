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
  audioAccessible?: boolean;
  isPlaying?: boolean;
  audioElement?: HTMLAudioElement;
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
  private apiUrl = 'https://voix-marins-backend-production.up.railway.app/plaintes';
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

  readonly backendBaseUrl = 'https://voix-marins-backend-production.up.railway.app/';
  
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

    // Traiter les plaintes et vérifier l'accessibilité des fichiers audio
    this.plaintes = await Promise.all(response.map(async (p) => {
      const plainte = {
        ...p,
        audioUrl: p.audioUrl ? `${this.backendBaseUrl}${p.audioUrl}` : undefined,
        audioAccessible: false
      };
      
      // Vérifier l'accessibilité du fichier audio si disponible
      if (plainte.audioUrl) {
        plainte.audioAccessible = await this.checkAudioAccessibility(plainte.audioUrl, token);
      }
      
      return plainte;
    }));
    
    console.log('Réponse du backend (list of plaintes):', response);
  } catch (error) {
    console.error('Erreur lors du chargement des plaintes:', error);
    this.plaintes = [];
  }
}

// Méthode pour obtenir l'URL audio avec authentification
async getAudioUrl(plainte: Plainte): Promise<string> {
  if (!plainte.audioUrl) return '';
  
  try {
    // Récupérer le token d'authentification
    const token = await firstValueFrom(this.authService.getToken());
    if (!token) return '';
    
    // Construire l'URL avec le token d'authentification
    const url = new URL(plainte.audioUrl);
    url.searchParams.set('token', token);
    
    return url.toString();
  } catch (error) {
    console.error('Erreur lors de la construction de l\'URL audio:', error);
    return plainte.audioUrl; // Retourner l'URL originale en cas d'erreur
  }
}

// Méthode pour vérifier l'accessibilité d'un fichier audio
private async checkAudioAccessibility(audioUrl: string, token: string): Promise<boolean> {
  try {
    // Construire l'URL avec le token
    const url = new URL(audioUrl);
    url.searchParams.set('token', token);
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Range': 'bytes=0-1'
    });
    
    const response = await firstValueFrom(
      this.http.head(url.toString(), { headers, observe: 'response' })
    );
    
    return response.status === 200 || response.status === 206;
  } catch (error) {
    console.warn(`Fichier audio inaccessible: ${audioUrl}`, error);
    // En cas d'erreur, on considère que le fichier pourrait être accessible
    // car certains serveurs ne supportent pas les requêtes HEAD
    return true;
  }
}

// Méthode pour gérer les erreurs de lecture audio
onAudioError(plainte: Plainte, event: any) {
  console.error('Erreur de lecture audio:', event);
  plainte.audioAccessible = false;
  plainte.isPlaying = false;
  
  // Afficher un message à l'utilisateur
  alert('Impossible de lire l\'enregistrement audio. Le fichier pourrait être corrompu ou inaccessible.');
}

// Méthode pour démarrer la lecture audio
async playAudio(plainte: Plainte) {
  try {
    if (!plainte.audioUrl) return;
    
    // Si l'audio est déjà en cours de lecture, le mettre en pause
    if (plainte.isPlaying && plainte.audioElement) {
      plainte.audioElement.pause();
      plainte.isPlaying = false;
      return;
    }
    
    // Créer un nouvel élément audio avec authentification
    const token = await firstValueFrom(this.authService.getToken());
    if (!token) {
      alert('Erreur d\'authentification. Veuillez vous reconnecter.');
      return;
    }
    
    // Construire l'URL avec authentification
    const url = new URL(plainte.audioUrl);
    url.searchParams.set('token', token);
    
    // Créer l'élément audio
    const audio = new Audio(url.toString());
    
    // Ajouter les en-têtes d'authentification
    audio.crossOrigin = 'anonymous';
    
    // Gérer les événements
    audio.addEventListener('ended', () => this.onAudioEnded(plainte));
    audio.addEventListener('error', (event) => this.onAudioError(plainte, event));
    audio.addEventListener('loadstart', () => {
      plainte.isPlaying = true;
    });
    
    // Démarrer la lecture
    await audio.play();
    plainte.audioElement = audio;
    plainte.isPlaying = true;
    
  } catch (error) {
    console.error('Erreur lors de la lecture audio:', error);
    plainte.isPlaying = false;
    alert('Erreur lors de la lecture audio. Vérifiez votre connexion.');
  }
}

// Méthode pour arrêter la lecture audio
stopAudio(plainte: Plainte) {
  if (plainte.audioElement) {
    plainte.audioElement.pause();
    plainte.audioElement.currentTime = 0;
  }
  plainte.isPlaying = false;
}

// Méthode appelée quand l'audio se termine
onAudioEnded(plainte: Plainte) {
  plainte.isPlaying = false;
  if (plainte.audioElement) {
    plainte.audioElement.currentTime = 0;
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

  
}
