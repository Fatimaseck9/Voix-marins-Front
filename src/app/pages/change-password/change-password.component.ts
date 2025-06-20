import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseService } from 'src/app/shared/base.service';
import { AuthService } from '../auth/auth.service';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm: FormGroup;
  message = { text: '', type: '' };
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private baseService: BaseService,
    private authService: AuthService,
    private router: Router
  ) {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      ]],
      confirmNewPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator.bind(this) });
  }

  ngOnInit() {}

  passwordMatchValidator(form: AbstractControl) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmNewPassword')?.value;
    const oldPassword = form.get('oldPassword')?.value;
    
    if (!newPassword || !confirmPassword) {
      return null;
    }
    
    if (newPassword === oldPassword) {
      return { sameAsOld: true };
    }
    
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  // Méthode pour déboguer l'état du formulaire
  debugFormState() {
    console.log('État du formulaire:', {
      valid: this.changePasswordForm.valid,
      invalid: this.changePasswordForm.invalid,
      errors: this.changePasswordForm.errors,
      oldPassword: {
        value: this.changePasswordForm.get('oldPassword')?.value,
        valid: this.changePasswordForm.get('oldPassword')?.valid,
        errors: this.changePasswordForm.get('oldPassword')?.errors
      },
      newPassword: {
        value: this.changePasswordForm.get('newPassword')?.value,
        valid: this.changePasswordForm.get('newPassword')?.valid,
        errors: this.changePasswordForm.get('newPassword')?.errors
      },
      confirmNewPassword: {
        value: this.changePasswordForm.get('confirmNewPassword')?.value,
        valid: this.changePasswordForm.get('confirmNewPassword')?.valid,
        errors: this.changePasswordForm.get('confirmNewPassword')?.errors
      }
    });
  }

  getPasswordStrength(password: string): number {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }

  onSubmit() {
    // Déboguer l'état du formulaire
    this.debugFormState();
    
    if (this.isSubmitting || this.changePasswordForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur de validation',
        text: 'Veuillez corriger les erreurs du formulaire.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2196F3'
      });
      console.log('Formulaire invalide ou en cours de soumission');
      return;
    }

    const { oldPassword, newPassword } = this.changePasswordForm.value;
    
    if (this.getPasswordStrength(newPassword) < 4) {
      Swal.fire({
        icon: 'error',
        title: 'Mot de passe faible',
        text: 'Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2196F3'
      });
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Session expirée',
        text: 'Votre session a expiré, veuillez vous reconnecter.',
        confirmButtonText: 'Se reconnecter',
        confirmButtonColor: '#2196F3'
      }).then(() => {
        window.location.href = 'https://gaalgui.sn/login-admin';
      });
      return;
    }

    try {
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.sub;

      this.isSubmitting = true;

      this.baseService.post(
        'auth/change-password',
        true,
        { 
          userId,
          oldPassword, 
          newPassword 
        }
      ).subscribe({
        next: (response: any) => {
          console.log('Réponse du serveur:', response);
          if (response?.data?.access_token) {
            // Mettre à jour les tokens via AuthService
            this.authService.setToken(response.data.access_token);
            if (response.data.refresh_token) {
              this.authService.setRefreshToken(response.data.refresh_token);
            }

            // Mettre à jour les informations utilisateur
            const decodedNewToken: any = jwtDecode(response.data.access_token);
            console.log('Nouveau token décodé:', decodedNewToken);
            
            const user = {
              id: decodedNewToken.sub,
              email: decodedNewToken.email,
              roles: decodedNewToken.role ? [decodedNewToken.role] : [],
              isActive: true
            };
            
            console.log('Utilisateur mis à jour:', user);
            
            // Mettre à jour le service d'authentification
            this.authService.setAccount(user);

            Swal.fire({
              icon: 'success',
              title: 'Succès !',
              text: 'Mot de passe modifié avec succès. Redirection en cours...',
              timer: 2000,
              showConfirmButton: false,
              confirmButtonColor: '#2196F3'
            });
            
            setTimeout(() => {
              this.router.navigate(['/admin/tableau-bord']).then(
                (success) => {
                  console.log('Redirection réussie:', success);
                },
                (error) => {
                  console.error('Erreur de redirection:', error);
                  window.location.href = 'https://gaalgui.sn/admin/tableau-bord';
                }
              );
            }, 2000);
          } else if (response?.status === 'success') {
            // Le serveur a confirmé le changement de mot de passe
            Swal.fire({
              icon: 'success',
              title: 'Succès !',
              text: 'Mot de passe modifié avec succès. Redirection en cours...',
              timer: 2000,
              showConfirmButton: false,
              confirmButtonColor: '#2196F3'
            });
            
            // Vérifier si l'utilisateur est toujours authentifié
            const currentToken = this.authService.getToken();
            if (currentToken) {
              console.log('Token actuel toujours valide, redirection vers tableau de bord');
              setTimeout(() => {
                // Essayer d'abord avec le router Angular
                console.log('Tentative de redirection avec router.navigate vers /admin/tableau-bord');
                this.router.navigate(['/admin/tableau-bord']).then(
                  (success) => {
                    console.log('Redirection vers tableau de bord réussie:', success);
                  },
                  (error) => {
                    console.error('Erreur de redirection vers tableau de bord:', error);
                    // En cas d'échec, essayer avec window.location
                    console.log('Tentative de redirection avec window.location');
                    window.location.href = 'https://gaalgui.sn/admin/tableau-bord';
                  }
                );
              }, 2000);
            } else {
              console.log('Token expiré, redirection vers login');
              setTimeout(() => {
                this.authService.logout();
                window.location.href = 'https://gaalgui.sn/login-admin';
              }, 2000);
            }
          } else {
            console.error('Réponse inattendue du serveur:', response);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors du changement de mot de passe.',
              confirmButtonText: 'OK',
              confirmButtonColor: '#2196F3'
            });
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: err.error?.message || 'Erreur lors du changement de mot de passe',
            confirmButtonText: 'OK',
            confirmButtonColor: '#2196F3'
          });
          if (err.status === 401) {
            // En cas d'erreur d'authentification, rediriger vers la page de connexion
            setTimeout(() => {
              this.authService.logout();
              window.location.href = 'https://gaalgui.sn/login-admin';
            }, 2000);
          }
          console.error('Erreur détaillée:', err);
        },
        complete: () => {
          this.isSubmitting = false;
        }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Token invalide',
        text: 'Token invalide, veuillez vous reconnecter.',
        confirmButtonText: 'Se reconnecter',
        confirmButtonColor: '#2196F3'
      }).then(() => {
        this.authService.logout();
        window.location.href = 'https://gaalgui.sn/login-admin';
      });
    }
  }

  // Getters pour la validation du formulaire
  get oldPasswordControl() { return this.changePasswordForm.get('oldPassword'); }
  get newPasswordControl() { return this.changePasswordForm.get('newPassword'); }
  get confirmNewPasswordControl() { return this.changePasswordForm.get('confirmNewPassword'); }
}