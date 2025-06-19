import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BaseService } from 'src/app/shared/base.service';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.css']
})
export class AdminListComponent implements OnInit {
  admins: any[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(
    private baseService: BaseService,
    private cdr: ChangeDetectorRef,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    console.log('AdminListComponent initialized');
    
    // Vérifier le token
    const token = this.cookieService.get('access_token');
    console.log('Token présent:', !!token);
    if (token) {
      console.log('Token length:', token.length);
    }
    
    this.loadAdmins();
  }

  loadAdmins() {
    console.log('Loading admins...');
    this.loading = true;
    this.error = '';
    this.admins = [];
    
    // Forcer la détection de changement
    this.cdr.detectChanges();
    
    // Vérifier le token avant l'appel
    const token = this.cookieService.get('access_token');
    if (!token) {
      this.error = 'Token d\'authentification manquant. Veuillez vous reconnecter.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }
    
    this.baseService.get('users/admins', true).subscribe({
      next: (data) => {
        console.log('Raw admins data received:', data);
        console.log('Data type:', typeof data);
        console.log('Data length:', Array.isArray(data) ? data.length : 'Not an array');
        
        if (Array.isArray(data)) {
          this.admins = data;
        } else if (data && typeof data === 'object') {
          // Si c'est un objet, essayer de trouver un tableau à l'intérieur
          const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            this.admins = possibleArrays[0] as any[];
          } else {
            this.admins = [data]; // Traiter comme un seul admin
          }
        } else {
          this.admins = [];
        }
        
        this.loading = false;
        console.log('Final admins array:', this.admins);
        console.log('Admins count:', this.admins.length);
        
        // Log détaillé du premier admin pour debug
        if (this.admins.length > 0) {
          console.log('First admin structure:', this.admins[0]);
          console.log('First admin name:', this.admins[0].name);
          console.log('First admin email:', this.admins[0].admin?.email);
          console.log('First admin role:', this.admins[0].role);
          console.log('First admin isActive:', this.admins[0].admin?.isActive);
        }
        
        // Forcer la détection de changement
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading admins:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        
        if (err.status === 401) {
          this.error = 'Token expiré ou invalide. Veuillez vous reconnecter.';
        } else if (err.status === 403) {
          this.error = 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
        } else {
          this.error = 'Erreur lors du chargement des administrateurs: ' + (err.message || err);
        }
        
        this.loading = false;
        this.admins = [];
        this.cdr.detectChanges();
      },
    });
  }

  deleteAdmin(id: number) {
    if (confirm('Confirmer la suppression ?')) {
      this.baseService.delete(`users/${id}`, true).subscribe({
        next: () => {
          alert('Admin supprimé');
          this.loadAdmins();
        },
        error: (err) => {
          console.error('Error deleting admin:', err);
          alert('Erreur lors de la suppression');
        },
      });
    }
  }
}
