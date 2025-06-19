import { Component, OnInit } from '@angular/core';
import { BaseService } from 'src/app/shared/base.service';

@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html',
})
export class AdminListComponent implements OnInit {
  admins: any[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(private baseService: BaseService) {}

  ngOnInit(): void {
    console.log('AdminListComponent initialized');
    this.loadAdmins();
  }

  loadAdmins() {
    this.loading = true;
    this.error = '';
    
    console.log('Loading admins from endpoint: users/admins');
    console.log('Loading state set to:', this.loading);
    
    this.baseService.get('users/admins', true).subscribe({
      next: (data) => {
        console.log('Raw admins data:', JSON.stringify(data, null, 2));
        console.log('Data type:', typeof data);
        console.log('Is array:', Array.isArray(data));
        
        if (Array.isArray(data)) {
          this.admins = data;
        } else if (data && data.data && Array.isArray(data.data)) {
          this.admins = data.data;
        } else if (data && data.users && Array.isArray(data.users)) {
          this.admins = data.users;
        } else {
          console.warn('Unexpected data structure:', data);
          this.admins = [];
        }
        
        console.log('Processed admins:', this.admins);
        console.log('Admins length:', this.admins.length);
        this.loading = false;
        console.log('Loading state set to:', this.loading);
        console.log('Error state:', this.error);
      },
      error: (err) => {
        console.error('Error loading admins:', err);
        this.error = 'Erreur lors du chargement des administrateurs: ' + (err.message || err.statusText || 'Erreur inconnue');
        this.loading = false;
        console.log('Error occurred, loading set to:', this.loading);
        console.log('Error message:', this.error);
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
          alert('Erreur lors de la suppression: ' + (err.message || err.statusText || 'Erreur inconnue'));
        },
      });
    }
  }
}
