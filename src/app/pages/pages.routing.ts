import { Routes } from '@angular/router';

import { RegisterComponent } from './register/register.component';
import { PricingComponent } from './pricing/pricing.component';
import { LockComponent } from './lock/lock.component';
import { LoginComponent } from './login/login.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AdminListComponent } from './admin-list/admin-list.component';
import { AdminAuthGuard } from './auth/admin-auth.guard';
import { PasswordChangeGuard } from './auth/password-change.guard';

export const PagesRoutes: Routes = [

    {
        path: '',
        children: [ {
            path: 'login',
            component: LoginComponent
        }, {
            path: 'lock',
            component: LockComponent
        }, 
        {
            path: 'register',
            component: RegisterComponent,
            canActivate: [AdminAuthGuard]
        }, 
        {
            path: 'pricing',
            component: PricingComponent
        },
        {
            path: 'change-password',
            component: ChangePasswordComponent,
            canActivate: [PasswordChangeGuard]
        },
        {
            path: 'admin-list',
            component: AdminListComponent,
            canActivate: [AdminAuthGuard]
        }
    ]
    }
];
