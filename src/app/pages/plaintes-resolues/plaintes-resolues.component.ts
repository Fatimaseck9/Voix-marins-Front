import { Component, OnInit } from '@angular/core';
import { PlainteService } from '../../services/plainte.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-plaintes-resolues',
  templateUrl: './plaintes-resolues.component.html',
  styleUrls: ['./plaintes-resolues.component.css']
})
export class PlaintesResoluesComponent implements OnInit {
  plaintes: any[] = [];
  filteredPlaintes: any[] = [];
  searchTerm: string = '';
  selectedCategorie: string = '';
  selectedPlainte: any = null;
  showModal = false;

  constructor(
    private plainteService: PlainteService,
    private sanitizer: DomSanitizer,
    private router: Router,
    private http: HttpClient,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    this.loadPlaintesResolues();
  }

  loadPlaintesResolues() {
    this.plainteService.getPlaintesResolues().subscribe({
      next: (plaintes) => {
        console.log('Plaintes résolues chargées:', plaintes);
        this.plaintes = plaintes;
        this.filterPlaintes();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des plaintes résolues:', error);
      }
    });
  }

  filterPlaintes() {
    this.filteredPlaintes = this.plaintes.filter(plainte => {
      const matchSearch = this.searchTerm
        ? plainte.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          plainte.description.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;

      const matchCategorie = this.selectedCategorie
        ? plainte.categorie === this.selectedCategorie
        : true;

      return matchSearch && matchCategorie;
    });
  }

  getCategoryLabel(categorie: string): string {
    const labels: { [key: string]: string } = {
      'harcelement': 'Harcèlement',
      'violence': 'Violence physique',
      'nourriture': 'Refus de nourriture',
      'paiement': 'Problème de paiement'
    };
    return labels[categorie] || categorie;
  }

  getCategoryClass(categorie: string): string {
    const classes: { [key: string]: string } = {
      'harcelement': 'bg-danger',
      'violence': 'bg-warning',
      'nourriture': 'bg-info',
      'paiement': 'bg-primary'
    };
    return classes[categorie] || 'bg-secondary';
  }

  voirDetails(plainte: any) {
    console.log('Détails de la plainte:', plainte);
    
    // Récupérer les informations de l'admin à partir du token
    const token = this.cookieService.get('access_token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log('Token décodé:', decodedToken);
        
        if (decodedToken && typeof decodedToken === 'object') {
          // Si l'ID de l'admin correspond à celui qui a résolu la plainte
          if (decodedToken['sub'] === plainte.resolvedBy?.id) {
            this.selectedPlainte = {
              ...plainte,
              resolvedBy: {
                id: decodedToken['sub'],
                name: decodedToken['name'],
                email: decodedToken['email'],
                role: decodedToken['role']
              }
            };
          } else {
            // Si ce n'est pas le même admin, on garde les informations de base
            this.selectedPlainte = plainte;
          }
        }
      } catch (error) {
        console.error('Erreur lors du décodage du token:', error);
        this.selectedPlainte = plainte;
      }
    } else {
      this.selectedPlainte = plainte;
    }
    
    this.showModal = true;
  }

  fermerModal() {
    this.showModal = false;
    this.selectedPlainte = null;
  }

  getFileName(pvUrl: string): string {
    if (!pvUrl) return '';
    return pvUrl.split('/').pop() || pvUrl;
  }

  getFullPVUrl(pvUrl: string): string {
    if (!pvUrl) return '';
    return pvUrl.startsWith('http') ? pvUrl : `https://api.gaalgui.sn/${pvUrl}`;
  }

  telechargerPV(plainte: any) {
    if (plainte.pvUrl) {
      const fullUrl = this.getFullPVUrl(plainte.pvUrl);
      console.log('Téléchargement du PV:', fullUrl);
      window.open(fullUrl, '_blank');
    } else {
      console.error('Aucun PV disponible pour cette plainte');
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Aucun PV disponible pour cette plainte.',
        confirmButtonText: 'OK'
      });
    }
  }

  // Obtenir les informations de l'admin actuel
  getCurrentAdmin(): any {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const decodedToken = jwtDecode(token);
      if (decodedToken && typeof decodedToken === 'object') {
        return {
          name: decodedToken['username'],
          email: decodedToken['email'],
          role: decodedToken['role'] || 'admin'
        };
      }
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
    }
    return null;
  }

  // Vérifier si l'admin actuel est celui qui a résolu la plainte
  isCurrentAdminResolver(plainte: any): boolean {
    const currentAdmin = this.getCurrentAdmin();
    if (!currentAdmin || !plainte.resolvedBy) return false;
    
    // Vérifier si l'email de l'admin actuel correspond à celui qui a résolu la plainte
    return currentAdmin.email === plainte.resolvedBy.email;
  }

  // Vérifier si une plainte peut être modifiée
  canModifyPlainte(plainte: any): boolean {
    // Si la plainte n'est pas résolue, elle peut être modifiée
    if (plainte.statut !== 'Resolue') return true;
    
    // Si la plainte est résolue, seul l'admin qui l'a résolue peut la modifier
    return this.isCurrentAdminResolver(plainte);
  }

  sanitizeHtml(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
