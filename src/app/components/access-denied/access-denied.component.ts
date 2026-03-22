import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/common/components/button/button.component';

@Component({
    selector: 'app-access-denied',
    imports: [AngularSvgIconModule, ButtonComponent, TranslateModule],
    templateUrl: './access-denied.component.html',
    styleUrl: './access-denied.component.scss'
})
export class AccessDeniedComponent {
  constructor(private router: Router) {}

  goToHomePage() {
    this.router.navigate(['/']);
  }
}
