import { Component, OnInit, ElementRef, OnDestroy, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-layout',
  templateUrl: './auth-layout.component.html'
})
export class AuthLayoutComponent implements OnInit, OnDestroy {
  private toggleButton: HTMLElement | null = null;
  private sidebarVisible = false;
  mobile_menu_visible = 0;
  private _router!: Subscription;
  private layer: HTMLElement | null = null;

  constructor(
    private router: Router, 
    private element: ElementRef,
    private renderer: Renderer2 // Ajout de Renderer2
  ) {}

  ngOnInit() {
    const navbar: HTMLElement = this.element.nativeElement;
    
    // Initialisation sécurisée
    this.toggleButton = navbar.querySelector('.navbar-toggler');
    
    this._router = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.safeSidebarClose();
      });
  }

  ngOnDestroy() {
    // Nettoyage des subscriptions et éléments DOM
    this._router?.unsubscribe();
    this.safeRemoveLayer();
  }

  private safeSidebarClose() {
    const body = document.body;
    
    if (this.toggleButton) {
      this.renderer.removeClass(this.toggleButton, 'toggled');
    }
    
    this.renderer.removeClass(body, 'nav-open');
    this.safeRemoveLayer();

    const allToggles = document.querySelectorAll('.navbar-toggler');
    allToggles.forEach(toggle => {
      this.renderer.removeClass(toggle, 'toggled');
    });

    this.sidebarVisible = false;
    this.mobile_menu_visible = 0;
  }

  private safeRemoveLayer() {
    if (this.layer) {
      this.renderer.removeChild(document.body, this.layer);
      this.layer = null;
    }
  }

  sidebarOpen() {
    const body = document.body;
    this.layer = this.renderer.createElement('div');
    
    if (!this.layer || !this.toggleButton) return;

    this.renderer.addClass(this.layer, 'close-layer');
    this.renderer.appendChild(body, this.layer);

    // Animation avec Renderer2
    setTimeout(() => {
      this.renderer.addClass(this.layer, 'visible');
    }, 100);

    this.renderer.listen(this.layer, 'click', () => {
      this.safeSidebarClose();
    });

    // Gestion des classes avec Renderer2
    this.renderer.addClass(body, 'nav-open');
    this.renderer.addClass(this.toggleButton, 'toggled');
    
    this.sidebarVisible = true;
    this.mobile_menu_visible = 1;
  }

  sidebarToggle() {
    if (this.sidebarVisible) {
      this.safeSidebarClose();
    } else {
      this.sidebarOpen();
    }
  }
}