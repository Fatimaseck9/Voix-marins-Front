import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch } from '@angular/common/http';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';  
import { LoginComponent } from './pages/login/login.component';
import { AuthInterceptor } from './services/auth.interceptor';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { HomeMarinComponent } from './pages/home-marin/home-marin.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environment/environment';
import { PwaInstallPromptComponent } from './components/pwa-install-prompt/pwa-install-prompt.component';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    HttpClientModule,
    CommonModule,
    AppComponent,
    LoginComponent,
    HomeMarinComponent,
    RouterModule.forRoot(routes),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: true,
      registrationStrategy: 'registerWhenStable:30000'
    }),
    PwaInstallPromptComponent
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
  ],
})
export class AppModule { }
