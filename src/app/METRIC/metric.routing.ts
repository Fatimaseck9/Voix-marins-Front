import { METRICComponent } from "./metric.component";
import { IndicateursComponent } from "./indicateurs/indicateurs.component";
import { DetailsKpiComponent } from "./indicateurs/details-kpi/details-kpi.component";
import { ParametreComponent } from "./parametre/parametre.component";
import { TableauDeBordComponent } from "./tableau-de-bord/tableau-de-bord.component";
import { DetailsTBComponent } from "./tableau-de-bord/details-tb/details-tb.component";
import { StructuresComponent } from "./structures/structures.component";
import { DemandeSuivisIndicateursComponent } from "./demande-suivis-indicateurs/demande-suivis-indicateurs.component";
import { DetailsStructuresComponent } from "./structures/details-structures/details-structures.component";

import { Routes } from "@angular/router";


export const MetricRoute: Routes = [
  {
    //Default redirection to the first route.
    path: "",
    redirectTo: "indicateurs",
    pathMatch: "full",
  },
  {
    path: "",
    component: METRICComponent,
    children: [
      {
        path: "indicateurs",
        component: IndicateursComponent,
      },
      // {
      //   path: "indicateurs/add",
      //   component: EditIndicateurComponent,
      // },
      // {
      //   path: "indicateurs/edit/:id",
      //   component: EditIndicateurComponent,
      // },
      {
        path: "indicateurs/:id",
        component: DetailsKpiComponent,
      },

      {
        path: "parametres",
        component: ParametreComponent,
      },
      {
        path: "tableau-de-bords",
        component: TableauDeBordComponent,
      },
      {
        path: "tableau-de-bords/:tbId",
        component: DetailsTBComponent,
      },
      {
        path: "structures",
        component: StructuresComponent,
      },
      {
        path: "structures/:id",
        component: DetailsStructuresComponent,
      },
      {
        path: "structures/indicateurs-suivis/:id",
        component: DemandeSuivisIndicateursComponent,
      },
    ],
  },
];
