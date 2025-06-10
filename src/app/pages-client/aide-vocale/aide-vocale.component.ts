import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-aide-vocale',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './aide-vocale.component.html',
  styleUrls: ['./aide-vocale.component.css']
})
export class AideVocaleComponent {
  @ViewChild('voiceGuide') audioPlayer!: ElementRef<HTMLAudioElement>;
  isPlaying = false;

  playPause() {
    if (this.audioPlayer.nativeElement.paused) {
      this.audioPlayer.nativeElement.play();
      this.isPlaying = true;
    } else {
      this.audioPlayer.nativeElement.pause();
      this.isPlaying = false;
    }

  }

  restart() {
    this.audioPlayer.nativeElement.currentTime = 0;
    this.audioPlayer.nativeElement.play();
    this.isPlaying = true;
  }

  playSection(section: string) {
   
    switch(section) {
      case 'declaration':
        this.audioPlayer.nativeElement.currentTime = 0;
        break;
      case 'reclamation':
        this.audioPlayer.nativeElement.currentTime = 30; 
        break;
      case 'paiement':
        this.audioPlayer.nativeElement.currentTime = 75; 
        break;
    }
    this.audioPlayer.nativeElement.play();
    this.isPlaying = true;
  }
  menuActive = false;

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