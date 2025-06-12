import { CommonModule } from '@angular/common';
import { Component, HostListener, ViewEncapsulation } from '@angular/core';
import { RouterModule,Router } from '@angular/router';
import { AuthService } from 'src/app/servicesclient/auth.service';

@Component({
  selector: 'app-home-marin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-marin.component.html',
  styleUrls: ['./home-marin.component.css'],

})
  

export class HomeMarinComponent {
  menuActive = false;
    constructor(
      private router: Router,
      private authService: AuthService
    ) {}


  toggleMenu() {
    this.menuActive = !this.menuActive;
  }
    goToHome() {
    // On reste sur la même page ou on navigue explicitement vers home-marin
    this.router.navigate(['/login-marin']);
  }

  logout() {
    this.authService.logout();
    // La redirection sera gérée par le service AuthService
  }

  @HostListener('window:resize', ['$event'])
onResize(event: Event) {
  if (window.innerWidth > 768 && this.menuActive) {
    this.menuActive = false;
    document.body.style.overflow = '';
  }
}



}
