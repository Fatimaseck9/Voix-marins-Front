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

  readonly backendBaseUrl = 'https://voix-marins-backend-production.up.railway.app';
  
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
      let audioUrl = undefined;
      
      // Construire l'URL audio selon le format reçu du backend
      if (p.audioUrl) {
        console.log('Audio URL original:', p.audioUrl);
        
        if (p.audioUrl.startsWith('http')) {
          // URL complète déjà fournie
          audioUrl = p.audioUrl;
        } else if (p.audioUrl.startsWith('/')) {
          // Chemin relatif commençant par / - éviter le double slash
          audioUrl = `${this.backendBaseUrl.replace(/\/$/, '')}${p.audioUrl}`;
        } else {
          // Chemin relatif sans / - ajouter un slash
          audioUrl = `${this.backendBaseUrl.replace(/\/$/, '')}/${p.audioUrl}`;
        }
        
        console.log('Audio URL construite:', audioUrl);
      }
      
      const plainte = {
        ...p,
        audioUrl: audioUrl,
        audioAccessible: false
      };
      
      // Vérifier l'accessibilité du fichier audio si disponible
      if (plainte.audioUrl) {
        plainte.audioAccessible = await this.checkAudioAccessibility(plainte.audioUrl, token);
        console.log('Audio accessible:', plainte.audioAccessible, 'pour URL:', plainte.audioUrl);
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

// Méthode pour tester l'existence d'un fichier audio
private async testAudioFile(url: string, token: string): Promise<boolean> {
  try {
    console.log('Test d\'existence du fichier:', url);
    
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    console.log('Réponse du test:', response.status, response.statusText);
    return response.ok;
  } catch (error) {
    console.error('Erreur lors du test du fichier:', error);
    return false;
  }
}

// Méthode pour vérifier l'accessibilité d'un fichier audio
private async checkAudioAccessibility(audioUrl: string, token: string): Promise<boolean> {
  try {
    // Tester d'abord l'existence du fichier
    const fileExists = await this.testAudioFile(audioUrl, token);
    
    if (!fileExists) {
      console.warn(`Fichier audio introuvable: ${audioUrl}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn(`Erreur lors de la vérification d'accessibilité: ${audioUrl}`, error);
    // En cas d'erreur, on considère que le fichier pourrait être accessible
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
    
    // Récupérer le token d'authentification
    const token = await firstValueFrom(this.authService.getToken());
    if (!token) {
      alert('Erreur d\'authentification. Veuillez vous reconnecter.');
      return;
    }
    
    console.log('Tentative de lecture audio pour URL:', plainte.audioUrl);
    
    // Utiliser fetch pour récupérer l'audio avec authentification
    const response = await fetch(plainte.audioUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
    }
    
    // Convertir la réponse en blob
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Créer l'élément audio
    const audio = new Audio(audioUrl);
    
    // Gérer les événements
    audio.addEventListener('ended', () => {
      this.onAudioEnded(plainte);
      URL.revokeObjectURL(audioUrl); // Libérer la mémoire
    });
    audio.addEventListener('error', (event) => {
      this.onAudioError(plainte, event);
      URL.revokeObjectURL(audioUrl); // Libérer la mémoire
    });
    audio.addEventListener('loadstart', () => {
      plainte.isPlaying = true;
    });
    
    // Démarrer la lecture
    await audio.play();
    plainte.audioElement = audio;
    plainte.isPlaying = true;
    
    console.log('Lecture audio démarrée avec succès');
    
  } catch (error) {
    console.error('Erreur lors de la lecture audio:', error);
    plainte.isPlaying = false;
    alert(`Erreur lors de la lecture audio: ${error.message}`);
  }
}

// Méthode pour arrêter la lecture audio
stopAudio(plainte: Plainte) {
  if (plainte.audioElement) {
    plainte.audioElement.pause();
    plainte.audioElement.currentTime = 0;
    
    // Nettoyer l'URL blob si elle existe
    if (plainte.audioElement.src && plainte.audioElement.src.startsWith('blob:')) {
      URL.revokeObjectURL(plainte.audioElement.src);
    }
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
