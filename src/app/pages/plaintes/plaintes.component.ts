import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PlainteService } from 'src/app/services/plainte.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';
import { AuthService } from '../auth/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { AjouterPlainteAdminComponent } from '../ajouter-plainte-admin/ajouter-plainte-admin.component';
import { MarinService } from 'src/app/services/marin.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-plaintes',
  templateUrl: './plaintes.component.html',
  styleUrls: ['./plaintes.component.css']
})
export class PlaintesComponent implements OnInit, AfterViewInit {

  @ViewChild('richEditor', { static: false }) richEditor!: ElementRef;

  plaintes: any[] = [];
  selectedStatut: string = '';
  selectedCategorie: string = '';
  searchTerm: string = '';
  selectedPlainte: any = null;
  isEditModalOpen: boolean = false;
  showAlert: boolean = false;
  alertMessage: string = '';
  showModal = false;
  showSaveAlert = false;
  
  // Variable pour éviter les mises à jour en boucle
  private isUpdatingContent: boolean = false;

  selectedFile: File | null = null;

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '200px',
    minHeight: '0',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Entrez le texte...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    toolbarHiddenButtons: [
      ['insertImage', 'insertVideo']
    ],
    customClasses: [
      {
        name: 'highlight',
        class: 'highlight-text',
      }
    ]
  };

  marinsAffichage: any[] = [];
  nouvellePlainte = {
    marinId: '',
    titre: '',
    categorie: '',
    description: '',
    date: ''
  };

  constructor(
    private plainteService: PlainteService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
    private authService: AuthService,
    private cookieService: CookieService,
    private dialog: MatDialog,
    private marinService: MarinService
  ) {}

  ngOnInit(): void {
    this.plainteService.getAllPlaintes().subscribe({
      next: (data) => {
        console.log('Plaintes reçues du backend:', data);
        this.plaintes = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des plaintes:', err);
      }
    });
    this.marinService.getMarins().subscribe({
      next: (marins) => {
        this.marinsAffichage = marins;
      },
      error: () => this.marinsAffichage = []
    });
  }

  ngAfterViewInit(): void {
    // Initialiser l'éditeur après que la vue soit chargée
    if (this.richEditor && this.richEditor.nativeElement) {
      this.initializeEditor();
    }
  }

  private initializeEditor(): void {
    const editor = this.richEditor.nativeElement;
    
    // Ajouter des gestionnaires d'événements pour une meilleure expérience
    editor.addEventListener('paste', (e: ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/plain');
      if (text) {
        document.execCommand('insertText', false, text);
      }
    });

    // Gérer les raccourcis clavier
    editor.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            this.formatBold();
            break;
          case 'i':
            e.preventDefault();
            this.formatItalic();
            break;
          case 'u':
            e.preventDefault();
            this.formatUnderline();
            break;
        }
      }
    });
  }

  getFullAudioUrl(relativeUrl: string): string {
    if (!relativeUrl) return '';
    // Assurez-vous que l'URL ne commence pas déjà par http
    if (relativeUrl.startsWith('http')) return relativeUrl;
    return `${environment.apiUrl}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
  }

  traiterPlainte(plainte: any) {
    const updateData = {
      statut: plainte.statut,
      categorie: plainte.categorie,
      detailsplainte: plainte.detailsplainte
    };

    this.plainteService.updatePlainte(plainte.id, updateData).subscribe({
      next: (updated: any) => {
        console.log('Plainte traitée avec succès');
        plainte.statut = updated.statut;
        plainte.categorie = updated.categorie;
        plainte.detailsplainte = updated.detailsplainte;
        this.plaintes = [...this.plaintes];
      },
      error: (err) => {
        console.error('Erreur lors du traitement de la plainte :', err);
      }
    });
  }

  rechargerPlaintes() {
    this.plainteService.getAllPlaintes().subscribe({
      next: (data) => {
        this.plaintes = data;
      },
      error: (err) => {
        console.error('Erreur lors du rechargement des plaintes:', err);
      }
    });
  }

  resetFiltres(): void {
    this.selectedStatut = '';
    this.selectedCategorie = '';
    this.searchTerm = '';
  }

  get filteredPlaintes(): any[] {
    return this.plaintes.filter((plainte) => {
      const matchStatut = this.selectedStatut ? plainte.statut === this.selectedStatut : true;
      const matchCategorie = this.selectedCategorie ? plainte.categorie === this.selectedCategorie : true;
      const matchSearch = this.searchTerm
        ? plainte.titre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          plainte.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          plainte.utilisateur?.user?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          plainte.utilisateur?.numero?.toString().includes(this.searchTerm)
        : true;

      return matchStatut && matchCategorie && matchSearch;
    });
  }

  ouvrirModalEdition(plainte: any) {
    // Créer une copie de la plainte
    this.selectedPlainte = {
      ...plainte,
      detailsplainte: plainte.detailsplainte || '',
      // Ne garder le PV que si le statut est "Resolue"
      pvUrl: plainte.statut === 'Resolue' ? plainte.pvUrl : null
    };
    
    console.log('Modal ouvert avec plainte:', this.selectedPlainte);
    this.isEditModalOpen = true;
    
    // Attendre que le DOM soit mis à jour avant d'initialiser l'éditeur
    setTimeout(() => {
      if (this.richEditor && this.richEditor.nativeElement) {
        this.initializeEditor();
        // Définir le contenu initial sans utiliser innerHTML dans le template
        this.richEditor.nativeElement.innerHTML = this.selectedPlainte.detailsplainte;
      }
    }, 100);
  }

  fermerModal(): void {
    this.isEditModalOpen = false;
    this.selectedPlainte = null;
    this.isUpdatingContent = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format de fichier non supporté. Veuillez utiliser PDF, DOC ou DOCX.');
        return;
      }
      
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier est trop volumineux. Taille maximale : 5MB');
        return;
      }

      this.selectedFile = file;
    }
  }

  async ajouterPV() {
    // Vérifier si le statut est "Resolue"
    if (this.selectedPlainte?.statut !== 'Resolue') {
      Swal.fire({
        icon: 'warning',
        title: 'Action non autorisée',
        text: 'Le PV ne peut être ajouté que lorsque le statut est "Résolue".',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Créer un input file caché
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';
    input.style.display = 'none';
    document.body.appendChild(input);

    // Gérer la sélection du fichier
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Vérifier le type de fichier
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
          Swal.fire({
            icon: 'error',
            title: 'Format non supporté',
            text: 'Veuillez utiliser PDF, DOC ou DOCX.',
            confirmButtonText: 'OK'
          });
          return;
        }
        
        // Vérifier la taille du fichier (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          Swal.fire({
            icon: 'error',
            title: 'Fichier trop volumineux',
            text: 'Taille maximale : 5MB',
            confirmButtonText: 'OK'
          });
          return;
        }

        try {
          // Uploader le fichier
          const response = await firstValueFrom(
            this.plainteService.uploadPV(this.selectedPlainte.id, file)
          );

          if (response && response.pvUrl) {
            // Mettre à jour l'URL du PV dans la plainte
            this.selectedPlainte.pvUrl = response.pvUrl;
            
            // Forcer la mise à jour de l'affichage
            this.selectedPlainte = { ...this.selectedPlainte };
            
            // Afficher un message de succès
            Swal.fire({
              icon: 'success',
              title: 'Succès !',
              text: 'PV uploadé avec succès !',
              timer: 2000,
              showConfirmButton: false
            });
          }
        } catch (error) {
          console.error('Erreur lors de l\'upload du PV:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Erreur lors de l\'upload du PV. Veuillez réessayer.',
            confirmButtonText: 'OK'
          });
        }
      }
      // Nettoyer
      document.body.removeChild(input);
    };

    // Déclencher le sélecteur de fichier
    input.click();
  }

  // Vérifier si l'admin actuel est celui qui a résolu la plainte
  isCurrentAdminResolver(plainte: any): boolean {
    const currentAdmin = this.getCurrentAdmin();
    console.log('Admin actuel:', currentAdmin);
    console.log('Admin qui a résolu:', plainte.resolvedBy);
    
    if (!currentAdmin || !plainte.resolvedBy) return false;
    
    // Si l'email n'est pas défini dans resolvedBy, on ne peut pas comparer
    if (!plainte.resolvedBy.email) {
      console.log('Email non défini dans resolvedBy');
      return false;
    }
    
    const currentEmail = currentAdmin.email.toLowerCase();
    const resolverEmail = plainte.resolvedBy.email.toLowerCase();
    
    console.log('Comparaison des emails:', {
      currentEmail,
      resolverEmail,
      match: currentEmail === resolverEmail
    });
    
    return currentEmail === resolverEmail;
  }

  // Obtenir les informations de l'admin actuel
  getCurrentAdmin(): any {
    const token = this.cookieService.get('access_token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log('Token décodé:', decodedToken);
        
        if (decodedToken && typeof decodedToken === 'object') {
          const admin = {
            id: decodedToken['sub'],
            name: decodedToken['name'],
            email: decodedToken['email'],
            role: decodedToken['role']
          };
          console.log('Admin extrait:', admin);
          return admin;
        }
      } catch (error) {
        console.error('Erreur lors du décodage du token:', error);
      }
    }
    return null;
  }

  // Vérifier si une plainte peut être modifiée
  canModifyPlainte(plainte: any): boolean {
    // Si la plainte n'est pas résolue, n'importe quel admin peut la modifier
    if (plainte.statut !== 'Resolue') return true;
    
    // Si la plainte est résolue mais n'a pas d'admin assigné, n'importe quel admin peut la modifier
    if (!plainte.resolvedBy) return true;
    
    // Si la plainte est résolue, seul l'admin qui l'a résolue peut la modifier
    const currentAccount = this.authService.getCurrentAccount();
    const currentAdminId = currentAccount ? currentAccount.id : null;
    const resolvedById = typeof plainte.resolvedBy === 'object' ? plainte.resolvedBy.id : plainte.resolvedBy;
    
    console.log('Current Admin ID:', currentAdminId);
    console.log('Resolved By ID:', resolvedById);
    console.log('Can modify:', currentAdminId === resolvedById);
    
    return currentAdminId === resolvedById;
  }

  sauvegarderModifications() {
    if (!this.selectedPlainte) return;
          
    // Vérifier si la plainte peut être modifiée
    if (!this.canModifyPlainte(this.selectedPlainte)) {
          Swal.fire({
        icon: 'error',
        title: 'Modification impossible',
        text: 'Cette plainte a été résolue par un autre administrateur. Vous ne pouvez pas la modifier.',
        confirmButtonText: 'OK'
      });
      return;
    }

      const updateData = {
          statut: this.selectedPlainte.statut,
          categorie: this.selectedPlainte.categorie,
      detailsplainte: this.selectedPlainte.detailsplainte
    };

    // Si le statut est "Resolue", ajouter uniquement l'id de l'admin
    if (updateData.statut === 'Resolue') {
      const admin = this.getCurrentAdmin();
      console.log('Admin actuel lors de la résolution:', admin);
      
      if (admin) {
        updateData['resolvedBy'] = admin.id || admin.sub;
        updateData['dateResolution'] = new Date().toISOString();
        console.log('Données de résolution:', updateData);
      } else {
        console.error('Impossible de récupérer les informations de l\'admin');
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de récupérer les informations de l\'administrateur.',
          confirmButtonText: 'OK'
        });
        return;
      }
    }

    this.plainteService.updatePlainte(this.selectedPlainte.id, updateData).subscribe({
      next: (response) => {
        console.log('Réponse du serveur:', response);
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'La plainte a été mise à jour avec succès.',
          confirmButtonText: 'OK'
        });
        this.fermerModal();
      this.rechargerPlaintes();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
          text: 'Une erreur est survenue lors de la mise à jour de la plainte.',
        confirmButtonText: 'OK'
      });
    }
    });
  }

get nombreEnAttente(): number {
  return this.plaintes.filter(p => p.statut === 'En attente').length;
}

get nombreEnTraitement(): number {
  return this.plaintes.filter(p => p.statut === 'En traitement').length;
}

get nombreResolue(): number {
  return this.plaintes.filter(p => p.statut === 'Resolue').length;
}

get nombreTotal(): number {
  return this.plaintes.length;
}

  sanitizeHtml(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  // Sauvegarder la position du curseur
  private saveCaretPosition(): any {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  }

  // Restaurer la position du curseur
  private restoreCaretPosition(range: any): void {
    if (range) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }

  // Méthode pour gérer les changements dans l'éditeur SANS innerHTML
  onEditorContentChange(event: any) {
    if (!this.isUpdatingContent && this.selectedPlainte) {
      this.selectedPlainte.detailsplainte = event.target.innerHTML;
    }
  }

  // Méthode corrigée pour le formatage qui préserve le curseur
  applyFormat(command: string, value?: string) {
  console.log("Command:", command, "Value:", value);

  if (this.richEditor && this.richEditor.nativeElement) {
    this.richEditor.nativeElement.focus();
    
    try {
      const savedRange = this.saveCaretPosition();
      const success = document.execCommand(command, false, value || null);
      
      console.log("ExecCommand success:", success);

      if (success) {
        this.isUpdatingContent = true;
        this.selectedPlainte.detailsplainte = this.richEditor.nativeElement.innerHTML;

        setTimeout(() => {
          this.restoreCaretPosition(savedRange);
          this.isUpdatingContent = false;
        }, 10);
      } else {
        console.warn("Command did not succeed:", command);
      }
    } catch (error) {
      console.error('Erreur lors du formatage:', error);
      this.isUpdatingContent = false;
    }
  }
}

  // Méthodes spécifiques pour chaque type de formatage
  formatBold() {
    this.applyFormat('bold');
  }

  formatItalic() {
    this.applyFormat('italic');
  }

  formatUnderline() {
    this.applyFormat('underline');
  }

  formatStrikethrough() {
    this.applyFormat('strikeThrough');
  }

  insertOrderedList() {
    this.applyFormat('insertOrderedList');
  }

  insertUnorderedList() {
    this.applyFormat('insertUnorderedList');
  }

  formatColor(color: string) {
    this.applyFormat('foreColor', color);
  }

  formatHighlight(color: string) {
    this.applyFormat('backColor', color);
  }

  // Ajouter un getter pour le statut
  get selectedPlainteStatut(): string {
    return this.selectedPlainte?.statut || '';
  }

  // Ajouter un setter pour le statut
  set selectedPlainteStatut(value: string) {
  if (!this.selectedPlainte) return;

  const ancienStatut = this.selectedPlainte.statut;
  const pvExiste = !!this.selectedPlainte.pvUrl;

    // Si on passe d'un statut "Resolue" à un autre statut et qu'un PV existe
    if (ancienStatut === 'Resolue' && value !== 'Resolue' && pvExiste) {
      // Supprimer le PV immédiatement
      this.plainteService.deletePV(this.selectedPlainte.id).subscribe({
        next: async () => {
          // Mettre à jour l'état local
          this.selectedPlainte.pvUrl = null;
  this.selectedPlainte.statut = value;

          // Mettre à jour la base de données
          try {
            await firstValueFrom(
              this.plainteService.updatePlainte(this.selectedPlainte.id, {
                statut: value,
                categorie: this.selectedPlainte.categorie,
                detailsplainte: this.selectedPlainte.detailsplainte,
                pvUrl: null
              })
            );
            
            // Forcer la mise à jour de l'affichage
            this.selectedPlainte = { ...this.selectedPlainte };
            
            // Recharger les plaintes
            this.rechargerPlaintes();

        Swal.fire({
          icon: 'info',
              title: 'PV supprimé',
          text: 'Le PV a été supprimé car le statut a changé.',
          timer: 2000,
          showConfirmButton: false
        });
          } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            // En cas d'erreur, on revient au statut précédent
            this.selectedPlainte.statut = ancienStatut;
            this.selectedPlainte = { ...this.selectedPlainte };
          }
      },
      error: (err) => {
          console.error('Erreur lors de la suppression du PV:', err);
          // En cas d'erreur, on revient au statut précédent
          this.selectedPlainte.statut = ancienStatut;
          this.selectedPlainte = { ...this.selectedPlainte };
          
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
            text: 'Impossible de supprimer le PV. Le changement de statut a été annulé.',
          confirmButtonText: 'OK'
        });
      }
    });
    } else {
      // Si pas de PV à supprimer, on change simplement le statut
      this.selectedPlainte.statut = value;
    }
  }

  // Méthode pour vérifier si le PV doit être affiché
  shouldShowPV(): boolean {
    return this.selectedPlainte?.statut === 'Resolue' && !!this.selectedPlainte?.pvUrl;
  }

  // Méthode pour obtenir le nom du fichier PV
  getPVFileName(): string {
    if (!this.selectedPlainte?.pvUrl) return '';
    return this.selectedPlainte.pvUrl.split('/').pop() || '';
}

  // Retourne le nom du fichier à partir de l'URL
  getFileName(pvUrl: string): string {
    if (!pvUrl) return '';
    return pvUrl.split('/').pop() || pvUrl;
  }

  // Retourne l'URL complète du PV
  getFullPVUrl(pvUrl: string): string {
    if (!pvUrl) return '';
    return pvUrl.startsWith('http') ? pvUrl : `${environment.apiUrl}/${pvUrl}`;
  }

  // Modifier la méthode closeModal pour réinitialiser l'alerte
  closeModal() {
    this.showModal = false;
    this.showAlert = false; // Réinitialiser l'alerte lors de la fermeture du modal
    this.selectedPlainte = null;
  }

  // Supprimer le PV
  async supprimerPV() {
    if (!this.selectedPlainte?.pvUrl) return;

    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        // Appeler le service pour supprimer le PV
        await firstValueFrom(this.plainteService.deletePV(this.selectedPlainte.id));
        
        // Mettre à jour l'URL du PV dans la plainte
        this.selectedPlainte.pvUrl = null;
        
        // Forcer la mise à jour de l'affichage
        this.selectedPlainte = { ...this.selectedPlainte };
        
        // Afficher un message de succès
        Swal.fire({
          icon: 'success',
          title: 'Succès !',
          text: 'PV supprimé avec succès !',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Erreur lors de la suppression du PV:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors de la suppression du PV. Veuillez réessayer.',
          confirmButtonText: 'OK'
        });
      }
    }
  }

  onStatutChange(newStatut: string) {
    if (!this.selectedPlainte) return;

    const ancienStatut = this.selectedPlainte.statut;
    const pvExiste = !!this.selectedPlainte.pvUrl;

    // Si un PV existe, on le supprime quel que soit le changement de statut
    if (pvExiste) {
      // Supprimer le PV
      this.plainteService.deletePV(this.selectedPlainte.id).subscribe({
        next: () => {
          // Mettre à jour l'état local
          this.selectedPlainte.pvUrl = null;
          this.selectedPlainte.statut = newStatut;
          // Forcer la mise à jour de l'affichage
          this.selectedPlainte = { ...this.selectedPlainte };

          // Mettre à jour la base de données
          this.plainteService.updatePlainte(this.selectedPlainte.id, {
            statut: newStatut,
            categorie: this.selectedPlainte.categorie,
            detailsplainte: this.selectedPlainte.detailsplainte,
            pvUrl: null
          }).subscribe({
            next: () => {
              // Recharger les plaintes
              this.rechargerPlaintes();
              
              Swal.fire({
                icon: 'info',
                title: 'PV supprimé',
                text: 'Le PV a été supprimé car le statut a changé. Un nouveau PV devra être ajouté si nécessaire.',
                timer: 2000,
                showConfirmButton: false
              });
            },
            error: (err) => {
              console.error('Erreur lors de la mise à jour:', err);
              // En cas d'erreur, on revient au statut précédent
              this.selectedPlainte.statut = ancienStatut;
              this.selectedPlainte = { ...this.selectedPlainte };
            }
          });
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du PV:', err);
          // En cas d'erreur, on revient au statut précédent
          this.selectedPlainte.statut = ancienStatut;
          this.selectedPlainte = { ...this.selectedPlainte };
          
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de supprimer le PV. Le changement de statut a été annulé.',
            confirmButtonText: 'OK'
          });
        }
      });
    } else {
      // Si pas de PV à supprimer, on change simplement le statut
      this.selectedPlainte.statut = newStatut;
    }
  }

  loadPlaintes() {
    this.plainteService.getAllPlaintes().subscribe({
      next: (plaintes) => {
        console.log('Plaintes chargées:', plaintes);
        this.plaintes = plaintes;
        // Pas besoin d'appeler filterPlaintes car filteredPlaintes est un getter
      },
      error: (error) => {
        console.error('Erreur lors du chargement des plaintes:', error);
      }
    });
  }

  updatePlainte() {
    if (this.selectedPlainte) {
      // S'assurer que resolvedBy reste l'ID original
      const plainteToUpdate = {
        ...this.selectedPlainte,
        resolvedBy: this.selectedPlainte.resolvedBy ? 
          (typeof this.selectedPlainte.resolvedBy === 'object' ? 
            this.selectedPlainte.resolvedBy.id : 
            this.selectedPlainte.resolvedBy) : 
          null
      };
      
      console.log('Mise à jour de la plainte:', plainteToUpdate);
      
      this.plainteService.updatePlainte(this.selectedPlainte.id, plainteToUpdate).subscribe({
        next: (response) => {
          console.log('Plainte mise à jour avec succès:', response);
          // Afficher l'alerte de succès
          this.showSaveAlert = true;
          // Fermer le modal
          this.showModal = false;
          this.isEditModalOpen = false;
          // Recharger les plaintes
          this.loadPlaintes();
          // Masquer l'alerte après 3 secondes
          setTimeout(() => {
            this.showSaveAlert = false;
          }, 3000);
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de la plainte:', error);
          alert('Erreur lors de la mise à jour de la plainte');
        }
      });
    }
  }

  ouvrirAjoutPlainte(): void {
    const dialogRef = this.dialog.open(AjouterPlainteAdminComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.rechargerPlaintes(); // recharge la liste après ajout
      }
    });
  }

  ajouterPlainte() {
    if (!this.nouvellePlainte.marinId || !this.nouvellePlainte.titre || !this.nouvellePlainte.categorie || !this.nouvellePlainte.description || !this.nouvellePlainte.date) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs.', 'error');
      return;
    }
    const formValue = { ...this.nouvellePlainte, marinId: Number(this.nouvellePlainte.marinId) };
    this.plainteService.submitPlainte(formValue).subscribe({
      next: () => {
        Swal.fire('Succès', 'Plainte ajoutée avec succès !', 'success');
        this.nouvellePlainte = { marinId: '', titre: '', categorie: '', description: '', date: '' };
        
        // Fermer le modal Bootstrap
        const modalElement = document.getElementById('ajoutPlainteModal');
        if (modalElement) {
          const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          }
        }
        
        this.rechargerPlaintes();
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout de la plainte:', err);
        Swal.fire('Erreur', 'Erreur lors de l\'ajout de la plainte.', 'error');
      }
    });
  }
}