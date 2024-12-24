import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "../app.module";
import { MetricRoute } from "./metric.routing";
import { METRICComponent } from "../METRIC/metric.component";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { ParametreComponent } from "./parametre/parametre.component";
import { DataTablesModule } from "angular-datatables";
import { ReactiveFormsModule } from "@angular/forms";
import { NgMultiSelectDropDownModule } from "ng-multiselect-dropdown";

import { NgxGraphModule } from "@swimlane/ngx-graph";
import { TableauDeBordComponent } from "./tableau-de-bord/tableau-de-bord.component";
import { DetailsTBComponent } from "./tableau-de-bord/details-tb/details-tb.component";
import { StructuresComponent } from "./structures/structures.component";

import { HeaderComponent } from "./global-components/header/header.component";
import { FooterComponent } from "./global-components/footer/footer.component";

import { IndicateursComponent } from "./indicateurs/indicateurs.component";
import { DetailsKpiComponent } from "./indicateurs/details-kpi/details-kpi.component";
import { DetailsStructuresComponent } from "./structures/details-structures/details-structures.component";
import { DemandeSuivisIndicateursComponent } from "./demande-suivis-indicateurs/demande-suivis-indicateurs.component";

import { BaseService } from "../shared/base.service";
import { metricService } from "../shared/metric.Service";
import { NotificationService } from "../shared/services/notifications";
import { GoogleChartsModule } from "angular-google-charts";

@NgModule({
  declarations: [
    METRICComponent,
    IndicateursComponent,
    DetailsKpiComponent,
    ParametreComponent,
    TableauDeBordComponent,
    DetailsTBComponent,
    StructuresComponent,
    HeaderComponent,
    FooterComponent,
    DetailsStructuresComponent,
    DemandeSuivisIndicateursComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(MetricRoute),
    FormsModule,
    MaterialModule,

    HttpClientModule,
    NgxGraphModule,
    GoogleChartsModule,
    ReactiveFormsModule,
    NgMultiSelectDropDownModule.forRoot(),

    DataTablesModule.forRoot(),
  ],

  providers: [BaseService, NotificationService, metricService],
})
export class MetricModule {}
