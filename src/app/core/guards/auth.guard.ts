import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { map, take, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    return this.authService.user.pipe(
      take(1),
      map((user) => {
        const auth = !!user;
        if (auth) return auth;
        return this.router.createUrlTree(['/auth/sign-in']);
      }),
    );
  }
}
