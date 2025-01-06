import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { map, take} from 'rxjs/operators';
import { AuthService } from "src/app/modules/auth/services/auth.service";


@Injectable({ providedIn: 'root' })
export class LoginResolve implements Resolve<boolean> {

 constructor(private authService: AuthService, private router: Router) { }

 resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.user.pipe(
       take(1),
       map((user) => {
          if (user) {
            console.log(user);
             this.router.navigateByUrl('/dashboard/stats');
             return false;
          }
          return true;
       })
    );
 }
}