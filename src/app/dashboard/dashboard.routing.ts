import { Routes } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { AdminAuthGuard } from '../pages/auth/admin-auth.guard';


export const DashboardRoutes: Routes = [
    {

      path: 'dashboard',
      children: [ {
        path: '',
        component: DashboardComponent,canActivate: [AdminAuthGuard]
    }]
}
];
