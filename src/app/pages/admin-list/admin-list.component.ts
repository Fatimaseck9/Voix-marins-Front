import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BaseService } from 'src/app/shared/base.service';

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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('AdminListComponent initialized');
    this.loadAdmins();
  }

  loadAdmins() {
    console.log('Loading admins...');
    this.loading = true;
    this.error = '';
    this.admins = [];
    
    // Forcer la détection de changement
    this.cdr.detectChanges();
    
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
            this.admins = possibleArrays[0];
          } else {
            this.admins = [data]; // Traiter comme un seul admin
          }
        } else {
          this.admins = [];
        }
        
        this.loading = false;
        console.log('Final admins array:', this.admins);
        console.log('Admins count:', this.admins.length);
        
        // Forcer la détection de changement
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading admins:', err);
        this.error = 'Erreur lors du chargement des administrateurs: ' + (err.message || err);
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
