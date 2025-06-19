import { Component, OnInit } from '@angular/core';
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

  constructor(private baseService: BaseService) {}

  ngOnInit(): void {
    console.log('AdminListComponent initialized');
    this.loadAdmins();
  }

  loadAdmins() {
    console.log('Loading admins...');
    this.loading = true;
    this.error = '';
    
    this.baseService.get('users/admins', true).subscribe({
      next: (data) => {
        console.log('Raw admins data:', JSON.stringify(data, null, 2));
        this.admins = data || [];
        this.loading = false;
        console.log('Admins loaded successfully, count:', this.admins.length);
      },
      error: (err) => {
        console.error('Error loading admins:', err);
        this.error = 'Erreur lors du chargement des administrateurs';
        this.loading = false;
        this.admins = [];
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
