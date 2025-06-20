import { Component, OnInit, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AuthService } from 'src/app/servicesclient/auth.service';
import { PlainteService } from 'src/app/servicesclient/plainte.service';
import { environment } from 'src/environments/environment';

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

      // Utiliser le service pour récupérer les plaintes de l'utilisateur
      const response = await firstValueFrom(this.plainteService.getPlaintes());

      // Filtrer les plaintes pour l'utilisateur actuel
      this.plaintes = response
        .filter((p: any) => p.utilisateurId === userId || p.utilisateur === userId)
        .map((p: any) => {
          console.log('Plainte audio URL:', p.audioUrl); // 🔍 Ajout ici
          return {
            ...p,
            audioUrl: p.audioUrl ? `${environment.apiUrl}${p.audioUrl}` : undefined
          };
        });

      console.log('Réponse du backend (list of plaintes):', response); // Ajout
    } catch (error) {
      console.error('Erreur lors du chargement des plaintes:', error);
      this.plaintes = [];
    }
  }

  async annulerPlainte(plainte: Plainte) {
    if (confirm('Êtes-vous sûr de vouloir annuler cette plainte ?')) {
      try {
        // Utiliser le service pour supprimer la plainte
        await firstValueFrom(this.plainteService.supprimerPlainte(plainte.id));

        // Mettre à jour la liste locale
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

  // Méthode pour gérer les erreurs audio
  onAudioError(event: any, plainte: Plainte) {
    console.error('Erreur audio pour la plainte:', plainte.id, event);
    // Optionnel : afficher un message à l'utilisateur
    const audioElement = event.target;
    audioElement.style.display = 'none';
    
    // Créer un message d'erreur
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-warning mt-2';
    errorDiv.innerHTML = `
      <i class="fas fa-exclamation-triangle me-2"></i>
      Impossible de lire l'audio. 
      <a href="${plainte.audioUrl}" target="_blank" class="alert-link">Télécharger le fichier</a>
    `;
    audioElement.parentNode.appendChild(errorDiv);
  }

  // Méthode pour vérifier si l'audio est supporté
  isAudioSupported(): boolean {
    const audio = document.createElement('audio');
    return !!(audio.canPlayType && audio.canPlayType('audio/mpeg').replace(/no/, ''));
  }
}
