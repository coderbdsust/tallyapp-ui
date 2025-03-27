import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from 'src/app/common/components/button/button.component';

@Component({
    selector: 'app-error404',
    imports: [AngularSvgIconModule, ButtonComponent],
    templateUrl: './error403.component.html',
    styleUrl: './error403.component.scss'
})
export class Error403Component {
  constructor(private router: Router) {}

  goToHomePage() {
    this.router.navigate(['/']);
  }
}
