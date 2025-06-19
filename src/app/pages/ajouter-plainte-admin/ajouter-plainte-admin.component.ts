import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlainteService } from 'src/app/services/plainte.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-ajouter-plainte-admin',
  templateUrl: './ajouter-plainte-admin.component.html',
  styleUrls: ['./ajouter-plainte-admin.component.css']
})
export class AjouterPlainteAdminComponent implements OnInit {
  plainteForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  marins: any[] = [];

  constructor(private fb: FormBuilder, private plainteService: PlainteService, private userService: UserService) {
    this.plainteForm = this.fb.group({
      marinId: ['', Validators.required],
      titre: ['', Validators.required],
      categorie: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.userService.getMarins().subscribe({
      next: (users) => {
        // Filtrer uniquement les utilisateurs ayant le rôle "marin"
        this.marins = users.filter(u => u.role === 'marin');
      },
      error: () => this.marins = []
    });
  }

  onSubmit() {
    if (this.plainteForm.valid) {
      this.plainteService.submitPlainte(this.plainteForm.value).subscribe({
        next: () => {
          this.successMessage = 'Plainte ajoutée avec succès !';
          this.errorMessage = '';
          this.plainteForm.reset();
        },
        error: (err) => {
          this.errorMessage = "Erreur lors de l'ajout de la plainte.";
          this.successMessage = '';
        }
      });
    }
  }
} 