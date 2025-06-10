import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { PlainteService } from 'src/app/services/plainte.service';
import { Chart, registerables, ChartConfiguration } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-tableau-de-bord',
  templateUrl: './tableau-de-bord.component.html',
  styleUrls: ['./tableau-de-bord.component.css']
})
export class TableauDeBordComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('categoriesChart', { static: false }) categoriesChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('evolutionChart', { static: false }) evolutionChart!: ElementRef<HTMLCanvasElement>;

  private categoriesChartInstance?: Chart;
  private evolutionChartInstance?: Chart;

  plaintes: any[] = [];
  loading = true;
  selectedPeriod: 'month' | 'quarter' | 'year' = 'month';
  evolutionPeriod: 'month' | 'quarter' | 'year' = 'month';
  
  // Catégories mises à jour pour correspondre à votre structure BDD
  categories = [
    { key: 'harcelement', label: 'Harcèlement' },
    { key: 'violence', label: 'Violence physique' },
    { key: 'nourriture', label: 'Refus de nourriture' },
    { key: 'paiement', label: 'Problème de paiement' }
  ];

  categoryColors = [
    '#FF6B6B', // Rouge coral
    '#4ECDC4', // Turquoise
    '#45B7D1', // Bleu ciel
    '#96CEB4'  // Vert menthe
  ];

  constructor(private plainteService: PlainteService) {}

  ngOnInit(): void {
    console.log('ngOnInit appelé');
    this.loadPlaintes();
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit appelé');
    console.log('categoriesChart element:', this.categoriesChart);
    console.log('evolutionChart element:', this.evolutionChart);
    
    // Ne pas initialiser ici si les données ne sont pas encore chargées
    // L'initialisation se fera dans loadPlaintes()
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  private loadPlaintes(): void {
    console.log('loadPlaintes appelée');
    this.plainteService.getAllPlaintes().subscribe({
      next: (data) => {
        console.log('Données reçues du service:', data);
        this.plaintes = data || [];
        this.loading = false;
        
        // Debug: vérifier la structure des données
        if (this.plaintes.length > 0) {
          console.log('Première plainte:', this.plaintes[0]);
          console.log('Propriétés disponibles:', Object.keys(this.plaintes[0]));
          if (this.plaintes[0].categorie) {
            console.log('Structure de categorie:', this.plaintes[0].categorie);
            console.log('Type de categorie:', typeof this.plaintes[0].categorie);
          }
        }
        
        // Attendre que la vue soit rendue
        setTimeout(() => {
          console.log('Initialisation des graphiques après chargement des données');
          this.initializeCharts();
        }, 500);
      },
      error: (err) => {
        console.error('Erreur lors du chargement:', err);
        this.loading = false;
        this.createTestData();
      }
    });
  }

  private createTestData(): void {
    console.log('Création de données de test...');
    // Données de test correspondant à votre structure BDD
    this.plaintes = [
      { 
        categorie: { key: 'harcelement', label: 'Harcèlement', image: 'harcelement.jpeg' }, 
        statut: 'En attente', 
        date: new Date() 
      },
      { 
        categorie: { key: 'harcelement', label: 'Harcèlement', image: 'harcelement.jpeg' }, 
        statut: 'En traitement', 
        date: new Date() 
      },
      { 
        categorie: { key: 'violence', label: 'Violence physique', image: 'violence.jpeg' }, 
        statut: 'Resolue', 
        date: new Date() 
      },
      { 
        categorie: { key: 'nourriture', label: 'Refus de nourriture', image: 'nourriture.jpeg' }, 
        statut: 'En attente', 
        date: new Date() 
      },
      { 
        categorie: { key: 'paiement', label: 'Problème de paiement', image: 'paiement.jpeg' }, 
        statut: 'En traitement', 
        date: new Date() 
      },
      { 
        categorie: { key: 'harcelement', label: 'Harcèlement', image: 'harcelement.jpeg' }, 
        statut: 'Resolue', 
        date: new Date() 
      },
    ];
    
    console.log('Données de test créées:', this.plaintes);
    
    setTimeout(() => {
      this.initializeCharts();
    }, 100);
  }

  private initializeCharts(): void {
    console.log('=== INITIALISATION DES GRAPHIQUES ===');
    console.log('Nombre de plaintes:', this.plaintes.length);
    console.log('Loading status:', this.loading);
    
    // Attendre que les ViewChild soient disponibles
    if (!this.categoriesChart || !this.evolutionChart) {
      console.warn('ViewChild non disponibles, retry dans 200ms');
      setTimeout(() => this.initializeCharts(), 200);
      return;
    }

    console.log('Elements DOM trouvés:', {
      categoriesChart: !!this.categoriesChart?.nativeElement,
      evolutionChart: !!this.evolutionChart?.nativeElement
    });

    this.destroyCharts();
    
    if (this.categoriesChart?.nativeElement) {
      console.log('Création du graphique des catégories...');
      this.createCategoriesChart();
    } else {
      console.error('Element categoriesChart non trouvé');
    }
    
    if (this.evolutionChart?.nativeElement) {
      console.log('Création du graphique d\'évolution...');
      this.createEvolutionChart();
    } else {
      console.error('Element evolutionChart non trouvé');
    }
  }

  private destroyCharts(): void {
    if (this.categoriesChartInstance) {
      this.categoriesChartInstance.destroy();
      this.categoriesChartInstance = undefined;
    }
    if (this.evolutionChartInstance) {
      this.evolutionChartInstance.destroy();
      this.evolutionChartInstance = undefined;
    }
  }

  private createCategoriesChart(): void {
    console.log('=== CRÉATION DU GRAPHIQUE CIRCULAIRE ===');
    
    const canvas = this.categoriesChart.nativeElement;
    console.log('Canvas element:', canvas);
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Impossible d\'obtenir le contexte 2D du canvas');
      return;
    }

    // Calculer les données avec les keys
    console.log('Catégories à analyser:', this.categories);
    const data = this.categories.map(cat => {
      const count = this.getNombrePlaintesParCategorie(cat.key);
      console.log(`${cat.label} (${cat.key}): ${count} plaintes`);
      return count;
    });
    
    const total = data.reduce((sum, val) => sum + val, 0);
    const labels = this.categories.map(cat => cat.label);
    
    console.log('Données finales du graphique:', {
      labels: labels,
      data: data,
      total: total
    });

    // Si pas de données, afficher un message
    if (total === 0) {
      console.warn('Aucune donnée trouvée pour les catégories');
      this.drawNoDataMessage(ctx, canvas, 'Aucune donnée de catégorie disponible');
      return;
    }

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: this.categoryColors.slice(0, this.categories.length),
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverBorderWidth: 4,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12,
                family: 'Inter, sans-serif'
              },
              generateLabels: (chart) => {
                const datasets = chart.data.datasets;
                if (datasets.length) {
                  const dataset = datasets[0];
                  return chart.data.labels?.map((label, i) => {
                    const value = dataset.data[i] as number;
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                    return {
                      text: `${label}: ${value} (${percentage}%)`,
                      fillStyle: dataset.backgroundColor?.[i] as string,
                      strokeStyle: dataset.borderColor as string,
                      lineWidth: dataset.borderWidth as number,
                      index: i
                    };
                  }) || [];
                }
                return [];
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#6366f1',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                const value = context.parsed || 0;
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return `${context.label}: ${value} plaintes (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000,
          onComplete: () => {
            console.log('Animation du graphique circulaire terminée');
          }
        },
        interaction: {
          intersect: false
        }
      }
    };

    try {
      console.log('Création de l\'instance Chart...');
      this.categoriesChartInstance = new Chart(ctx, config);
      console.log('✅ Graphique circulaire créé avec succès');
      console.log('Instance du graphique:', this.categoriesChartInstance);
    } catch (error) {
      console.error('❌ Erreur lors de la création du graphique circulaire:', error);
    }
  }

  private createEvolutionChart(): void {
    const canvas = this.evolutionChart.nativeElement;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('Impossible d\'obtenir le contexte 2D du canvas pour l\'évolution');
      return;
    }

    const labels = this.generateEvolutionLabels();
    const data = this.generateEvolutionData();

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nombre de plaintes',
          data: data,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              font: {
                size: 12
              }
            }
          },
          x: {
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              font: {
                size: 12
              }
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                size: 12,
                family: 'Inter, sans-serif'
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#6366f1',
            borderWidth: 1
          }
        },
        animation: {
          duration: 1000
        }
      }
    };

    try {
      this.evolutionChartInstance = new Chart(ctx, config);
      console.log('Graphique d\'évolution créé avec succès');
    } catch (error) {
      console.error('Erreur lors de la création du graphique d\'évolution:', error);
    }
  }

  private drawNoDataMessage(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, message: string): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
  }

  private generateEvolutionLabels(): string[] {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    
    switch (this.evolutionPeriod) {
      case 'year':
        return months;
      case 'quarter':
        return ['T1', 'T2', 'T3', 'T4'];
      default:
        return Array.from({length: 12}, (_, i) => `Sem ${i + 1}`);
    }
  }

  private generateEvolutionData(): number[] {
    // Pour le moment, générer des données aléatoires
    // Vous pouvez remplacer ceci par une logique réelle basée sur vos données
    const length = this.evolutionPeriod === 'quarter' ? 4 : 12;
    return Array(length).fill(0).map(() => Math.floor(Math.random() * 20) + 5);
  }

  // Méthodes utilitaires corrigées
  getNombrePlaintesParCategorie(categoryKey: string): number {
    if (!this.plaintes || this.plaintes.length === 0) {
      console.log(`Aucune plainte disponible pour ${categoryKey}`);
      return 0;
    }

    const count = this.plaintes.filter(p => {
      // Vérifiez différentes possibilités de structure
      let plainteCategory = '';
      
      if (p.categorie) {
        // Si c'est un objet avec key
        if (typeof p.categorie === 'object' && p.categorie.key) {
          plainteCategory = p.categorie.key;
        }
        // Si c'est directement la key (string)
        else if (typeof p.categorie === 'string') {
          plainteCategory = p.categorie.toLowerCase();
        }
      }
      
      const match = plainteCategory === categoryKey.toLowerCase();
      
      if (match) {
        console.log(`Match trouvé pour ${categoryKey}:`, p);
      }
      
      return match;
    }).length;
    
    console.log(`Catégorie "${categoryKey}": ${count} plaintes trouvées`);
    return count;
  }

  setPeriod(period: 'month' | 'quarter' | 'year'): void {
    this.selectedPeriod = period;
    setTimeout(() => this.initializeCharts(), 100);
  }

  setEvolutionPeriod(period: 'month' | 'quarter' | 'year'): void {
    this.evolutionPeriod = period;
    setTimeout(() => this.initializeCharts(), 100);
  }

  // Getters pour les statistiques
  get nombreEnAttente(): number {
    return this.plaintes.filter(p => 
      p.statut && p.statut.toLowerCase().includes('attente')
    ).length;
  }

  get nombreEnTraitement(): number {
    return this.plaintes.filter(p => 
      p.statut && p.statut.toLowerCase().includes('traitement')
    ).length;
  }

  get nombreResolue(): number {
    return this.plaintes.filter(p => 
      p.statut && (p.statut.toLowerCase().includes('resolue') || p.statut.toLowerCase().includes('résolu'))
    ).length;
  }

  get nombreTotal(): number {
    return this.plaintes.length;
  }

  // Méthodes de debug et test
  debugData(): void {
    console.log('=== DEBUG DES DONNÉES AVEC STRUCTURE KEY/LABEL ===');
    console.log('Toutes les plaintes:', this.plaintes);
    console.log('Nombre total de plaintes:', this.plaintes.length);
    
    if (this.plaintes.length > 0) {
      console.log('Structure de la première plainte:', this.plaintes[0]);
      console.log('Type de categorie:', typeof this.plaintes[0].categorie);
      if (this.plaintes[0].categorie) {
        console.log('Contenu de categorie:', this.plaintes[0].categorie);
      }
    }
    
    console.log('Catégories définies:', this.categories);
    
    this.categories.forEach(cat => {
      const count = this.getNombrePlaintesParCategorie(cat.key);
      console.log(`${cat.label} (${cat.key}): ${count} plaintes`);
    });
  }

  // Méthode de test à appeler depuis la console
  forceTestChart(): void {
    console.log('Forçage du test du graphique...');
    // Simuler des données avec la bonne structure
    this.plaintes = [
      { categorie: { key: 'harcelement', label: 'Harcèlement' }, statut: 'En attente' },
      { categorie: { key: 'harcelement', label: 'Harcèlement' }, statut: 'En traitement' },
      { categorie: { key: 'violence', label: 'Violence physique' }, statut: 'Resolue' },
      { categorie: { key: 'nourriture', label: 'Refus de nourriture' }, statut: 'En attente' },
      { categorie: { key: 'paiement', label: 'Problème de paiement' }, statut: 'En traitement' }
    ];
    
    this.loading = false;
    console.log('Données de test forcées:', this.plaintes);
    this.initializeCharts();
  }
}