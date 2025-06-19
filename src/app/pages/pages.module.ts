import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../app.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { FlexLayoutModule } from '@angular/flex-layout';

import { PagesRoutes } from './pages.routing';

import { RegisterComponent } from './register/register.component';
import { PricingComponent } from './pricing/pricing.component';
import { LockComponent } from './lock/lock.component';
import { LoginComponent } from './login/login.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { HistoriquePlainteComponent } from './historique-plainte/historique-plainte.component';
import { PlaintesResoluesComponent } from './plaintes-resolues/plaintes-resolues.component';
import { AjouterPlainteAdminComponent } from './ajouter-plainte-admin/ajouter-plainte-admin.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(PagesRoutes),
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  declarations: [
    LoginComponent,
    RegisterComponent,
    PricingComponent,
    LockComponent,
    ChangePasswordComponent,
    HistoriquePlainteComponent,
    PlaintesResoluesComponent,
    AjouterPlainteAdminComponent,
  ],
  providers: [
   
  ]
})

export class PagesModule {}
