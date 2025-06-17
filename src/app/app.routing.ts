import { Routes } from "@angular/router";
import { AdminLayoutComponent } from "./layouts/admin/admin-layout.component";
import { AuthLayoutComponent } from "./layouts/auth/auth-layout.component";
import { LoginComponent } from "./pages/login/login.component";

import { RegisterComponent } from "./pages/register/register.component";
import { ChangePasswordComponent } from "./pages/change-password/change-password.component";
import { PasswordChangeGuard } from "./pages/auth/password-change.guard";
import { PlaintesComponent } from "./pages/plaintes/plaintes.component";
import { TableauDeBordComponent } from "./tableau-de-bord/tableau-de-bord.component";
import { HomeMarinComponent } from "./pages-client/home-marin/home-marin.component";
import { PlainteComponent } from "./pages-client/plainte/plainte.component";
import { SuivreMesPlaintesComponent } from "./pages-client/suivre-mes-plaintes/suivre-mes-plaintes.component";
import { AideVocaleComponent } from "./pages-client/aide-vocale/aide-vocale.component";
import { AppelerAnamComponent } from "./pages-client/appeler-anam/appeler-anam.component";

import { LoginMarinComponent } from "./pages-client/login/loginmarin.component";
import { MarinAuthGuard } from "./servicesclient/marin-auth.guard";
import { AdminAuthGuard } from "./pages/auth/admin-auth.guard";
import { AdminListComponent } from "./pages/admin-list/admin-list.component";
import { PlaintesResoluesComponent } from './pages/plaintes-resolues/plaintes-resolues.component';



export const AppRoutes: Routes = [
  // Redirection par défaut vers login
 // { 
    //path: "", 
   // component: LoginComponent,  
    //pathMatch: "full" 
 // },

   { 
    path: "", 
    redirectTo: "login-marin", 
    pathMatch: "full" 
  },

  // Routes d'authentification
  {
    path: "",
    component: AuthLayoutComponent,
    children: [
      { 
        path: "login-admin", 
        component: LoginComponent 
      },
     
      { path: "login-marin", component: LoginMarinComponent }, 

       { 
        path: "register", 
        component: RegisterComponent 
      },
  
      // Nouvelle route pour le changement de mot de passe
      { 
        path: "change-password",
        component: ChangePasswordComponent,
        canActivate: [PasswordChangeGuard] // Garde spécifique
      },
     { 
        path: "pages",
        loadChildren: () => import("./pages/pages.module").then(m => m.PagesModule)
      }
    ]
  },

   // Routes pour l'application 1 (Marin)
  {
    path: 'marin',
    canActivate: [MarinAuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeMarinComponent },
      { path: 'plainte', component: PlainteComponent },
      { path: 'suivre-plaintes', component: SuivreMesPlaintesComponent },
      { path: 'aide-vocale', component: AideVocaleComponent },
      { path: 'appeler', component: AppelerAnamComponent },
    ]
  },

  // Routes protégées
  {
    path: "admin",
    component: AdminLayoutComponent,
    canActivate: [AdminAuthGuard], 
   
    children: [
      { 
        path: "dashboard",
        loadChildren: () => import("./dashboard/dashboard.module").then(m => m.DashboardModule),
      },
      { 
        path: "metric",
        loadChildren: () => import("./METRIC/metric.module").then(m => m.MetricModule)
      },
      {
        path: 'plaintes',
        component: PlaintesComponent
      },
      {
        path: 'plaintesresolues',
        component: PlaintesResoluesComponent
      },
      {
        path: 'tableau-bord',
        component: TableauDeBordComponent 
      },
      { 
        path: "register", 
        component: RegisterComponent 
      },
      { path: 'admin-list', component: AdminListComponent }
    ]
  },

  // Gestion des routes inconnues
  { 
    path: "**", 
    redirectTo: "" 
  }
];