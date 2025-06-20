import { Component, OnInit } from '@angular/core';
import { BaseService } from 'src/app/shared/base.service';
import Swal from 'sweetalert2';

interface Admin {
  id: number;
  name: string;
  role: string;
  admin: {
    id: number;
    email: string;
    isActive: boolean;
  } | null;
}

@Component({
  selector: 'app-admin-list',
  templateUrl: './admin-list.component.html',
  styleUrls: ['./admin-list.component.css']
})
export class AdminListComponent implements OnInit {
  admins: Admin[] = [];
  loading = false;
  error = '';

  constructor(private baseService: BaseService) {}

  ngOnInit() {
    this.loadAdmins();
  }

  loadAdmins() {
    this.loading = true;
    this.error = '';

    this.baseService.get('users/admins', true).subscribe({
      next: (response: any) => {
        console.log('Réponse des admins:', response);
        if (response?.success && response?.data) {
          this.admins = response.data;
        } else {
          this.error = 'Erreur lors du chargement des administrateurs';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des admins:', err);
        this.error = 'Erreur lors du chargement des administrateurs';
        this.loading = false;
      }
    });
  }

  toggleAdminStatus(admin: Admin) {
    if (!admin.admin) return;

    const action = admin.admin.isActive ? 'désactiver' : 'activer';
    
    Swal.fire({
      title: 'Confirmation',
      text: `Êtes-vous sûr de vouloir ${action} l'administrateur ${admin.name} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2196F3',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.performToggleStatus(admin.id);
      }
    });
  }

  private performToggleStatus(adminId: number) {
    this.baseService.patch(`users/${adminId}/toggle`, true, {}).subscribe({
      next: (response: any) => {
        console.log('Statut modifié:', response);
        Swal.fire({
          icon: 'success',
          title: 'Succès !',
          text: 'Le statut de l\'administrateur a été modifié avec succès.',
          confirmButtonColor: '#2196F3'
        });
        this.loadAdmins(); // Recharger la liste
      },
      error: (err) => {
        console.error('Erreur lors de la modification du statut:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la modification du statut.',
          confirmButtonColor: '#2196F3'
        });
      }
    });
  }

  deleteAdmin(admin: Admin) {
    Swal.fire({
      title: 'Confirmation de suppression',
      text: `Êtes-vous sûr de vouloir supprimer l'administrateur ${admin.name} ? Cette action est irréversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.performDelete(admin.id);
      }
    });
  }

  private performDelete(adminId: number) {
    this.baseService.delete(`users/${adminId}`, true).subscribe({
      next: (response: any) => {
        console.log('Admin supprimé:', response);
        Swal.fire({
          icon: 'success',
          title: 'Supprimé !',
          text: 'L\'administrateur a été supprimé avec succès.',
          confirmButtonColor: '#2196F3'
        });
        this.loadAdmins(); // Recharger la liste
      },
      error: (err) => {
        console.error('Erreur lors de la suppression:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la suppression de l\'administrateur.',
          confirmButtonColor: '#2196F3'
        });
      }
    });
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive ? 'badge-success' : 'badge-danger';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'Actif' : 'Inactif';
  }
} 