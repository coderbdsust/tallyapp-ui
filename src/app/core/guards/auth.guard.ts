import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import Keycloak from 'keycloak-js';

export const authGuard: CanActivateFn = (route, state) => {
  const keycloak = inject(Keycloak);
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!keycloak.authenticated) {
    return router.createUrlTree(['/auth/sign-in']);
  }
  
  const requiredRoles: string[] = route.data['modules'] ?? [];

  const hasAccess = requiredRoles.some((role) => authService.hasModule(role));

  if (hasAccess) {
    return true;
  }

  return router.createUrlTree(['/access-denied']);
};
