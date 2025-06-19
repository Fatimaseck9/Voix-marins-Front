import { Component, OnInit } from '@angular/core';
import { BaseService } from 'src/app/shared/base.service';

@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html',
})
export class AdminListComponent implements OnInit {
  admins: any[] = [];

  constructor(private baseService: BaseService) {}

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins() {
    this.baseService.get('users/admins', true).subscribe({
      next: (data) => {
        console.log('Raw admins data:', JSON.stringify(data, null, 2));
        this.admins = data;
      },
      error: (err) => console.error('Error loading admins:', err),
    });
  }

  deleteAdmin(id: number) {
    if (confirm('Confirmer la suppression ?')) {
      this.baseService.delete(`users/${id}`, true).subscribe({
        next: () => {
          alert('Admin supprimé');
          this.loadAdmins();
        },
        error: (err) => console.error('Error deleting admin:', err),
      });
    }
  }
}
