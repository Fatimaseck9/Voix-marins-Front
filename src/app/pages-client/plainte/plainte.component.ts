import { Component, ViewChild, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import Swal from 'sweetalert2';
import { AuthService } from 'src/app/servicesclient/auth.service';
 
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
  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  recordingInterval: any;
  stream: MediaStream | null = null;
 
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
 
  private apiUrl = 'http://localhost:3001/plaintes';
 
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
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
 
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
      });
 
      const categories = await firstValueFrom(this.http.get<any[]>(`${this.apiUrl}/categories`, { headers }));
      if (categories && categories.length > 0) {
        this.categories = categories.map(cat => ({
          key: cat.key,
          label: cat.label,
          image: `${cat.key}.jpeg`.toLowerCase()
        }));
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
 
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth > 768 && this.menuActive) {
      this.menuActive = false;
      document.body.style.overflow = '';
    }
  }
 
  async startRecording() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.prepareRecorderUI();
 
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
 
      this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) this.audioChunks.push(event.data);
      };
 
      this.mediaRecorder.addEventListener('stop', () => this.finalizeRecording());
      this.mediaRecorder.start(1000);
      this.startTimer();
    } catch (error) {
      console.error('Erreur microphone:', error);
      Swal.fire({
        title: 'Microphone inaccessible',
        text: 'Veuillez autoriser l\'accès au microphone',
        icon: 'error'
      });
    }
  }
 
  private prepareRecorderUI() {
    this.showRecorderControls = true;
    this.showAudioControls = false;
    this.recording = true;
    this.paused = false;
    this.seconds = 0;
    this.audioChunks = [];
    if (this.audioUrl) URL.revokeObjectURL(this.audioUrl);
  }
 
  private finalizeRecording() {
    this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm;codecs=opus' });
    this.audioUrl = URL.createObjectURL(this.audioBlob);
    this.showAudioControls = true;
    this.showRecorderControls = false;
    clearInterval(this.recordingInterval);
    this.stopStream();
    setTimeout(() => this.replayRecording(), 300);
  }
 
  pauseRecording() {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.pause();
      this.recording = false;
      this.paused = true;
      clearInterval(this.recordingInterval);
    }
  }
 
  resumeRecording() {
    if (this.mediaRecorder?.state === 'paused') {
      this.mediaRecorder.resume();
      this.recording = true;
      this.paused = false;
      this.startTimer();
    }
  }
 
  stopRecording() {
    if (this.mediaRecorder && (this.recording || this.paused)) {
      this.mediaRecorder.stop();
      this.recording = false;
      this.paused = false;
      setTimeout(() => !this.showAudioControls && this.finalizeRecording(), 300);
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
 
      const formData = new FormData();
      const audioFile = new File([this.audioBlob], 'enregistrement.webm', { type: 'audio/webm' });
      formData.append('audio', audioFile);
      formData.append('titre', this.plainte.titre || 'Plainte vocale');
      formData.append('categorie', this.plainte.categorie || 'Enregistrement vocal');
      formData.append('description', this.plainte.description || 'Plainte enregistrée vocalement');
      formData.append('utilisateurId', userId);
 
      await firstValueFrom(
        this.http.post<PlainteResponse>(`${this.apiUrl}/create`, formData, {
          headers: new HttpHeaders({
            'Authorization': `Bearer ${token}`
          })
        })
      );
 
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
 
    await firstValueFrom(this.http.post<PlainteResponse>(
      `${this.apiUrl}/form`,
      { titre, categorie, description, date },
      { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) }
    ));
 
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
    this.audioChunks = [];
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
 
      await firstValueFrom(
        this.http.post<PlainteResponse>(
          `${this.apiUrl}/categorie/${categoryKey}`,
          { utilisateurId: userId },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );
 
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