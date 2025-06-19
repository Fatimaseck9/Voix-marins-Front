import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlainteService } from 'src/app/services/plainte.service';
import { MarinService } from 'src/app/services/marin.service';

@Component({
  selector: 'app-ajouter-plainte-admin',
  templateUrl: './ajouter-plainte-admin.component.html',
  styleUrls: ['./ajouter-plainte-admin.component.css']
})
export class AjouterPlainteAdminComponent implements OnInit {
  plainteForm: FormGroup;
  successMessage = '';
  errorMessage = '';
  marinsAffichage: any[] = [];

  constructor(
    private fb: FormBuilder,
    private plainteService: PlainteService,
    private marinService: MarinService
  ) {
    this.plainteForm = this.fb.group({
      marinId: ['', Validators.required],
      titre: ['', Validators.required],
      categorie: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.marinService.getMarins().subscribe({
      next: (marins) => {
        this.marinsAffichage = marins.map(marin => ({
          id: marin.id,
          numero: marin.numero,
          name: marin.user?.name || 'Nom inconnu'
        }));
      },
      error: () => this.marinsAffichage = []
    });
  }

  onSubmit() {
    if (this.plainteForm.valid) {
      const formValue = { ...this.plainteForm.value, marinId: Number(this.plainteForm.value.marinId) };
      this.plainteService.submitPlainte(formValue).subscribe({
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