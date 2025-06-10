import { Component, AfterViewInit, PLATFORM_ID, Inject, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-pwa-install-prompt',
  templateUrl: './pwa-install-prompt.component.html',
  styleUrls: ['./pwa-install-prompt.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class PwaInstallPromptComponent implements AfterViewInit, OnDestroy {
  deferredPrompt: any;
  showInstallButton = false;
  isBrowser: boolean;
  private beforeInstallPromptHandler: ((e: Event) => void) | null = null;
  private appInstalledHandler: (() => void) | null = null;
  private isLoginMarinPage = false;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    // S'abonner aux changements de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Vérifier si nous sommes sur la page login-marin
      this.isLoginMarinPage = event.url === '/login-marin';
      
      // Cacher le bouton si nous ne sommes pas sur login-marin
      if (!this.isLoginMarinPage) {
        this.showInstallButton = false;
      }
    });
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      // Attendre que le DOM soit complètement chargé
      setTimeout(() => {
        this.setupPwaInstall();
      }, 0);
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      if (this.beforeInstallPromptHandler) {
        window.removeEventListener('beforeinstallprompt', this.beforeInstallPromptHandler);
      }
      if (this.appInstalledHandler) {
        window.removeEventListener('appinstalled', this.appInstalledHandler);
      }
    }
  }

  private setupPwaInstall() {
    if (!this.isBrowser) return;

    this.beforeInstallPromptHandler = (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e;
      // Ne montrer le bouton que si nous sommes sur la page login-marin
      this.showInstallButton = this.isLoginMarinPage;
    };

    this.appInstalledHandler = () => {
      this.showInstallButton = false;
      this.deferredPrompt = null;
      console.log('PWA installée avec succès');
    };

    window.addEventListener('beforeinstallprompt', this.beforeInstallPromptHandler);
    window.addEventListener('appinstalled', this.appInstalledHandler);
  }

  async installPwa() {
    if (!this.isBrowser || !this.deferredPrompt) return;

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      console.log(`Résultat de l'installation: ${outcome}`);
      this.deferredPrompt = null;
      this.showInstallButton = false;
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error);
    }
  }
} 