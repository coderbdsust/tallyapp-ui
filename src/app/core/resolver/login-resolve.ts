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
             if(user.roles[0].includes('SUPER_ADMIN')){
               this.router.navigateByUrl('/admin/user-management');
             }else
                this.router.navigateByUrl('/dashboard/home');
             return false;
          }
          return true;
       })
    );
 }
}