import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { Account } from 'src/app/models/account';
import { BaseService } from 'src/app/shared/base.service';
import { Router } from '@angular/router'; 
import { AuthService } from '../auth/auth.service';
import { SideBarService } from 'src/app/sidebar/sidebar.service';
import { jwtDecode } from 'jwt-decode';

declare var $: any;

@Component({
    selector: 'app-login-cmp',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
    test: Date = new Date();
    private toggleButton: any;
    private sidebarVisible: boolean;
    private nativeElement: Node;

    account: Account = new Account();
    user: any;

    message = {
        text: '',
        type: ''
    }

    constructor(
        private router: Router,
        private sideBarService: SideBarService,
        private element: ElementRef,
        private baseService: BaseService,
        private authService: AuthService
    ) {
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;

        // Vérifier si l'utilisateur est déjà connecté
        if (this.authService.isLoggedIn()) {
            this.redirectBasedOnUserStatus();
        }
    }

    private redirectBasedOnUserStatus(): void {
        const token = this.authService.getToken();
        if (!token) return;

        try {
            const decodedToken: any = jwtDecode(token);
            
            if (decodedToken.isActive) {
                console.log('Compte actif, redirection vers le tableau de bord');
                this.router.navigate(['/admin/tableau-bord']);
            } else {
                console.log('Compte inactif, redirection vers le changement de mot de passe');
                this.router.navigate(['/change-password']);
            }
        } catch (error) {
            console.error('Erreur lors de la redirection:', error);
            this.authService.logout();
        }
    }

    ngOnInit() {
        const navbar: HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        const body = document.getElementsByTagName('body')[0];
        body.classList.add('login-page');
        body.classList.add('off-canvas-sidebar');
        const card = document.getElementsByClassName('card')[0];
        setTimeout(function () {
            card.classList.remove('card-hidden');
        }, 700);
    }

    sidebarToggle() {
        const body = document.getElementsByTagName('body')[0];
        if (!this.sidebarVisible) {
            setTimeout(() => {
                this.toggleButton.classList.add('toggled');
            }, 500);
            body.classList.add('nav-open');
            this.sidebarVisible = true;
        } else {
            this.toggleButton.classList.remove('toggled');
            body.classList.remove('nav-open');
            this.sidebarVisible = false;
        }
    }

    ngOnDestroy() {
        const body = document.getElementsByTagName('body')[0];
        body.classList.remove('login-page');
        body.classList.remove('off-canvas-sidebar');
    }

    onLogin() {
        this.baseService.post('auth/login', false, {
            email: this.account.email,
            password: this.account.password,
            application: "jambars"
        }).subscribe({
            next: (res) => {
                if (res && res.data && res.data.access_token && res.data.refresh_token) {
                    const decodedToken: any = jwtDecode(res.data.access_token);

                    const user = {
                        id: decodedToken.sub || null,
                        email: decodedToken.email || this.account.email,
                        roles: decodedToken.role ? [decodedToken.role] : [],
                        isActive: decodedToken.isActive
                    };

                    // Mettre à jour les tokens via AuthService
                    this.authService.setToken(res.data.access_token);
                    this.authService.setRefreshToken(res.data.refresh_token);

                    // Mettre à jour le service d'authentification
                    this.authService.setAccount(user);

                    // Redirection basée sur isActive du token
                    if (user.isActive) {
                        console.log('Compte actif, redirection vers le tableau de bord');
                        this.router.navigate(['/admin/tableau-bord']).then(() => {
                            console.log('Navigation terminée');
                            // Attendre un peu pour s'assurer que les services sont initialisés
                            setTimeout(async () => {
                                // Réinitialiser le sidebar
                                await this.sideBarService.initialiseSideBar();
                            }, 100);
                        }).catch(err => {
                            console.error('Erreur de navigation:', err);
                        });
                    } else {
                        console.log('Compte inactif, redirection vers le changement de mot de passe');
                        this.router.navigate(['/change-password']);
                    }
                } else {
                    this.message.text = 'Une erreur est survenue, veuillez réessayer.';
                    this.message.type = 'error';
                    console.error('Réponse API invalide:', res);
                }
            },
            error: (err) => {
                this.message.text = err.error?.message || 'Identifiants incorrects';
                this.message.type = 'error';
                console.error('Erreur de connexion:', err);
            }
        });
    }
}
