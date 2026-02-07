import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import { Observable, of } from "rxjs";
import { AuthService } from "src/app/core/services/auth.service";

@Injectable({ providedIn: 'root' })
export class LoginResolve implements Resolve<boolean> {

  constructor(private authService: AuthService, private router: Router) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const roles = this.authService.getRoles();
    
    if (roles && roles.length > 0) {
      console.log(roles);
      if (roles.includes('SUPER_ADMIN')) {
        this.router.navigateByUrl('/admin/user-management');
      } else {
        this.router.navigateByUrl('/dashboard/home');
      }
      return of(false);
    }
    
    return of(true);
  }
}