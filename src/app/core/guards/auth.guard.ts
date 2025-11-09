import { CanActivateFn, Router } from '@angular/router';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(FirebaseAuthService);
  const router = inject(Router);
  
  const authenticated = auth.user() != null;
  
  if (!authenticated) {
    router.navigate(['/login'], { state: { navigateTo: state.url } });
  }
  
  return authenticated;
};