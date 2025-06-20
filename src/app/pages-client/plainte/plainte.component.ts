import { Component, ViewChild, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import Swal from 'sweetalert2';
import { AuthService } from 'src/app/servicesclient/auth.service';
import { PlainteService } from 'src/app/servicesclient/plainte.service';
import Recorder from 'recorder-js';
 
// Interface pour la réponse du serveur
interface PlainteResponse {
  audioUrl: string;
  id?: string;
  titre?: string;
  categorie?: string;
  description?: string;
  date?: string;
  statut?: string;
}
 
@Component({
  selector: 'app-plainte',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './plainte.component.html',
  styleUrls: ['./plainte.component.css']
})
export class PlainteComponent {
  @ViewChild('audioPlayer') audioPlayer!: ElementRef<HTMLAudioElement>;
 
  menuActive = false;
  plaintes: any[] = [];
  isBrowser: boolean;
 
  // États d'enregistrement
  recording = false;
  paused = false;
  showRecorderControls = false;
  showAudioControls = false;
  seconds = 0;
  isSubmitting = false;
 
  // Audio
  audioBlob: Blob | null = null;
  audioUrl = '';
  recordingInterval: any;
  stream: MediaStream | null = null;

  private recorder: Recorder | null = null;
  private audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
 
  // Formulaire
  showForm = false;
  plainte = {
    titre: '',
    categorie: '',
    description: '',
    date: ''
  };
 
  categories = [
    { key: 'harcelement', label: 'Harcèlement', image: 'harcelement.jpeg' },
    { key: 'violence', label: 'Violence physique', image: 'violence.jpeg' },
    { key: 'nourriture', label: 'Refus de nourriture', image: 'nourriture.jpeg' },
    { key: 'paiement', label: 'Problème de paiement', image: 'paiement.jpeg' }
  ];
 
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService,
    private plainteService: PlainteService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      // Test de compatibilité audio pour diagnostic
      const compatibility = this.testAudioCompatibility();
      console.log('Compatibilité audio:', compatibility);
      
      this.loadPlaintes();
      this.loadCategoriesFromBackend();
    }
  }
 
  private async loadCategoriesFromBackend() {
    try {
      if (!this.authService.isLoggedIn()) {
        console.warn('Utilisateur non connecté. Veuillez vous connecter.');
        return;
      }
 
      const token = await firstValueFrom(this.authService.getToken());
      if (!token) {
        Swal.fire({
          title: 'Erreur',
          text: 'Token invalide. Vérifiez votre connexion.',
          icon: 'error'
        });
        return;
      }
 
      console.log('Chargement des catégories avec authentification...');
      
      const categories = await firstValueFrom(this.plainteService.getCategories());
      
      console.log('Catégories reçues:', categories);
      
      if (categories && categories.length > 0) {
        this.categories = categories.map(cat => ({
          key: cat.key,
          label: cat.label,
          image: `${cat.key}.jpeg`.toLowerCase()
        }));
        console.log('Catégories traitées:', this.categories);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      Swal.fire({
        title: 'Erreur',
        text: 'Erreur lors du chargement des catégories',
        icon: 'error'
      });
    }
  }
 
  toggleMenu() {
    this.menuActive = !this.menuActive;
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
 
  // Vérifier les permissions microphone
  async checkMicrophonePermission(): Promise<boolean> {
    try {
      if (!navigator.permissions) {
        return true; // Si l'API permissions n'est pas disponible, on essaie quand même
      }
      
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return permission.state === 'granted';
    } catch (error) {
      console.log('Permission API non disponible:', error);
      return true; // On essaie quand même
    }
  }
 
  // Tester le microphone (spécialement pour mobile)
  async testMicrophone() {
    try {
      Swal.fire({
        title: 'Test du microphone',
        text: 'Test de l\'accès au microphone en cours...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Test réussi, arrêter le stream
      stream.getTracks().forEach(track => track.stop());

      Swal.fire({
        title: '✅ Microphone fonctionnel !',
        text: 'Votre microphone fonctionne correctement. Vous pouvez maintenant enregistrer votre plainte.',
        icon: 'success',
        confirmButtonText: 'Parfait !',
        timer: 3000
      });

    } catch (error: any) {
      console.error('Test microphone échoué:', error);
      
      let errorMessage = 'Impossible d\'accéder au microphone.';
      let instructions = '';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'L\'accès au microphone a été refusé.';
        instructions = 'Veuillez :\n1. Recharger la page\n2. Cliquer sur "Autoriser" quand le navigateur demande l\'accès\n3. Réessayer';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Aucun microphone détecté.';
        instructions = 'Vérifiez que votre appareil dispose d\'un microphone.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Votre navigateur ne supporte pas l\'enregistrement.';
        instructions = 'Essayez avec Chrome, Firefox ou Safari.';
      }

      Swal.fire({
        title: '❌ Test échoué',
        text: errorMessage + '\n\n' + instructions,
        icon: 'error',
        confirmButtonText: 'Compris',
        footer: 'Conseil : Rechargez la page et autorisez l\'accès au microphone'
      });
    }
  }

  // Méthode pour tester la compatibilité audio
  testAudioCompatibility() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    console.log('Détection appareil:', {
      isIOS,
      isSafari,
      userAgent: navigator.userAgent,
      mediaDevices: !!navigator.mediaDevices,
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      AudioContext: !!window.AudioContext,
      webkitAudioContext: !!(window as any).webkitAudioContext
    });

    // Test des formats supportés
    const audio = document.createElement('audio');
    const formats = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav'];
    const supportedFormats: string[] = [];
    
    formats.forEach(format => {
      const result = audio.canPlayType(format);
      if (result === 'probably' || result === 'maybe') {
        supportedFormats.push(format);
      }
    });

    console.log('Formats audio supportés:', supportedFormats);

    return {
      isIOS,
      isSafari,
      hasMediaDevices: !!navigator.mediaDevices,
      hasGetUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      hasAudioContext: !!window.AudioContext,
      hasWebkitAudioContext: !!(window as any).webkitAudioContext,
      supportedFormats
    };
  }
 
  // Démarrer l'enregistrement avec recorder-js
  async startRecording() {
    try {
      // Vérification des permissions en premier
      const hasPermission = await this.checkMicrophonePermission();
      if (!hasPermission) {
        Swal.fire({
          title: 'Permission requise',
          text: 'Cette application a besoin d\'accéder à votre microphone pour enregistrer votre plainte.',
          icon: 'info',
          confirmButtonText: 'Autoriser l\'accès'
        });
      }

      // Vérifier si getUserMedia est disponible
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported');
      }

      // Configuration audio avec fallback pour mobile
      const audioConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      };

      this.stream = await navigator.mediaDevices.getUserMedia(audioConstraints);
      
      // Initialiser recorder-js
      this.recorder = new Recorder(this.audioContext, { type: 'audio/wav' });
      await this.recorder.init(this.stream);
      this.recorder.start();

      this.prepareRecorderUI();
    } catch (error: any) {
      console.error('Erreur microphone:', error);
      let errorMessage = 'Veuillez autoriser l\'accès au microphone';
      let errorTitle = 'Microphone inaccessible';
 
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'L\'accès au microphone a été refusé...';
        errorTitle = 'Permission refusée';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Aucun microphone détecté.';
        errorTitle = 'Microphone non trouvé';
      }
 
      Swal.fire({
        title: errorTitle,
        text: errorMessage,
        icon: 'error',
        confirmButtonText: 'Compris',
        footer: 'Essayez de recharger la page et d\'autoriser l\'accès au micro.'
      });
    }
  }
 
  private prepareRecorderUI() {
    this.showRecorderControls = true;
    this.showAudioControls = false;
    this.recording = true;
    this.paused = false;
    this.seconds = 0;
    if (this.audioUrl) URL.revokeObjectURL(this.audioUrl);
    this.startTimer();
  }
 
  pauseRecording() {
    if (this.recorder && this.recording) {
      this.recorder.pause();
      this.recording = false;
      this.paused = true;
      clearInterval(this.recordingInterval);
    }
  }
 
  resumeRecording() {
    if (this.recorder && this.paused) {
      this.recorder.resume();
      this.recording = true;
      this.paused = false;
      this.startTimer();
    }
  }
 
  async stopRecording() {
    if (this.recorder) {
      try {
        const { blob } = await this.recorder.stop();
        this.audioBlob = blob;
        this.audioUrl = URL.createObjectURL(blob);
        this.showRecorderControls = false;
        this.showAudioControls = true;
      this.recording = false;
      this.paused = false;
        this.stopStream();
        this.replayRecording();
        clearInterval(this.recordingInterval);
      } catch (error) {
        console.error('Erreur lors de l\'arrêt de l\'enregistrement:', error);
      }
    }
  }
 
  replayRecording() {
    if (this.audioPlayer?.nativeElement && this.audioUrl) {
      const player = this.audioPlayer.nativeElement;
      player.currentTime = 0;
      player.play().catch(e => console.error('Erreur lecture:', e));
    }
  }
 
  private startTimer() {
    this.recordingInterval = setInterval(() => this.seconds++, 1000);
  }
 
  private stopStream() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
  }
 
  async sendRecording() {
    if (!this.audioBlob) {
      Swal.fire({
        title: 'Aucun enregistrement',
        text: 'Veuillez effectuer un enregistrement audio',
        icon: 'warning'
      });
      return;
    }

    this.isSubmitting = true;
    Swal.fire({
      title: 'Envoi en cours...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const token = this.authService.getStoredToken();
      if (!token) {
        Swal.fire({
          title: 'Erreur',
          text: 'Erreur d\'authentification. Veuillez vous reconnecter.',
          icon: 'error'
        });
        return;
      }

      const userPayload = this.authService.decodeToken(token);
      const userId = userPayload ? userPayload.sub : null;

      if (!userId) {
        Swal.fire({
          title: 'Erreur',
          text: 'Erreur lors de la récupération de l\'ID utilisateur.',
          icon: 'error'
        });
        return;
      }

      const plainteData = {
        titre: this.plainte.titre || 'Plainte vocale',
        categorie: this.plainte.categorie || 'Enregistrement vocal',
        description: this.plainte.description || 'Plainte enregistrée vocalement',
        utilisateurId: userId
      };

      const audioFile = new File([this.audioBlob], 'enregistrement.wav', { type: 'audio/wav' });

      await firstValueFrom(this.plainteService.submitPlainte(plainteData, audioFile));

      Swal.fire({
        title: 'Succès',
        text: 'Enregistrement envoyé avec succès ✅',
        icon: 'success'
      }).then(() => {
        this.resetRecording();
        this.router.navigate(['marin/suivre-plaintes']);
      });
    } catch (error: any) {
      console.error('Erreur:', error);
      Swal.fire({
        title: 'Erreur',
        text: 'Erreur lors de l\'envoi de la plainte',
        icon: 'error'
      });
    } finally {
      this.isSubmitting = false;
      Swal.close();
    }
  }

  async submitForm() {
    const { titre, categorie, description, date } = this.plainte;

    if (!titre || !categorie || !description || !date) {
      Swal.fire({
        title: 'Champs manquants',
        text: 'Veuillez remplir tous les champs',
        icon: 'warning'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Confirmer la soumission',
      text: 'Voulez-vous vraiment soumettre cette plainte ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui, soumettre',
      cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) {
      return; // L'utilisateur a annulé
    }

    this.isSubmitting = true;

    Swal.fire({
      title: 'Envoi en cours...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const token = await firstValueFrom(this.authService.getToken());
      if (!token) {
        Swal.fire({
          title: 'Erreur',
          text: 'Erreur d\'authentification. Veuillez vous reconnecter.',
          icon: 'error'
        });
        return;
      }

      // Utiliser le service pour soumettre le formulaire
      const plainteData = { titre, categorie, description, date };
      await firstValueFrom(this.plainteService.submitPlainte(plainteData));

      Swal.fire({
        title: 'Succès',
        text: 'Plainte soumise avec succès ✅',
        icon: 'success'
      }).then(() => {
        this.resetForm();
        this.router.navigate(['marin/suivre-plaintes']);
      });
    } catch (error: any) {
      console.error('Erreur:', error);
      Swal.fire({
        title: 'Erreur',
        text: 'Erreur lors de la soumission de la plainte',
        icon: 'error'
      });
    } finally {
      this.isSubmitting = false;
      Swal.close();
    }
  }
 
  deleteRecording() {
    Swal.fire({
      title: 'Supprimer l\'enregistrement',
      text: 'Êtes-vous sûr de vouloir supprimer cet enregistrement ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.audioUrl) URL.revokeObjectURL(this.audioUrl);
        this.resetRecording();
        Swal.fire('Supprimé!', 'Votre enregistrement a été supprimé.', 'success');
      }
    });
  }
 
  private resetRecording() {
    this.recording = false;
    this.paused = false;
    this.showRecorderControls = false;
    this.showAudioControls = false;
    this.audioBlob = null;
    this.audioUrl = '';
    this.seconds = 0;
    clearInterval(this.recordingInterval);
    this.stopStream();
  }
 
  toggleForm() {
    this.showForm = !this.showForm;
  }
 
  cancelForm() {
    Swal.fire({
      title: 'Annuler la plainte',
      text: 'Êtes-vous sûr de vouloir annuler ? Tous les changements seront perdus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non, continuer'
    }).then((result) => {
      if (result.isConfirmed) {
        this.resetForm();
      }
    });
  }
 
  private resetForm() {
    this.plainte = { titre: '', categorie: '', description: '', date: '' };
    this.showForm = false;
  }
 
  private async loadPlaintes() {
    if (this.isBrowser) {
      const saved = localStorage.getItem('plaintes');
      this.plaintes = saved ? JSON.parse(saved) : [];
    }
  }
 
  private getCategoryLabel(key: string): string {
    return this.categories.find(cat => cat.key === key)?.label || '';
  }
 
  async selectCategory(categoryKey: string) {
    const result = await Swal.fire({
      title: 'Confirmation',
      text: `Soumettre une plainte "${this.getCategoryLabel(categoryKey)}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non'
    });

    if (!result.isConfirmed) return;

    this.isSubmitting = true;
    Swal.fire({
      title: 'Envoi en cours...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    try {
      const userId = this.authService.getUserId();
      const token = this.authService.getStoredToken();

      if (!userId || !token) {
        Swal.fire({
          title: 'Erreur',
          text: 'Utilisateur non identifié. Veuillez vous reconnecter.',
          icon: 'error'
        });
        return;
      }

      // Utiliser le service pour soumettre par catégorie
      const plainteData = { utilisateurId: userId };
      await firstValueFrom(this.plainteService.submitPlainte(plainteData));

      Swal.fire({
        title: 'Succès',
        text: 'Plainte soumise avec succès ✅',
        icon: 'success'
      }).then(() => {
        this.router.navigate(['marin/suivre-plaintes']);
      });
    } catch (error: any) {
      console.error('Erreur:', error);

      if (error.error?.message === 'Catégorie non trouvée') {
        Swal.fire({
          title: 'Erreur',
          text: 'La catégorie sélectionnée n\'existe pas',
          icon: 'error'
        });
      } else if (error.status === 401) {
        Swal.fire({
          title: 'Non autorisé',
          text: 'Veuillez vous reconnecter.',
          icon: 'error'
        });
      } else {
        Swal.fire({
          title: 'Erreur',
          text: 'Erreur lors de la soumission de la plainte',
          icon: 'error'
        });
      }
    } finally {
      this.isSubmitting = false;
      Swal.close();
    }
  }
 
  currentTime: number = 0;
  duration: number = 0;
  isPlaying: boolean = false;
 
  onPlay() {
    this.isPlaying = true;
  }
 
  onPause() {
    this.isPlaying = false;
  }
 
  onTimeUpdate() {
    if (this.audioPlayer?.nativeElement) {
      this.currentTime = this.audioPlayer.nativeElement.currentTime;
      this.duration = this.audioPlayer.nativeElement.duration;
    }
  }
 
  onAudioEnded() {
    this.isPlaying = false;
    this.currentTime = 0;
    console.log("Lecture terminée");
  }
}