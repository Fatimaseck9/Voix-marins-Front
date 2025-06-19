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
    this.loadAdmins();
  }

  loadAdmins() {
    this.loading = true;
    this.error = '';
    
    this.baseService.get('users/admins', true).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.admins = data;
        } else if (data && data.data && Array.isArray(data.data)) {
          this.admins = data.data;
        } else if (data && data.users && Array.isArray(data.users)) {
          this.admins = data.users;
        } else {
          this.admins = [];
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading admins:', err);
        this.error = 'Erreur lors du chargement des administrateurs: ' + (err.message || err.statusText || 'Erreur inconnue');
        this.loading = false;
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
