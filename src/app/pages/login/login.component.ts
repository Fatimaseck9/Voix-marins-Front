import { Component, OnInit, ElementRef, OnDestroy } from '@angular/core';
import { Account } from 'src/app/models/account';
import { BaseService } from 'src/app/shared/base.service';
import { Router } from '@angular/router'; 
import { AuthService } from '../auth/auth.service';

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

    constructor(private router: Router, private element: ElementRef, private baseService: BaseService, private authService: AuthService) {
        this.nativeElement = element.nativeElement;
        this.sidebarVisible = false;
    }

    ngOnInit() {
        var navbar : HTMLElement = this.element.nativeElement;
        this.toggleButton = navbar.getElementsByClassName('navbar-toggle')[0];
        const body = document.getElementsByTagName('body')[0];
        body.classList.add('login-page');
        body.classList.add('off-canvas-sidebar');
        const card = document.getElementsByClassName('card')[0];
        setTimeout(function() {
            // after 1000 ms we add the class animated to the login/register card
            card.classList.remove('card-hidden');
        }, 700);
    }

    sidebarToggle() {
        var toggleButton = this.toggleButton;
        var body = document.getElementsByTagName('body')[0];
        var sidebar = document.getElementsByClassName('navbar-collapse')[0];
        if (this.sidebarVisible == false) {
            setTimeout(function() {
                toggleButton.classList.add('toggled');
            }, 500);
            body.classList.add('nav-open');
            this.sidebarVisible = true;
        } else {
            this.toggleButton.classList.remove('toggled');
            this.sidebarVisible = false;
            body.classList.remove('nav-open');
        }
    }

    ngOnDestroy(){
      const body = document.getElementsByTagName('body')[0];
      body.classList.remove('login-page');
      body.classList.remove('off-canvas-sidebar');
    }

    updateLastLogin(id) {
        this.baseService.patch('Accounts/'+id,true,{lastLogin: new Date()})
        .subscribe(
            res=>{
            }
        )
    }

   
    onLogin() {
        // console.log('Username:', this.account.username);
        // console.log('Password:', this.account.password);
    
        this.baseService.post('Accounts/login?include=user', false, {username: this.account.username.toLocaleUpperCase(), password: this.account.password })
        .subscribe({
            next: (res) => {
               
                this.user = res.user;
                if (res.user && res.user.id) { // Vérifiez que l'objet 'user' et sa propriété 'id' ne sont pas null
                    if (this.account.username === this.account.password) {
                        this.authService.setTmpToken(res.id);
                     
                    } else {
                        this.authService.setToken(res.id);
                       
                    }
                    // Création du compte dans les cookies
                    this.authService.setAccount(res.user);
                    // Obtenir les rôles du compte
                    const currentAccount = this.authService.getCurrentAccount();
                    if (currentAccount && currentAccount.id) { // Vérifiez que 'currentAccount' et sa propriété 'id' ne sont pas null
                        this.baseService.get('Accounts/' + currentAccount.id + '/roles?filter={"include":["actions","sections"]}', true)
                        .subscribe({
                            next: (rolesRes) => {
                                this.authService.setAccountRoles(rolesRes);
                                if (this.account.username === this.account.password) {
                                    this.router.navigate(['/pages/register']);
                                } else if (!this.user.disabled) {
                                    this.updateLastLogin(this.user.id);
                                    this.authService.redirect();
                                } else {
                                    this.message.text = 'Ce compte a été désactivé';
                                    this.message.type = 'error';
                                }
                            },
                            error: (err) => {
                                console.error('Erreur lors de la récupération des rôles du compte :', err);
                            }
                        });
                    } else {
                        console.error('Erreur: Impossible de récupérer les rôles du compte, les données de compte sont invalides.');
                    }
                } else {
                    console.error('Erreur: Impossible de récupérer les rôles du compte, les données de l\'utilisateur sont invalides.');
                }
            },
            error: (err) => {
                this.message.text = 'Identifiants incorrects';
                this.message.type = 'error';
            }
        });
    }
  
}
