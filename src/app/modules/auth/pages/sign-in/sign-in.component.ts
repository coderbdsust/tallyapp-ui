import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { ButtonComponent } from '../../../../common/components/button/button.component';
import { inject } from '@angular/core';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  imports: [AngularSvgIconModule, ButtonComponent],
})
export class SignInComponent {
  
  constructor(
    private readonly _router: Router,
  ) {}

  private keycloak = inject(Keycloak);

  loginWithKeycloak() {
    this.keycloak.login({ redirectUri: window.location.origin + '/' });
  }
}
