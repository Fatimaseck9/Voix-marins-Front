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
    const token = await firstValueFrom(this.authService.getToken());
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const response = await firstValueFrom(
      this.http.get<any[]>(`${this.apiUrl}/mes-plaintes`, { headers })
    );

    this.plaintes = response.map(p => ({
      ...p,
      audioUrl: p.audioUrl ? this.formatAudioUrl(p.audioUrl) : undefined
    }));
    
    console.log('Réponse du backend (list of plaintes):', response);
  } catch (error) {
    console.error('Erreur lors du chargement des plaintes:', error);
    this.plaintes = [];
  }
}

  private formatAudioUrl(audioUrl: string): string {
    // Si l'URL est déjà complète, la retourner
    if (audioUrl.startsWith('http')) {
      return audioUrl;
    }
    
    // Nettoyer l'URL de base et l'URL audio
    const baseUrl = this.backendBaseUrl.replace(/\/+$/, ''); // Enlever tous les slashes finaux
    const cleanAudioUrl = audioUrl.replace(/^\/+/, ''); // Enlever tous les slashes initiaux
    
    // Construire l'URL complète sans double slash
    return `${baseUrl}/${cleanAudioUrl}`;
  }

  // Méthode pour vérifier si l'audio est valide
  onAudioError(event: any, plainte: Plainte) {
    console.error('Erreur de lecture audio pour la plainte:', plainte.id, event);
    // Optionnel : masquer le lecteur audio en cas d'erreur
    // plainte.audioUrl = undefined;
  }

  onAudioLoad(event: any, plainte: Plainte) {
    console.log('Audio chargé avec succès pour la plainte:', plainte.id);
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
