import { Component, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-appeler-anam',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './appeler-anam.component.html',
  styleUrls: ['./appeler-anam.component.css']
})
export class AppelerAnamComponent {
  menuActive = false;
  isMobile = false;
  phoneNumber = '+221338699999';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkDevice();
    }
  }

  private checkDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    this.isMobile = /android|iPad|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  }

  makePhoneCall() {
    if (this.isMobile) {
      window.location.href = `tel:${this.phoneNumber}`;
    } else {
      // Pour les appareils non-mobiles, on peut ouvrir un lien WhatsApp ou afficher un message
      window.open(`https://wa.me/${this.phoneNumber.replace('+', '')}`, '_blank');
    }
  }

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth > 768 && this.menuActive) {
      this.menuActive = false;
      document.body.style.overflow = '';
    }
  }
}
