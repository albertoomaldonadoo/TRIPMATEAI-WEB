
import { CanActivateFn, Router } from '@angular/router';
import { StrapiAuthService } from '../services/strapi-auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  let auth = inject(StrapiAuthService);
  let router = inject(Router);
  let authenticated = auth.user()!=null;
  if(!authenticated)
    router.navigate(['/login'],{state:{navigateTo:state.url}});
  return authenticated;
};
