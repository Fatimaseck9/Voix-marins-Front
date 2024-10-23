export interface Indicateur  {
    name: string;
    description: string;
    loi_composition:string;
    formule_calcul: string
    valeur_cible: string
    selectedProprietaires: any[];
    selectedSuppleants: any[];
    selectedAnalystes: any[];
    selectedStructures: any[];
    selectedAnalystesStructures: any[];
    tendanceId: string;
    uniteId: string;
    operationId: string;
    periodiciteId: string;
    origineId: string;
    typeIndicateurId: string;
    sousObjectifId: string;
    objectifId: string;
    // analyseRequise: boolean: [true],
  };