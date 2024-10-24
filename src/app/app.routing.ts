import { Routes } from "@angular/router";

import { AdminLayoutComponent } from "./layouts/admin/admin-layout.component";
import { AuthLayoutComponent } from "./layouts/auth/auth-layout.component";
import { LoginComponent } from "./pages/login/login.component";
import { AuthGuard } from "./pages/auth/auth-guard.service";

export const AppRoutes: Routes = [
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full",
  },
  {
    path: "",
    component: AuthLayoutComponent,

    children: [
      {
        path: "pages",
        children: [
          {
            path: "login",
            component: LoginComponent,
            loadChildren: () =>
              import("./pages/pages.module").then((m) => m.PagesModule),
          },
        ],
      },
    ],
  },
  {
    path: "",
    component: AdminLayoutComponent,
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./dashboard/dashboard.module").then((m) => m.DashboardModule),
        canActivate: [AuthGuard],
      },
      {
        path: "metric",
        loadChildren: () =>
          import("./METRIC/metric.module").then((m) => m.MetricModule),
      },
    ],
  },
  // {
  //     path: '',
  //     redirectTo: 'dashboard',
  //     pathMatch: 'full',
  // },
  // {
  //     path: '',
  //     component: AdminLayoutComponent,
  //     children: [
  // {
  //     path: '',
  //     loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  // },
  //  {
  //     path: '',
  //     loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  // },
  //  {
  //     path: 'components',
  //     loadChildren: () => import('./components/components.module').then(m => m.ComponentsModule)
  // }, {
  // },
  //  {
  //     path: 'qosUniverse',
  //     loadChildren: () => import('./QOSUNIVERSE/qosuniverse.module').then(m => m.QosUniverseModule)
  // },
  // {
  //     path: 'forms',
  //     loadChildren: () => import('./forms/forms.module').then(m => m.Forms)
  // }, {
  //     path: 'tables',
  //     loadChildren: () => import('./tables/tables.module').then(m => m.TablesModule)
  // }, {
  //     path: 'maps',
  //     loadChildren: () => import('./maps/maps.module').then(m => m.MapsModule)
  // }, {
  //     path: 'widgets',
  //     loadChildren: () => import('./widgets/widgets.module').then(m => m.WidgetsModule)
  // }, {
  //     path: 'charts',
  //     loadChildren: () => import('./charts/charts.module').then(m => m.ChartsModule)
  // }, {
  //     path: 'calendar',
  //     loadChildren: () => import('./calendar/calendar.module').then(m => m.CalendarModule)
  // },
  //  {
  //     path: '',
  //     loadChildren: () => import('./userpage/user.module').then(m => m.UserModule)
  // }, {
  //     path: '',
  //     loadChildren: () => import('./timeline/timeline.module').then(m => m.TimelineModule)
  //         // }
  //     ]
  // },
];
