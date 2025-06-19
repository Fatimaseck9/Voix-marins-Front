import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseService } from 'src/app/shared/base.service';
import { AuthService } from '../auth/auth.service';
import { jwtDecode } from 'jwt-decode';

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
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {}

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmNewPassword')?.value;
    
    if (newPassword === form.get('oldPassword')?.value) {
      return { sameAsOld: true };
    }
    
    return newPassword === confirmPassword ? null : { mismatch: true };
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
    if (this.isSubmitting || this.changePasswordForm.invalid) {
      this.message = { text: 'Veuillez corriger les erreurs du formulaire.', type: 'error' };
      return;
    }

    const { oldPassword, newPassword } = this.changePasswordForm.value;
    
    if (this.getPasswordStrength(newPassword) < 4) {
      this.message = { 
        text: 'Le nouveau mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
        type: 'error'
      };
      return;
    }

    const token = this.authService.getToken();
    if (!token) {
      this.message = { text: 'Session expirée, veuillez vous reconnecter.', type: 'error' };
      window.location.href = 'https://gaalgui.sn/login-admin';
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

            this.message = { text: 'Mot de passe modifié avec succès. Redirection...', type: 'success' };
            
            console.log('Tentative de redirection vers /admin/tableau-bord');
            // Vérifier que le token est bien mis à jour
            const updatedToken = this.authService.getToken();
            console.log('Token après mise à jour:', updatedToken ? 'Présent' : 'Absent');
            
            setTimeout(() => {
              console.log('Exécution de la redirection...');
              this.router.navigate(['https://gaalgui.sn/admin/tableau-bord']).then(
                (success) => {
                  console.log('Redirection réussie:', success);
                },
                (error) => {
                  console.error('Erreur de redirection:', error);
                  // En cas d'échec, essayer une redirection alternative
                  console.log('Tentative de redirection alternative vers /admin/dashboard');
                  window.location.href = 'https://gaalgui.sn/admin/tableau-bord';
                }
              );
            }, 500); // Réduit de 1500ms à 500ms
          } else {
            console.error('Pas de token dans la réponse:', response);
          }
        },
        error: (err) => {
          this.isSubmitting = false;
          this.message = { 
            text: err.error?.message || 'Erreur lors du changement de mot de passe', 
            type: 'error' 
          };
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
      this.message = { text: 'Token invalide, veuillez vous reconnecter.', type: 'error' };
      this.authService.logout();
      window.location.href = 'https://gaalgui.sn/login-admin';
    }
  }

  // Getters pour la validation du formulaire
  get oldPasswordControl() { return this.changePasswordForm.get('oldPassword'); }
  get newPasswordControl() { return this.changePasswordForm.get('newPassword'); }
  get confirmNewPasswordControl() { return this.changePasswordForm.get('confirmNewPassword'); }
}