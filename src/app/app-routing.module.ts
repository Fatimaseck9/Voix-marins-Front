import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { PlaintesResoluesComponent } from './pages/plaintes-resolues/plaintes-resolues.component';

const routes: Routes = [
  {
    path: 'plaintes-resolues',
    component: PlaintesResoluesComponent,
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { } 