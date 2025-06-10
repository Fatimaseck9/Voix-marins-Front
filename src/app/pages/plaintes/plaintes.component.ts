import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PlainteService } from 'src/app/services/plainte.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-plaintes',
  templateUrl: './plaintes.component.html',
  styleUrls: ['./plaintes.component.css']
})
export class PlaintesComponent implements OnInit, AfterViewInit {

  @ViewChild('richEditor', { static: false }) richEditor!: ElementRef;

  plaintes: any[] = [];
  http: any;
  selectedStatut: string = '';
  selectedCategorie: string = '';
  searchTerm: string = '';
  selectedPlainte: any = null;
  isEditModalOpen: boolean = false;
  showAlert: boolean = false;
  alertMessage: string = '';
  
  // Variable pour éviter les mises à jour en boucle
  private isUpdatingContent: boolean = false;

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

  constructor(
    private plainteService: PlainteService,
    private sanitizer: DomSanitizer
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
  const fullUrl = `http://localhost:3001${relativeUrl}`;
  console.log('Audio URL:', fullUrl);
  return fullUrl;
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
    this.selectedPlainte = {
      ...plainte,
      detailsplainte: plainte.detailsplainte || ''
    };
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

  sauvegarderModifications(): void {
    const updateData = {
      statut: this.selectedPlainte.statut,
      categorie: this.selectedPlainte.categorie,
      detailsplainte: this.selectedPlainte.detailsplainte
    };

    this.plainteService.updatePlainte(this.selectedPlainte.id, updateData).subscribe({
      next: (updated: any) => {
        this.alertMessage = 'Plainte mise à jour avec succès !';
        this.showAlert = true;
        this.rechargerPlaintes();
        
        setTimeout(() => this.showAlert = false, 3000);
        this.fermerModal();
      },
      error: (err) => {
        this.alertMessage = 'Erreur lors de la mise à jour : ' + err.message;
        this.showAlert = true;
        setTimeout(() => this.showAlert = false, 5000);
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
}