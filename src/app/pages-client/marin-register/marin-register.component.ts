import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MarinRegisterService } from 'src/app/servicesclient/marin-register.service';


@Component({
  selector: 'app-marin-register',
  templateUrl: './marin-register.component.html',
  styleUrls: ['./marin-register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class MarinRegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private marinRegisterService: MarinRegisterService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      numero: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const userData = {
        name: this.registerForm.get('name')?.value,
        numero: this.registerForm.get('numero')?.value
      };

      this.marinRegisterService.registerMarin(userData).subscribe({
        next: (response) => {
          this.successMessage = 'Inscription réussie !';
          setTimeout(() => {
            this.router.navigate(['/login-marin']);
          }, 2000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Une erreur est survenue lors de l\'inscription.';
          console.error('Erreur d\'inscription:', error);
        }
      });
    }
  }
} 