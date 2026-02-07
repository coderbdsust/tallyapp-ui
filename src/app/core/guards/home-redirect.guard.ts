import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

export const homeRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasRole('SUPER_ADMIN')) {
    return router.createUrlTree(['/admin/user-management']);
  }

  return router.createUrlTree(['/dashboard']);
};
