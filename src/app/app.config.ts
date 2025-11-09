import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    // Inicializar Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)), // <-- ¡CORREGIDO!
    
    // Proveer Authentication
    provideAuth(() => getAuth()),
    
    // Proveer Firestore (para futuro dashboard)
    provideFirestore(() => getFirestore())
  ]
};